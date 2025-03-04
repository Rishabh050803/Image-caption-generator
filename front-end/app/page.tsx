"use client"

import { useState, useEffect } from "react"
import ImageUpload from "@/components/image-upload"
import CaptionGenerator from "@/components/caption-generator"
import TeamSection from "@/components/team-section"
import { generateBasicCaption, generateAdvancedCaption, generateHashtags } from "@/lib/caption-service"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Github } from "lucide-react"
import Link from "next/link"
import { BackgroundBeams } from "@/components/ui/background-beams"

// Replace this with your actual GitHub repository URL
const GITHUB_REPO_URL = "https://github.com/Rishabh050803/Image-caption-generator"

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [caption, setCaption] = useState<string>("")
  const [editedCaption, setEditedCaption] = useState<string>("")
  const [isEditing, setIsEditing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedModel, setSelectedModel] = useState<"basic" | "advanced">("basic")
  const [tone, setTone] = useState<string>("formal")
  const [customPrompt, setCustomPrompt] = useState<string>("")
  const [hashtags, setHashtags] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [generationStep, setGenerationStep] = useState<"idle" | "basic" | "advanced" | "hashtags">("idle")

  // Initialize dark mode based on user preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("darkMode") === "true"
      setIsDarkMode(savedMode)
      if (savedMode) {
        document.documentElement.classList.add("dark")
      }
    }
  }, [])

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    if (newMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("darkMode", String(newMode))
    }
  }

  const handleImageUpload = (imageDataUrl: string) => {
    setUploadedImage(imageDataUrl)
    setCaption("")
    setEditedCaption("")
    setIsEditing(false)
  }

  const handleGenerateCaption = async (containHashtags: boolean) => {
    // Existing code...
    if (!uploadedImage) return

    setIsGenerating(true)
    setIsEditing(false)
    setGenerationStep("basic")

    try {
      // 1) Basic caption
      let generatedCaption = await generateBasicCaption({
        image: uploadedImage,
        model: selectedModel,
        tone: selectedModel === "advanced" ? tone : "formal",
        customPrompt: selectedModel === "advanced" ? customPrompt : "",
        containHashtags,
        prevCaption: caption,
      })

      // 2) Advanced refinement (if "advanced" selected)
      if (selectedModel === "advanced") {
        setGenerationStep("advanced")
        const refinedCaption = await generateAdvancedCaption({
          image: uploadedImage,
          model: selectedModel,
          tone,
          customPrompt,
          containHashtags,
          prevCaption: caption,
        })
        if (refinedCaption !== "error") {
          generatedCaption = refinedCaption
        } else {
          console.log("Error in refining caption")
        }
      }

      // 3) Hashtags
      if (containHashtags) {
        setGenerationStep("hashtags")
        let tags = await generateHashtags(generatedCaption)
        if (tags.length > 0) {
          // Limit to 5 for brevity
          tags = tags.slice(0, 5)
          generatedCaption += "\n\n" + tags.join(" ")
        } else {
          console.log("Error in generating hashtags")
        }
      }

      setCaption(generatedCaption)
      setEditedCaption(generatedCaption)
    } catch (error) {
      console.error("Error generating caption:", error)
    } finally {
      setIsGenerating(false)
      setGenerationStep("idle")
    }
  }

  const saveEditedCaption = () => {
    setCaption(editedCaption)
    setIsEditing(false)
  }

  return (
    <div className={`min-h-screen transition-colors relative ${isDarkMode ? "dark bg-black text-white" : "bg-white"}`}>
      {/* Unified background for the entire page */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <BackgroundBeams className="h-full w-full" />
      </div>

      {/* All content container */}
      <div className="relative z-10">
        {/* Main section (image upload and caption generator) */}
        <div className="container mx-auto py-12 px-4">
          {/* Header with Title + Buttons */}
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-3xl font-bold text-center">Image Caption Generator</h1>
            <div className="flex items-center gap-4">
              <Link
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center"
              >
                <Button variant="outline" size="icon" className="rounded-full">
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub Repository</span>
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Main Grid: Left=Image Upload, Right=Caption */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold mb-4">Image Upload</h2>
              <ImageUpload onImageUpload={handleImageUpload} uploadedImage={uploadedImage} />
            </div>

            <div className="flex flex-col">
              <h2 className="text-xl font-semibold mb-4">Caption Generator</h2>
              <CaptionGenerator
                caption={caption}
                editedCaption={editedCaption}
                setEditedCaption={setEditedCaption}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                saveEditedCaption={saveEditedCaption}
                isGenerating={isGenerating}
                generationStep={generationStep}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                tone={tone}
                setTone={setTone}
                customPrompt={customPrompt}
                setCustomPrompt={setCustomPrompt}
                onGenerateCaption={handleGenerateCaption}
                imageUploaded={!!uploadedImage}
              />
            </div>
          </div>

          {/* Team section with visual separator but same background */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-center mb-8">Our Team</h2>
            <TeamSection />
          </div>
        </div>
      </div>
    </div>
  )
}

