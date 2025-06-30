import { Router } from "express"
import { asyncHandler } from "../middleware/errorHandler"
import { supabase } from "../config/supabase"
import { cacheGet, cacheSet } from "../config/redis"

const router = Router()

// Get all vendors
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const cacheKey = "vendors:all"
    let vendors = await cacheGet(cacheKey)

    if (!vendors) {
      const { data, error } = await supabase.from("vendors").select("*").order("score", { ascending: false })

      if (error) throw error
      vendors = data
      await cacheSet(cacheKey, vendors, 600) // Cache for 10 minutes
    }

    res.json({
      success: true,
      data: vendors,
      team: "crazsymb",
    })
  }),
)

// Get vendor by ID
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params

    const { data: vendor, error } = await supabase.from("vendors").select("*").eq("id", id).single()

    if (error) throw error

    res.json({
      success: true,
      data: vendor,
      team: "crazsymb",
    })
  }),
)

// Create vendor
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const vendorData = {
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("vendors").insert(vendorData).select().single()

    if (error) throw error

    res.status(201).json({
      success: true,
      data,
      team: "crazsymb",
    })
  }),
)

// Update vendor
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("vendors").update(updateData).eq("id", id).select().single()

    if (error) throw error

    res.json({
      success: true,
      data,
      team: "crazsymb",
    })
  }),
)

// Delete vendor
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params

    const { error } = await supabase.from("vendors").delete().eq("id", id)

    if (error) throw error

    res.json({
      success: true,
      message: "Vendor deleted successfully",
      team: "crazsymb",
    })
  }),
)

export default router
