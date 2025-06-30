import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { optimization_types = ["reallocation", "replenishment", "markdown"], team } = body

    const supabase = createServerClient()

    // Get current inventory data
    const { data: inventoryData, error: inventoryError } = await supabase
      .from("inventory_data")
      .select("*")
      .order("date_recorded", { ascending: false })

    if (inventoryError) throw inventoryError

    // Get demand forecasts
    const { data: forecasts, error: forecastError } = await supabase
      .from("demand_forecasts")
      .select("*")
      .gte("forecast_date", new Date().toISOString().split("T")[0])

    if (forecastError) throw forecastError

    const optimizations = []

    // Group inventory by SKU and region
    const inventoryMap = new Map()
    for (const item of inventoryData || []) {
      const key = `${item.sku_id}-${item.region}`
      if (!inventoryMap.has(key)) {
        inventoryMap.set(key, [])
      }
      inventoryMap.get(key).push(item)
    }

    // Generate optimization recommendations
    for (const [key, items] of inventoryMap) {
      const [sku_id, region] = key.split("-")

      // Find corresponding forecast
      const forecast = forecasts?.find((f) => f.sku_id === sku_id && f.region === region)
      if (!forecast) continue

      // Calculate total inventory and demand
      const totalInventory = items.reduce((sum: number, item: any) => sum + item.inventory_count, 0)
      const totalStockouts = items.reduce((sum: number, item: any) => sum + item.stockouts, 0)
      const predictedDemand = forecast.predicted_demand

      // REALLOCATION OPPORTUNITIES
      if (optimization_types.includes("reallocation")) {
        // Find stores with excess inventory
        const excessStores = items.filter(
          (item: any) => item.inventory_count > predictedDemand * 1.5 && item.stockouts === 0,
        )

        // Find stores with low inventory
        const lowStores = items.filter(
          (item: any) => item.inventory_count < predictedDemand * 0.5 || item.stockouts > 0,
        )

        for (const excessStore of excessStores) {
          for (const lowStore of lowStores) {
            if (excessStore.store_id === lowStore.store_id) continue

            const transferQty = Math.min(
              Math.floor(excessStore.inventory_count * 0.3),
              predictedDemand - lowStore.inventory_count,
            )

            if (transferQty > 0) {
              optimizations.push({
                sku_id,
                source_location: excessStore.store_id,
                target_location: lowStore.store_id,
                recommended_quantity: transferQty,
                optimization_type: "reallocation",
                priority_score: lowStore.stockouts > 0 ? 9 : 7,
                cost_impact: transferQty * 2.5, // Estimated transfer cost
                expected_benefit: transferQty * 15, // Estimated revenue benefit
                reasoning: `Transfer excess inventory from ${excessStore.store_id} to address ${lowStore.stockouts > 0 ? "stockouts" : "low inventory"} at ${lowStore.store_id}`,
                status: "pending",
              })
            }
          }
        }
      }

      // REPLENISHMENT OPPORTUNITIES
      if (optimization_types.includes("replenishment")) {
        const lowInventoryStores = items.filter((item: any) => item.inventory_count < predictedDemand * 0.8)

        for (const store of lowInventoryStores) {
          const replenishQty = Math.max(predictedDemand - store.inventory_count, predictedDemand * 0.5)

          optimizations.push({
            sku_id,
            source_location: "Distribution Center",
            target_location: store.store_id,
            recommended_quantity: Math.round(replenishQty),
            optimization_type: "replenishment",
            priority_score: store.stockouts > 0 ? 10 : 6,
            cost_impact: replenishQty * 3.0, // Estimated replenishment cost
            expected_benefit: replenishQty * 18, // Estimated revenue benefit
            reasoning: `Replenish ${store.store_id} to meet forecasted demand of ${predictedDemand} units`,
            status: "pending",
          })
        }
      }

      // MARKDOWN OPPORTUNITIES
      if (optimization_types.includes("markdown")) {
        const excessInventoryStores = items.filter(
          (item: any) => item.inventory_count > predictedDemand * 2 && item.returns > 5,
        )

        for (const store of excessInventoryStores) {
          const markdownQty = Math.floor(store.inventory_count * 0.4)

          optimizations.push({
            sku_id,
            source_location: store.store_id,
            target_location: store.store_id,
            recommended_quantity: markdownQty,
            optimization_type: "markdown",
            priority_score: 5,
            cost_impact: markdownQty * 8, // Revenue loss from markdown
            expected_benefit: markdownQty * 5, // Benefit from clearing inventory
            reasoning: `Apply markdown to clear excess inventory and reduce carrying costs at ${store.store_id}`,
            status: "pending",
          })
        }
      }
    }

    // Sort by priority and limit results
    optimizations.sort((a, b) => b.priority_score - a.priority_score)
    const topOptimizations = optimizations.slice(0, 50)

    // Insert optimizations into database
    if (topOptimizations.length > 0) {
      const { error: insertError } = await supabase.from("inventory_optimization").insert(topOptimizations)

      if (insertError) throw insertError
    }

    // Log agent action
    await supabase.from("agent_actions").insert({
      agent: "Inventory Optimizer",
      action: `Generated ${topOptimizations.length} inventory optimization opportunities`,
      status: "completed",
      entity_type: "inventory_optimization",
      metadata: {
        optimizations_created: topOptimizations.length,
        types: optimization_types,
        potential_savings: topOptimizations.reduce((sum, opt) => sum + opt.expected_benefit, 0),
        team: team || "crazsymb",
      },
    })

    return NextResponse.json({
      success: true,
      optimizations_created: topOptimizations.length,
      potential_savings: topOptimizations.reduce((sum, opt) => sum + opt.expected_benefit, 0),
      breakdown: {
        reallocation: topOptimizations.filter((opt) => opt.optimization_type === "reallocation").length,
        replenishment: topOptimizations.filter((opt) => opt.optimization_type === "replenishment").length,
        markdown: topOptimizations.filter((opt) => opt.optimization_type === "markdown").length,
      },
      team: team || "crazsymb",
      hackathon: "Walmart Sparkathon",
    })
  } catch (error: any) {
    console.error("Inventory optimization error:", error)
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
