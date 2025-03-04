"use client"

import { useState, useEffect } from "react"
import ImageUpload from "@/components/image-upload"
import CaptionGenerator from "@/components/caption-generator"
import TeamSection from "@/components/team-section"
import { generateCaption,generateBasicCaption,generateAdvancedCaption,generateHashtags} from "@/lib/caption-service"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Github } from "lucide-react"
import Link from "next/link"
import { hash } from "crypto"

// Replace this with your actual GitHub repository URL
const GITHUB_REPO_URL = "https://github.com/yourusername/image-caption-generator"

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
    if (!uploadedImage) return;

    setIsGenerating(true);
    setIsEditing(false);
    setGenerationStep("basic");

    try {
      let generatedCaption = await generateBasicCaption({
        image: uploadedImage,
        model: selectedModel,
        tone: selectedModel === "advanced" ? tone : "formal",
        customPrompt: selectedModel === "advanced" ? customPrompt : "",
        containHashtags, 
        prevCaption: caption,
      });


      if(selectedModel === "advanced" ){
        setGenerationStep("advanced");
        let refinedCaption = await generateAdvancedCaption({
          image: uploadedImage,
          model: selectedModel,
          tone: selectedModel === "advanced" ? tone : "formal",
          customPrompt: selectedModel === "advanced" ? customPrompt : "",
          containHashtags, 
          prevCaption: caption,
        });
        if(refinedCaption!="error"){
          generatedCaption = refinedCaption;
        }
        else{
          console.log("Error in refining caption");
        }
      }

      if(containHashtags){
        setGenerationStep("hashtags");
        let hashtags = await generateHashtags(generatedCaption);
        if(hashtags.length>0){
          hashtags = hashtags;
          if(hashtags.length>5){
            hashtags = hashtags.slice(0,5);
          }
          generatedCaption += "\n\n" + hashtags.join(" ");
        }
        else{
          console.log("Error in generating hashtags");
        }
      }

      setCaption(generatedCaption);
      setEditedCaption(generatedCaption);
    } catch (error) {
      console.error("Error generating caption:", error);
    } finally {
      setIsGenerating(false);
      setGenerationStep("idle");
    }
  };


  const saveEditedCaption = () => {
    setCaption(editedCaption)
    setIsEditing(false)
  }

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? "dark bg-gray-900 text-white" : "bg-white"}`}>
      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              generationStep={generationStep}  // Pass the new state
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              tone={tone}
              setTone={setTone}
              customPrompt={customPrompt}
              setCustomPrompt={setCustomPrompt}
              onGenerateCaption={handleGenerateCaption}  // Now accepts the hashtag flag
              imageUploaded={!!uploadedImage}
            />

          </div>
        </div>

        <TeamSection />
      </main>
    </div>
  )
}

