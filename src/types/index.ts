export interface Vendor {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  country?: string
  score: number
  on_time_delivery_rate: number
  quality_score: number
  response_time?: string
  created_at: string
  updated_at: string
}

export interface Shipment {
  id: string
  shipment_id: string
  vendor_id?: string
  origin: string
  destination: string
  carrier?: string
  status: "pending" | "in-transit" | "delivered" | "delayed" | "customs"
  eta?: string
  actual_delivery?: string
  value?: number
  currency: string
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  invoice_number: string
  vendor_id?: string
  po_number?: string
  grn_number?: string
  status: "pending" | "approved" | "rejected" | "paid"
  amount: number
  currency: string
  issue_date?: string
  due_date?: string
  payment_date?: string
  created_at: string
  updated_at: string
}

export interface InvoiceDiscrepancy {
  id: string
  invoice_id: string
  type: string
  item: string
  po_value?: string
  invoice_value?: string
  created_at: string
}

export interface ESGScore {
  id: string
  vendor_id: string
  overall_score: number
  environmental_score: number
  social_score: number
  governance_score: number
  carbon_footprint?: string
  assessment_date: string
  created_at: string
  updated_at: string
}

export interface ESGRisk {
  id: string
  vendor_id: string
  type: string
  severity: "low" | "medium" | "high" | "critical"
  region?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface AgentAction {
  id: string
  agent: string
  action: string
  status: "pending" | "completed" | "failed" | "warning"
  entity_type?: string
  entity_id?: string
  created_at: string
}

export interface Document {
  id: string
  name: string
  type: string
  entity_type: string
  entity_id: string
  url: string
  size?: number
  created_at: string
  updated_at: string
}

export interface DashboardKPIs {
  totalShipments: number
  vendorScore: number
  invoiceAccuracy: number
  agentActions: number
  monthlySpend: number
  onTimeDelivery: number
  riskAlerts: number
  esgCompliance: number
}

export interface AgentResult {
  agent: string
  status: "success" | "warning" | "error"
  message: string
  data?: any
  recommendations?: string[]
  timestamp: string
}
