import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, supabaseHelpers } from "@/lib/supabase"
import csv from "csv-parser"
import { Readable } from "stream"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const dataType = formData.get("dataType") as string
    const uploadId = formData.get("uploadId") as string

    if (!file || !dataType || !uploadId) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Convert file to readable stream
    const buffer = Buffer.from(await file.arrayBuffer())
    const stream = Readable.from(buffer)

    const records: any[] = []
    const errors: any[] = []

    // Parse CSV
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on("data", (data) => {
          records.push(data)
        })
        .on("end", resolve)
        .on("error", reject)
    })

    let processed = 0
    let failed = 0

    // Process records in batches
    const batchSize = 100
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize)
      const processedBatch = batch.map((record) => processRecord(dataType, record))

      try {
        await supabaseHelpers.bulkInsert(getTableName(dataType), processedBatch)
        processed += processedBatch.length
      } catch (error: any) {
        failed += processedBatch.length
        errors.push({
          batch: i / batchSize + 1,
          error: error.message,
          records: processedBatch.length,
        })
      }
    }

    // Update upload status
    await supabaseHelpers.updateCSVUploadStatus(
      uploadId,
      failed > 0 ? "completed" : "completed",
      processed,
      failed,
      errors.length > 0 ? { errors } : null,
    )

    return NextResponse.json({
      success: true,
      processed,
      failed,
      total: records.length,
      errors,
      team: "crazsymb",
      hackathon: "Walmart Sparkathon",
    })
  } catch (error: any) {
    console.error("CSV processing error:", error)

    // Update upload status to failed if uploadId is available
    const formData = await request.formData()
    const uploadId = formData.get("uploadId") as string

    if (uploadId) {
      try {
        await supabaseHelpers.updateCSVUploadStatus(uploadId, "failed", 0, 0, { error: error.message })
      } catch (updateError) {
        console.error("Failed to update upload status:", updateError)
      }
    }

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

function getTableName(dataType: string): string {
  const tableMap: Record<string, string> = {
    vendors: "vendors",
    shipments: "shipments",
    invoices: "invoices",
    esg_scores: "esg_scores",
    esg_risks: "esg_risks",
  }
  return tableMap[dataType] || dataType
}

function processRecord(dataType: string, record: any) {
  const now = new Date().toISOString()

  switch (dataType) {
    case "vendors":
      return {
        name: record.name,
        email: record.email || null,
        phone: record.phone || null,
        address: record.address || null,
        country: record.country || null,
        score: Number.parseInt(record.score) || 0,
        on_time_delivery_rate: Number.parseFloat(record.on_time_delivery_rate) || 0,
        quality_score: Number.parseFloat(record.quality_score) || 0,
        response_time: record.response_time || null,
        created_at: now,
        updated_at: now,
      }

    case "shipments":
      return {
        shipment_id: record.shipment_id,
        vendor_id: record.vendor_id || null,
        origin: record.origin,
        destination: record.destination,
        carrier: record.carrier || null,
        status: record.status || "pending",
        eta: record.eta ? new Date(record.eta).toISOString() : null,
        actual_delivery: record.actual_delivery ? new Date(record.actual_delivery).toISOString() : null,
        value: Number.parseFloat(record.value) || null,
        currency: record.currency || "USD",
        tracking_number: record.tracking_number || null,
        created_at: now,
        updated_at: now,
      }

    case "invoices":
      return {
        invoice_number: record.invoice_number,
        vendor_id: record.vendor_id || null,
        po_number: record.po_number || null,
        grn_number: record.grn_number || null,
        status: record.status || "pending",
        amount: Number.parseFloat(record.amount) || 0,
        currency: record.currency || "USD",
        issue_date: record.issue_date ? new Date(record.issue_date).toISOString() : null,
        due_date: record.due_date ? new Date(record.due_date).toISOString() : null,
        payment_date: record.payment_date ? new Date(record.payment_date).toISOString() : null,
        created_at: now,
        updated_at: now,
      }

    case "esg_scores":
      return {
        vendor_id: record.vendor_id,
        overall_score: Number.parseInt(record.overall_score) || 0,
        environmental_score: Number.parseInt(record.environmental_score) || 0,
        social_score: Number.parseInt(record.social_score) || 0,
        governance_score: Number.parseInt(record.governance_score) || 0,
        carbon_footprint: record.carbon_footprint || null,
        assessment_date: record.assessment_date ? new Date(record.assessment_date).toISOString() : now,
        created_at: now,
        updated_at: now,
      }

    case "esg_risks":
      return {
        vendor_id: record.vendor_id,
        type: record.type,
        severity: record.severity || "medium",
        region: record.region || null,
        description: record.description || null,
        mitigation_plan: record.mitigation_plan || null,
        status: record.status || "open",
        created_at: now,
        updated_at: now,
      }

    default:
      return { ...record, created_at: now, updated_at: now }
  }
}
