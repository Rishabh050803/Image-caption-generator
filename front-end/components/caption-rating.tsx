"use client"

import { useState } from 'react'
import { Star, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth"

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
          <Star className="w-8 h-8" />
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
        `${process.env.NEXT_PUBLIC_API_URL || 'https://image-caption-generator-1wpc.onrender.com'}/api/csrf-token/`, 
        { credentials: 'include' }
      )
      
      const { csrfToken } = await csrfResponse.json()
      setSubmitProgress(30)
      
      // Submit the rating
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://image-caption-generator-1wpc.onrender.com'}/api/captions/rate/`, 
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
  
  // Show thank you message after successful submission
  if (isSubmitted) {
    return (
      <div className="w-full flex flex-col items-center gap-4 mt-6 border-t pt-4">
        <div className="w-full max-w-md bg-green-50 dark:bg-green-900/30 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full">
              <Check className="h-8 w-8 text-green-600 dark:text-green-300" />
            </div>
          </div>
          <h3 className="text-xl font-medium text-center text-green-700 dark:text-green-300">
            Thanks for your feedback!
          </h3>
          <p className="text-center text-green-600 dark:text-green-400 mt-2">
            Your rating helps us improve our caption generation.
          </p>
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setRating(null)
                setIsSubmitted(false)
              }}
            >
              Rate Again
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  if (!caption) return null
  
  return (
    <div className="w-full flex flex-col items-center gap-4 mt-6 border-t pt-4">
      <h3 className="text-lg font-medium text-center">How would you rate this caption?</h3>
      
      <div className="flex items-center gap-1">
        {displayStars()}
      </div>
      
      {isSubmitting && (
        <div className="w-full max-w-xs mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${submitProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <Button 
        onClick={submitRating} 
        disabled={!rating || isSubmitting}
        className="mt-2"
      >
        {isSubmitting ? "Submitting..." : "Submit Rating"}
      </Button>
    </div>
  )
}