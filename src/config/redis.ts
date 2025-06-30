import { createClient } from "redis"
import { logger } from "../utils/logger"

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"

export const redis = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500),
  },
})

redis.on("error", (err) => {
  logger.error("Redis Client Error:", err)
})

redis.on("connect", () => {
  logger.info("Redis Client Connected")
})

export async function connectRedis() {
  try {
    await redis.connect()
    return true
  } catch (error) {
    logger.error("Failed to connect to Redis:", error)
    return false
  }
}

export async function cacheSet(key: string, value: any, ttl = 3600) {
  try {
    await redis.setEx(key, ttl, JSON.stringify(value))
    return true
  } catch (error) {
    logger.error("Cache set error:", error)
    return false
  }
}

export async function cacheGet(key: string) {
  try {
    const value = await redis.get(key)
    return value ? JSON.parse(value) : null
  } catch (error) {
    logger.error("Cache get error:", error)
    return null
  }
}
