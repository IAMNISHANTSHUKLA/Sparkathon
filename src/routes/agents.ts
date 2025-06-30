import { Router } from "express"
import { asyncHandler } from "../middleware/errorHandler"
import { agentOrchestrator } from "../agents"
import { logger } from "../utils/logger"

const router = Router()

// Run specific agent
router.post(
  "/run/:agentName",
  asyncHandler(async (req, res) => {
    const { agentName } = req.params
    const { data } = req.body

    logger.info(`Running agent: ${agentName}`, { team: "crazsymb", data })

    const result = await agentOrchestrator.runAgent(agentName, data)

    res.json({
      success: true,
      data: result,
      team: "crazsymb",
      hackathon: "Walmart Sparkathon",
    })
  }),
)

// Run all agents
router.post(
  "/run-all",
  asyncHandler(async (req, res) => {
    logger.info("Running all agents", { team: "crazsymb" })

    const results = await agentOrchestrator.runAllAgents()

    res.json({
      success: true,
      data: results,
      team: "crazsymb",
      hackathon: "Walmart Sparkathon",
    })
  }),
)

// Get agent status
router.get(
  "/status",
  asyncHandler(async (req, res) => {
    const status = agentOrchestrator.getAgentStatus()

    res.json({
      success: true,
      data: status,
      team: "crazsymb",
      hackathon: "Walmart Sparkathon",
    })
  }),
)

// Test notification creation
router.post(
  "/test-notification",
  asyncHandler(async (req, res) => {
    const { message, type = "info" } = req.body

    // Create a test notification
    const notification = {
      id: `notif-${Date.now()}`,
      message: message || "Test notification from OpsPilot agents - Team crazsymb",
      type,
      timestamp: new Date().toISOString(),
      agent: "Test Agent",
      team: "crazsymb",
    }

    // In a real implementation, this would be sent via WebSocket or Redis pub/sub
    logger.info("Test notification created:", notification)

    res.json({
      success: true,
      data: notification,
      team: "crazsymb",
    })
  }),
)

export default router
