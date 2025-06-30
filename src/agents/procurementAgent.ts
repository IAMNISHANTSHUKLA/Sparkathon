import { supabase } from "../config/supabase"
import { generateAIResponse } from "../config/googleAI"
import { logger } from "../utils/logger"
import type { AgentResult } from "../types"

export class ProcurementAgent {
  async execute(data?: any): Promise<AgentResult> {
    try {
      logger.info("Procurement Agent executing - Team crazsymb")

      // Get procurement data
      const { data: vendors, error: vendorError } = await supabase.from("vendors").select("*")

      const { data: invoices, error: invoiceError } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)

      if (vendorError || invoiceError) throw vendorError || invoiceError

      const optimization = await this.optimizeProcurement(vendors || [], invoices || [])

      // Log agent action
      await this.logAction("Analyzed procurement optimization opportunities", "completed")

      return {
        agent: "Procurement Agent",
        status: "success",
        message: `Procurement analysis completed, identified ${optimization.costSavingOpportunities.length} cost-saving opportunities`,
        data: optimization,
        recommendations: this.generateRecommendations(optimization),
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      logger.error("Procurement Agent failed:", error)
      await this.logAction("Procurement optimization failed", "failed")

      return {
        agent: "Procurement Agent",
        status: "error",
        message: error.message,
        timestamp: new Date().toISOString(),
      }
    }
  }

  private async optimizeProcurement(vendors: any[], invoices: any[]) {
    const optimization = {
      totalSpend: 0,
      vendorConcentration: {},
      costSavingOpportunities: [],
      riskDiversification: [],
      priceAnalysis: {},
      demandForecast: {},
      supplierRecommendations: [],
    }

    // Calculate total spend
    optimization.totalSpend = invoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0)

    // Analyze vendor concentration
    optimization.vendorConcentration = this.analyzeVendorConcentration(vendors, invoices)

    // Identify cost-saving opportunities
    optimization.costSavingOpportunities = await this.identifyCostSavings(vendors, invoices)

    // Analyze supply risk and diversification needs
    optimization.riskDiversification = this.analyzeSupplyRisk(vendors)

    // Price trend analysis
    optimization.priceAnalysis = this.analyzePriceTrends(invoices)

    // Demand forecasting
    optimization.demandForecast = this.forecastDemand(invoices)

    // Supplier recommendations
    optimization.supplierRecommendations = await this.generateSupplierRecommendations(vendors)

    // Use Google AI for procurement insights
    const aiPrompt = `Analyze procurement optimization data for Walmart Sparkathon project by team crazsymb:
    Total Spend: $${optimization.totalSpend}
    Cost Saving Opportunities: ${optimization.costSavingOpportunities.length}
    High Risk Vendors: ${optimization.riskDiversification.filter((r) => r.risk === "high").length}
    
    Provide strategic procurement insights and optimization recommendations.`

    try {
      const aiInsights = await generateAIResponse(aiPrompt, optimization)
      optimization["aiInsights"] = aiInsights
    } catch (error) {
      logger.error("AI analysis failed:", error)
    }

    return optimization
  }

  private analyzeVendorConcentration(vendors: any[], invoices: any[]) {
    const vendorSpend = {}

    invoices.forEach((invoice) => {
      if (invoice.vendor_id) {
        vendorSpend[invoice.vendor_id] = (vendorSpend[invoice.vendor_id] || 0) + invoice.amount
      }
    })

    const totalSpend = Object.values(vendorSpend).reduce((sum: number, spend: number) => sum + spend, 0)
    const concentration = {}

    Object.entries(vendorSpend).forEach(([vendorId, spend]) => {
      const vendor = vendors.find((v) => v.id === vendorId)
      if (vendor) {
        concentration[vendor.name] = {
          spend: spend as number,
          percentage: ((spend as number) / totalSpend) * 100,
        }
      }
    })

    return concentration
  }

  private async identifyCostSavings(vendors: any[], invoices: any[]) {
    const opportunities = []

    // Identify high-spend, low-performance vendors
    const vendorPerformance = this.calculateVendorPerformance(vendors, invoices)

    vendorPerformance.forEach((vendor) => {
      if (vendor.spend > 50000 && vendor.score < 80) {
        opportunities.push({
          type: "Vendor Optimization",
          vendor: vendor.name,
          potentialSaving: vendor.spend * 0.15, // 15% potential saving
          description: "Replace or negotiate better terms with underperforming vendor",
        })
      }
    })

    // Identify consolidation opportunities
    const categorySpend = this.analyzeCategorySpend(invoices)
    Object.entries(categorySpend).forEach(([category, data]: [string, any]) => {
      if (data.vendorCount > 3 && data.totalSpend > 100000) {
        opportunities.push({
          type: "Vendor Consolidation",
          category,
          potentialSaving: data.totalSpend * 0.08, // 8% saving through consolidation
          description: `Consolidate ${data.vendorCount} vendors in ${category} category`,
        })
      }
    })

    // Identify bulk purchase opportunities
    const frequentPurchases = this.identifyFrequentPurchases(invoices)
    frequentPurchases.forEach((purchase) => {
      opportunities.push({
        type: "Bulk Purchase",
        item: purchase.item,
        potentialSaving: purchase.totalSpend * 0.12, // 12% saving through bulk
        description: "Negotiate bulk pricing for frequent purchases",
      })
    })

    return opportunities
  }

  private calculateVendorPerformance(vendors: any[], invoices: any[]) {
    return vendors.map((vendor) => {
      const vendorInvoices = invoices.filter((inv) => inv.vendor_id === vendor.id)
      const totalSpend = vendorInvoices.reduce((sum, inv) => sum + inv.amount, 0)

      return {
        id: vendor.id,
        name: vendor.name,
        score: vendor.score,
        spend: totalSpend,
        invoiceCount: vendorInvoices.length,
      }
    })
  }

  private analyzeCategorySpend(invoices: any[]) {
    // Simulate category analysis
    const categories = ["Electronics", "Raw Materials", "Packaging", "Services", "Equipment"]
    const categoryData = {}

    categories.forEach((category) => {
      const categoryInvoices = invoices.filter(() => Math.random() < 0.2) // Random assignment for demo
      categoryData[category] = {
        totalSpend: categoryInvoices.reduce((sum, inv) => sum + inv.amount, 0),
        vendorCount: new Set(categoryInvoices.map((inv) => inv.vendor_id)).size,
        invoiceCount: categoryInvoices.length,
      }
    })

    return categoryData
  }

  private identifyFrequentPurchases(invoices: any[]) {
    // Simulate frequent purchase identification
    const items = ["Office Supplies", "IT Equipment", "Raw Materials", "Packaging"]

    return items.map((item) => ({
      item,
      frequency: Math.floor(Math.random() * 20) + 5,
      totalSpend: Math.floor(Math.random() * 100000) + 50000,
      averageOrderValue: Math.floor(Math.random() * 5000) + 1000,
    }))
  }

  private analyzeSupplyRisk(vendors: any[]) {
    return vendors.map((vendor) => {
      let riskLevel = "low"
      const riskFactors = []

      // Geographic risk
      const highRiskCountries = ["China", "India", "Vietnam", "Bangladesh"]
      if (highRiskCountries.some((country) => vendor.country?.includes(country))) {
        riskFactors.push("Geographic concentration")
        riskLevel = "medium"
      }

      // Performance risk
      if (vendor.score < 70) {
        riskFactors.push("Poor performance")
        riskLevel = "high"
      }

      // Delivery risk
      if (vendor.on_time_delivery_rate < 80) {
        riskFactors.push("Delivery reliability")
        riskLevel = riskLevel === "high" ? "high" : "medium"
      }

      return {
        vendor: vendor.name,
        risk: riskLevel,
        factors: riskFactors,
        recommendation: this.getRiskMitigation(riskLevel, riskFactors),
      }
    })
  }

  private getRiskMitigation(riskLevel: string, factors: string[]): string {
    if (riskLevel === "high") {
      return "Identify alternative suppliers and implement dual sourcing"
    } else if (riskLevel === "medium") {
      return "Monitor closely and develop contingency plans"
    }
    return "Continue current relationship with regular monitoring"
  }

  private analyzePriceTrends(invoices: any[]) {
    // Simulate price trend analysis
    const trends = {
      overall: "increasing",
      categories: {
        Electronics: { trend: "decreasing", change: -5.2 },
        "Raw Materials": { trend: "increasing", change: 8.7 },
        Packaging: { trend: "stable", change: 1.1 },
        Services: { trend: "increasing", change: 3.4 },
      },
      recommendations: [
        "Lock in electronics pricing with long-term contracts",
        "Explore alternative raw material sources",
        "Negotiate service rate caps",
      ],
    }

    return trends
  }

  private forecastDemand(invoices: any[]) {
    // Simulate demand forecasting
    const forecast = {
      nextQuarter: {
        expectedSpend: Math.floor(Math.random() * 1000000) + 2000000,
        confidence: 85,
        keyDrivers: ["Seasonal demand", "New product launches", "Market expansion"],
      },
      recommendations: [
        "Increase inventory for Q4 seasonal demand",
        "Secure capacity with key suppliers",
        "Consider forward buying for volatile commodities",
      ],
    }

    return forecast
  }

  private async generateSupplierRecommendations(vendors: any[]) {
    const recommendations = []

    // Recommend new suppliers for diversification
    recommendations.push({
      type: "New Supplier",
      category: "Electronics",
      reason: "Diversify supply base and reduce geographic risk",
      criteria: "ISO certified, <50% China exposure, >90% OTD rate",
    })

    // Recommend supplier development
    const lowPerformers = vendors.filter((v) => v.score < 75)
    if (lowPerformers.length > 0) {
      recommendations.push({
        type: "Supplier Development",
        vendors: lowPerformers.slice(0, 3).map((v) => v.name),
        reason: "Improve performance of existing suppliers",
        actions: ["Quality improvement programs", "Delivery optimization", "Cost reduction initiatives"],
      })
    }

    return recommendations
  }

  private generateRecommendations(optimization: any): string[] {
    const recommendations = []

    if (optimization.costSavingOpportunities.length > 0) {
      const totalSavings = optimization.costSavingOpportunities.reduce((sum, opp) => sum + opp.potentialSaving, 0)
      recommendations.push(`Implement cost-saving initiatives for potential $${Math.round(totalSavings)} savings`)
    }

    const highRiskVendors = optimization.riskDiversification.filter((r) => r.risk === "high")
    if (highRiskVendors.length > 0) {
      recommendations.push(`Develop alternative suppliers for ${highRiskVendors.length} high-risk vendors`)
    }

    recommendations.push("Implement strategic sourcing for top spend categories")
    recommendations.push("Establish vendor performance scorecards and SLAs")
    recommendations.push("Consider e-procurement platform for efficiency gains")

    return recommendations
  }

  private async logAction(action: string, status: string) {
    try {
      await supabase.from("agent_actions").insert({
        agent: "Procurement Agent",
        action,
        status,
        entity_type: "procurement",
      })
    } catch (error) {
      logger.error("Failed to log agent action:", error)
    }
  }
}
