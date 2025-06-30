import { supabase } from "../config/supabase"
import { generateAIResponse } from "../config/googleAI"
import { logger } from "../utils/logger"
import type { AgentResult } from "../types"

export class InvoiceValidatorAgent {
  async execute(data?: any): Promise<AgentResult> {
    try {
      logger.info("Invoice Validator Agent executing - Team crazsymb")

      // Get recent invoices
      const { data: invoices, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error

      const validation = await this.validateInvoices(invoices || [])

      // Log agent action
      await this.logAction(`Validated ${invoices?.length || 0} invoices`, "completed")

      return {
        agent: "Invoice Validator Agent",
        status: validation.discrepancies.length > 0 ? "warning" : "success",
        message: `Validated ${invoices?.length || 0} invoices, found ${validation.discrepancies.length} discrepancies`,
        data: validation,
        recommendations: this.generateRecommendations(validation),
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      logger.error("Invoice Validator Agent failed:", error)
      await this.logAction("Invoice validation failed", "failed")

      return {
        agent: "Invoice Validator Agent",
        status: "error",
        message: error.message,
        timestamp: new Date().toISOString(),
      }
    }
  }

  private async validateInvoices(invoices: any[]) {
    const validation = {
      totalInvoices: invoices.length,
      validInvoices: 0,
      discrepancies: [],
      fraudRisk: [],
      accuracyRate: 0,
    }

    for (const invoice of invoices) {
      const discrepancy = await this.checkInvoiceDiscrepancies(invoice)
      if (discrepancy) {
        validation.discrepancies.push(discrepancy)

        // Store discrepancy in database
        await supabase.from("invoice_discrepancies").insert({
          invoice_id: invoice.id,
          type: discrepancy.type,
          item: discrepancy.item,
          po_value: discrepancy.po_value,
          invoice_value: discrepancy.invoice_value,
        })
      } else {
        validation.validInvoices++
      }

      // Check for fraud indicators
      if (this.detectFraudRisk(invoice)) {
        validation.fraudRisk.push(invoice.id)
      }
    }

    validation.accuracyRate = invoices.length > 0 ? (validation.validInvoices / invoices.length) * 100 : 100

    // Use Google AI for fraud detection analysis
    const aiPrompt = `Analyze invoice validation results for Walmart Sparkathon project by team crazsymb:
    Total Invoices: ${validation.totalInvoices}
    Valid Invoices: ${validation.validInvoices}
    Discrepancies: ${validation.discrepancies.length}
    Fraud Risk: ${validation.fraudRisk.length}
    Accuracy Rate: ${validation.accuracyRate}%
    
    Provide insights on invoice processing and fraud prevention.`

    try {
      const aiInsights = await generateAIResponse(aiPrompt, validation)
      validation["aiInsights"] = aiInsights
    } catch (error) {
      logger.error("AI analysis failed:", error)
    }

    return validation
  }

  private async checkInvoiceDiscrepancies(invoice: any) {
    // Simulate PO vs Invoice validation
    const randomCheck = Math.random()

    if (randomCheck < 0.1) {
      // 10% chance of discrepancy for demo
      return {
        type: "Amount Mismatch",
        item: `Invoice ${invoice.invoice_number}`,
        po_value: (invoice.amount * 0.9).toString(),
        invoice_value: invoice.amount.toString(),
      }
    }

    if (randomCheck < 0.05) {
      // 5% chance of quantity discrepancy
      return {
        type: "Quantity Mismatch",
        item: `Invoice ${invoice.invoice_number}`,
        po_value: "100 units",
        invoice_value: "95 units",
      }
    }

    return null
  }

  private detectFraudRisk(invoice: any): boolean {
    // Simple fraud detection rules
    const riskFactors = [
      invoice.amount > 100000, // High amount
      !invoice.po_number, // Missing PO
      !invoice.grn_number, // Missing GRN
      new Date(invoice.due_date) < new Date(invoice.issue_date), // Invalid dates
    ]

    return riskFactors.filter(Boolean).length >= 2
  }

  private generateRecommendations(validation: any): string[] {
    const recommendations = []

    if (validation.discrepancies.length > 0) {
      recommendations.push(`Review ${validation.discrepancies.length} invoice discrepancies`)
    }

    if (validation.fraudRisk.length > 0) {
      recommendations.push(`Investigate ${validation.fraudRisk.length} invoices for fraud risk`)
    }

    if (validation.accuracyRate < 95) {
      recommendations.push("Implement stricter invoice validation controls")
    }

    recommendations.push("Automate PO-GRN-Invoice matching process")

    return recommendations
  }

  private async logAction(action: string, status: string) {
    try {
      await supabase.from("agent_actions").insert({
        agent: "Invoice Validator Agent",
        action,
        status,
        entity_type: "invoice",
      })
    } catch (error) {
      logger.error("Failed to log agent action:", error)
    }
  }
}
