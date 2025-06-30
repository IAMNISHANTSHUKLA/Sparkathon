import { supabase } from "../config/supabase"
import { generateAIResponse } from "../config/googleAI"
import { logger } from "../utils/logger"
import type { AgentResult } from "../types"

export class VendorMonitorAgent {
  async execute(data?: any): Promise<AgentResult> {
    try {
      logger.info("Vendor Monitor Agent executing - Team crazsymb")

      // Get vendor data
      const { data: vendors, error } = await supabase.from("vendors").select("*")

      if (error) throw error

      const analysis = await this.analyzeVendorPerformance(vendors || [])

      // Log agent action
      await this.logAction("Analyzed vendor performance metrics", "completed")

      return {
        agent: "Vendor Monitor Agent",
        status: "success",
        message: "Vendor performance analysis completed",
        data: analysis,
        recommendations: this.generateRecommendations(analysis),
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      logger.error("Vendor Monitor Agent failed:", error)
      await this.logAction("Vendor analysis failed", "failed")

      return {
        agent: "Vendor Monitor Agent",
        status: "error",
        message: error.message,
        timestamp: new Date().toISOString(),
      }
    }
  }

  private async analyzeVendorPerformance(vendors: any[]) {
    const analysis = {
      totalVendors: vendors.length,
      averageScore: 0,
      topPerformers: [],
      underPerformers: [],
      riskVendors: [],
    }

    if (vendors.length > 0) {
      analysis.averageScore = vendors.reduce((sum, v) => sum + v.score, 0) / vendors.length
      analysis.topPerformers = vendors.filter((v) => v.score >= 90).slice(0, 5)
      analysis.underPerformers = vendors.filter((v) => v.score < 70)
      analysis.riskVendors = vendors.filter((v) => v.on_time_delivery_rate < 80)
    }

    // Use Google AI for deeper analysis
    const aiPrompt = `Analyze vendor performance data for Walmart Sparkathon project by team crazsymb:
    Total Vendors: ${analysis.totalVendors}
    Average Score: ${analysis.averageScore}
    Underperformers: ${analysis.underPerformers.length}
    Risk Vendors: ${analysis.riskVendors.length}
    
    Provide insights and recommendations for supply chain optimization.`

    try {
      const aiInsights = await generateAIResponse(aiPrompt, analysis)
      analysis["aiInsights"] = aiInsights
    } catch (error) {
      logger.error("AI analysis failed:", error)
    }

    return analysis
  }

  private generateRecommendations(analysis: any): string[] {
    const recommendations = []

    if (analysis.underPerformers.length > 0) {
      recommendations.push(`Review ${analysis.underPerformers.length} underperforming vendors`)
    }

    if (analysis.riskVendors.length > 0) {
      recommendations.push(`Address delivery issues with ${analysis.riskVendors.length} vendors`)
    }

    if (analysis.averageScore < 80) {
      recommendations.push("Implement vendor improvement program")
    }

    recommendations.push("Schedule quarterly vendor performance reviews")

    return recommendations
  }

  private async logAction(action: string, status: string) {
    try {
      await supabase.from("agent_actions").insert({
        agent: "Vendor Monitor Agent",
        action,
        status,
        entity_type: "vendor",
      })
    } catch (error) {
      logger.error("Failed to log agent action:", error)
    }
  }
}
