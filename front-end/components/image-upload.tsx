"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";

interface ImageUploadProps {
  onImageUpload: (imageDataUrl: string) => void;
  uploadedImage: string | null;
}

export default function ImageUpload({ onImageUpload, uploadedImage }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setPreviewImage(uploadedImage);
  }, [uploadedImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input triggered");
    const file = e.target.files?.[0];
    if (file) {
      console.log("File selected:", file.name);
      processFile(file);
    }
  };
  

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  
    console.log("File dropped:", e.dataTransfer.files);
  
    const file = e.dataTransfer.files?.[0];
    if (!file) {
      console.error("No file detected in drop event");
      return;
    }
  
    console.log("Dropped file:", file.name, "Type:", file.type, "Size:", file.size);
    
    if (file.type.startsWith("image/")) {
      processFile(file);
    } else {
      console.error("Invalid file type:", file.type);
    }
  };
  
  const processFile = (file: File) => {
    console.log("Processing file:", file.name);
  
    if (!file.type.startsWith("image/")) {
      console.error("Invalid file type");
      return;
    }
  
    const reader = new FileReader();
    
    reader.onload = (event) => {
      console.log("File read successfully:", event.target?.result?.toString().substring(0, 30), "...");
      if (event.target?.result) {
        setPreviewImage(event.target.result as string);
        onImageUpload(event.target.result as string);
      }
    };
  
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
    };
  
    reader.readAsDataURL(file);
  };
  
  
  return (
    <Card className="w-full h-full flex items-center justify-center dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="p-6 w-full h-full">
        {previewImage ? (
          <div className="relative w-full h-full flex flex-col items-center">
            <div className="relative w-full h-[320px] overflow-hidden rounded-md mb-4">
              <img
                src={previewImage || "/placeholder.svg"}
                alt="Uploaded image"
                className="w-full h-full object-contain"
              />
            </div>
            <Button
              onClick={() => {
                setPreviewImage(null);
                onImageUpload("");
              }}
              variant="outline"
              className="mt-auto dark:border-gray-600 dark:text-gray-200"
            >
              Upload Different Image
            </Button>
          </div>
        ) : (
          <div
            className={`w-full h-[400px] border-2 border-dashed rounded-md flex flex-col items-center justify-center p-6 transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 dark:border-gray-600"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <ImageIcon className="w-12 h-12 text-muted-foreground mb-4 dark:text-gray-400" />
            <p className="text-lg font-medium mb-2 dark:text-gray-200">Drag & drop an image here</p>
            <p className="text-sm text-muted-foreground mb-6 dark:text-gray-400">or</p>

            {/* Updated File Input */}
            <label htmlFor="image-upload" className="relative cursor-pointer">
              <Button type="button">Browse Files</Button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
              />
              </label>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
