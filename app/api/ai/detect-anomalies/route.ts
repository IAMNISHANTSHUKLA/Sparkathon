import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { team } = body

    const supabase = createServerClient()

    // Get recent inventory data
    const { data: inventoryData, error: inventoryError } = await supabase
      .from("inventory_data")
      .select("*")
      .gte("date_recorded", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
      .order("date_recorded", { ascending: false })

    if (inventoryError) throw inventoryError

    // Get demand forecasts for comparison
    const { data: forecasts, error: forecastError } = await supabase
      .from("demand_forecasts")
      .select("*")
      .gte("forecast_date", new Date().toISOString().split("T")[0])

    if (forecastError) throw forecastError

    const anomalies = []

    // Group data by SKU and region
    const dataMap = new Map()
    for (const item of inventoryData || []) {
      const key = `${item.sku_id}-${item.region}`
      if (!dataMap.has(key)) {
        dataMap.set(key, [])
      }
      dataMap.get(key).push(item)
    }

    // Detect anomalies
    for (const [key, items] of dataMap) {
      const [sku_id, region] = key.split("-")

      if (items.length < 2) continue

      // Sort by date
      items.sort((a: any, b: any) => new Date(a.date_recorded).getTime() - new Date(b.date_recorded).getTime())

      const latest = items[items.length - 1]
      const previous = items[items.length - 2]

      // DEMAND SPIKE DETECTION
      if (latest.past_sales_weekly && previous.past_sales_weekly) {
        const latestSales = Array.isArray(latest.past_sales_weekly)
          ? latest.past_sales_weekly[latest.past_sales_weekly.length - 1]
          : 0
        const previousSales = Array.isArray(previous.past_sales_weekly)
          ? previous.past_sales_weekly[previous.past_sales_weekly.length - 1]
          : 0

        if (latestSales > previousSales * 1.5 && latestSales > 100) {
          const deviation = ((latestSales - previousSales) / previousSales) * 100

          anomalies.push({
            sku_id,
            region,
            anomaly_type: "demand_spike",
            severity: deviation > 100 ? "critical" : deviation > 50 ? "high" : "medium",
            detected_value: latestSales,
            expected_value: previousSales,
            deviation_percentage: deviation,
            detection_date: new Date().toISOString().split("T")[0],
            is_repetitive: false,
            exclusion_applied: false,
            root_cause:
              deviation > 100
                ? "Potential viral trend or unexpected event driving demand"
                : "Seasonal increase or promotional impact",
            impact_assessment: {
              revenue_impact: (latestSales - previousSales) * 15,
              stockout_risk: latest.inventory_count < latestSales ? "high" : "medium",
              competitor_advantage: latest.inventory_count < latestSales,
            },
            status: "open",
          })
        }
      }

      // STOCKOUT DETECTION
      if (latest.stockouts > 0 || latest.inventory_count === 0) {
        const forecast = forecasts?.find((f) => f.sku_id === sku_id && f.region === region)
        const expectedDemand = forecast?.predicted_demand || 100

        anomalies.push({
          sku_id,
          region,
          anomaly_type: "stockout",
          severity: latest.stockouts > 5 ? "critical" : "high",
          detected_value: latest.inventory_count,
          expected_value: expectedDemand,
          deviation_percentage: 100,
          detection_date: new Date().toISOString().split("T")[0],
          is_repetitive: items.filter((item: any) => item.stockouts > 0).length > 2,
          exclusion_applied: false,
          root_cause:
            latest.stockouts > 5
              ? "Critical supply chain disruption or demand surge"
              : "Inventory planning gap or supplier delay",
          impact_assessment: {
            revenue_loss: expectedDemand * 15,
            customer_satisfaction: "poor",
            competitor_gain: true,
          },
          status: "open",
        })
      }

      // WEATHER ANOMALY DETECTION
      if (latest.weather_forecast && previous.weather_forecast) {
        const tempDiff = Math.abs(
          (latest.weather_forecast.temp_high || 70) - (previous.weather_forecast.temp_high || 70),
        )

        if (tempDiff > 20) {
          const isClothingCategory = latest.category === "Clothing"
          const impact = isClothingCategory ? tempDiff * 0.01 : tempDiff * 0.005

          anomalies.push({
            sku_id,
            region,
            anomaly_type: "weather",
            severity: tempDiff > 30 ? "high" : "medium",
            detected_value: latest.weather_forecast.temp_high,
            expected_value: previous.weather_forecast.temp_high,
            deviation_percentage: (tempDiff / (previous.weather_forecast.temp_high || 70)) * 100,
            detection_date: new Date().toISOString().split("T")[0],
            is_repetitive: false,
            exclusion_applied: false,
            root_cause: `Significant weather change affecting ${isClothingCategory ? "clothing" : "general"} demand`,
            impact_assessment: {
              demand_impact: impact,
              inventory_strain: tempDiff > 30 ? "high" : "medium",
              seasonal_adjustment_needed: true,
            },
            status: "open",
          })
        }
      }

      // ECONOMIC ANOMALY DETECTION
      if (latest.economic_index && previous.economic_index) {
        const economicChange = Math.abs(latest.economic_index - previous.economic_index)

        if (economicChange > 0.1) {
          anomalies.push({
            sku_id,
            region,
            anomaly_type: "economic",
            severity: economicChange > 0.2 ? "high" : "medium",
            detected_value: latest.economic_index,
            expected_value: previous.economic_index,
            deviation_percentage: (economicChange / previous.economic_index) * 100,
            detection_date: new Date().toISOString().split("T")[0],
            is_repetitive: false,
            exclusion_applied: false,
            root_cause:
              latest.economic_index > previous.economic_index
                ? "Economic upturn affecting consumer spending"
                : "Economic downturn impacting demand",
            impact_assessment: {
              demand_multiplier: latest.economic_index,
              category_impact: latest.category === "Electronics" ? "high" : "medium",
              price_sensitivity: latest.economic_index < 1 ? "high" : "low",
            },
            status: "open",
          })
        }
      }
    }

    // Filter out repetitive anomalies that should be excluded
    const filteredAnomalies = anomalies.filter((anomaly) => {
      // Exclude repetitive stockouts for low-priority items
      if (anomaly.is_repetitive && anomaly.anomaly_type === "stockout" && anomaly.severity === "medium") {
        anomaly.exclusion_applied = true
        return false
      }
      return true
    })

    // Insert anomalies into database
    if (filteredAnomalies.length > 0) {
      const { error: insertError } = await supabase.from("anomaly_detection").insert(filteredAnomalies)

      if (insertError) throw insertError
    }

    // Create notifications for critical anomalies
    const criticalAnomalies = filteredAnomalies.filter((a) => a.severity === "critical")

    for (const anomaly of criticalAnomalies) {
      await supabase.from("notifications").insert({
        title: `Critical ${anomaly.anomaly_type.replace("_", " ")} Detected`,
        message: `${anomaly.root_cause} for ${anomaly.sku_id} in ${anomaly.region}`,
        type: "error",
        priority: "urgent",
        entity_type: "anomaly_detection",
        metadata: {
          anomaly_id: anomaly.id,
          team: team || "crazsymb",
          auto_generated: true,
        },
      })
    }

    // Log agent action
    await supabase.from("agent_actions").insert({
      agent: "Anomaly Detector",
      action: `Detected ${filteredAnomalies.length} anomalies (${criticalAnomalies.length} critical)`,
      status: filteredAnomalies.length > 0 ? "warning" : "completed",
      entity_type: "anomaly_detection",
      metadata: {
        anomalies_detected: filteredAnomalies.length,
        critical_count: criticalAnomalies.length,
        excluded_count: anomalies.length - filteredAnomalies.length,
        team: team || "crazsymb",
      },
    })

    return NextResponse.json({
      success: true,
      anomalies_detected: filteredAnomalies.length,
      critical_anomalies: criticalAnomalies.length,
      excluded_anomalies: anomalies.length - filteredAnomalies.length,
      breakdown: {
        demand_spike: filteredAnomalies.filter((a) => a.anomaly_type === "demand_spike").length,
        stockout: filteredAnomalies.filter((a) => a.anomaly_type === "stockout").length,
        weather: filteredAnomalies.filter((a) => a.anomaly_type === "weather").length,
        economic: filteredAnomalies.filter((a) => a.anomaly_type === "economic").length,
      },
      team: team || "crazsymb",
      hackathon: "Walmart Sparkathon",
    })
  } catch (error: any) {
    console.error("Anomaly detection error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        team: "crazsymb",
      },
      { status: 500 },
    )
  }
}
