import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface VendorScoreCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  change?: {
    value: string
    trend: "positive" | "negative" | "neutral"
  }
}

export function VendorScoreCard({ title, value, description, icon, change }: VendorScoreCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {change && (
          <div className="flex items-center mt-1">
            <span
              className={`text-xs ${
                change.trend === "positive"
                  ? "text-green-500"
                  : change.trend === "negative"
                    ? "text-red-500"
                    : "text-gray-500"
              }`}
            >
              {change.trend === "positive" ? "↑" : change.trend === "negative" ? "↓" : "→"} {change.value}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
