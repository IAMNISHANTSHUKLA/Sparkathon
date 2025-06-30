import { supabase } from "../config/supabase"
import { logger } from "../utils/logger"

export async function generateSampleData() {
  logger.info("Generating sample data for OpsPilot - Team crazsymb")

  try {
    // Generate sample vendors
    await generateSampleVendors()

    // Generate sample shipments
    await generateSampleShipments()

    // Generate sample invoices
    await generateSampleInvoices()

    // Generate sample ESG data
    await generateSampleESGData()

    logger.info("Sample data generation completed successfully")
    return true
  } catch (error) {
    logger.error("Sample data generation failed:", error)
    return false
  }
}

async function generateSampleVendors() {
  const vendors = [
    {
      name: "Acme Manufacturing Corp",
      email: "contact@acme-mfg.com",
      phone: "+1-555-0123",
      address: "123 Industrial Blvd, Detroit, MI",
      country: "USA",
      score: 85,
      on_time_delivery_rate: 92.5,
      quality_score: 88.0,
      response_time: "2 hours",
    },
    {
      name: "Global Supplies Ltd",
      email: "info@globalsupplies.com",
      phone: "+44-20-1234-5678",
      address: "456 High Street, London",
      country: "UK",
      score: 78,
      on_time_delivery_rate: 85.2,
      quality_score: 82.5,
      response_time: "4 hours",
    },
    {
      name: "Shanghai Electronics Co",
      email: "sales@shanghai-elec.cn",
      phone: "+86-21-9876-5432",
      address: "789 Pudong Ave, Shanghai",
      country: "China",
      score: 72,
      on_time_delivery_rate: 78.8,
      quality_score: 85.2,
      response_time: "6 hours",
    },
    {
      name: "Mumbai Textiles Pvt Ltd",
      email: "export@mumbai-textiles.in",
      phone: "+91-22-8765-4321",
      address: "321 Export Zone, Mumbai",
      country: "India",
      score: 68,
      on_time_delivery_rate: 75.5,
      quality_score: 79.8,
      response_time: "8 hours",
    },
    {
      name: "Nordic Components AB",
      email: "orders@nordic-comp.se",
      phone: "+46-8-555-1234",
      address: "654 Tech Park, Stockholm",
      country: "Sweden",
      score: 91,
      on_time_delivery_rate: 96.2,
      quality_score: 94.5,
      response_time: "1 hour",
    },
  ]

  for (const vendor of vendors) {
    await supabase.from("vendors").insert({
      ...vendor,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  logger.info(`Generated ${vendors.length} sample vendors`)
}

async function generateSampleShipments() {
  // Get vendor IDs
  const { data: vendors } = await supabase.from("vendors").select("id")
  const vendorIds = vendors?.map((v) => v.id) || []

  const shipments = [
    {
      shipment_id: "SHP-34567",
      vendor_id: vendorIds[0],
      origin: "Shanghai, China",
      destination: "Los Angeles, USA",
      carrier: "FastFreight Express",
      status: "in-transit",
      eta: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      value: 45200,
      currency: "USD",
    },
    {
      shipment_id: "SHP-34568",
      vendor_id: vendorIds[1],
      origin: "Hamburg, Germany",
      destination: "New York, USA",
      carrier: "OceanLine",
      status: "customs",
      eta: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      value: 32100,
      currency: "USD",
    },
    {
      shipment_id: "SHP-34569",
      vendor_id: vendorIds[2],
      origin: "Tokyo, Japan",
      destination: "Seattle, USA",
      carrier: "PacificShip",
      status: "delayed",
      eta: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      value: 28900,
      currency: "USD",
    },
    {
      shipment_id: "SHP-34570",
      vendor_id: vendorIds[3],
      origin: "Rotterdam, Netherlands",
      destination: "Boston, USA",
      carrier: "AtlanticFreight",
      status: "delivered",
      actual_delivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      value: 19500,
      currency: "USD",
    },
    {
      shipment_id: "SHP-34571",
      vendor_id: vendorIds[4],
      origin: "Mumbai, India",
      destination: "Dubai, UAE",
      carrier: "IndianOcean",
      status: "in-transit",
      eta: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      value: 22300,
      currency: "USD",
    },
  ]

  for (const shipment of shipments) {
    await supabase.from("shipments").insert({
      ...shipment,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  logger.info(`Generated ${shipments.length} sample shipments`)
}

async function generateSampleInvoices() {
  // Get vendor IDs
  const { data: vendors } = await supabase.from("vendors").select("id")
  const vendorIds = vendors?.map((v) => v.id) || []

  const invoices = [
    {
      invoice_number: "INV-2024-001",
      vendor_id: vendorIds[0],
      po_number: "PO-12345",
      grn_number: "GRN-67890",
      status: "pending",
      amount: 15000,
      currency: "USD",
      issue_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      invoice_number: "INV-2024-002",
      vendor_id: vendorIds[1],
      po_number: "PO-12346",
      grn_number: "GRN-67891",
      status: "approved",
      amount: 22500,
      currency: "USD",
      issue_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      invoice_number: "INV-2024-003",
      vendor_id: vendorIds[2],
      po_number: "PO-12347",
      grn_number: "GRN-67892",
      status: "paid",
      amount: 8750,
      currency: "USD",
      issue_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      payment_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      invoice_number: "INV-2024-004",
      vendor_id: vendorIds[3],
      po_number: "PO-12348",
      grn_number: "GRN-67893",
      status: "rejected",
      amount: 12300,
      currency: "USD",
      issue_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  for (const invoice of invoices) {
    await supabase.from("invoices").insert({
      ...invoice,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  logger.info(`Generated ${invoices.length} sample invoices`)
}

async function generateSampleESGData() {
  // Get vendor IDs
  const { data: vendors } = await supabase.from("vendors").select("id")
  const vendorIds = vendors?.map((v) => v.id) || []

  // Generate ESG scores
  const esgScores = vendorIds.map((vendorId, index) => ({
    vendor_id: vendorId,
    overall_score: 70 + Math.floor(Math.random() * 25), // 70-95
    environmental_score: 65 + Math.floor(Math.random() * 30), // 65-95
    social_score: 75 + Math.floor(Math.random() * 20), // 75-95
    governance_score: 80 + Math.floor(Math.random() * 15), // 80-95
    carbon_footprint: (Math.random() * 1000 + 500).toFixed(2), // 500-1500 tons CO2
    assessment_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))

  for (const score of esgScores) {
    await supabase.from("esg_scores").insert(score)
  }

  // Generate ESG risks
  const riskTypes = ["Environmental", "Social", "Governance"]
  const severities = ["low", "medium", "high", "critical"]
  const regions = ["Southeast Asia", "South America", "Eastern Europe", "Africa", "Middle East"]

  const esgRisks = []
  for (let i = 0; i < 10; i++) {
    esgRisks.push({
      vendor_id: vendorIds[Math.floor(Math.random() * vendorIds.length)],
      type: riskTypes[Math.floor(Math.random() * riskTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      region: regions[Math.floor(Math.random() * regions.length)],
      description: `Sample ESG risk description ${i + 1}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  for (const risk of esgRisks) {
    await supabase.from("esg_risks").insert(risk)
  }

  logger.info(`Generated ${esgScores.length} ESG scores and ${esgRisks.length} ESG risks`)
}
