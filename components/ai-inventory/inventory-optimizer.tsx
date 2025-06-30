"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  Package,
  TrendingUp,
  DollarSign,
  MapPin,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  Target,
  Loader2,
} from "lucide-react"

interface InventoryOptimization {
  id: string
  sku_id: string
  source_location: string
  target_location: string
  recommended_quantity: number
  optimization_type: "reallocation" | "replenishment" | "markdown"
  priority_score: number
  cost_impact: number
  expected_benefit: number
  status: "pending" | "approved" | "executed" | "rejected"
  reasoning: string
  created_at: string
}

interface OptimizationSummary {
  total_opportunities: number
  potential_savings: number
  pending_approvals: number
  executed_today: number
  high_priority_count: number
}

const COLORS = ["#004c91", "#ffc220", "#00a652", "#ff6900", "#6c757d"]

export function InventoryOptimizer() {
  const [optimizations, setOptimizations] = useState<InventoryOptimization[]>([])
  const [summary, setSummary] = useState<OptimizationSummary | null>(null)
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadOptimizations()
  }, [selectedType, selectedStatus])

  const loadOptimizations = async () => {
    try {
      setLoading(true)

      let query = supabase.from("inventory_optimization").select("*").order("priority_score", { ascending: false })

      if (selectedType !== "all") {
        query = query.eq("optimization_type", selectedType)
      }

      if (selectedStatus !== "all") {
        query = query.eq("status", selectedStatus)
      }

      const { data, error } = await query

      if (error) throw error

      setOptimizations(data || [])

      // Calculate summary
      const allOptimizations = data || []
      const summary: OptimizationSummary = {
        total_opportunities: allOptimizations.length,
        potential_savings: allOptimizations.reduce((sum, opt) => sum + opt.expected_benefit, 0),
        pending_approvals: allOptimizations.filter((opt) => opt.status === "pending").length,
        executed_today: allOptimizations.filter(
          (opt) => opt.status === "executed" && new Date(opt.created_at).toDateString() === new Date().toDateString(),
        ).length,
        high_priority_count: allOptimizations.filter((opt) => opt.priority_score >= 8).length,
      }

      setSummary(summary)
    } catch (error: any) {
      console.error("Error loading optimizations:", error)
      toast({
        title: "Error Loading Data",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const runOptimization = async () => {
    try {
      setIsOptimizing(true)

      const response = await fetch("/api/ai/optimize-inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          optimization_types: ["reallocation", "replenishment", "markdown"],
          team: "crazsymb",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to run optimization")
      }

      const result = await response.json()

      toast({
        title: "Optimization Complete",
        description: `Generated ${result.optimizations_created} new optimization opportunities`,
      })

      await loadOptimizations()
    } catch (error: any) {
      console.error("Error running optimization:", error)
      toast({
        title: "Optimization Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  const approveOptimization = async (id: string) => {
    try {
      const { error } = await supabase.from("inventory_optimization").update({ status: "approved" }).eq("id", id)

      if (error) throw error

      toast({
        title: "Optimization Approved",
        description: "The optimization has been approved for execution",
      })

      await loadOptimizations()
    } catch (error: any) {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const rejectOptimization = async (id: string) => {
    try {
      const { error } = await supabase.from("inventory_optimization").update({ status: "rejected" }).eq("id", id)

      if (error) throw error

      toast({
        title: "Optimization Rejected",
        description: "The optimization has been rejected",
      })

      await loadOptimizations()
    } catch (error: any) {
      toast({
        title: "Rejection Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "reallocation":
        return "bg-walmart-blue text-white"
      case "replenishment":
        return "bg-walmart-green text-white"
      case "markdown":
        return "bg-walmart-orange text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-walmart-yellow text-walmart-gray-dark"
      case "approved":
        return "bg-walmart-green text-white"
      case "executed":
        return "bg-walmart-blue text-white"
      case "rejected":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getPriorityIcon = (score: number) => {
    if (score >= 8) return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (score >= 6) return <TrendingUp className="h-4 w-4 text-walmart-yellow" />
    return <Target className="h-4 w-4 text-walmart-blue" />
  }

  // Prepare chart data
  const typeDistribution = optimizations.reduce(
    (acc, opt) => {
      acc[opt.optimization_type] = (acc[opt.optimization_type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const pieData = Object.entries(typeDistribution).map(([type, count], index) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
    color: COLORS[index % COLORS.length],
  }))

  const savingsData = optimizations
    .slice(0, 10)
    .map((opt) => ({
      sku: opt.sku_id.split("-").pop(),
      savings: opt.expected_benefit,
      cost: opt.cost_impact,
      priority: opt.priority_score,
    }))
    .sort((a, b) => b.savings - a.savings)

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
            <Package className="h-6 w-6" />
            AI Inventory Optimization Engine
          </CardTitle>
          <CardDescription className="text-blue-100">
            Walmart-grade inventory positioning and smart reallocation - Team crazsymb
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-blue-100 mb-2 block">Optimization Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="reallocation">Reallocation</SelectItem>
                  <SelectItem value="replenishment">Replenishment</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-blue-100 mb-2 block">Status Filter</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="executed">Executed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={runOptimization}
              disabled={isOptimizing}
              className="bg-walmart-yellow text-walmart-gray-dark hover:bg-walmart-yellow/90"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Run Optimization
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Metrics */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-walmart-blue/5 to-walmart-blue/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-walmart-blue">Total Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-walmart-blue">{summary.total_opportunities}</div>
              <p className="text-xs text-gray-600 mt-1">Optimization recommendations</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-walmart-green/5 to-walmart-green/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-walmart-green">Potential Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-walmart-green">
                ${(summary.potential_savings / 1000).toFixed(0)}K
              </div>
              <p className="text-xs text-gray-600 mt-1">Expected benefit</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-walmart-yellow/5 to-walmart-yellow/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-walmart-orange">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-walmart-orange">{summary.pending_approvals}</div>
              <p className="text-xs text-gray-600 mt-1">Awaiting review</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700">Executed Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{summary.executed_today}</div>
              <p className="text-xs text-gray-600 mt-1">Completed optimizations</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-red-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-700">High Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{summary.high_priority_count}</div>
              <p className="text-xs text-gray-600 mt-1">Urgent optimizations</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Optimization Types</CardTitle>
            <CardDescription>Distribution of optimization opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
            <CardTitle className="text-lg">Top Savings Opportunities</CardTitle>
            <CardDescription>Highest expected benefit optimizations</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={savingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="sku" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 14px 0 rgba(0, 76, 145, 0.15)",
                  }}
                />
                <Bar dataKey="savings" fill="#004c91" name="Expected Savings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Optimization List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-walmart-blue" />
            Optimization Recommendations
          </CardTitle>
          <CardDescription>AI-generated inventory optimization opportunities with approval workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizations.slice(0, 20).map((optimization) => (
              <div
                key={optimization.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-walmart transition-all duration-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {optimization.sku_id}
                    </Badge>
                    <Badge className={getTypeColor(optimization.optimization_type)}>
                      {optimization.optimization_type}
                    </Badge>
                    <Badge className={getStatusColor(optimization.status)}>{optimization.status}</Badge>
                    <div className="flex items-center gap-1">
                      {getPriorityIcon(optimization.priority_score)}
                      <span className="text-xs text-gray-600">Priority: {optimization.priority_score}/10</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="font-medium">{optimization.source_location}</span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span className="font-medium">{optimization.target_location}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Qty: <span className="font-semibold">{optimization.recommended_quantity}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{optimization.reasoning}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-walmart-green" />
                      <span className="text-walmart-green font-semibold">
                        +${optimization.expected_benefit.toLocaleString()}
                      </span>
                      <span className="text-gray-600">benefit</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-red-500" />
                      <span className="text-red-500 font-semibold">-${optimization.cost_impact.toLocaleString()}</span>
                      <span className="text-gray-600">cost</span>
                    </div>
                    <div className="text-gray-500 text-xs">
                      {new Date(optimization.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {optimization.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => approveOptimization(optimization.id)}
                        className="bg-walmart-green hover:bg-walmart-green/90"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectOptimization(optimization.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {optimization.status === "approved" && (
                    <Badge className="bg-walmart-green text-white">
                      <Clock className="h-3 w-3 mr-1" />
                      Ready for Execution
                    </Badge>
                  )}
                  {optimization.status === "executed" && (
                    <Badge className="bg-walmart-blue text-white">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          {optimizations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No optimization opportunities found</p>
              <p className="text-sm">Run the optimization engine to generate recommendations</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
