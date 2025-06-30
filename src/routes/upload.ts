import { Router } from "express"
import multer from "multer"
import csv from "csv-parser"
import fs from "fs"
import path from "path"
import { asyncHandler } from "../middleware/errorHandler"
import { supabase } from "../config/supabase"
import { logger } from "../utils/logger"

const router = Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_PATH || "./uploads"
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE || "10485760"), // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".csv", ".xlsx", ".xls", ".json", ".pdf", ".txt"]
    const ext = path.extname(file.originalname).toLowerCase()

    if (allowedTypes.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error(`File type ${ext} not allowed. Allowed types: ${allowedTypes.join(", ")}`))
    }
  },
})

// Upload and process CSV files
router.post(
  "/csv",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
        team: "crazsymb",
      })
    }

    const { dataType } = req.body // vendors, shipments, invoices, etc.
    const filePath = req.file.path

    logger.info(`Processing CSV upload: ${req.file.originalname}`, {
      team: "crazsymb",
      dataType,
      fileSize: req.file.size,
    })

    try {
      const results = await processCsvFile(filePath, dataType)

      // Clean up uploaded file
      fs.unlinkSync(filePath)

      res.json({
        success: true,
        message: `Successfully processed ${results.processed} records`,
        data: {
          processed: results.processed,
          errors: results.errors,
          sample: results.sample,
        },
        team: "crazsymb",
        hackathon: "Walmart Sparkathon",
      })
    } catch (error) {
      // Clean up uploaded file on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }

      logger.error("CSV processing failed:", error)
      throw error
    }
  }),
)

// Generate sample CSV templates
router.get(
  "/template/:dataType",
  asyncHandler(async (req, res) => {
    const { dataType } = req.params

    const templates = {
      vendors: {
        headers: ["name", "email", "phone", "address", "country", "score", "on_time_delivery_rate", "quality_score"],
        sample: [
          ["Acme Corp", "contact@acme.com", "+1-555-0123", "123 Main St", "USA", "85", "92.5", "88.0"],
          [
            "Global Supplies Ltd",
            "info@globalsupplies.com",
            "+44-20-1234-5678",
            "456 High St",
            "UK",
            "78",
            "85.2",
            "82.5",
          ],
        ],
      },
      shipments: {
        headers: ["shipment_id", "vendor_id", "origin", "destination", "carrier", "status", "eta", "value", "currency"],
        sample: [
          [
            "SHP-001",
            "vendor-1",
            "Shanghai, China",
            "Los Angeles, USA",
            "FedEx",
            "in-transit",
            "2024-01-15",
            "25000",
            "USD",
          ],
          [
            "SHP-002",
            "vendor-2",
            "Hamburg, Germany",
            "New York, USA",
            "DHL",
            "delivered",
            "2024-01-10",
            "18500",
            "USD",
          ],
        ],
      },
      invoices: {
        headers: [
          "invoice_number",
          "vendor_id",
          "po_number",
          "grn_number",
          "status",
          "amount",
          "currency",
          "issue_date",
          "due_date",
        ],
        sample: [
          ["INV-001", "vendor-1", "PO-12345", "GRN-67890", "pending", "15000", "USD", "2024-01-01", "2024-01-31"],
          ["INV-002", "vendor-2", "PO-12346", "GRN-67891", "paid", "22500", "USD", "2023-12-15", "2024-01-15"],
        ],
      },
    }

    const template = templates[dataType]
    if (!template) {
      return res.status(400).json({
        success: false,
        message: `Template not found for data type: ${dataType}`,
        availableTypes: Object.keys(templates),
        team: "crazsymb",
      })
    }

    // Generate CSV content
    const csvContent = [template.headers.join(","), ...template.sample.map((row) => row.join(","))].join("\n")

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", `attachment; filename="${dataType}_template.csv"`)
    res.send(csvContent)
  }),
)

// Process uploaded CSV file
async function processCsvFile(filePath: string, dataType: string) {
  return new Promise((resolve, reject) => {
    const results = {
      processed: 0,
      errors: [],
      sample: [],
    }

    const records = []

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        records.push(data)
        if (results.sample.length < 3) {
          results.sample.push(data)
        }
      })
      .on("end", async () => {
        try {
          // Process records based on data type
          for (const record of records) {
            try {
              await insertRecord(dataType, record)
              results.processed++
            } catch (error) {
              results.errors.push({
                record,
                error: error.message,
              })
            }
          }

          logger.info(`CSV processing completed: ${results.processed} records processed`, {
            team: "crazsymb",
            dataType,
            errors: results.errors.length,
          })

          resolve(results)
        } catch (error) {
          reject(error)
        }
      })
      .on("error", (error) => {
        reject(error)
      })
  })
}

// Insert record into appropriate table
async function insertRecord(dataType: string, record: any) {
  const tableName = getTableName(dataType)
  const processedRecord = processRecord(dataType, record)

  const { error } = await supabase.from(tableName).insert(processedRecord)

  if (error) {
    throw new Error(`Database insert failed: ${error.message}`)
  }
}

// Get table name for data type
function getTableName(dataType: string): string {
  const tableMap = {
    vendors: "vendors",
    shipments: "shipments",
    invoices: "invoices",
    esg_scores: "esg_scores",
    esg_risks: "esg_risks",
  }

  return tableMap[dataType] || dataType
}

// Process record based on data type
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

    default:
      return { ...record, created_at: now, updated_at: now }
  }
}

export default router
