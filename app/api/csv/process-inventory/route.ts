import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import Papa from "papaparse"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const dataType = formData.get("dataType") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Read and parse CSV
    const text = await file.text()
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().replace(/\s+/g, "_"),
    })

    if (parsed.errors.length > 0) {
      return NextResponse.json(
        {
          error: "CSV parsing failed",
          details: parsed.errors,
        },
        { status: 400 },
      )
    }

    const records = parsed.data as any[]
    let processedCount = 0
    let failedCount = 0
    const errors: string[] = []

    // Process inventory data
    if (dataType === "inventory_data") {
      for (const record of records) {
        try {
          // Validate required fields
          if (!record.sku_id || !record.category || !record.region || !record.store_id) {
            throw new Error("Missing required fields: sku_id, category, region, store_id")
          }

          // Parse JSON fields
          let pastSalesWeekly = []
          if (record.past_sales_weekly) {
            try {
              pastSalesWeekly = JSON.parse(record.past_sales_weekly.replace(/'/g, '"'))
            } catch {
              pastSalesWeekly = record.past_sales_weekly.split(",").map((n: string) => Number.parseInt(n.trim()))
            }
          }

          let weatherForecast = {}
          if (record.weather_forecast) {
            try {
              weatherForecast = JSON.parse(record.weather_forecast.replace(/'/g, '"'))
            } catch {
              weatherForecast = {}
            }
          }

          let promotionalFlags = {}
          if (record.promotional_flags) {
            try {
              promotionalFlags = JSON.parse(record.promotional_flags.replace(/'/g, '"'))
            } catch {
              promotionalFlags = {}
            }
          }

          const inventoryRecord = {
            sku_id: record.sku_id,
            category: record.category,
            region: record.region,
            store_id: record.store_id,
            past_sales_weekly: pastSalesWeekly,
            search_volume: Number.parseInt(record.search_volume) || 0,
            page_views: Number.parseInt(record.page_views) || 0,
            inventory_count: Number.parseInt(record.inventory_count) || 0,
            stockouts: Number.parseInt(record.stockouts) || 0,
            returns: Number.parseInt(record.returns) || 0,
            temperature: Number.parseFloat(record.temperature) || null,
            zip_code: record.zip_code || null,
            weather_forecast: weatherForecast,
            economic_index: Number.parseFloat(record.economic_index) || null,
            promotional_flags: promotionalFlags,
            date_recorded: record.date_recorded || new Date().toISOString().split("T")[0],
          }

          const { error } = await supabase.from("inventory_data").insert(inventoryRecord)

          if (error) throw error
          processedCount++
        } catch (error: any) {
          failedCount++
          errors.push(`Row ${processedCount + failedCount}: ${error.message}`)
        }
      }
    }

    // Process vendor data
    else if (dataType === "vendors") {
      for (const record of records) {
        try {
          if (!record.name) {
            throw new Error("Missing required field: name")
          }

          const vendorRecord = {
            name: record.name,
            email: record.email || null,
            phone: record.phone || null,
            address: record.address || null,
            country: record.country || null,
            region: record.region || null,
            score: Number.parseInt(record.score) || 0,
            on_time_delivery_rate: Number.parseFloat(record.on_time_delivery_rate) || 0,
            quality_score: Number.parseFloat(record.quality_score) || 0,
            supplier_type: record.supplier_type || "standard",
            walmart_certified: record.walmart_certified === "true" || record.walmart_certified === true,
          }

          const { error } = await supabase.from("vendors").insert(vendorRecord)

          if (error) throw error
          processedCount++
        } catch (error: any) {
          failedCount++
          errors.push(`Row ${processedCount + failedCount}: ${error.message}`)
        }
      }
    }

    // Log the upload
    await supabase.from("csv_uploads").insert({
      filename: file.name,
      original_name: file.name,
      data_type: dataType,
      file_size: file.size,
      records_processed: processedCount,
      records_failed: failedCount,
      status: failedCount === 0 ? "completed" : "completed",
      error_details: errors.length > 0 ? { errors } : null,
      uploaded_by: "system",
      completed_at: new Date().toISOString(),
    })

    // Create notification
    await supabase.from("notifications").insert({
      title: "CSV Upload Complete",
      message: `Processed ${processedCount} records from ${file.name}${failedCount > 0 ? ` (${failedCount} failed)` : ""}`,
      type: failedCount === 0 ? "success" : "warning",
      priority: "medium",
      metadata: {
        file_name: file.name,
        data_type: dataType,
        processed: processedCount,
        failed: failedCount,
        team: "crazsymb",
      },
    })

    // Log agent action
    await supabase.from("agent_actions").insert({
      agent: "CSV Processor",
      action: `Processed ${dataType} CSV upload: ${processedCount} records`,
      status: failedCount === 0 ? "completed" : "warning",
      entity_type: "csv_uploads",
      metadata: {
        file_name: file.name,
        records_processed: processedCount,
        records_failed: failedCount,
        team: "crazsymb",
      },
    })

    return NextResponse.json({
      success: true,
      processed: processedCount,
      failed: failedCount,
      errors: errors.slice(0, 10), // Limit error details
      team: "crazsymb",
      hackathon: "Walmart Sparkathon",
    })
  } catch (error: any) {
    console.error("CSV processing error:", error)
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
