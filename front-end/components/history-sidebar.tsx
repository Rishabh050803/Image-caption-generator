"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, Star, Image, FileText, Clock, Lock, RefreshCw, Search, X } from "lucide-react"
import { format } from "date-fns"
import { truncate } from "@/lib/utils"
import { useAuth } from "@/lib/auth"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"

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

interface HistorySidebarProps {
  onSelectCaption: (caption: RatedCaption) => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

// Tone color mapping
const toneColorMap: Record<string, { bg: string, bgDark: string, text: string, icon: string }> = {
  formal: {
    bg: "bg-blue-100",
    bgDark: "dark:bg-blue-900/40", 
    text: "dark:text-blue-300",
    icon: "📝"
  },
  creative: {
    bg: "bg-purple-100",
    bgDark: "dark:bg-purple-900/40", 
    text: "dark:text-purple-300",
    icon: "🎨"
  },
  funny: {
    bg: "bg-amber-100",
    bgDark: "dark:bg-amber-900/40", 
    text: "dark:text-amber-300",
    icon: "😂"
  },
  professional: {
    bg: "bg-emerald-100",
    bgDark: "dark:bg-emerald-900/40", 
    text: "dark:text-emerald-300",
    icon: "💼"
  },
  casual: {
    bg: "bg-rose-100",
    bgDark: "dark:bg-rose-900/40", 
    text: "dark:text-rose-300",
    icon: "🙂"
  },
  // Default color for any other tone
  default: {
    bg: "bg-gray-100",
    bgDark: "dark:bg-gray-800", 
    text: "dark:text-gray-300",
    icon: "📄"
  }
};

export function HistorySidebar({ onSelectCaption, isOpen, setIsOpen }: HistorySidebarProps) {
  const [captions, setCaptions] = useState<RatedCaption[]>([])
  const [filteredCaptions, setFilteredCaptions] = useState<RatedCaption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      fetchCaptions()
    } else {
      setCaptions([])
      setFilteredCaptions([])
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCaptions(captions)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredCaptions(
        captions.filter(caption => 
          caption.generated_caption?.toLowerCase().includes(query) || 
          caption.refined_caption?.toLowerCase().includes(query) ||
          caption.tone?.toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery, captions])

  const fetchCaptions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/captions/ratings/`,
        { credentials: 'include' }
      )
      
      if (response.ok) {
        const data = await response.json()
        setCaptions(data)
        setFilteredCaptions(data)
      }
    } catch (error) {
      console.error("Error fetching captions:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    if (isAuthenticated && !isRefreshing) {
      setIsRefreshing(true)
      fetchCaptions()
    }
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  // Function to get tone color classes
  const getToneColorClasses = (tone: string | null): string => {
    if (!tone) return `${toneColorMap.default.bg} ${toneColorMap.default.bgDark} ${toneColorMap.default.text}`;
    
    const toneKey = tone.toLowerCase();
    const colorSet = toneColorMap[toneKey] || toneColorMap.default;
    
    return `${colorSet.bg} ${colorSet.bgDark} ${colorSet.text}`;
  };

  const getToneIcon = (tone: string | null): string => {
    if (!tone) return toneColorMap.default.icon;
    
    const toneKey = tone.toLowerCase();
    return toneColorMap[toneKey]?.icon || toneColorMap.default.icon;
  };

  const sidebarVariants = {
    open: { 
      width: "20rem",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      } 
    },
    closed: { 
      width: "4rem",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      } 
    }
  };

  // Add this function to your component
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  return (
    <motion.div 
      initial={false}
      animate={isOpen ? "open" : "closed"}
      variants={sidebarVariants}
      className="fixed top-0 left-0 h-full z-20 flex overflow-hidden"
    >
      {/* Main sidebar content */}
      <div className="glass backdrop-blur-lg h-full shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200/20 dark:border-gray-700/20 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.h2 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="font-semibold flex items-center"
              >
                <Clock className="h-5 w-5 mr-2" />
                Caption History
              </motion.h2>
            )}
          </AnimatePresence>
          
          <div className="flex items-center">
            {isAuthenticated && isOpen && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="hover:bg-white/10 dark:hover:bg-black/20"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span className="sr-only">Refresh</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh history</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="hover:bg-white/10 dark:hover:bg-black/20"
            >
              {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Caption List or Login Prompt */}
        {isOpen && (
          <div 
            className="flex-1 overflow-hidden flex flex-col"
            onWheel={handleWheel}
          >
            {isAuthenticated && (
              <div className="p-3 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search captions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-8 py-2 bg-secondary/30 border-secondary/20"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-2.5"
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* This is the actual scrollable container */}
            <div
              className="flex-1 overflow-y-auto custom-scrollbar"
              style={{ 
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {!isAuthenticated ? (
                <div className="p-6 flex flex-col items-center justify-center h-full text-center fade-in">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Lock className="h-8 w-8 text-primary opacity-70" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Login Required</h3>
                  <p className="text-muted-foreground mb-6 max-w-xs">
                    Sign in to view and manage your caption history.
                  </p>
                  <div className="space-y-3 w-full max-w-[200px]">
                    <Link href="/login" className="w-full">
                      <Button variant="default" className="w-full hover:scale-105 transition-transform">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" className="w-full">
                      <Button variant="outline" className="w-full hover:scale-105 transition-transform">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredCaptions.length > 0 ? (
                <div className="p-2">
                  {filteredCaptions.map((caption) => (
                    <motion.div 
                      key={caption.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => onSelectCaption(caption)}
                      className="mb-3 p-3 rounded-lg hover:bg-white/10 dark:hover:bg-black/20 cursor-pointer transition-colors glass border border-white/5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i}
                              className={`w-4 h-4 ${i < caption.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          {format(new Date(caption.created_at), "MMM d")}
                        </span>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-black/20">
                          <img src={caption.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-sm flex-1">
                          {truncate(caption.refined_caption || caption.generated_caption, 70)}
                        </p>
                      </div>

                      {caption.tone && (
                        <div className="mt-2 text-xs">
                          <span className={`px-2 py-1 rounded-full ${getToneColorClasses(caption.tone)} flex items-center w-fit`}>
                            <span className="mr-1">{getToneIcon(caption.tone)}</span>
                            {caption.tone}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="mx-auto h-10 w-10 mb-2 opacity-50" />
                  <p>No captions yet</p>
                  {searchQuery && (
                    <p className="text-sm mt-1">Try a different search term</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Collapsed View */}
        {!isOpen && (
          <div className="flex flex-col items-center pt-4 space-y-6">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hover:bg-white/10 dark:hover:bg-black/20">
              <Image className="h-5 w-5" />
            </Button>
            
            {isAuthenticated ? (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="hover:bg-white/10 dark:hover:bg-black/20"
                >
                  <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hover:bg-white/10 dark:hover:bg-black/20">
                  <Clock className="h-5 w-5" />
                </Button>
                <div className="text-xs font-medium text-center text-muted-foreground">
                  {captions.length}
                </div>
              </>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar} 
                className="hover:bg-white/10 dark:hover:bg-black/20"
              >
                <Lock className="h-5 w-5 text-muted-foreground" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10 md:hidden" 
          onClick={toggleSidebar}
        />
      )}
    </motion.div>
  )
}