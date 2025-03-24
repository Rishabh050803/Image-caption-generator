"use client"

import React, { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Image, X, Upload, Camera, FileImage } from "lucide-react"

interface ImageUploadProps {
  onImageUpload: (base64: string) => void
  uploadedImage: string | null
}

export default function ImageUpload({ onImageUpload, uploadedImage }: ImageUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null)
      setIsLoading(true)

      const file = acceptedFiles[0]
      if (!file) return

      // Check if file is an image
      if (!file.type.match("image.*")) {
        setError("Please upload an image file")
        setIsLoading(false)
        return
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size must be less than 10MB")
        setIsLoading(false)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) {
          onImageUpload(result)
        }
        setIsLoading(false)
      }
      reader.readAsDataURL(file)
    },
    [onImageUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"]
    },
    maxFiles: 1
  })

  const handleRemoveImage = () => {
    onImageUpload("")
  }

  return (
    <div className="w-full flex flex-col h-full">
      <AnimatePresence mode="wait">
        {!uploadedImage ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <div
              {...getRootProps()}
              className={`relative cursor-pointer border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all duration-200 h-full min-h-[450px] ${
                isDragActive
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-border hover:border-primary/50 hover:bg-secondary/30"
              }`}
            >
              <input {...getInputProps()} />
              
              <div className={`flex flex-col items-center justify-center space-y-6 text-center transition-transform ${isDragActive ? "scale-110" : ""}`}>
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  {isLoading ? (
                    <div className="animate-spin h-12 w-12 border-2 border-primary border-t-transparent rounded-full" />
                  ) : (
                    <Image className="h-12 w-12 text-primary" />
                  )}
                </div>
                
                {/* Decorative elements to fill space */}
                <div className="absolute -z-10 opacity-5">
                  <FileImage className="h-48 w-48 text-primary" />
                </div>
                
                <div className="space-y-3 max-w-xs">
                  <h3 className="font-medium text-xl">{isDragActive ? "Drop your image here" : "Upload an image"}</h3>
                  <p className="text-muted-foreground">
                    Drag and drop or click to browse your files
                  </p>
                  <span className="text-xs text-muted-foreground block">
                    Supports JPG, PNG, WebP (max 10MB)
                  </span>
                </div>
                
                <div className="py-6">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="hover:bg-primary hover:text-white transition-colors"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Select Image
                  </Button>
                </div>
                
                {/* Visual cues for drop area */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center opacity-50">
                  <div className="w-16 h-1 bg-muted-foreground/20 rounded-full"></div>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="mt-3 text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                {error}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center h-full min-h-[450px]"
          >
            <img
              src={uploadedImage}
              alt="Uploaded"
              className="h-full w-full object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/5 pointer-events-none" />
            
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={handleRemoveImage}
              className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </motion.button>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-4 right-4 flex gap-2"
            >
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Button size="sm" variant="outline" className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-white/20">
                  <Camera className="h-4 w-4 mr-2" />
                  Change Image
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

