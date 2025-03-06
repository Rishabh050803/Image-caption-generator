"use client"
import { useState, useEffect } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileUpload } from "@/components/ui/file-upload"

interface ImageUploadProps {
  onImageUpload: (imageDataUrl: string) => void
  uploadedImage: string | null
}

interface FileUploadProps {
  onChange?: (files: File[]) => void
  accept?: string
}

export default function ImageUpload({ onImageUpload, uploadedImage }: ImageUploadProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    setPreviewImage(uploadedImage)
  }, [uploadedImage])

  const handleFileUpload = (files: File[]) => {
    const file = files[0]
    if (!file || !file.type.startsWith("image/")) {
      console.error("Invalid file type or no file selected")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewImage(event.target.result as string)
        onImageUpload(event.target.result as string)
      }
    }

    reader.onerror = (error) => {
      console.error("FileReader error:", error)
    }

    reader.readAsDataURL(file)
  }

  return (
    <Card className="w-full h-full flex items-center justify-center dark:bg-black dark:border-gray-800">
      <CardContent className="p-6 w-full h-full">
        {previewImage ? (
          <div className="relative w-full h-full flex flex-col items-center">
            <div className="relative w-full h-[450px] overflow-hidden rounded-md mb-4">
              <img
                src={previewImage || "/placeholder.svg"}
                alt="Uploaded image"
                className="w-full h-full object-contain"
              />
            </div>
            <Button
              onClick={() => {
                setPreviewImage(null)
                onImageUpload("")
              }}
              variant="outline"
              className="mt-auto dark:border-gray-800 dark:text-gray-200"
            >
              Upload Different Image
            </Button>
          </div>
        ) : (
          <div className="w-full h-[450px] flex flex-col items-center justify-center">
            <FileUpload 
              onChange={handleFileUpload}
              
              accept="image/*"
              className="w-full h-full" 
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

