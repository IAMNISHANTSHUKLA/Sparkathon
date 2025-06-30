"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts"
import {
  TrendingUp,
  Brain,
  Target,
  AlertTriangle,
  CheckCircle,
  Zap,
  BarChart3,
  Calendar,
  MapPin,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DemandForecast {
  id: string
  sku_id: string
  region: string
  store_id: string
  forecast_date: string
  predicted_demand: number
  confidence_interval: {
    lower: number
    upper: number
  }
  model_id: string
  actual_demand?: number
  accuracy_score?: number
  factors: {
    weather_impact?: number
    promotion_boost?: number
    seasonal_factor?: number
    economic_factor?: number
  }
}

interface MLModel {
  id: string
  model_name: string
  model_type: string
  version: string
  accuracy_metrics: {
    mape: number
    rmse: number
    mae: number
  }
  status: string
  auto_selected: boolean
}

export function DemandForecaster() {
  const [forecasts, setForecasts] = useState<DemandForecast[]>([])
  const [models, setModels] = useState<MLModel[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string>("all")
  const [selectedModel, setSelectedModel] = useState<string>("auto")
  const [isGenerating, setIsGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [selectedRegion])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load forecasts
      let forecastQuery = supabase.from("demand_forecasts").select("*").order("forecast_date", { ascending: true })

      if (selectedRegion !== "all") {
        forecastQuery = forecastQuery.eq("region", selectedRegion)
      }

      const { data: forecastData, error: forecastError } = await forecastQuery

      if (forecastError) throw forecastError

      // Load ML models
      const { data: modelData, error: modelError } = await supabase
        .from("ml_models")
        .select("*")
        .eq("status", "active")
        .order("accuracy_metrics->mape", { ascending: true })

      if (modelError) throw modelError

      setForecasts(forecastData || [])
      setModels(modelData || [])

      // Prepare chart data
      const chartData = (forecastData || []).map((forecast) => ({
        date: new Date(forecast.forecast_date).toLocaleDateString(),
        predicted: forecast.predicted_demand,
        actual: forecast.actual_demand || null,
        lower: forecast.confidence_interval.lower,
        upper: forecast.confidence_interval.upper,
        sku: forecast.sku_id,
        region: forecast.region,
      }))

      setChartData(chartData)
    } catch (error: any) {
      console.error("Error loading forecast data:", error)
      toast({
        title: "Error Loading Data",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateForecasts = async () => {
    try {
      setIsGenerating(true)

      const response = await fetch("/api/ai/generate-forecasts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          region: selectedRegion === "all" ? null : selectedRegion,
          model_id: selectedModel === "auto" ? null : selectedModel,
          forecast_period: "weekly",
          team: "crazsymb",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate forecasts")
      }

      const result = await response.json()

      toast({
        title: "Forecasts Generated",
        description: `Generated ${result.forecasts_created} new demand forecasts`,
      })

      // Reload data
      await loadData()
    } catch (error: any) {
      console.error("Error generating forecasts:", error)
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.9) return "text-walmart-green"
    if (accuracy >= 0.8) return "text-walmart-yellow"
    return "text-red-600"
  }

  const getConfidenceLevel = (interval: { lower: number; upper: number }, predicted: number) => {
    const range = interval.upper - interval.lower
    const confidence = 1 - range / predicted
    return Math.max(0, Math.min(1, confidence))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="gradient-walmart text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Demand Forecasting System
          </CardTitle>
          <CardDescription className="text-blue-100">
            Walmart-grade demand prediction using advanced ML models - Team crazsymb
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-blue-100 mb-2 block">Region Filter</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="Southwest">Southwest</SelectItem>
                  <SelectItem value="Southeast">Southeast</SelectItem>
                  <SelectItem value="Northeast">Northeast</SelectItem>
                  <SelectItem value="Midwest">Midwest</SelectItem>
                  <SelectItem value="West">West</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-blue-100 mb-2 block">ML Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-Select Best Model</SelectItem>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.model_name} (MAPE: {(model.accuracy_metrics.mape * 100).toFixed(1)}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={generateForecasts}
              disabled={isGenerating}
              className="bg-walmart-yellow text-walmart-gray-dark hover:bg-walmart-yellow/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Forecasts
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Model Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {models.slice(0, 4).map((model) => (
          <Card key={model.id} className={cn("relative", model.auto_selected && "ring-2 ring-walmart-green")}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{model.model_type.toUpperCase()}</CardTitle>
                {model.auto_selected && (
                  <Badge className="bg-walmart-green text-white">
                    <Target className="h-3 w-3 mr-1" />
                    Auto-Selected
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs">{model.model_name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">MAPE</span>
                  <span className={cn("text-sm font-semibold", getAccuracyColor(1 - model.accuracy_metrics.mape))}>
                    {(model.accuracy_metrics.mape * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={(1 - model.accuracy_metrics.mape) * 100}
                  className="h-2"
                  // @ts-ignore
                  indicatorClassName="bg-walmart-green"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>RMSE: {model.accuracy_metrics.rmse.toFixed(1)}</span>
                  <span>MAE: {model.accuracy_metrics.mae.toFixed(1)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Forecast Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-walmart-blue" />
            Demand Forecast Trends
          </CardTitle>
          <CardDescription>
            Predicted vs actual demand with confidence intervals - {forecasts.length} forecasts loaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 14px 0 rgba(0, 76, 145, 0.15)",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="upper"
                  stackId="1"
                  stroke="#004c91"
                  fill="#004c91"
                  fillOpacity={0.1}
                  name="Upper Confidence"
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stackId="1"
                  stroke="#004c91"
                  fill="#ffffff"
                  fillOpacity={1}
                  name="Lower Confidence"
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#004c91"
                  strokeWidth={3}
                  dot={{ fill: "#004c91", strokeWidth: 2, r: 4 }}
                  name="Predicted Demand"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#00a652"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#00a652", strokeWidth: 2, r: 3 }}
                  name="Actual Demand"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No forecast data available</p>
                <p className="text-sm">Generate forecasts to see predictions</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Forecast List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-walmart-blue" />
            Forecast Details
          </CardTitle>
          <CardDescription>Individual SKU forecasts with confidence levels and contributing factors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forecasts.slice(0, 10).map((forecast) => {
              const confidence = getConfidenceLevel(forecast.confidence_interval, forecast.predicted_demand)
              const accuracy = forecast.accuracy_score || 0

              return (
                <div
                  key={forecast.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-walmart transition-all duration-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {forecast.sku_id}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        {forecast.region}
                      </div>
                      <Badge
                        className={cn(
                          "text-xs",
                          confidence > 0.8
                            ? "bg-walmart-green text-white"
                            : confidence > 0.6
                              ? "bg-walmart-yellow text-walmart-gray-dark"
                              : "bg-red-100 text-red-700",
                        )}
                      >
                        {(confidence * 100).toFixed(0)}% Confidence
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-gray-600">Predicted: </span>
                        <span className="font-semibold text-walmart-blue">{forecast.predicted_demand}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Range: </span>
                        <span className="font-mono text-xs">
                          {forecast.confidence_interval.lower} - {forecast.confidence_interval.upper}
                        </span>
                      </div>
                      {forecast.actual_demand && (
                        <div>
                          <span className="text-gray-600">Actual: </span>
                          <span className="font-semibold text-walmart-green">{forecast.actual_demand}</span>
                        </div>
                      )}
                    </div>
                    {Object.keys(forecast.factors).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Object.entries(forecast.factors).map(([factor, value]) => (
                          <Badge key={factor} variant="secondary" className="text-xs">
                            {factor.replace("_", " ")}: {typeof value === "number" ? value.toFixed(2) : value}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {forecast.actual_demand ? (
                      accuracy > 0.9 ? (
                        <CheckCircle className="h-5 w-5 text-walmart-green" />
                      ) : accuracy > 0.7 ? (
                        <TrendingUp className="h-5 w-5 text-walmart-yellow" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )
                    ) : (
                      <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse" />
                    )}
                    <div className="text-right">
                      <div className="text-sm font-medium">{new Date(forecast.forecast_date).toLocaleDateString()}</div>
                      {accuracy > 0 && (
                        <div className={cn("text-xs", getAccuracyColor(accuracy))}>
                          {(accuracy * 100).toFixed(1)}% accurate
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {forecasts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No forecasts available</p>
              <p className="text-sm">Click &quot;Generate Forecasts&quot; to create AI-powered demand predictions</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {forecasts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-walmart-blue/5 to-walmart-blue/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-walmart-blue">Average Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-walmart-blue">
                {(
                  (forecasts.filter((f) => f.accuracy_score).reduce((sum, f) => sum + (f.accuracy_score || 0), 0) /
                    forecasts.filter((f) => f.accuracy_score).length) *
                  100
                ).toFixed(1)}
                %
              </div>
              <p className="text-xs text-gray-600 mt-1">MAPE across all models</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-walmart-green/5 to-walmart-green/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-walmart-green">High Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-walmart-green">
                {forecasts.filter((f) => getConfidenceLevel(f.confidence_interval, f.predicted_demand) > 0.8).length}
              </div>
              <p className="text-xs text-gray-600 mt-1">Forecasts with &gt;80% confidence</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-walmart-yellow/5 to-walmart-yellow/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-walmart-orange">Total Forecasts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-walmart-orange">{forecasts.length}</div>
              <p className="text-xs text-gray-600 mt-1">Active demand predictions</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
