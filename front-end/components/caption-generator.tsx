"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Copy, Edit, Check, Save } from "lucide-react"
import CaptionRating from "./caption-rating"

interface CaptionGeneratorProps {
  caption: string
  basicCaption:string
  generatedHashtags:string
  editedCaption: string
  setEditedCaption: (caption: string) => void
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  saveEditedCaption: () => void
  isGenerating: boolean
  generationStep: "idle" | "basic" | "advanced" | "hashtags"
  selectedModel: "basic" | "advanced"
  setSelectedModel: (model: "basic" | "advanced") => void
  tone: string
  setTone: (tone: string) => void
  customPrompt: string
  setCustomPrompt: (prompt: string) => void
  onGenerateCaption: (includeHashtags: boolean) => void
  imageUploaded: boolean
  uploadedImage: string  // Add this line
}

export default function CaptionGenerator({
  caption,
  basicCaption,
  generatedHashtags,
  editedCaption,
  setEditedCaption,
  isEditing,
  setIsEditing,
  saveEditedCaption,
  isGenerating,
  generationStep,
  selectedModel,
  setSelectedModel,
  tone,
  setTone,
  customPrompt,
  setCustomPrompt,
  onGenerateCaption,
  imageUploaded,
  uploadedImage,  // Add this parameter
}: CaptionGeneratorProps) {
  const [copied, setCopied] = useState(false)
  const [captionVisible, setCaptionVisible] = useState(false)
  const [includeHashtags, setIncludeHashtags] = useState(false)
  const [currentLoadingStep, setCurrentLoadingStep] = useState(0)
  const [showLongWaitMessage, setShowLongWaitMessage] = useState(false)
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const longWaitTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Define loading states for each step
  const loadingStates = [
    { text: "Analyzing your image..." },
    { text: "Identifying key elements..." },
    { text: "Understanding image context..." },
    { text: "Drafting basic caption..." },
  ]

  // Add advanced loading states if using advanced mode
  const advancedLoadingStates = [
    ...loadingStates,
    { text: "Applying your custom tone preferences..." },
    { text: "Refining caption style..." },
    { text: "Incorporating your custom instructions..." },
    { text: "Polishing final wording..." },
  ]

  // Add hashtag states if including hashtags
  const hashtagLoadingStates = [
    ...(selectedModel === "advanced" ? advancedLoadingStates : loadingStates),
    { text: "Identifying trending topics..." },
    { text: "Generating relevant hashtags..." },
    { text: "Finalizing caption with hashtags..." },
  ]

  // Determine which set of loading states to use
  let currentLoadingStates = loadingStates
  if (selectedModel === "advanced" && includeHashtags) {
    currentLoadingStates = hashtagLoadingStates
  } else if (selectedModel === "advanced") {
    currentLoadingStates = advancedLoadingStates
  } else if (includeHashtags) {
    currentLoadingStates = [
      ...loadingStates,
      { text: "Generating relevant hashtags..." },
      { text: "Finalizing caption with hashtags..." },
    ]
  }

  // Update loading states based on generation step
  useEffect(() => {
    // Clean up any existing timers
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current)
    }
    if (longWaitTimerRef.current) {
      clearTimeout(longWaitTimerRef.current)
    }

    setShowLongWaitMessage(false)

    if (isGenerating) {
      setCurrentLoadingStep(0)

      // Progress through loading steps
      const progressLoading = () => {
        setCurrentLoadingStep((prev) => {
          // Don't exceed the number of loading states
          if (prev < currentLoadingStates.length - 1) {
            return prev + 1
          }
          return prev
        })
      }

      // Set up step progression timers
      const stepTime = 2500 // Base time per step

      // Set up the loading steps to progress
      for (let i = 1; i < currentLoadingStates.length; i++) {
        loadingTimerRef.current = setTimeout(() => {
          progressLoading()
        }, i * stepTime)
      }

      // Set up the "taking longer than expected" message timer
      const totalExpectedTime = currentLoadingStates.length * stepTime + 5000
      longWaitTimerRef.current = setTimeout(() => {
        setShowLongWaitMessage(true)
      }, totalExpectedTime)
    }

    // Clean up function
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current)
      }
      if (longWaitTimerRef.current) {
        clearTimeout(longWaitTimerRef.current)
      }
    }
  }, [isGenerating, currentLoadingStates.length])

  // Reset animation when caption changes
  useEffect(() => {
    setCaptionVisible(false)
    const timer = setTimeout(() => {
      setCaptionVisible(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [caption])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(caption)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // The caption loading UI component
  const renderLoadingContent = () => {
    // Show the current loading step, or the "taking longer" message
    if (showLongWaitMessage) {
      return (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            Taking longer than expected. Please wait...
          </p>
        </>
      )
    }

    return (
      <>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground dark:text-gray-400">
          {currentLoadingStates[currentLoadingStep]?.text || "Generating your caption..."}
        </p>
      </>
    )
  }

  return (
    <Card className="w-full h-full flex flex-col dark:bg-black dark:border-gray-800">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="space-y-4 flex-1">
          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model-selection" className="dark:text-gray-200">
              Select Model
            </Label>
            <RadioGroup
              id="model-selection"
              value={selectedModel}
              onValueChange={(value) => setSelectedModel(value as "basic" | "advanced")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="basic" id="basic" />
                <Label htmlFor="basic" className="dark:text-gray-200">
                  Basic
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="advanced" id="advanced" />
                <Label htmlFor="advanced" className="dark:text-gray-200">
                  Advanced
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Caption Tone Selection */}
          <div className="space-y-2">
            <Label htmlFor="tone-selection" className="dark:text-gray-200">
              Caption Tone
            </Label>
            <Select value={tone} onValueChange={setTone} disabled={selectedModel === "basic"}>
              <SelectTrigger id="tone-selection" className={selectedModel === "basic" ? "opacity-50" : ""}>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="funny">Funny</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Instructions */}
          <div className="space-y-2">
            <Label htmlFor="custom-prompt" className="dark:text-gray-200">
              Custom Instructions
            </Label>
            <Textarea
              id="custom-prompt"
              placeholder={
                selectedModel === "basic"
                  ? "Available in Advanced mode"
                  : "Add specific instructions for caption generation..."
              }
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              disabled={selectedModel === "basic"}
              className={`resize-none dark:bg-gray-900 dark:text-gray-200 ${selectedModel === "basic" ? "opacity-50" : ""}`}
            />
          </div>

          {/* Include Hashtags Selection */}
          <div className="space-y-2">
            <Label htmlFor="hashtag-selection" className="dark:text-gray-200">
              Include Hashtags?
            </Label>
            <RadioGroup
              id="hashtag-selection"
              value={includeHashtags ? "yes" : "no"}
              onValueChange={(value) => setIncludeHashtags(value === "yes")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="hashtag-yes" />
                <Label htmlFor="hashtag-yes" className="dark:text-gray-200">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="hashtag-no" />
                <Label htmlFor="hashtag-no" className="dark:text-gray-200">
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Caption Display */}
          <div className="space-y-2 flex-1">
            <div className="flex justify-between items-center">
              <Label className="dark:text-gray-200">Generated Caption</Label>
              {caption && !isGenerating && (
                <div className="flex space-x-2">
                  {isEditing ? (
                    <Button variant="ghost" size="sm" onClick={saveEditedCaption}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={copyToClipboard} disabled={isEditing}>
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
            <div className="border rounded-md p-3 min-h-[150px] bg-muted/30 dark:bg-gray-900 dark:border-gray-800">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  {renderLoadingContent()}
                  <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-900 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(((currentLoadingStep + 1) / currentLoadingStates.length) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ) : caption ? (
                isEditing ? (
                  <Textarea
                    value={editedCaption}
                    onChange={(e) => setEditedCaption(e.target.value)}
                    className="w-full h-full min-h-[100px] border-0 p-0 focus-visible:ring-0 resize-none dark:bg-gray-900 dark:text-gray-200"
                  />
                ) : (
                  <p
                    className={`transition-opacity duration-500 dark:text-gray-200 ${captionVisible ? "opacity-100" : "opacity-0"}`}
                  >
                    {caption}
                  </p>
                )
              ) : (
                <p className="text-muted-foreground text-sm dark:text-gray-400">No caption generated yet.</p>
              )}
              {caption && !isEditing && !isGenerating && (
                <CaptionRating
                  image={imageUploaded ? uploadedImage : ""}
                  caption={basicCaption}
                  tone={tone}
                  customPrompt={customPrompt}
                  hashtags={generatedHashtags}  // Use includeHashtags instead of containsHashtags
                  refinedCaption={selectedModel === "advanced" ? caption : undefined}
                  onRatingSubmitted={() => {
                    // Optional: Handle submission success
                    // e.g., show thank you message or reset form
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Generate Caption Button */}
        <Button
          onClick={() => onGenerateCaption(includeHashtags)}
          disabled={!imageUploaded || isGenerating}
          className="mt-4"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Caption"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

