import { supabase } from "../config/supabase"
import { generateAIResponse } from "../config/googleAI"
import { logger } from "../utils/logger"
import type { AgentResult } from "../types"

export class CustomsComplianceAgent {
  async execute(data?: any): Promise<AgentResult> {
    try {
      logger.info("Customs Compliance Agent executing - Team crazsymb")

      // Get shipments requiring customs clearance
      const { data: shipments, error } = await supabase
        .from("shipments")
        .select("*")
        .in("status", ["pending", "in-transit", "customs"])

      if (error) throw error

      const compliance = await this.checkCustomsCompliance(shipments || [])

      // Log agent action
      await this.logAction(`Checked customs compliance for ${shipments?.length || 0} shipments`, "completed")

      return {
        agent: "Customs Compliance Agent",
        status: compliance.nonCompliantShipments.length > 0 ? "warning" : "success",
        message: `Compliance check completed, ${compliance.nonCompliantShipments.length} issues found`,
        data: compliance,
        recommendations: this.generateRecommendations(compliance),
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      logger.error("Customs Compliance Agent failed:", error)
      await this.logAction("Customs compliance check failed", "failed")

      return {
        agent: "Customs Compliance Agent",
        status: "error",
        message: error.message,
        timestamp: new Date().toISOString(),
      }
    }
  }

  private async checkCustomsCompliance(shipments: any[]) {
    const compliance = {
      totalShipments: shipments.length,
      compliantShipments: 0,
      nonCompliantShipments: [],
      documentationIssues: [],
      dutyCalculations: [],
      hsCodeValidations: [],
    }

    for (const shipment of shipments) {
      const complianceCheck = await this.validateShipmentCompliance(shipment)

      if (complianceCheck.isCompliant) {
        compliance.compliantShipments++
      } else {
        compliance.nonCompliantShipments.push({
          shipment,
          issues: complianceCheck.issues,
        })
      }

      // Check documentation
      const docCheck = await this.validateDocumentation(shipment)
      if (!docCheck.isComplete) {
        compliance.documentationIssues.push({
          shipmentId: shipment.id,
          missingDocs: docCheck.missingDocuments,
        })
      }

      // Calculate duties
      const dutyCalc = this.calculateDuties(shipment)
      compliance.dutyCalculations.push(dutyCalc)

      // Validate HS codes
      const hsValidation = this.validateHSCodes(shipment)
      compliance.hsCodeValidations.push(hsValidation)
    }

    // Use Google AI for customs analysis
    const aiPrompt = `Analyze customs compliance data for Walmart Sparkathon project by team crazsymb:
    Total Shipments: ${compliance.totalShipments}
    Compliant: ${compliance.compliantShipments}
    Non-Compliant: ${compliance.nonCompliantShipments.length}
    Documentation Issues: ${compliance.documentationIssues.length}
    
    Provide insights for customs compliance optimization and risk reduction.`

    try {
      const aiInsights = await generateAIResponse(aiPrompt, compliance)
      compliance["aiInsights"] = aiInsights
    } catch (error) {
      logger.error("AI analysis failed:", error)
    }

    return compliance
  }

  private async validateShipmentCompliance(shipment: any) {
    const issues = []
    let isCompliant = true

    // Check required fields
    if (!shipment.origin || !shipment.destination) {
      issues.push("Missing origin or destination information")
      isCompliant = false
    }

    if (!shipment.value || shipment.value <= 0) {
      issues.push("Invalid or missing shipment value")
      isCompliant = false
    }

    // Check international shipment requirements
    if (this.isInternationalShipment(shipment)) {
      if (!shipment.carrier) {
        issues.push("Missing carrier information for international shipment")
        isCompliant = false
      }
    }

    // Simulate additional compliance checks
    const randomCheck = Math.random()
    if (randomCheck < 0.1) {
      // 10% chance of compliance issue for demo
      issues.push("Restricted goods detected - requires special permit")
      isCompliant = false
    }

    return { isCompliant, issues }
  }

  private async validateDocumentation(shipment: any) {
    const requiredDocs = ["Commercial Invoice", "Packing List", "Bill of Lading", "Certificate of Origin"]

    // Simulate document check
    const missingDocuments = []
    const randomMissing = Math.random()

    if (randomMissing < 0.2) {
      // 20% chance of missing docs for demo
      missingDocuments.push(requiredDocs[Math.floor(Math.random() * requiredDocs.length)])
    }

    return {
      isComplete: missingDocuments.length === 0,
      missingDocuments,
      requiredDocuments: requiredDocs,
    }
  }

  private calculateDuties(shipment: any) {
    // Simulate duty calculation
    const dutyRate = this.getDutyRate(shipment.origin, shipment.destination)
    const dutyAmount = (shipment.value || 0) * dutyRate

    return {
      shipmentId: shipment.id,
      dutyRate: dutyRate * 100, // Convert to percentage
      dutyAmount: Math.round(dutyAmount * 100) / 100,
      currency: shipment.currency || "USD",
    }
  }

  private validateHSCodes(shipment: any) {
    // Simulate HS code validation
    const hsCode = this.generateHSCode(shipment)
    const isValid = hsCode.length === 10 // Standard HS code length

    return {
      shipmentId: shipment.id,
      hsCode,
      isValid,
      description: this.getHSCodeDescription(hsCode),
    }
  }

  private isInternationalShipment(shipment: any): boolean {
    // Simple check for international shipment
    const originCountry = this.extractCountry(shipment.origin)
    const destCountry = this.extractCountry(shipment.destination)
    return originCountry !== destCountry
  }

  private extractCountry(location: string): string {
    // Simple country extraction
    if (location.includes("USA") || location.includes("United States")) return "US"
    if (location.includes("China")) return "CN"
    if (location.includes("Germany")) return "DE"
    if (location.includes("Japan")) return "JP"
    if (location.includes("India")) return "IN"
    return "Unknown"
  }

  private getDutyRate(origin: string, destination: string): number {
    // Simulate duty rate lookup
    const rates = {
      "CN-US": 0.15, // China to US
      "DE-US": 0.05, // Germany to US
      "JP-US": 0.08, // Japan to US
      "IN-US": 0.12, // India to US
    }

    const originCountry = this.extractCountry(origin)
    const destCountry = this.extractCountry(destination)
    const key = `${originCountry}-${destCountry}`

    return rates[key] || 0.1 // Default 10%
  }

  private generateHSCode(shipment: any): string {
    // Generate sample HS code based on shipment
    const codes = [
      "8471300000", // Computers
      "8517120000", // Phones
      "6203420000", // Clothing
      "9401800000", // Furniture
      "8708100000", // Auto parts
    ]

    return codes[Math.floor(Math.random() * codes.length)]
  }

  private getHSCodeDescription(hsCode: string): string {
    const descriptions = {
      "8471300000": "Portable automatic data processing machines",
      "8517120000": "Telephones for cellular networks",
      "6203420000": "Men's or boys' trousers of cotton",
      "9401800000": "Other seats",
      "8708100000": "Bumpers and parts thereof",
    }

    return descriptions[hsCode] || "General merchandise"
  }

  private generateRecommendations(compliance: any): string[] {
    const recommendations = []

    if (compliance.nonCompliantShipments.length > 0) {
      recommendations.push(`Address compliance issues for ${compliance.nonCompliantShipments.length} shipments`)
    }

    if (compliance.documentationIssues.length > 0) {
      recommendations.push(`Complete missing documentation for ${compliance.documentationIssues.length} shipments`)
    }

    recommendations.push("Implement automated HS code validation system")
    recommendations.push("Set up pre-clearance documentation workflows")
    recommendations.push("Establish relationships with customs brokers in key markets")

    return recommendations
  }

  private async logAction(action: string, status: string) {
    try {
      await supabase.from("agent_actions").insert({
        agent: "Customs Compliance Agent",
        action,
        status,
        entity_type: "shipment",
      })
    } catch (error) {
      logger.error("Failed to log agent action:", error)
    }
  }
}
