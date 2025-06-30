"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "@/components/dashboard/overview"
import { RecentShipments } from "@/components/dashboard/recent-shipments"
import { AgentActivity } from "@/components/dashboard/agent-activity"
import { VendorScoreCard } from "@/components/dashboard/vendor-score-card"
import { DocumentUpload } from "@/components/dashboard/document-upload"
import { CSVUpload } from "@/components/csv-upload"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import {
  BarChart3,
  TrendingUp,
  Package,
  AlertTriangle,
  Users,
  FileText,
  Brain,
  Target,
  Sparkles,
  Award,
  Zap,
  Shield,
} from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  total_shipments: number
  avg_vendor_score: number
  invoice_accuracy: number
  monthly_agent_actions: number
  monthly_spend: number
  avg_on_time_delivery: number
  high_risk_alerts: number
  avg_esg_score: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      const { data, error } = await supabase.from("dashboard_kpis").select("*").single()

      if (error) throw error

      setStats(data)
    } catch (error: any) {
      console.error("Error loading dashboard stats:", error)
      toast({
        title: "Error Loading Dashboard",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCSVUpload = (result: any) => {
    // Refresh dashboard after CSV upload
    loadDashboardStats()
    toast({
      title: "Data Integrated",
      description: "Dashboard updated with new data",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-8 w-8 text-walmart-yellow" />
          <h1 className="text-4xl font-bold gradient-walmart bg-clip-text text-transparent">OpsPilot Dashboard</h1>
          <Sparkles className="h-8 w-8 text-walmart-yellow" />
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          AI-powered supply chain operations with Walmart-grade performance
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Badge className="bg-walmart-blue text-white px-4 py-2">
            <Award className="h-4 w-4 mr-2" />
            Walmart Sparkathon 2024
          </Badge>
          <Badge className="bg-walmart-green text-white px-4 py-2">Team crazsymb</Badge>
          <Link href="/ai-inventory">
            <Button className="bg-walmart-yellow text-walmart-gray-dark hover:bg-walmart-yellow/90">
              <Brain className="h-4 w-4 mr-2" />
              AI Inventory System
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Performance Indicators */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-walmart-blue/5 to-walmart-blue/10 hover:shadow-walmart-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
              <Package className="h-4 w-4 text-walmart-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-walmart-blue">{stats.total_shipments}</div>
              <p className="text-xs text-gray-600">Active shipments</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-walmart-green/5 to-walmart-green/10 hover:shadow-walmart-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendor Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-walmart-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-walmart-green">{stats.avg_vendor_score}</div>
              <p className="text-xs text-gray-600">Average performance</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-walmart-yellow/5 to-walmart-yellow/10 hover:shadow-walmart-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invoice Accuracy</CardTitle>
              <FileText className="h-4 w-4 text-walmart-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-walmart-orange">{stats.invoice_accuracy}%</div>
              <p className="text-xs text-gray-600">Processing accuracy</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 hover:shadow-walmart-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risk Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.high_risk_alerts}</div>
              <p className="text-xs text-gray-600">High-risk ESG alerts</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI/ML System Quick Access */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            AI/ML Inventory System
          </CardTitle>
          <CardDescription>Access the high-performance AI-driven inventory optimization system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/ai-inventory?tab=forecasting">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Brain className="h-8 w-8 mx-auto mb-2 text-walmart-blue" />
                  <h4 className="font-semibold">Demand Forecasting</h4>
                  <p className="text-xs text-gray-600">AI-powered predictions</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/ai-inventory?tab=optimization">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-walmart-green" />
                  <h4 className="font-semibold">Inventory Optimization</h4>
                  <p className="text-xs text-gray-600">Smart reallocation</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/ai-inventory?tab=anomalies">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-walmart-orange" />
                  <h4 className="font-semibold">Anomaly Detection</h4>
                  <p className="text-xs text-gray-600">Patent-pending logic</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-walmart-blue/5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="shipments" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Shipments
          </TabsTrigger>
          <TabsTrigger value="vendors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Vendors
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            AI Agents
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Data Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Overview />
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key operational indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">On-Time Delivery</span>
                      <span className="text-sm font-bold text-walmart-green">{stats.avg_on_time_delivery}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Monthly Spend</span>
                      <span className="text-sm font-bold text-walmart-blue">
                        ${(stats.monthly_spend / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">ESG Score</span>
                      <span className="text-sm font-bold text-walmart-green">{stats.avg_esg_score}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Agent Actions</span>
                      <span className="text-sm font-bold text-walmart-orange">{stats.monthly_agent_actions}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="shipments" className="space-y-6">
          <RecentShipments />
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6">
          <VendorScoreCard />
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <AgentActivity />
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CSVUpload onUploadComplete={handleCSVUpload} />
            <DocumentUpload />
          </div>
        </TabsContent>
      </Tabs>

      {/* System Status Footer */}
      <Card className="bg-gradient-to-r from-walmart-blue/5 to-walmart-green/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-walmart-blue">System Status</h3>
              <p className="text-sm text-gray-600">All systems operational - Team crazsymb</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-walmart-green text-white">
                <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                Online
              </Badge>
              <Badge className="bg-walmart-blue text-white">Walmart Sparkathon</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
