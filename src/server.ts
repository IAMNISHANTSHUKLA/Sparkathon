import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import { createServer } from "http"
import { setupRoutes } from "./routes"
import { errorHandler } from "./middleware/errorHandler"
import { logger } from "./utils/logger"
import { initializeAgents } from "./agents"
import { connectRedis } from "./config/redis"

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? ["https://your-frontend-domain.com"] : ["http://localhost:3000"],
    credentials: true,
  }),
)
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Team and hackathon info endpoint
app.get("/api/info", (req, res) => {
  res.json({
    project: "OpsPilot - Agentic AI for Supply Chain Management",
    team: process.env.TEAM_NAME || "crazsymb",
    hackathon: process.env.HACKATHON || "Walmart Sparkathon",
    members: (process.env.TEAM_MEMBERS || "Nishant Shukla, Ambar Kumar, Ankush Nagwekar").split(", "),
    version: "1.0.0",
    description: "AI-powered supply chain optimization platform with autonomous agents",
    features: [
      "Vendor Performance Monitoring",
      "Invoice Validation & Fraud Detection",
      "Real-time Shipment Tracking",
      "Customs & Compliance Automation",
      "ESG Risk Assessment",
      "Procurement Optimization",
    ],
  })
})

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    team: "crazsymb - Walmart Sparkathon",
  })
})

// Setup routes
setupRoutes(app)

// Error handling
app.use(errorHandler)

// Initialize services
async function startServer() {
  try {
    // Connect to Redis
    await connectRedis()
    logger.info("Redis connected successfully")

    // Initialize AI agents
    await initializeAgents()
    logger.info("AI agents initialized successfully")

    server.listen(PORT, () => {
      logger.info(`🚀 OpsPilot Backend Server running on port ${PORT}`)
      logger.info(`🏆 Walmart Sparkathon - Team crazsymb`)
      logger.info(`👥 Team: Nishant Shukla, Ambar Kumar, Ankush Nagwekar`)
      logger.info(`📊 Dashboard: http://localhost:${PORT}/api/info`)
    })
  } catch (error) {
    logger.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()

export { app, server }
