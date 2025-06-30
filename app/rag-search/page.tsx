"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, Search, FileText, Upload, RefreshCw, FileUp, Sparkles } from "lucide-react"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { SparklesCore } from "@/components/ui/sparkles"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

// Mock data for demonstration
const mockSearchResults = [
  {
    id: "doc-1",
    title: "Supplier Code of Conduct",
    snippet:
      "All suppliers must adhere to our ESG standards, including zero tolerance for child labor, maintaining sustainable forestry practices, and reducing carbon emissions by 15% year over year...",
    relevance: 0.92,
    date: "2023-01-15",
    type: "PDF",
  },
  {
    id: "doc-2",
    title: "Environmental Policy 2023",
    snippet:
      "Our commitment to environmental sustainability includes reducing Scope 1 and Scope 2 emissions by 30% by 2025, implementing water conservation measures across all facilities, and achieving zero waste to landfill...",
    relevance: 0.87,
    date: "2023-03-22",
    type: "PDF",
  },
  {
    id: "doc-3",
    title: "Quarterly ESG Report - Q1 2023",
    snippet:
      "This quarter saw a 5% reduction in carbon emissions across our supply chain. However, three suppliers in Southeast Asia were flagged for potential labor violations that require further investigation...",
    relevance: 0.81,
    date: "2023-04-10",
    type: "TXT",
  },
]

const mockSummary = `Based on the retrieved documents, your supply chain has made progress in environmental sustainability with a 5% reduction in carbon emissions in Q1 2023. However, there are potential labor violations with three suppliers in Southeast Asia that require immediate attention.

Your Supplier Code of Conduct clearly states zero tolerance for child labor, which aligns with international standards. The Environmental Policy targets a 30% reduction in Scope 1 and 2 emissions by 2025, which is on track but will require continued monitoring of all suppliers.

Recommended actions:
1. Investigate the flagged suppliers in Southeast Asia
2. Accelerate the carbon reduction programs with high-emission suppliers
3. Implement the water conservation measures mentioned in the Environmental Policy`

export default function RagSearch() {
  const [activeTab, setActiveTab] = useState("search")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<any[] | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const handleSearch = () => {
    if (!searchQuery) {
      setError("Please enter a search query")
      return
    }

    setLoading(true)
    setError(null)
    setSummary(null)

    // Simulate API call
    setTimeout(() => {
      try {
        setSearchResults(mockSearchResults)
        setLoading(false)
      } catch (err) {
        setError("An error occurred while searching")
        setLoading(false)
      }
    }, 1500)
  }

  const handleSummarize = () => {
    if (!searchResults) {
      setError("Please search for documents first")
      return
    }

    setLoading(true)
    setError(null)

    // Simulate API call
    setTimeout(() => {
      try {
        setSummary(mockSummary)
        setLoading(false)
      } catch (err) {
        setError("An error occurred while generating summary")
        setLoading(false)
      }
    }, 2000)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setUploading(true)

    // Simulate file upload
    setTimeout(() => {
      const newFiles = Array.from(e.target.files || []).map((file) => file.name)
      setUploadedFiles([...uploadedFiles, ...newFiles])
      setUploading(false)
      e.target.value = ""
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-2">ESG Document Search & Analysis</h1>
        <p className="text-muted-foreground mb-8">Search through your ESG documents and get AI-powered insights</p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="search">Search & Analyze</TabsTrigger>
            <TabsTrigger value="upload">Upload Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search ESG Documents</CardTitle>
                <CardDescription>Search through your ESG policies, reports, and compliance documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search for ESG policies, compliance requirements, or vendor standards..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={loading} className="flex items-center gap-2">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Search
                  </Button>
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {loading && !searchResults ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : searchResults ? (
                  <div className="space-y-4">
                    {searchResults.map((result, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-blue-500" />
                              <h3 className="text-lg font-medium">{result.title}</h3>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {result.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{result.snippet}</p>
                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>Relevance: {result.relevance * 100}%</span>
                            <span>{result.date}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <div className="flex justify-center pt-4">
                      <Button onClick={handleSummarize} disabled={loading} className="flex items-center gap-2">
                        {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        Generate AI Summary
                      </Button>
                    </div>

                    {summary && (
                      <Card className="mt-6 overflow-hidden border-blue-200 dark:border-blue-800">
                        <CardHeader className="bg-blue-50 dark:bg-blue-900/20 pb-2">
                          <CardTitle className="text-lg flex items-center">
                            <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                            AI-Generated Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 relative">
                          <div className="absolute inset-0 pointer-events-none">
                            <SparklesCore
                              id="tsparticles"
                              background="transparent"
                              minSize={0.2}
                              maxSize={0.6}
                              particleDensity={20}
                              className="w-full h-full"
                              particleColor="#4f46e5"
                            />
                          </div>
                          <div className="relative z-10">
                            <TextGenerateEffect words={summary} />
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload ESG Documents</CardTitle>
                <CardDescription>
                  Upload your ESG policies, reports, and compliance documents for AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-10 text-center mb-6">
                  <div className="flex flex-col items-center justify-center">
                    <FileUp className="h-10 w-10 text-slate-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Drag and drop files here</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Support for PDF and TXT files. Max file size: 10MB.
                    </p>
                    <div className="flex justify-center">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Button as="span">
                          <Upload className="h-4 w-4 mr-2" />
                          Select Files
                        </Button>
                        <input
                          id="file-upload"
                          type="file"
                          multiple
                          accept=".pdf,.txt"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {uploading && (
                  <div className="flex items-center justify-center p-4 mb-4">
                    <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                    <span>Uploading files...</span>
                  </div>
                )}

                {uploadedFiles.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Uploaded Files</h3>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-md"
                        >
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="text-sm">{file}</span>
                          </div>
                          <Badge variant="outline" className="text-xs flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                            Processed
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Clear All</Button>
                <Button>Process Documents</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}
