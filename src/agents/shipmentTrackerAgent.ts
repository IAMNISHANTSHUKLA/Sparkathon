import { supabase } from "../config/supabase"
import { generateAIResponse } from "../config/googleAI"
import { logger } from "../utils/logger"
import type { AgentResult } from "../types"

export class ShipmentTrackerAgent {
  async execute(data?: any): Promise<AgentResult> {
    try {
      logger.info("Shipment Tracker Agent executing - Team crazsymb")

      // Get active shipments
      const { data: shipments, error } = await supabase
        .from("shipments")
        .select("*")
        .in("status", ["pending", "in-transit", "customs"])

      if (error) throw error

      const tracking = await this.trackShipments(shipments || [])

      // Log agent action
      await this.logAction(`Tracked ${shipments?.length || 0} active shipments`, "completed")

      return {
        agent: "Shipment Tracker Agent",
        status: tracking.delayedShipments.length > 0 ? "warning" : "success",
        message: `Tracked ${shipments?.length || 0} shipments, ${tracking.delayedShipments.length} delayed`,
        data: tracking,
        recommendations: this.generateRecommendations(tracking),
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      logger.error("Shipment Tracker Agent failed:", error)
      await this.logAction("Shipment tracking failed", "failed")

      return {
        agent: "Shipment Tracker Agent",
        status: "error",
        message: error.message,
        timestamp: new Date().toISOString(),
      }
    }
  }

  private async trackShipments(shipments: any[]) {
    const tracking = {
      totalShipments: shipments.length,
      inTransit: 0,
      delayed: 0,
      onTime: 0,
      delayedShipments: [],
      weatherImpacted: [],
      customsDelayed: [],
    }

    for (const shipment of shipments) {
      const status = await this.getShipmentStatus(shipment)

      switch (status.status) {
        case "in-transit":
          tracking.inTransit++
          if (status.isDelayed) {
            tracking.delayed++
            tracking.delayedShipments.push(shipment)
          } else {
            tracking.onTime++
          }
          break
        case "customs":
          tracking.customsDelayed.push(shipment)
          break
      }

      // Check weather impact
      if (this.checkWeatherImpact(shipment)) {
        tracking.weatherImpacted.push(shipment)
      }

      // Update shipment status if needed
      if (status.newStatus && status.newStatus !== shipment.status) {
        await this.updateShipmentStatus(shipment.id, status.newStatus)
      }
    }

    // Use Google AI for route optimization
    const aiPrompt = `Analyze shipment tracking data for Walmart Sparkathon project by team crazsymb:
    Total Shipments: ${tracking.totalShipments}
    In Transit: ${tracking.inTransit}
    Delayed: ${tracking.delayed}
    Weather Impacted: ${tracking.weatherImpacted.length}
    Customs Delayed: ${tracking.customsDelayed.length}
    
    Provide insights for shipment optimization and delay prevention.`

    try {
      const aiInsights = await generateAIResponse(aiPrompt, tracking)
      tracking["aiInsights"] = aiInsights
    } catch (error) {
      logger.error("AI analysis failed:", error)
    }

    return tracking
  }

  private async getShipmentStatus(shipment: any) {
    // Simulate carrier API call
    const now = new Date()
    const eta = new Date(shipment.eta)
    const isDelayed = now > eta && shipment.status !== "delivered"

    // Simulate status updates
    let newStatus = null
    const random = Math.random()

    if (shipment.status === "pending" && random < 0.3) {
      newStatus = "in-transit"
    } else if (shipment.status === "in-transit" && random < 0.1) {
      newStatus = "delivered"
    } else if (shipment.status === "in-transit" && random < 0.05) {
      newStatus = "customs"
    }

    return {
      status: newStatus || shipment.status,
      isDelayed,
      newStatus,
      estimatedDelay: isDelayed ? Math.floor(Math.random() * 72) + 1 : 0, // hours
    }
  }

  private checkWeatherImpact(shipment: any): boolean {
    // Simulate weather impact check
    const weatherRiskRoutes = ["Shanghai", "Mumbai", "Miami", "Houston"]
    return (
      weatherRiskRoutes.some((city) => shipment.origin.includes(city) || shipment.destination.includes(city)) &&
      Math.random() < 0.2
    )
  }

  private async updateShipmentStatus(shipmentId: string, status: string) {
    try {
      await supabase
        .from("shipments")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", shipmentId)
    } catch (error) {
      logger.error("Failed to update shipment status:", error)
    }
  }

  private generateRecommendations(tracking: any): string[] {
    const recommendations = []

    if (tracking.delayedShipments.length > 0) {
      recommendations.push(`Address ${tracking.delayedShipments.length} delayed shipments`)
    }

    if (tracking.weatherImpacted.length > 0) {
      recommendations.push(`Monitor weather conditions for ${tracking.weatherImpacted.length} shipments`)
    }

    if (tracking.customsDelayed.length > 0) {
      recommendations.push(`Expedite customs clearance for ${tracking.customsDelayed.length} shipments`)
    }

    recommendations.push("Implement proactive delay notification system")
    recommendations.push("Consider alternative routes for weather-prone areas")

    return recommendations
  }

  private async logAction(action: string, status: string) {
    try {
      await supabase.from("agent_actions").insert({
        agent: "Shipment Tracker Agent",
        action,
        status,
        entity_type: "shipment",
      })
    } catch (error) {
      logger.error("Failed to log agent action:", error)
    }
  }
}
