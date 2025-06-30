import { Router } from "express"
import { asyncHandler } from "../middleware/errorHandler"
import { DashboardService } from "../services/dashboardService"
import { cacheGet, cacheSet } from "../config/redis"

const router = Router()
const dashboardService = new DashboardService()

// Get dashboard KPIs
router.get(
  "/kpis",
  asyncHandler(async (req, res) => {
    const cacheKey = "dashboard:kpis"

    // Try to get from cache first
    let kpis = await cacheGet(cacheKey)

    if (!kpis) {
      kpis = await dashboardService.getKPIs()
      await cacheSet(cacheKey, kpis, 300) // Cache for 5 minutes
    }

    res.json({
      success: true,
      data: kpis,
      cached: !!kpis,
      team: "crazsymb",
    })
  }),
)

// Get recent activities
router.get(
  "/activities",
  asyncHandler(async (req, res) => {
    const limit = Number.parseInt(req.query.limit as string) || 10
    const activities = await dashboardService.getRecentActivities(limit)

    res.json({
      success: true,
      data: activities,
      team: "crazsymb",
    })
  }),
)

// Get analytics data
router.get(
  "/analytics",
  asyncHandler(async (req, res) => {
    const { period = "30d" } = req.query
    const analytics = await dashboardService.getAnalytics(period as string)

    res.json({
      success: true,
      data: analytics,
      team: "crazsymb",
    })
  }),
)

// Get risk assessment
router.get(
  "/risks",
  asyncHandler(async (req, res) => {
    const risks = await dashboardService.getRiskAssessment()

    res.json({
      success: true,
      data: risks,
      team: "crazsymb",
    })
  }),
)

export default router
