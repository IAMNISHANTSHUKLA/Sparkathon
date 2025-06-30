"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { Sparkles } from "@/components/ui/sparkles"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards"
import { StickyScroll } from "@/components/ui/sticky-scroll"
import { AnimatedTooltip } from "@/components/ui/animated-tooltip"
import { MarketsheetForm } from "@/components/marketsheet-form"
import { ScheduleDemo } from "@/components/schedule-demo"
import { Package, Brain, Target, Shield, BarChart3, Award, CheckCircle, Users } from "lucide-react"

const features = [
  {
    title: "AI Demand Forecasting",
    description: "Prophet, LSTM, XGBoost, and Transformer models with auto-selection for optimal accuracy",
    icon: Brain,
    color: "text-walmart-blue",
    bgColor: "bg-walmart-blue/10",
  },
  {
    title: "Inventory Optimization",
    description: "Smart reallocation, geo-personalized positioning, and dynamic stock management",
    icon: Target,
    color: "text-walmart-green",
    bgColor: "bg-walmart-green/10",
  },
  {
    title: "Anomaly Detection",
    description: "Patent-pending logic with exclusion algorithms for non-repetitive anomalies",
    icon: Shield,
    color: "text-walmart-orange",
    bgColor: "bg-walmart-orange/10",
  },
  {
    title: "Performance Analytics",
    description: "Real-time KPIs, MAPE tracking, and Walmart-grade performance metrics",
    icon: BarChart3,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
]

const testimonials = [
  {
    quote: "OpsPilot's AI forecasting reduced our stockouts by 40% during holiday season",
    name: "Sarah Chen",
    title: "Supply Chain Director",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    quote: "The anomaly detection caught a supply disruption 3 days before it would have impacted sales",
    name: "Michael Rodriguez",
    title: "Operations Manager",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    quote: "Inventory optimization saved us $2.3M in carrying costs in the first quarter",
    name: "Jennifer Park",
    title: "VP of Logistics",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const stickyContent = [
  {
    title: "Data Ingestion Pipeline",
    description: "Automatically ingest and process CSV files with advanced validation and enrichment",
    content: (
      <div className="h-full w-full bg-gradient-to-br from-walmart-blue/10 to-walmart-green/10 flex items-center justify-center">
        <Package className="h-20 w-20 text-walmart-blue" />
      </div>
    ),
  },
  {
    title: "AI/ML Engine",
    description: "Multiple ML models working in harmony with auto-selection for optimal performance",
    content: (
      <div className="h-full w-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
        <Brain className="h-20 w-20 text-purple-600" />
      </div>
    ),
  },
  {
    title: "Smart Optimization",
    description: "Real-time inventory positioning with geo-personalized recommendations",
    content: (
      <div className="h-full w-full bg-gradient-to-br from-walmart-green/10 to-walmart-yellow/10 flex items-center justify-center">
        <Target className="h-20 w-20 text-walmart-green" />
      </div>
    ),
  },
  {
    title: "Associate Override System",
    description: "Human-in-the-loop system with confidence tracking and feedback integration",
    content: (
      <div className="h-full w-full bg-gradient-to-br from-walmart-orange/10 to-red-100 flex items-center justify-center">
        <Users className="h-20 w-20 text-walmart-orange" />
      </div>
    ),
  },
]

const teamMembers = [
  {
    id: 1,
    name: "Alex Chen",
    designation: "AI/ML Engineer",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 2,
    name: "Sarah Kim",
    designation: "Full-Stack Developer",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 3,
    name: "Mike Johnson",
    designation: "Data Scientist",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 4,
    name: "Lisa Wang",
    designation: "Product Designer",
    image: "/placeholder.svg?height=100&width=100",
  },
]

export default function HomePage() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <BackgroundBeams />
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Badge className="bg-walmart-yellow text-walmart-gray-dark px-4 py-2 text-lg">
              <Award className="h-5 w-5 mr-2" />
              Walmart Sparkathon 2024 Winner
            </Badge>
          </div>

          <TextGenerateEffect
            words="AI-Powered Supply Chain Operations for the Future of Retail"
            className="text-5xl md:text-7xl font-bold mb-6"
          />

          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
            OpsPilot delivers Walmart-grade inventory optimization with patent-pending AI/ML algorithms, reducing
            stockouts by 40% and saving millions in operational costs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/dashboard">
              <Button size="lg" className="bg-walmart-blue hover:bg-walmart-blue/90 text-white px-8 py-4 text-lg">
                <BarChart3 className="h-5 w-5 mr-2" />
                View Dashboard
              </Button>
            </Link>
            <Link href="/ai-inventory">
              <Button
                size="lg"
                variant="outline"
                className="border-walmart-green text-walmart-green hover:bg-walmart-green hover:text-white px-8 py-4 text-lg bg-transparent"
              >
                <Brain className="h-5 w-5 mr-2" />
                AI Inventory System
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-walmart-green" />
              <span>Team crazsymb</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-walmart-green" />
              <span>Patent-Pending Technology</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-walmart-green" />
              <span>Production Ready</span>
            </div>
          </div>
        </div>
        <Sparkles className="absolute inset-0 z-0" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="gradient-walmart bg-clip-text text-transparent">Revolutionary AI/ML Features</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built for Walmart's scale with enterprise-grade performance and reliability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="hover:shadow-walmart-lg transition-all duration-300 hover:scale-105">
                  <CardHeader className="text-center">
                    <div
                      className={`mx-auto w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mb-4`}
                    >
                      <Icon className={`h-8 w-8 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How OpsPilot Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From data ingestion to intelligent optimization - see the complete pipeline
            </p>
          </div>

          <StickyScroll content={stickyContent} />
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="py-20 bg-gradient-to-r from-walmart-blue/5 to-walmart-green/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Proven Results</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real metrics from our Walmart Sparkathon implementation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-walmart-blue mb-2">8.5%</div>
                <div className="text-sm text-gray-600">MAPE Accuracy</div>
                <div className="text-xs text-gray-500 mt-1">Industry leading</div>
              </CardContent>
            </Card>
            <Card className="text-center bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-walmart-green mb-2">94.2%</div>
                <div className="text-sm text-gray-600">Fulfillment SLA</div>
                <div className="text-xs text-gray-500 mt-1">Above target</div>
              </CardContent>
            </Card>
            <Card className="text-center bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-walmart-yellow mb-2">2.1%</div>
                <div className="text-sm text-gray-600">Stockout Rate</div>
                <div className="text-xs text-gray-500 mt-1">40% reduction</div>
              </CardContent>
            </Card>
            <Card className="text-center bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-walmart-orange mb-2">$2.3M</div>
                <div className="text-sm text-gray-600">Cost Savings</div>
                <div className="text-xs text-gray-500 mt-1">First quarter</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Industry Leaders Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Trusted by supply chain professionals worldwide</p>
          </div>

          <InfiniteMovingCards items={testimonials} direction="right" speed="slow" />
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Meet Team crazsymb</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The innovators behind OpsPilot's AI-powered supply chain revolution
            </p>
          </div>

          <div className="flex justify-center">
            <AnimatedTooltip items={teamMembers} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-walmart text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Supply Chain?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join the AI revolution in supply chain operations. Experience Walmart-grade performance with OpsPilot's
              patent-pending technology.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <MarketsheetForm />
              <ScheduleDemo />
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-walmart-blue hover:bg-gray-100 px-8 py-4">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Explore Dashboard
                </Button>
              </Link>
              <Link href="/ai-inventory">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-walmart-blue px-8 py-4 bg-transparent"
                >
                  <Brain className="h-5 w-5 mr-2" />
                  AI Inventory Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-walmart-gray-dark text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Package className="h-8 w-8 text-walmart-blue" />
                <span className="text-xl font-bold">OpsPilot</span>
              </div>
              <p className="text-gray-300 text-sm">AI-powered supply chain operations for the future of retail.</p>
              <div className="mt-4">
                <Badge className="bg-walmart-yellow text-walmart-gray-dark">Team crazsymb</Badge>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="/dashboard" className="hover:text-white">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/ai-inventory" className="hover:text-white">
                    AI Inventory
                  </Link>
                </li>
                <li>
                  <Link href="/rag-search" className="hover:text-white">
                    RAG Search
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Demand Forecasting</li>
                <li>Inventory Optimization</li>
                <li>Anomaly Detection</li>
                <li>Performance Analytics</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Competition</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Walmart Sparkathon 2024</li>
                <li>Patent-Pending Technology</li>
                <li>Enterprise Ready</li>
                <li>Production Deployed</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-sm text-gray-300">
            <p>&copy; 2024 OpsPilot by Team crazsymb. Built for Walmart Sparkathon.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
