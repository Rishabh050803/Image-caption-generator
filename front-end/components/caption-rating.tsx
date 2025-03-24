"use client"

import { useState } from 'react'
import { Star, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth"
import { motion, AnimatePresence } from "framer-motion"

interface CaptionRatingProps {
  image: string                // The base64 image
  caption: string              // The basic caption
  tone?: string                // Selected tone
  customPrompt?: string        // Custom prompt
  hashtags?: string           // Generated hashtags array
  refinedCaption?: string      // Advanced/refined caption
  onRatingSubmitted?: () => void
}

export default function CaptionRating({
  image,
  caption,
  tone,
  customPrompt,
  hashtags,
  refinedCaption,
  onRatingSubmitted
}: CaptionRatingProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitProgress, setSubmitProgress] = useState(0)
  const { isAuthenticated } = useAuth()
  
  const displayStars = () => {
    const stars = []
    const totalStars = 5
    const activeRating = hoveredRating !== null ? hoveredRating : rating
    
    for (let i = 1; i <= totalStars; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`transition-all ${
            i <= (activeRating || 0) ? "text-yellow-500" : "text-gray-300"
          }`}
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(null)}
          disabled={isSubmitting || isSubmitted}
        >
          <Star className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      )
    }
    
    return stars
  }
  
  const submitRating = async () => {
    if (!rating || !isAuthenticated || isSubmitted) return
    
    setIsSubmitting(true)
    setSubmitProgress(10)
    
    try {
      // Get CSRF token
      const csrfResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/csrf-token/`, 
        { credentials: 'include' }
      )
      
      const { csrfToken } = await csrfResponse.json()
      setSubmitProgress(30)
      
      // Submit the rating
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/captions/rate/`, 
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          },
          body: JSON.stringify({
            image,
            generated_caption: caption,
            rating,
            tone: tone || null,
            custom_instruction: customPrompt || null,
            hashtags: hashtags || null,
            refined_caption: refinedCaption || null
          }),
          credentials: 'include'
        }
      )
      
      setSubmitProgress(80)
      
      if (response.ok) {
        setSubmitProgress(100)
        setIsSubmitted(true)
        toast.success("Thank you for your rating!")
        if (onRatingSubmitted) onRatingSubmitted()
      } else {
        toast.error("Failed to submit rating. Please try again.")
        setSubmitProgress(0)
      }
    } catch (error) {
      console.error("Error submitting rating:", error)
      toast.error("Failed to submit rating. Please try again.")
      setSubmitProgress(0)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (!caption) return null
  
  return (
    <AnimatePresence mode="wait">
      {isSubmitted ? (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="w-full mt-2"
        >
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 py-1">
            <div className="bg-green-100 dark:bg-green-800/40 p-1 rounded-full">
              <Check className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Thanks for your feedback!</span>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full flex justify-between items-center py-1"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Rate: </span>
            <div className="flex items-center">
              {displayStars()}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isSubmitting && (
              <div className="w-16 h-1.5 bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-300" 
                  style={{ width: `${submitProgress}%` }}
                ></div>
              </div>
            )}
            
            <Button 
              onClick={submitRating} 
              disabled={!rating || isSubmitting}
              size="sm"
              variant="outline"
              className="h-8"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}