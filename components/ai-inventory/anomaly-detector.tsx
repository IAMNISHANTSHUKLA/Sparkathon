"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  AlertTriangle,
  TrendingUp,
  Cloud,
  DollarSign,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  Zap,
  Loader2,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Anomaly {
  id: string
  sku_id: string
  region: string
  anomaly_type: "demand_spike" | "stockout" | "weather" | "economic"
  severity: "low" | "medium" | "high" | "critical"
  detected_value: number
  expected_value: number
  deviation_percentage: number
  detection_date: string
  is_repetitive: boolean
  exclusion_applied: boolean
  root_cause: string
  impact_assessment: any
  status: "open" | "investigating" | "resolved" | "excluded"
}

const COLORS = ["#dc2626", "#ea580c", "#d97706", "#65a30d", "#059669"]

export function AnomalyDetector() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all")
  const [isDetecting, setIsDetecting] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadAnomalies()
  }, [selectedType, selectedSeverity])

  const loadAnomalies = async () => {
    try {
      setLoading(true)

      let query = supabase.from("anomaly_detection").select("*").order("detection_date", { ascending: false })

      if (selectedType !== "all") {
        query = query.eq("anomaly_type", selectedType)
      }

      if (selectedSeverity !== "all") {
        query = query.eq("severity", selectedSeverity)
      }

      const { data, error } = await query

      if (error) throw error

      setAnomalies(data || [])
    } catch (error: any) {
      console.error("Error loading anomalies:", error)
      toast({
        title: "Error Loading Data",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const runAnomalyDetection = async () => {
    try {
      setIsDetecting(true)

      const response = await fetch("/api/ai/detect-anomalies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          team: "crazsymb",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to run anomaly detection")
      }

      const result = await response.json()

      toast({
        title: "Anomaly Detection Complete",
        description: `Detected ${result.anomalies_detected} anomalies (${result.critical_anomalies} critical)`,
      })

      await loadAnomalies()
    } catch (error: any) {
      console.error("Error running anomaly detection:", error)
      toast({
        title: "Detection Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsDetecting(false)
    }
  }

  const updateAnomalyStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from("anomaly_detection").update({ status }).eq("id", id)

      if (error) throw error

      toast({
        title: "Status Updated",
        description: `Anomaly status changed to ${status}`,
      })

      await loadAnomalies()
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500 text-white"
      case "high":
        return "bg-orange-500 text-white"
      case "medium":
        return "bg-walmart-yellow text-walmart-gray-dark"
      case "low":
        return "bg-walmart-green text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "demand_spike":
        return <TrendingUp className="h-4 w-4" />
      case "stockout":
        return <AlertTriangle className="h-4 w-4" />
      case "weather":
        return <Cloud className="h-4 w-4" />
      case "economic":
        return <DollarSign className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-700"
      case "investigating":
        return "bg-walmart-yellow/20 text-walmart-orange"
      case "resolved":
        return "bg-walmart-green/20 text-walmart-green"
      case "excluded":
        return "bg-gray-100 text-gray-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  // Prepare chart data
  const severityData = anomalies.reduce(
    (acc, anomaly) => {
      acc[anomaly.severity] = (acc[anomaly.severity] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const pieData = Object.entries(severityData).map(([severity, count], index) => ({
    name: severity.charAt(0).toUpperCase() + severity.slice(1),
    value: count,
    color: COLORS[index % COLORS.length],
  }))

  const typeData = anomalies.reduce(
    (acc, anomaly) => {
      const type = anomaly.anomaly_type.replace("_", " ")
      acc[type] = (acc[type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const barData = Object.entries(typeData).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count,
  }))

  // Timeline data
  const timelineData = anomalies
    .slice(0, 30)
    .reduce((acc, anomaly) => {
      const date = new Date(anomaly.detection_date).toLocaleDateString()
      const existing = acc.find((item) => item.date === date)
      if (existing) {
        existing.count += 1
        if (anomaly.severity === "critical") existing.critical += 1
      } else {
        acc.push({
          date,
          count: 1,
          critical: anomaly.severity === "critical" ? 1 : 0,
        })
      }
      return acc
    }, [] as any[])
    .reverse()

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
              <div className="h-32 bg-gray-200 rounded"></div>
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
            <Shield className="h-6 w-6" />
            AI Anomaly Detection System
          </CardTitle>
          <CardDescription className="text-blue-100">
            Patent-pending logic to detect and exclude non-repetitive anomalies - Team crazsymb
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-blue-100 mb-2 block">Anomaly Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="demand_spike">Demand Spike</SelectItem>
                  <SelectItem value="stockout">Stockout</SelectItem>
                  <SelectItem value="weather">Weather</SelectItem>
                  <SelectItem value="economic">Economic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-blue-100 mb-2 block">Severity Filter</label>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={runAnomalyDetection}
              disabled={isDetecting}
              className="bg-walmart-yellow text-walmart-gray-dark hover:bg-walmart-yellow/90"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Detecting...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Run Detection
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-700">Critical Anomalies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {anomalies.filter((a) => a.severity === "critical").length}
            </div>
            <p className="text-xs text-gray-600 mt-1">Require immediate attention</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-walmart-yellow/10 to-walmart-yellow/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-walmart-orange">Open Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-walmart-orange">
              {anomalies.filter((a) => a.status === "open").length}
            </div>
            <p className="text-xs text-gray-600 mt-1">Pending investigation</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-walmart-green/10 to-walmart-green/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-walmart-green">Resolved Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-walmart-green">
              {
                anomalies.filter(
                  (a) =>
                    a.status === "resolved" && new Date(a.detection_date).toDateString() === new Date().toDateString(),
                ).length
              }
            </div>
            <p className="text-xs text-gray-600 mt-1">Successfully handled</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Auto-Excluded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-700">
              {anomalies.filter((a) => a.exclusion_applied).length}
            </div>
            <p className="text-xs text-gray-600 mt-1">Patent-pending logic</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Severity Distribution</CardTitle>
            <CardDescription>Breakdown by severity level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Anomaly Types</CardTitle>
            <CardDescription>Count by anomaly type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="type" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#004c91" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detection Timeline</CardTitle>
            <CardDescription>Anomalies detected over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#004c91" strokeWidth={2} name="Total Anomalies" />
                <Line
                  type="monotone"
                  dataKey="critical"
                  stroke="#dc2626"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Critical"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Anomaly List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-walmart-blue" />
            Detected Anomalies
          </CardTitle>
          <CardDescription>
            AI-detected anomalies with patent-pending exclusion logic - {anomalies.length} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {anomalies.slice(0, 20).map((anomaly) => (
              <div
                key={anomaly.id}
                className={cn(
                  "p-4 border rounded-lg transition-all duration-200",
                  anomaly.severity === "critical"
                    ? "border-red-300 bg-red-50 shadow-lg animate-pulse-walmart"
                    : "border-gray-200 hover:shadow-walmart",
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {anomaly.sku_id}
                      </Badge>
                      <Badge className={getSeverityColor(anomaly.severity)}>
                        {getTypeIcon(anomaly.anomaly_type)}
                        <span className="ml-1">{anomaly.anomaly_type.replace("_", " ")}</span>
                      </Badge>
                      <Badge className={getStatusColor(anomaly.status)}>{anomaly.status}</Badge>
                      <span className="text-sm text-gray-600">{anomaly.region}</span>
                      {anomaly.exclusion_applied && (
                        <Badge className="bg-gray-100 text-gray-600">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Auto-Excluded
                        </Badge>
                      )}
                      {anomaly.is_repetitive && (
                        <Badge variant="outline" className="text-xs">
                          Repetitive
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{anomaly.root_cause}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Detected: </span>
                        <span className="font-semibold text-red-600">{anomaly.detected_value}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Expected: </span>
                        <span className="font-semibold text-gray-800">{anomaly.expected_value}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Deviation: </span>
                        <span className="font-semibold text-walmart-orange">
                          {anomaly.deviation_percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(anomaly.detection_date).toLocaleDateString()}
                      </div>
                    </div>
                    {anomaly.impact_assessment && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <strong>Impact Assessment:</strong>{" "}
                        {JSON.stringify(anomaly.impact_assessment, null, 2)
                          .replace(/[{}",]/g, "")
                          .replace(/\n/g, " ")}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {anomaly.status === "open" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateAnomalyStatus(anomaly.id, "investigating")}
                          className="bg-walmart-yellow text-walmart-gray-dark hover:bg-walmart-yellow/90"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Investigate
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateAnomalyStatus(anomaly.id, "resolved")}
                          className="bg-walmart-green hover:bg-walmart-green/90"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                      </>
                    )}
                    {anomaly.status === "investigating" && (
                      <Badge className="bg-walmart-yellow text-walmart-gray-dark">
                        <Clock className="h-3 w-3 mr-1" />
                        Under Investigation
                      </Badge>
                    )}
                    {anomaly.status === "resolved" && (
                      <Badge className="bg-walmart-green text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolved
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {anomalies.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No anomalies detected</p>
              <p className="text-sm">Run anomaly detection to identify unusual patterns</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
