import { VendorMonitorAgent } from "./vendorMonitorAgent"
import { InvoiceValidatorAgent } from "./invoiceValidatorAgent"
import { ShipmentTrackerAgent } from "./shipmentTrackerAgent"
import { CustomsComplianceAgent } from "./customsComplianceAgent"
import { ESGRiskAgent } from "./esgRiskAgent"
import { ProcurementAgent } from "./procurementAgent"
import { logger } from "../utils/logger"
import cron from "node-cron"

export class AgentOrchestrator {
  private agents: Map<string, any> = new Map()

  constructor() {
    this.agents.set("vendor-monitor", new VendorMonitorAgent())
    this.agents.set("invoice-validator", new InvoiceValidatorAgent())
    this.agents.set("shipment-tracker", new ShipmentTrackerAgent())
    this.agents.set("customs-compliance", new CustomsComplianceAgent())
    this.agents.set("esg-risk", new ESGRiskAgent())
    this.agents.set("procurement", new ProcurementAgent())
  }

  async runAgent(agentName: string, data?: any) {
    const agent = this.agents.get(agentName)
    if (!agent) {
      throw new Error(`Agent ${agentName} not found`)
    }

    logger.info(`Running agent: ${agentName}`, { team: "crazsymb" })
    return await agent.execute(data)
  }

  async runAllAgents() {
    const results = []
    for (const [name, agent] of this.agents) {
      try {
        const result = await agent.execute()
        results.push({ agent: name, result, status: "success" })
      } catch (error) {
        logger.error(`Agent ${name} failed:`, error)
        results.push({ agent: name, error: error.message, status: "failed" })
      }
    }
    return results
  }

  getAgentStatus() {
    return Array.from(this.agents.keys()).map((name) => ({
      name,
      status: "active",
      lastRun: new Date().toISOString(),
    }))
  }
}

export const agentOrchestrator = new AgentOrchestrator()

export async function initializeAgents() {
  logger.info("Initializing AI agents for OpsPilot - Team crazsymb")

  // Schedule agents to run periodically
  cron.schedule("*/15 * * * *", async () => {
    logger.info("Running scheduled agent tasks")
    try {
      await agentOrchestrator.runAllAgents()
    } catch (error) {
      logger.error("Scheduled agent run failed:", error)
    }
  })

  logger.info("All agents initialized and scheduled")
}
