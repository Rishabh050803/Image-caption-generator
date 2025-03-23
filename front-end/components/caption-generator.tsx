"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Copy, Edit, Check, Save, Lock, Languages, Sparkles, Wand2 } from "lucide-react"
import { translateCaption } from "@/lib/caption-service"
import { toast } from "sonner"
import CaptionRating from "./caption-rating"
import { motion, AnimatePresence } from "framer-motion"
import { LoginPrompt } from "./login-prompt"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

interface CaptionGeneratorProps {
  caption: string;
  basicCaption: string;
  generatedHashtags: string;
  editedCaption: string;
  setEditedCaption: (value: string) => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  saveEditedCaption: () => void;
  isGenerating: boolean;
  generationStep: "idle" | "basic" | "advanced" | "hashtags";
  selectedModel: "basic" | "advanced";
  setSelectedModel: (value: "basic" | "advanced") => void;
  tone: string;
  setTone: (value: string) => void;
  customPrompt: string;
  setCustomPrompt: (value: string) => void;
  onGenerateCaption: (containHashtags: boolean) => void;
  imageUploaded: boolean;
  uploadedImage: string;
  hashtags: boolean;
  setHashtags: (value: boolean) => void;
  isAuthenticated: boolean;
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
  uploadedImage,
  hashtags,
  setHashtags,
  isAuthenticated
}: CaptionGeneratorProps) {
  const [copied, setCopied] = useState(false)
  const [captionVisible, setCaptionVisible] = useState(false)
  const [currentLoadingStep, setCurrentLoadingStep] = useState(0)
  const [currentLoadingStates, setCurrentLoadingStates] = useState<string[]>([])
  
  // New state for translation
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English")
  const [isTranslating, setIsTranslating] = useState(false)
  const [translatedCaption, setTranslatedCaption] = useState<string>("")
  const [currentTranslatedLanguage, setCurrentTranslatedLanguage] = useState<string>("")
  const [showTranslation, setShowTranslation] = useState(false)
  const [isCopiedTranslation, setIsCopiedTranslation] = useState(false)
  const [activeTab, setActiveTab] = useState("generate")

  // Available languages with emoji flags
  const languages = [
    { code: "English", name: "English", flag: "🇺🇸" },
    { code: "Spanish", name: "Spanish", flag: "🇪🇸" },
    { code: "French", name: "French", flag: "🇫🇷" },
    { code: "German", name: "German", flag: "🇩🇪" },
    { code: "Italian", name: "Italian", flag: "🇮🇹" },
    { code: "Portuguese", name: "Portuguese", flag: "🇵🇹" },
    { code: "Chinese", name: "Chinese", flag: "🇨🇳" },
    { code: "Japanese", name: "Japanese", flag: "🇯🇵" },
    { code: "Korean", name: "Korean", flag: "🇰🇷" },
    { code: "Russian", name: "Russian", flag: "🇷🇺" },
    { code: "Arabic", name: "Arabic", flag: "🇸🇦" },
    { code: "Hindi", name: "Hindi", flag: "🇮🇳" },
    { code: "Dutch", name: "Dutch", flag: "🇳🇱" },
    { code: "Swedish", name: "Swedish", flag: "🇸🇪" },
    { code: "Polish", name: "Polish", flag: "🇵🇱" }
  ]

  // Loading states for each step
  const loadingStates = {
    basic: [
      "Analyzing image...",
      "Identifying objects...",
      "Recognizing context...",
      "Crafting caption..."
    ],
    advanced: [
      "Processing image details...",
      "Applying tone preferences...",
      "Incorporating custom instructions...",
      "Refining caption..."
    ],
    hashtags: [
      "Analyzing caption...",
      "Identifying key terms...",
      "Finding trending tags...",
      "Generating hashtags..."
    ]
  }

  // Effect to handle loading states
  useEffect(() => {
    if (isGenerating) {
      const states = loadingStates[generationStep]
      setCurrentLoadingStates(states)
      setCurrentLoadingStep(0)

      // Simulate progress through the steps
      const interval = setInterval(() => {
        setCurrentLoadingStep((prev) => {
          if (prev < states.length - 1) {
            return prev + 1
          }
          clearInterval(interval)
          return prev
        })
      }, 1500)

      return () => clearInterval(interval)
    }
  }, [isGenerating, generationStep])

  // Effect to show the caption with a nice fade-in
  useEffect(() => {
    if (caption) {
      setCaptionVisible(false)
      const timer = setTimeout(() => {
        setCaptionVisible(true)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [caption])

  // Reset translation when caption changes
  useEffect(() => {
    setTranslatedCaption("")
    setCurrentTranslatedLanguage("")
    setShowTranslation(false)
    setIsCopiedTranslation(false)
  }, [caption])

  // Handle language change
  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language)
    // Clear translation if we change language
    if (language !== currentTranslatedLanguage) {
      setTranslatedCaption("")
      setShowTranslation(false)
      setIsCopiedTranslation(false)
    }
  }

  // Handle translation
  const handleTranslate = async () => {
    if (!caption || selectedLanguage === "English" || selectedLanguage === currentTranslatedLanguage) {
      return
    }
    
    setIsTranslating(true)
    
    try {
      const translated = await translateCaption(caption, selectedLanguage)
      setTranslatedCaption(translated)
      setCurrentTranslatedLanguage(selectedLanguage)
      setShowTranslation(true)
      toast.success(`Caption translated to ${selectedLanguage}`)
    } catch (error) {
      console.error("Translation failed:", error)
      
      if (error instanceof Error) {
        toast.error(`Translation failed: ${error.message}`)
      } else {
        toast.error("Translation failed. Please try again later.")
      }
    } finally {
      setIsTranslating(false)
    }
  }

  const copyToClipboard = (text: string, isTranslation: boolean = false) => {
    navigator.clipboard.writeText(text)
    if (isTranslation) {
      setIsCopiedTranslation(true)
      setTimeout(() => setIsCopiedTranslation(false), 2000)
    } else {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    toast.success("Copied to clipboard!")
  }

  // Replace the existing loading content with this modern AI loader
  const renderLoadingContent = () => {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 rounded-full animate-pulse"></div>
          
          <div className="relative flex items-center justify-center w-20 h-20">
            {/* Pulsing circle */}
            <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping opacity-30 duration-75"></div>
            
            {/* Orbital particles */}
            <div className="absolute w-full h-full animate-spin-slow">
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 -ml-1 rounded-full bg-primary/40"></div>
            </div>
            <div className="absolute w-full h-full animate-spin-slow-reverse">
              <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 -ml-1 rounded-full bg-primary/60"></div>
            </div>
            <div className="absolute w-full h-full animate-spin-medium">
              <div className="absolute left-0 top-1/2 w-1.5 h-1.5 -mt-1 rounded-full bg-primary/80"></div>
            </div>
            <div className="absolute w-full h-full animate-spin-medium-reverse">
              <div className="absolute right-0 top-1/2 w-1.5 h-1.5 -mt-1 rounded-full bg-primary/90"></div>
            </div>
            
            {/* Central brain icon */}
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
              {generationStep === "advanced" ? (
                <Sparkles className="h-5 w-5 text-white animate-pulse" />
              ) : (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="h-5 w-5 text-white"
                >
                  <path d="M12 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16z"></path>
                  <path d="M12 6v4"></path>
                  <path d="M15 10l-3 2-3-2"></path>
                  <path d="M15 14H9"></path>
                </svg>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-primary">
            {currentLoadingStates[currentLoadingStep]}
          </p>
          <p className="text-xs text-muted-foreground">
            Step {currentLoadingStep + 1} of {currentLoadingStates.length}
          </p>
        </div>
        
        {/* AI typing effect dots */}
        <div className="flex space-x-1 mt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
        
        {/* Progress bar with shimmer effect */}
        <div className="w-full max-w-xs bg-muted/30 rounded-full h-1.5 mt-2 overflow-hidden relative">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(((currentLoadingStep + 1) / currentLoadingStates.length) * 100, 100)}%`,
            }}
          >
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"
              style={{ 
                backgroundSize: "200% 100%"
              }}
            ></div>
          </div>
        </div>
      </div>
    )
  }

  const includeHashtags = selectedModel === "advanced" && isAuthenticated && hashtags

  return (
    <Card className="border-0 shadow-none bg-transparent h-full flex flex-col">
      <CardContent className="p-6 flex flex-col flex-1 overflow-hidden">
        <Tabs 
          defaultValue="generate"
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full flex flex-col flex-1"
        >
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="generate" className="data-[state=active]:bg-primary/20">
              <Wand2 className="h-4 w-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="translate" className="data-[state=active]:bg-primary/20" disabled={!caption}>
              <Languages className="h-4 w-4 mr-2" />
              Translate
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-4 flex-1 mt-0 flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Model Selection */}
              <div className="glass p-4 rounded-lg space-y-2">
                <Label htmlFor="model-selection" className="text-sm font-medium">
                  Generator Model
                </Label>
                <RadioGroup
                  id="model-selection"
                  value={selectedModel}
                  onValueChange={(value) => setSelectedModel(value as "basic" | "advanced")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="basic" id="basic" />
                    <Label htmlFor="basic" className="cursor-pointer flex items-center">
                      Basic
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value="advanced" 
                      id="advanced" 
                      disabled={!isAuthenticated}
                    />
                    <Label 
                      htmlFor="advanced" 
                      className={`cursor-pointer flex items-center ${!isAuthenticated ? "opacity-50" : ""}`}
                    >
                      Advanced
                      {!isAuthenticated ? (
                        <Lock className="h-3 w-3 ml-1" />
                      ) : (
                        <Sparkles className="h-3 w-3 ml-1 text-amber-500" />
                      )}
                    </Label>
                  </div>
                </RadioGroup>
                
                {!isAuthenticated && selectedModel === "basic" && (
                  <div className="text-xs text-muted-foreground italic mt-1 flex items-center">
                    <Lock className="h-3 w-3 mr-1" />
                    Log in to access advanced caption features
                  </div>
                )}
              </div>

              {/* Advanced Options */}
              <AnimatePresence>
                {selectedModel === "advanced" && isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="glass p-3 rounded-lg space-y-3">
                      {/* Caption Tone Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="tone-selection" className="text-sm font-medium flex items-center">
                          Tone
                          <span className="ml-2 text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 rounded-full">
                            Advanced
                          </span>
                        </Label>
                        <Select value={tone} onValueChange={setTone}>
                          <SelectTrigger id="tone-selection" className="bg-background/50">
                            <SelectValue placeholder="Select tone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="formal">🧐 Formal</SelectItem>
                            <SelectItem value="creative">🎨 Creative</SelectItem>
                            <SelectItem value="funny">😂 Funny</SelectItem>
                            <SelectItem value="professional">💼 Professional</SelectItem>
                            <SelectItem value="casual">🙂 Casual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Custom Instructions */}
                      <div className="space-y-2">
                        <Label htmlFor="custom-prompt" className="text-sm font-medium flex items-center">
                          Custom Instructions
                          <span className="ml-2 text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 rounded-full">
                            Advanced
                          </span>
                        </Label>
                        <Textarea
                          id="custom-prompt"
                          placeholder="Add specific instructions for caption generation..."
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          className="resize-none bg-background/50 min-h-[80px]"
                        />
                      </div>

                      {/* Include Hashtags Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="hashtag-selection" className="text-sm font-medium flex items-center">
                          Include Hashtags
                          <span className="ml-2 text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 rounded-full">
                            Advanced
                          </span>
                        </Label>
                        <RadioGroup
                          id="hashtag-selection"
                          value={hashtags ? "yes" : "no"}
                          onValueChange={(value) => setHashtags(value === "yes")}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="hashtag-yes" />
                            <Label htmlFor="hashtag-yes" className="cursor-pointer">
                              Yes
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="hashtag-no" />
                            <Label htmlFor="hashtag-no" className="cursor-pointer">
                              No
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Caption Display */}
              <div className="space-y-2 flex-1 overflow-hidden flex flex-col min-h-0">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Generated Caption</Label>
                  {caption && !isGenerating && (
                    <div className="flex space-x-2">
                      {isEditing ? (
                        <Button variant="ghost" size="sm" onClick={saveEditedCaption} className="h-8">
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-8">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard(caption)} 
                        disabled={isEditing}
                        className="h-8"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 mr-1 text-green-500" />
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
                <div className="glass p-4 rounded-lg flex-1 relative overflow-auto">
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                      {renderLoadingContent()}
                    </div>
                  ) : caption ? (
                    isEditing ? (
                      <Textarea
                        value={editedCaption}
                        onChange={(e) => setEditedCaption(e.target.value)}
                        className="w-full h-full min-h-[150px] border-0 p-0 focus-visible:ring-0 resize-none bg-transparent"
                      />
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: captionVisible ? 1 : 0 }}
                        transition={{ duration: 0.5 }}
                        className="whitespace-pre-line leading-relaxed"
                      >
                        {caption}
                      </motion.div>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <Wand2 className="h-8 w-8 text-primary opacity-70" />
                      </div>
                      <p>No caption generated yet</p>
                      <p className="text-sm mt-1">Upload an image and click "Generate Caption"</p>
                    </div>
                  )}
                </div>
                
                {/* Caption Rating or Login Prompt */}
                {caption && !isEditing && !isGenerating && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {isAuthenticated ? (
                      <CaptionRating
                        image={imageUploaded ? uploadedImage : ""}
                        caption={basicCaption}
                        tone={tone}
                        customPrompt={customPrompt}
                        hashtags={generatedHashtags}
                        refinedCaption={selectedModel === "advanced" ? caption : undefined}
                        onRatingSubmitted={() => {
                          // Optional: Handle submission success
                        }}
                      />
                    ) : (
                      <LoginPrompt 
                        variant="inline"
                        title="Rate this Caption" 
                        description="Log in to rate this caption and save it to your history"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Generate Caption Button */}
            <Button
              onClick={() => onGenerateCaption(includeHashtags)}
              disabled={!imageUploaded || isGenerating}
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-primary/80"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Generate Caption
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="translate" className="space-y-6 flex-1 mt-0">
            <div className="glass p-4 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="language-selection" className="text-sm font-medium">
                    Select Language
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose a language to translate your caption
                  </p>
                </div>
                {isAuthenticated ? (
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                    Available
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full flex items-center">
                    <Lock className="h-3 w-3 mr-1" />
                    Premium
                  </span>
                )}
              </div>
              
              <div className="flex flex-col md:flex-row gap-3">
                <Select
                  value={selectedLanguage}
                  onValueChange={handleLanguageChange}
                  disabled={isTranslating || !isAuthenticated}
                  className="flex-1"
                >
                  <SelectTrigger className="w-full bg-background/50">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center">
                          <span className="mr-2">{lang.flag}</span>
                          {lang.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  onClick={handleTranslate}
                  disabled={isTranslating || selectedLanguage === "English" || selectedLanguage === currentTranslatedLanguage || !isAuthenticated}
                  className="md:w-auto w-full"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    <>
                      <Languages className="mr-2 h-4 w-4" />
                      Translate
                    </>
                  )}
                </Button>
              </div>
              
              {!isAuthenticated && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-md p-3 text-sm">
                  <div className="flex items-start">
                    <Lock className="h-4 w-4 mt-0.5 mr-2 text-amber-500" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-300">Translation requires login</p>
                      <p className="text-amber-700 dark:text-amber-400 text-xs mt-1">
                        Create an account to unlock translation features and more.
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" variant="outline" asChild className="h-7 text-xs">
                          <Link href="/login">Log In</Link>
                        </Button>
                        <Button size="sm" asChild className="h-7 text-xs">
                          <Link href="/register">Sign Up</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Original Caption Display */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Original Caption</Label>
              <div className="glass p-4 rounded-lg relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
                    English
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(caption)}
                    className="h-6 px-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 mr-1 text-green-500" />
                        <span className="text-xs">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        <span className="text-xs">Copy</span>
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm">{caption}</p>
              </div>
            </div>

            {/* Translated Caption */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Translated Caption</Label>
              <div className="glass p-4 rounded-lg min-h-[100px] relative">
                {isTranslating ? (
                  <div className="flex flex-col items-center justify-center h-32 space-y-2">
                    <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent"></div>
                    <p className="text-sm text-center">Translating to {selectedLanguage}...</p>
                  </div>
                ) : showTranslation && translatedCaption ? (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full flex items-center">
                        {languages.find(l => l.code === currentTranslatedLanguage)?.flag || ""} {currentTranslatedLanguage}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(translatedCaption, true)}
                        className="h-6 px-2"
                      >
                        {isCopiedTranslation ? (
                          <>
                            <Check className="h-3 w-3 mr-1 text-green-500" />
                            <span className="text-xs">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            <span className="text-xs">Copy</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm"
                    >
                      {translatedCaption}
                    </motion.p>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-8">
                    <Languages className="h-8 w-8 opacity-40 mb-2" />
                    <p>No translation yet</p>
                    <p className="text-xs mt-1">
                      {isAuthenticated 
                        ? "Select a language and click Translate" 
                        : "Log in to use translation features"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

