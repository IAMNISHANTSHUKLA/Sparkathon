import { supabase } from "../config/supabase"
import type { DashboardKPIs } from "../types"
import { logger } from "../utils/logger"

export class DashboardService {
  async getKPIs(): Promise<DashboardKPIs> {
    try {
      // Get total shipments
      const { count: totalShipments } = await supabase.from("shipments").select("*", { count: "exact", head: true })

      // Get average vendor score
      const { data: vendorScores } = await supabase.from("vendors").select("score")

      const avgVendorScore = vendorScores?.length
        ? vendorScores.reduce((sum, v) => sum + v.score, 0) / vendorScores.length
        : 0

      // Get invoice accuracy
      const { count: totalInvoices } = await supabase.from("invoices").select("*", { count: "exact", head: true })

      const { count: discrepancies } = await supabase
        .from("invoice_discrepancies")
        .select("*", { count: "exact", head: true })

      const invoiceAccuracy = totalInvoices ? ((totalInvoices - (discrepancies || 0)) / totalInvoices) * 100 : 100

      // Get agent actions count
      const { count: agentActions } = await supabase.from("agent_actions").select("*", { count: "exact", head: true })

      // Calculate other KPIs with sample data
      const monthlySpend = 2500000 // Sample data
      const onTimeDelivery = 87.5 // Sample data
      const riskAlerts = 12 // Sample data
      const esgCompliance = 94.2 // Sample data

      return {
        totalShipments: totalShipments || 246,
        vendorScore: Math.round(avgVendorScore) || 87,
        invoiceAccuracy: Math.round(invoiceAccuracy * 10) / 10 || 94.2,
        agentActions: agentActions || 1284,
        monthlySpend,
        onTimeDelivery,
        riskAlerts,
        esgCompliance,
      }
    } catch (error) {
      logger.error("Error getting KPIs:", error)
      // Return sample data for hackathon demo
      return {
        totalShipments: 246,
        vendorScore: 87,
        invoiceAccuracy: 94.2,
        agentActions: 1284,
        monthlySpend: 2500000,
        onTimeDelivery: 87.5,
        riskAlerts: 12,
        esgCompliance: 94.2,
      }
    }
  }

  async getRecentActivities(limit = 10) {
    try {
      const { data: activities } = await supabase
        .from("agent_actions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)

      return activities || this.getSampleActivities()
    } catch (error) {
      logger.error("Error getting recent activities:", error)
      return this.getSampleActivities()
    }
  }

  async getAnalytics(period: string) {
    try {
      // Generate sample analytics data for hackathon
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const data = months.map((month) => ({
        name: month,
        total: Math.floor(Math.random() * 2000) + 1500,
        shipments: Math.floor(Math.random() * 50) + 20,
        vendors: Math.floor(Math.random() * 10) + 5,
      }))

      return {
        spendData: data,
        shipmentTrends: data,
        vendorPerformance: data,
      }
    } catch (error) {
      logger.error("Error getting analytics:", error)
      return { spendData: [], shipmentTrends: [], vendorPerformance: [] }
    }
  }

  async getRiskAssessment() {
    try {
      const { data: risks } = await supabase
        .from("esg_risks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      return risks || this.getSampleRisks()
    } catch (error) {
      logger.error("Error getting risk assessment:", error)
      return this.getSampleRisks()
    }
  }

  private getSampleActivities() {
    return [
      {
        id: "act-001",
        agent: "Vendor Monitor Agent",
        action: "Detected late delivery pattern for Supplier XYZ",
        status: "warning",
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "act-002",
        agent: "Invoice Validator Agent",
        action: "Validated 12 invoices against POs",
        status: "completed",
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "act-003",
        agent: "Shipment Tracker Agent",
        action: "Monitoring weather conditions for 8 active shipments",
        status: "pending",
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
    ]
  }

  private getSampleRisks() {
    return [
      {
        id: "risk-001",
        vendor_id: "vendor-1",
        type: "Environmental",
        severity: "high",
        region: "Southeast Asia",
        description: "Potential deforestation in supply chain",
        created_at: new Date().toISOString(),
      },
      {
        id: "risk-002",
        vendor_id: "vendor-2",
        type: "Social",
        severity: "medium",
        region: "South America",
        description: "Labor compliance concerns",
        created_at: new Date().toISOString(),
      },
    ]
  }
}
