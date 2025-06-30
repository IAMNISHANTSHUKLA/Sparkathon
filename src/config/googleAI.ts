import { GoogleGenerativeAI } from "@google/generative-ai"
import { logger } from "../utils/logger"

const apiKey = process.env.GOOGLE_API_KEY || "AIzaSyDfO8fbFcZxqb9C_EWuXop9Ud9jSh1XwcY"

if (!apiKey) {
  logger.error("Missing Google AI API key")
  throw new Error("Missing Google AI API key")
}

export const genAI = new GoogleGenerativeAI(apiKey)

// Initialize the model
export const model = genAI.getGenerativeModel({ model: "gemini-pro" })

// Test Google AI connection
export async function testGoogleAI() {
  try {
    const result = await model.generateContent(
      "Hello, this is a test for OpsPilot - Walmart Sparkathon project by team crazsymb",
    )
    logger.info("Google AI connection successful")
    return true
  } catch (error) {
    logger.error("Google AI connection failed:", error)
    return false
  }
}

// Generate AI response for supply chain analysis
export async function generateAIResponse(prompt: string, context?: any) {
  try {
    const enhancedPrompt = `
    You are an AI assistant for OpsPilot, a supply chain management platform built for Walmart Sparkathon by team crazsymb (Nishant Shukla, Ambar Kumar, Ankush Nagwekar).
    
    Context: ${context ? JSON.stringify(context) : "General supply chain query"}
    
    User Query: ${prompt}
    
    Please provide a detailed, actionable response focused on supply chain optimization, vendor management, or logistics insights.
    `

    const result = await model.generateContent(enhancedPrompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    logger.error("AI response generation failed:", error)
    throw error
  }
}
