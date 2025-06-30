"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, CheckCircle, AlertTriangle, Download, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface CSVUploadProps {
  onUploadComplete?: (result: any) => void
}

export function CSVUpload({ onUploadComplete }: CSVUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedDataType, setSelectedDataType] = useState<string>("inventory_data")
  const [uploadResult, setUploadResult] = useState<any>(null)
  const { toast } = useToast()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      if (!selectedDataType) {
        toast({
          title: "Data Type Required",
          description: "Please select a data type before uploading",
          variant: "destructive",
        })
        return
      }

      setUploading(true)
      setProgress(0)
      setUploadResult(null)

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90))
        }, 200)

        const formData = new FormData()
        formData.append("file", file)
        formData.append("dataType", selectedDataType)

        const response = await fetch("/api/csv/process-inventory", {
          method: "POST",
          body: formData,
        })

        clearInterval(progressInterval)
        setProgress(100)

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || "Upload failed")
        }

        setUploadResult(result)

        toast({
          title: "Upload Successful",
          description: `Processed ${result.processed} records successfully`,
        })

        onUploadComplete?.(result)
      } catch (error: any) {
        console.error("Upload error:", error)
        toast({
          title: "Upload Failed",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setUploading(false)
        setTimeout(() => setProgress(0), 1000)
      }
    },
    [selectedDataType, toast, onUploadComplete],
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
    maxFiles: 1,
    disabled: uploading,
  })

  const downloadTemplate = async (dataType: string) => {
    try {
      const response = await fetch(`/api/csv/template/${dataType}`)
      if (!response.ok) throw new Error("Failed to download template")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${dataType}_template.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Template Downloaded",
        description: `${dataType} template downloaded successfully`,
      })
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="gradient-walmart text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            AI/ML Inventory Data Ingestion
          </CardTitle>
          <CardDescription className="text-blue-100">
            Upload CSV files for Walmart-grade inventory optimization - Team crazsymb
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Data Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Data Type</CardTitle>
          <CardDescription>Choose the type of data you're uploading to ensure proper processing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedDataType} onValueChange={setSelectedDataType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select data type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inventory_data">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Inventory Data</div>
                    <div className="text-xs text-gray-500">SKU, sales, forecasts, weather data</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="vendors">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Vendor Data</div>
                    <div className="text-xs text-gray-500">Supplier information and performance</div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {selectedDataType && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadTemplate(selectedDataType)}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
              <Badge variant="secondary" className="text-xs">
                Use template for proper formatting
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload CSV File</CardTitle>
          <CardDescription>Drag and drop your CSV file or click to browse</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
              isDragActive && !isDragReject && "border-walmart-blue bg-walmart-blue/5 scale-[1.02]",
              isDragReject && "border-red-400 bg-red-50",
              uploading && "pointer-events-none opacity-50",
              !isDragActive && !isDragReject && "border-gray-300 hover:border-walmart-blue hover:bg-walmart-blue/5",
            )}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-walmart-blue/10 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-walmart-blue" />
              </div>
              {isDragActive ? (
                <div>
                  <p className="text-lg font-medium text-walmart-blue">Drop your CSV file here</p>
                  <p className="text-sm text-gray-600">Release to upload</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium">Drag & drop your CSV file here</p>
                  <p className="text-sm text-gray-600">or click to browse files</p>
                  <p className="text-xs text-gray-500 mt-2">Supports: .csv files up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          {uploading && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing CSV...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Result */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {uploadResult.success ? (
                <CheckCircle className="h-5 w-5 text-walmart-green" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              Upload Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-walmart-green/10 rounded-lg">
                <div className="text-2xl font-bold text-walmart-green">{uploadResult.processed}</div>
                <div className="text-sm text-gray-600">Records Processed</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{uploadResult.failed}</div>
                <div className="text-sm text-gray-600">Records Failed</div>
              </div>
              <div className="text-center p-4 bg-walmart-blue/10 rounded-lg">
                <div className="text-2xl font-bold text-walmart-blue">
                  {((uploadResult.processed / (uploadResult.processed + uploadResult.failed)) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>

            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Processing Errors:</p>
                    <ul className="text-sm space-y-1">
                      {uploadResult.errors.slice(0, 5).map((error: string, index: number) => (
                        <li key={index} className="text-red-600">
                          • {error}
                        </li>
                      ))}
                      {uploadResult.errors.length > 5 && (
                        <li className="text-gray-500">... and {uploadResult.errors.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Badge className="bg-walmart-blue text-white">Team crazsymb</Badge>
              <Badge className="bg-walmart-yellow text-walmart-gray-dark">Walmart Sparkathon</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Processing Info */}
      <Card className="bg-gradient-to-r from-walmart-blue/5 to-walmart-green/5">
        <CardHeader>
          <CardTitle className="text-lg">AI/ML Data Processing Pipeline</CardTitle>
          <CardDescription>Your data goes through our advanced processing pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-walmart-blue/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <FileText className="h-6 w-6 text-walmart-blue" />
              </div>
              <h4 className="font-medium">Data Ingestion</h4>
              <p className="text-xs text-gray-600">CSV parsing & validation</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-walmart-green/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-6 w-6 text-walmart-green" />
              </div>
              <h4 className="font-medium">Data Cleaning</h4>
              <p className="text-xs text-gray-600">Normalization & enrichment</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-walmart-yellow/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Sparkles className="h-6 w-6 text-walmart-orange" />
              </div>
              <h4 className="font-medium">AI Processing</h4>
              <p className="text-xs text-gray-600">ML model integration</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Upload className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium">Storage</h4>
              <p className="text-xs text-gray-600">Supabase integration</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
