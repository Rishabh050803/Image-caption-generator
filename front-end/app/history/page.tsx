"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import ProtectedRoute from "@/components/protected-route"
import { BackgroundBeams } from "@/components/ui/background-beams"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Star } from "lucide-react"

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

export default function HistoryPage() {
  const [ratings, setRatings] = useState<RatedCaption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated } = useAuth()
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchRatings()
    }
  }, [isAuthenticated])
  
  const fetchRatings = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/captions/ratings/`,
        { credentials: 'include' }
      )
      
      if (response.ok) {
        const data = await response.json()
        setRatings(data)
      }
    } catch (error) {
      console.error("Error fetching ratings:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen relative">
        <div className="absolute inset-0 w-full h-full">
          <BackgroundBeams className="h-full w-full" />
        </div>
        
        <div className="relative z-10 container py-12 px-4">
          <div className="flex items-center mb-8">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold ml-2">Your Caption History</h1>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : ratings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {ratings.map((rating) => (
                <div key={rating.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <img 
                      src={rating.image} 
                      alt="Uploaded" 
                      className="object-cover rounded-md w-full h-48"
                    />
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i}
                          className={`w-5 h-5 ${i < rating.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
                      {new Date(rating.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300">{rating.generated_caption}</p>
                  
                  {rating.tone && (
                    <div className="mt-3 text-sm">
                      <span className="font-semibold">Tone:</span> {rating.tone}
                    </div>
                  )}
                  
                  {rating.custom_instruction && (
                    <div className="mt-1 text-sm">
                      <span className="font-semibold">Custom instruction:</span> {rating.custom_instruction}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl">You haven't rated any captions yet.</p>
              <Link href="/">
                <Button className="mt-4">Generate Some Captions</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

// Add this to your navbar or header component
<Link href="/history">
  <Button variant="ghost">History</Button>
</Link>