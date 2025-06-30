import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { region, model_id, forecast_period = "weekly", team } = body

    const supabase = createServerClient()

    // Get inventory data for forecasting
    let inventoryQuery = supabase.from("inventory_data").select("*").order("date_recorded", { ascending: false })

    if (region) {
      inventoryQuery = inventoryQuery.eq("region", region)
    }

    const { data: inventoryData, error: inventoryError } = await inventoryQuery

    if (inventoryError) throw inventoryError

    // Get the best model if not specified
    let selectedModel = model_id
    if (!selectedModel) {
      const { data: models, error: modelError } = await supabase
        .from("ml_models")
        .select("*")
        .eq("status", "active")
        .eq("auto_selected", true)
        .limit(1)

      if (modelError) throw modelError
      selectedModel = models?.[0]?.id
    }

    // Generate forecasts using AI logic
    const forecasts = []
    const currentDate = new Date()

    for (const item of inventoryData || []) {
      // Parse past sales data
      const pastSales = Array.isArray(item.past_sales_weekly) ? item.past_sales_weekly : []

      if (pastSales.length === 0) continue

      // Simple forecasting algorithm (in production, this would use actual ML models)
      const avgSales = pastSales.reduce((sum: number, sale: number) => sum + sale, 0) / pastSales.length
      const trend = pastSales.length > 1 ? (pastSales[pastSales.length - 1] - pastSales[0]) / pastSales.length : 0

      // Apply factors
      let predictedDemand = avgSales + trend

      // Weather impact
      if (item.weather_forecast?.temp_high) {
        const tempFactor = item.category === "Clothing" ? (item.weather_forecast.temp_high < 50 ? 1.2 : 0.9) : 1.0
        predictedDemand *= tempFactor
      }

      // Economic factor
      if (item.economic_index) {
        predictedDemand *= item.economic_index
      }

      // Promotional boost
      if (item.promotional_flags?.black_friday || item.promotional_flags?.holiday_special) {
        predictedDemand *= 1.3
      }

      // Calculate confidence interval (±15% for demo)
      const confidence = 0.15
      const lower = Math.max(0, Math.round(predictedDemand * (1 - confidence)))
      const upper = Math.round(predictedDemand * (1 + confidence))

      // Create forecast for next week
      const forecastDate = new Date(currentDate)
      forecastDate.setDate(forecastDate.getDate() + 7)

      forecasts.push({
        sku_id: item.sku_id,
        region: item.region,
        store_id: item.store_id,
        forecast_date: forecastDate.toISOString().split("T")[0],
        forecast_period,
        predicted_demand: Math.round(predictedDemand),
        confidence_interval: { lower, upper },
        model_id: selectedModel,
        factors: {
          weather_impact: item.weather_forecast?.temp_high
            ? item.category === "Clothing" && item.weather_forecast.temp_high < 50
              ? 0.2
              : -0.1
            : 0,
          promotion_boost: item.promotional_flags?.black_friday || item.promotional_flags?.holiday_special ? 0.3 : 0,
          seasonal_factor: 1.0 + Math.sin((currentDate.getMonth() / 12) * 2 * Math.PI) * 0.1,
          economic_factor: item.economic_index || 1.0,
        },
      })
    }

    // Insert forecasts into database
    if (forecasts.length > 0) {
      const { error: insertError } = await supabase.from("demand_forecasts").insert(forecasts)

      if (insertError) throw insertError
    }

    // Log agent action
    await supabase.from("agent_actions").insert({
      agent: "AI Demand Forecaster",
      action: `Generated ${forecasts.length} demand forecasts for ${forecast_period} period`,
      status: "completed",
      entity_type: "demand_forecasts",
      metadata: {
        forecasts_created: forecasts.length,
        region: region || "all",
        model_used: selectedModel,
        team: team || "crazsymb",
      },
    })

    return NextResponse.json({
      success: true,
      forecasts_created: forecasts.length,
      model_used: selectedModel,
      team: team || "crazsymb",
      hackathon: "Walmart Sparkathon",
    })
  } catch (error: any) {
    console.error("Forecast generation error:", error)
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
