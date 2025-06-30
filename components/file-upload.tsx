"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadFile } from "@/lib/blob"
import { Loader2, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FileUploadProps {
  onUploadComplete?: (url: string, filename: string) => void
  folder?: string
  accept?: string
  maxSizeMB?: number
}

export function FileUpload({ onUploadComplete, folder = "", accept = "*", maxSizeMB = 5 }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      if (selectedFile.size > maxSizeBytes) {
        toast({
          title: "File too large",
          description: `Maximum file size is ${maxSizeMB}MB`,
          variant: "destructive",
        })
        return
      }

      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    try {
      const { url, filename } = await uploadFile(file, folder)
      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully",
      })
      if (onUploadComplete) {
        onUploadComplete(url, filename)
      }
      setFile(null)
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const clearFile = () => {
    setFile(null)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="file-upload">Upload File</Label>
      <div className="flex items-center gap-2">
        <Input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          accept={accept}
          className={file ? "hidden" : ""}
          disabled={isUploading}
        />
        {file && (
          <div className="flex items-center gap-2 border rounded-md p-2 w-full">
            <div className="flex-1 truncate">{file.name}</div>
            <Button variant="ghost" size="icon" onClick={clearFile} disabled={isUploading} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {file && (
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
