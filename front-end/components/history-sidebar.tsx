"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, Star, Image, FileText, Clock } from "lucide-react"
import { format } from "date-fns"
import { truncate } from "@/lib/utils"
import { useAuth } from "@/lib/auth"

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

export function HistorySidebar({ onSelectCaption, isOpen, setIsOpen }: HistorySidebarProps) {
  const [captions, setCaptions] = useState<RatedCaption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      fetchCaptions()
    }
  }, [isAuthenticated])

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
      }
    } catch (error) {
      console.error("Error fetching captions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className={`fixed top-0 left-0 h-full z-20 transition-all duration-300 flex ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-16"}`}>
      {/* Main sidebar content */}
      <div className={`bg-white dark:bg-gray-900 h-full shadow-xl flex flex-col ${isOpen ? "w-80" : "w-0 md:w-16"}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          {isOpen && <h2 className="font-semibold">Caption History</h2>}
          <Button variant="ghost" size="icon" className="ml-auto" onClick={toggleSidebar}>
            {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </div>

        {/* Caption List */}
        {isOpen && (
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : captions.length > 0 ? (
              <div className="p-2">
                {captions.map((caption) => (
                  <div 
                    key={caption.id}
                    onClick={() => onSelectCaption(caption)}
                    className="mb-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
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
                      <span className="text-xs text-gray-500">
                        {format(new Date(caption.created_at), "MMM d")}
                      </span>
                    </div>

                    <div className="flex items-start space-x-2">
                      <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <img src={caption.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {truncate(caption.refined_caption || caption.generated_caption, 70)}
                      </p>
                    </div>

                    {caption.tone && (
                      <div className="mt-2 text-xs">
                        <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                          {caption.tone}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <FileText className="mx-auto h-10 w-10 mb-2 opacity-50" />
                <p>No captions yet</p>
              </div>
            )}
          </ScrollArea>
        )}

        {/* Collapsed View */}
        {!isOpen && (
          <div className="flex flex-col items-center pt-4 space-y-6">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hover:bg-gray-100 dark:hover:bg-gray-800">
              <Image className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hover:bg-gray-100 dark:hover:bg-gray-800">
              <Clock className="h-5 w-5" />
            </Button>
            <div className="text-xs font-medium text-center dark:text-gray-400">
              {captions.length}
            </div>
          </div>
        )}
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-10 md:hidden" 
          onClick={toggleSidebar}
        />
      )}
    </div>
  )
}