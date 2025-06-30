import { createClient } from "@supabase/supabase-js"
import { logger } from "../utils/logger"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  logger.error("Missing Supabase configuration")
  throw new Error("Missing Supabase configuration")
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Test connection
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("vendors").select("count").limit(1)
    if (error) throw error
    logger.info("Supabase connection successful")
    return true
  } catch (error) {
    logger.error("Supabase connection failed:", error)
    return false
  }
}
