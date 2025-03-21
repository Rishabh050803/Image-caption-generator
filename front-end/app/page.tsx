"use client"

import { useState, useEffect } from "react"
import ImageUpload from "@/components/image-upload"
import CaptionGenerator from "@/components/caption-generator"
import TeamSection from "@/components/team-section"
import { generateBasicCaption, generateAdvancedCaption, generateHashtags } from "@/lib/caption-service"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Github, Menu, AlertCircle, WifiOff, Clock, LogIn } from "lucide-react"
import Link from "next/link"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import AuthWrapper from "@/components/auth-wrapper"
import { LogoutButton } from "@/components/logout-button"
import { HistorySidebar } from "@/components/history-sidebar"
import { useAuth } from "@/lib/auth"

// Replace this with your actual GitHub repository URL
const GITHUB_REPO_URL = "https://github.com/Rishabh050803/Image-caption-generator"

interface RatedCaption {
  id: number
  image: string
  generated_caption: string
  rating: number
  tone: string | null
  custom_instruction: string | null
  hashtags: string | null
  refined_caption: string | null
  created_at: string
}

export default function Home() {
  const { isAuthenticated } = useAuth()
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [caption, setCaption] = useState<string>("")
  const [basicCaption, setBasicCaption] = useState<string>("")
  const [generatedHashtags, setGeneratedHashtags] = useState<string>("")
  const [editedCaption, setEditedCaption] = useState<string>("")
  const [isEditing, setIsEditing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedModel, setSelectedModel] = useState<"basic" | "advanced">("basic")
  const [tone, setTone] = useState<string>("formal")
  const [customPrompt, setCustomPrompt] = useState<string>("")
  const [hashtags, setHashtags] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [generationStep, setGenerationStep] = useState<"idle" | "basic" | "advanced" | "hashtags">("idle")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [error, setError] = useState<{
    type: "connection" | "timeout" | "server" | "generation" | null;
    message: string;
  }>({ type: null, message: "" })

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

  // Check for internet connectivity
  useEffect(() => {
    const handleOnline = () => {
      setError(prevError => {
        if (prevError?.type === "connection") {
          toast.success("You're back online!");
          return { type: null, message: "" };
        }
        return prevError;
      });
    };

    const handleOffline = () => {
      setError(prevError => {
        // Only set error if we don't already have a connection error
        if (prevError?.type !== "connection") {
          toast.error("You're offline! Please check your connection.");
          return {
            type: "connection",
            message: "You appear to be offline. Please check your internet connection."
          };
        }
        return prevError;
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check initial state (but don't cause infinite loops)
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      // Use a setTimeout to avoid the loop during initial render
      const timer = setTimeout(handleOffline, 0);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []); // No dependencies!

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
    setError({ type: null, message: "" }) // Clear any previous errors
  }

  const handleSelectCaption = (selectedCaption: RatedCaption) => {
    try {
      // Set the image
      setUploadedImage(selectedCaption.image)
      
      // Set the caption - prefer refined caption if available
      const captionText = selectedCaption.refined_caption || selectedCaption.generated_caption
      setCaption(captionText)
      setBasicCaption(selectedCaption.generated_caption)
      setEditedCaption(captionText)
      
      // Set hashtags if available
      if (selectedCaption.hashtags) {
        setGeneratedHashtags(selectedCaption.hashtags)
      }
      
      // Set tone and custom prompt if available
      if (selectedCaption.tone) {
        setTone(selectedCaption.tone)
        setSelectedModel("advanced") // If tone is set, it was likely an advanced caption
      }
      
      if (selectedCaption.custom_instruction) {
        setCustomPrompt(selectedCaption.custom_instruction)
        setSelectedModel("advanced") // If custom instruction is set, it was an advanced caption
      }
      
      // Clear any previous errors
      setError({ type: null, message: "" })
      
      // Close the sidebar on mobile after selection
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
      }
    } catch (err) {
      console.error("Error selecting caption:", err);
      setError({ 
        type: "server", 
        message: "Failed to load caption details. Please try again." 
      });
    }
  }

  // Helper function to handle API calls with timeout
  const fetchWithTimeout = async (
    promiseFn: () => Promise<any>, 
    timeoutMs: number = 30000,
    errorMessage: string = "Request timed out"
  ) => {
    // Define timeoutId as potentially undefined
    let timeoutId: NodeJS.Timeout | undefined;
    
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("TIMEOUT"));
      }, timeoutMs);
    });
    
    try {
      const result = await Promise.race([promiseFn(), timeoutPromise]);
      // Only clear the timeout if it was set
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      return result;
    } catch (error) {
      // Also clear the timeout in the catch block to prevent memory leaks
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      if (error instanceof Error && error.message === "TIMEOUT") {
        throw new Error(errorMessage);
      }
      throw error;
    }
  };

  const handleGenerateCaption = async (containHashtags: boolean) => {
    if (!uploadedImage) return;
  
    setIsGenerating(true);
    setIsEditing(false);
    setGenerationStep("basic");
    setError({ type: null, message: "" }); // Clear any previous errors
  
    try {
      // First, check if we're online
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        throw new Error("You appear to be offline. Please check your internet connection.");
      }
  
      // 1) Generate the basic caption and store it separately
      try {
        const basicCaptionResult = await fetchWithTimeout(
          () => generateBasicCaption({
            image: uploadedImage,
            model: selectedModel,
            tone: selectedModel === "advanced" ? tone : "formal",
            customPrompt: selectedModel === "advanced" ? customPrompt : "",
            containHashtags,
            prevCaption: caption,
          }),
          45000, // 45 second timeout
          "Basic caption generation timed out. The server might be busy."
        );
        
        setBasicCaption(basicCaptionResult);
        let finalCaption = basicCaptionResult;
        
        // 2) If advanced mode is selected, generate a refined caption
        if (selectedModel === "advanced") {
          setGenerationStep("advanced");
          
          try {
            const refinedCaptionResult = await fetchWithTimeout(
              () => generateAdvancedCaption({
                image: uploadedImage,
                model: selectedModel,
                tone,
                customPrompt,
                containHashtags,
                prevCaption: caption,
              }),
              60000, // 60 second timeout
              "Advanced caption refinement timed out. Using the basic caption instead."
            );
            
            if (refinedCaptionResult !== "error") {
              finalCaption = refinedCaptionResult;
            } else {
              toast.warning("Advanced refinement failed. Using basic caption.");
              console.log("Error in refining caption");
            }
          } catch (advancedError) {
            console.error("Advanced caption error:", advancedError);
            toast.warning(advancedError instanceof Error ? advancedError.message : "Advanced refinement failed. Using basic caption.");
            // Continue with basic caption
          }
        }
    
        // 3) Generate hashtags if required
        if (containHashtags) {
          setGenerationStep("hashtags");
          
          try {
            let tags = await fetchWithTimeout(
              () => generateHashtags(finalCaption),
              30000, // 30 second timeout
              "Hashtag generation timed out."
            );
            
            if (tags.length > 0) {
              // Limit to 5 for brevity
              tags = tags.slice(0, 5);
              finalCaption += "\n\n" + tags.join(" ");
              setGeneratedHashtags(tags.join(","));
            } else {
              toast.warning("Couldn't generate hashtags");
              console.log("Error in generating hashtags");
            }
          } catch (hashtagError) {
            console.error("Hashtag error:", hashtagError);
            toast.warning(hashtagError instanceof Error ? hashtagError.message : "Couldn't generate hashtags");
            // Continue without hashtags
          }
        }
    
        // Save the final caption (refined if applicable) and set edited caption
        setCaption(finalCaption);
        setEditedCaption(finalCaption);
        toast.success("Caption generated successfully!");
        
      } catch (basicError) {
        console.error("Basic caption error:", basicError);
        
        if (basicError instanceof Error) {
          if (basicError.message.includes("timeout") || basicError.message.includes("timed out")) {
            setError({ type: "timeout", message: basicError.message });
          } else {
            setError({ type: "generation", message: "Failed to generate caption. Please try again." });
          }
        } else {
          setError({ type: "server", message: "Server error. Please try again later." });
        }
        
        toast.error("Caption generation failed");
      }
      
    } catch (error) {
      console.error("Caption generation error:", error);
      
      // Determine error type and set appropriate message
      if (error instanceof Error) {
        if (error.message.includes("offline")) {
          setError({ type: "connection", message: error.message });
        } else if (error.message.includes("NetworkError") || error.message.includes("Failed to fetch")) {
          setError({ type: "connection", message: "Network error. Please check your connection or the server might be down." });
        } else if (error.message.includes("timeout") || error.message.includes("timed out")) {
          setError({ type: "timeout", message: "The request timed out. Server may be busy." });
        } else {
          setError({ type: "server", message: "Something went wrong. Please try again later." });
        }
      } else {
        setError({ type: "server", message: "An unknown error occurred." });
      }
      
      toast.error("Caption generation failed");
    } finally {
      setIsGenerating(false);
      setGenerationStep("idle");
    }
  };

  const saveEditedCaption = () => {
    setCaption(editedCaption)
    setIsEditing(false)
  }

  // Function to dismiss error
  const dismissError = () => {
    setError({ type: null, message: "" });
  };

  // Error message component
  const ErrorMessage = () => {
    if (!error.type) return null;
    
    const errorIcons = {
      connection: <WifiOff className="h-5 w-5" />,
      timeout: <Clock className="h-5 w-5" />,
      server: <AlertCircle className="h-5 w-5" />,
      generation: <AlertCircle className="h-5 w-5" />
    };
    
    const icon = errorIcons[error.type] || <AlertCircle className="h-5 w-5" />;
    
    return (
      <Alert variant="destructive" className="mb-6">
        <div className="flex items-start">
          {icon}
          <div className="ml-3 flex-1">
            <AlertTitle>
              {error.type === "connection" && "Connection Error"}
              {error.type === "timeout" && "Request Timeout"}
              {error.type === "server" && "Server Error"}
              {error.type === "generation" && "Generation Error"}
            </AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={dismissError}>
            Dismiss
          </Button>
        </div>
      </Alert>
    );
  };

  return (
    <AuthWrapper>
      <div className={`min-h-screen transition-colors relative ${isDarkMode ? "dark bg-black text-white" : "bg-white"}`}>
        {/* Unified background for the entire page */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <BackgroundBeams className="h-full w-full" />
        </div>

        {/* History Sidebar */}
        <HistorySidebar 
          onSelectCaption={handleSelectCaption}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        {/* Main Content - Adjust padding to accommodate sidebar */}
        <div className={`relative z-10 transition-all duration-300 ${isSidebarOpen ? "md:ml-80" : "md:ml-16"}`}>
          <div className="container mx-auto py-12 px-4">
            {/* Header with Title + Buttons */}
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center">
                {isAuthenticated && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="mr-2 md:hidden" 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                )}
                <h1 className="text-3xl font-bold text-center">Image Caption Generator</h1>
              </div>
              <div className="flex items-center gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
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
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>See Project Repo</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                
                {isAuthenticated ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <LogoutButton />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Logout</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href="/login">
                          <Button variant="outline" size="icon" className="rounded-full">
                            <LogIn className="h-5 w-5" />
                            <span className="sr-only">Login</span>
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Login</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>

            {/* Error display area */}
            <ErrorMessage />

            {/* Welcome message for non-authenticated users */}
            {!isAuthenticated && (
              <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <h2 className="text-lg font-semibold mb-2">Welcome to Image Caption Generator</h2>
                <p className="mb-4">
                  You can use basic caption generation without an account. Sign up to access advanced features, 
                  including custom tones, personalized instructions, hashtags, and caption history!
                </p>
                <div className="flex gap-3">
                  <Link href="/login">
                    <Button variant="outline" size="sm">Log In</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              </div>
            )}

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
                  basicCaption={basicCaption}
                  generatedHashtags={generatedHashtags}
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
                  uploadedImage={uploadedImage || ""}
                  hashtags={hashtags}
                  setHashtags={setHashtags} 
                  isAuthenticated={isAuthenticated} // Add this prop
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
    </AuthWrapper>
  )
}

