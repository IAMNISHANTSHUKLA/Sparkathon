import type { Express } from "express"
import vendorRoutes from "./vendors"
import shipmentRoutes from "./shipments"
import invoiceRoutes from "./invoices"
import esgRoutes from "./esg"
import agentRoutes from "./agents"
import dashboardRoutes from "./dashboard"
import uploadRoutes from "./upload"
import authRoutes from "./auth"

export function setupRoutes(app: Express) {
  // API routes
  app.use("/api/auth", authRoutes)
  app.use("/api/vendors", vendorRoutes)
  app.use("/api/shipments", shipmentRoutes)
  app.use("/api/invoices", invoiceRoutes)
  app.use("/api/esg", esgRoutes)
  app.use("/api/agents", agentRoutes)
  app.use("/api/dashboard", dashboardRoutes)
  app.use("/api/upload", uploadRoutes)

  // 404 handler
  app.use("*", (req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
      team: "crazsymb",
      hackathon: "Walmart Sparkathon",
    })
  })
}
