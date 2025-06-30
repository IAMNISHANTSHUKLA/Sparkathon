"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/file-upload"
import { Button } from "@/components/ui/button"
import { listFiles } from "@/lib/blob"
import { useToast } from "@/hooks/use-toast"
import { FileText, Loader2, RefreshCw } from "lucide-react"

interface DocumentFile {
  url: string
  pathname: string
  size: number
  uploadedAt: Date
}

export function DocumentUpload() {
  const [documents, setDocuments] = useState<DocumentFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const loadDocuments = async () => {
    setIsLoading(true)
    try {
      const blobs = await listFiles("esg-documents")
      setDocuments(
        blobs.map((blob) => ({
          url: blob.url,
          pathname: blob.pathname,
          size: blob.size,
          uploadedAt: new Date(blob.uploadedAt),
        })),
      )
    } catch (error) {
      toast({
        title: "Error loading documents",
        description: "There was an error loading your documents",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadComplete = (url: string, filename: string) => {
    loadDocuments()
  }

  // Load documents on component mount
  useState(() => {
    loadDocuments()
  })

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const getFileName = (pathname: string) => {
    const parts = pathname.split("/")
    return parts[parts.length - 1].substring(nanoidLength + 1) // Remove nanoid prefix
  }

  const nanoidLength = 21 // Default nanoid length

  return (
    <Card>
      <CardHeader>
        <CardTitle>ESG Documents</CardTitle>
        <CardDescription>Upload and manage your ESG compliance documents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileUpload
          onUploadComplete={handleUploadComplete}
          folder="esg-documents"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
          maxSizeMB={10}
        />

        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Uploaded Documents</h3>
            <Button variant="outline" size="sm" onClick={loadDocuments} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2">Refresh</span>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.url} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <p className="font-medium">{getFileName(doc.pathname)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(doc.size)} • {doc.uploadedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No documents uploaded yet</div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Supported file types: PDF, Word, Excel, CSV, and text files up to 10MB
        </p>
      </CardFooter>
    </Card>
  )
}
