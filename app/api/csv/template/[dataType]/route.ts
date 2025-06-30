import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { dataType: string } }) {
  const { dataType } = params

  const templates: Record<string, { headers: string[]; sample: string[][] }> = {
    vendors: {
      headers: [
        "name",
        "email",
        "phone",
        "address",
        "country",
        "score",
        "on_time_delivery_rate",
        "quality_score",
        "response_time",
      ],
      sample: [
        [
          "Walmart Supplier Co",
          "contact@walmartsupp.com",
          "+1-555-0123",
          "123 Supply St, Bentonville, AR",
          "USA",
          "95",
          "98.5",
          "96.2",
          "1 hour",
        ],
        [
          "Great Value Mfg",
          "info@greatvalue.com",
          "+1-555-0124",
          "456 Manufacturing Blvd, Detroit, MI",
          "USA",
          "88",
          "92.5",
          "89.0",
          "2 hours",
        ],
        [
          "Global Electronics Ltd",
          "sales@globalelec.cn",
          "+86-21-9876-5432",
          "789 Tech Park, Shanghai",
          "China",
          "78",
          "82.8",
          "85.2",
          "4 hours",
        ],
      ],
    },
    shipments: {
      headers: [
        "shipment_id",
        "vendor_id",
        "origin",
        "destination",
        "carrier",
        "status",
        "eta",
        "value",
        "currency",
        "tracking_number",
      ],
      sample: [
        [
          "WMT-SHP-001",
          "vendor-uuid-here",
          "Shanghai, China",
          "Walmart DC, Bentonville, AR",
          "FedEx",
          "in-transit",
          "2024-02-15",
          "25000",
          "USD",
          "TRK123456789",
        ],
        [
          "WMT-SHP-002",
          "vendor-uuid-here",
          "Hamburg, Germany",
          "Walmart DC, New York",
          "DHL",
          "delivered",
          "2024-02-10",
          "18500",
          "USD",
          "TRK987654321",
        ],
        [
          "WMT-SHP-003",
          "vendor-uuid-here",
          "Mumbai, India",
          "Walmart DC, California",
          "UPS",
          "customs",
          "2024-02-20",
          "32100",
          "USD",
          "TRK456789123",
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
        "payment_date",
      ],
      sample: [
        [
          "WMT-INV-001",
          "vendor-uuid-here",
          "PO-12345",
          "GRN-67890",
          "paid",
          "15000",
          "USD",
          "2024-01-01",
          "2024-01-31",
          "2024-01-25",
        ],
        [
          "WMT-INV-002",
          "vendor-uuid-here",
          "PO-12346",
          "GRN-67891",
          "pending",
          "22500",
          "USD",
          "2024-01-15",
          "2024-02-15",
          "",
        ],
        [
          "WMT-INV-003",
          "vendor-uuid-here",
          "PO-12347",
          "GRN-67892",
          "approved",
          "8750",
          "USD",
          "2024-01-10",
          "2024-02-10",
          "",
        ],
      ],
    },
    esg_scores: {
      headers: [
        "vendor_id",
        "overall_score",
        "environmental_score",
        "social_score",
        "governance_score",
        "carbon_footprint",
        "assessment_date",
      ],
      sample: [
        ["vendor-uuid-here", "85", "82", "88", "85", "1250.5 tons CO2", "2024-01-01"],
        ["vendor-uuid-here", "78", "75", "80", "79", "1850.2 tons CO2", "2024-01-01"],
        ["vendor-uuid-here", "92", "95", "90", "91", "750.8 tons CO2", "2024-01-01"],
      ],
    },
    esg_risks: {
      headers: ["vendor_id", "type", "severity", "region", "description", "mitigation_plan", "status"],
      sample: [
        [
          "vendor-uuid-here",
          "Environmental",
          "high",
          "Southeast Asia",
          "Deforestation risk in supply chain",
          "Implement sustainable sourcing",
          "open",
        ],
        [
          "vendor-uuid-here",
          "Social",
          "medium",
          "South America",
          "Labor compliance monitoring needed",
          "Quarterly audits scheduled",
          "in-progress",
        ],
        [
          "vendor-uuid-here",
          "Governance",
          "low",
          "Europe",
          "Transparency improvement required",
          "Enhanced reporting implemented",
          "resolved",
        ],
      ],
    },
  }

  const template = templates[dataType]
  if (!template) {
    return NextResponse.json(
      {
        success: false,
        message: `Template not found for data type: ${dataType}`,
        availableTypes: Object.keys(templates),
        team: "crazsymb",
      },
      { status: 400 },
    )
  }

  // Generate CSV content
  const csvContent = [template.headers.join(","), ...template.sample.map((row) => row.join(","))].join("\n")

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${dataType}_template_walmart_sparkathon.csv"`,
      "X-Team": "crazsymb",
      "X-Hackathon": "Walmart Sparkathon",
    },
  })
}
