"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function AuthSuccess() {
  const router = useRouter()
  const { checkAuth } = useAuth()
  const [status, setStatus] = useState("pending") // pending, success, failed
  const [message, setMessage] = useState("Completing authentication...")
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const completeAuth = async () => {
      try {
        // Wait a moment for cookies to properly set
        await new Promise(r => setTimeout(r, 1000))
        
        // Check if authentication was successful
        const isAuthenticated = await checkAuth()
        
        if (isAuthenticated) {
          setStatus("success")
          setMessage("Authentication successful!")
          
          // Start countdown
          let count = 3
          setCountdown(count)
          const timer = setInterval(() => {
            count -= 1
            setCountdown(count)
            if (count <= 0) {
              clearInterval(timer)
              router.push("/")
            }
          }, 1000)
          
          return () => clearInterval(timer)
        } else {
          setStatus("failed")
          setMessage("Authentication failed. Please try again.")
          setTimeout(() => router.push("/login"), 3000)
        }
      } catch (error) {
        console.error("Error completing authentication:", error)
        setStatus("failed")
        setMessage("Authentication error. Please try again.")
        setTimeout(() => router.push("/login"), 3000)
      }
    }

    completeAuth()
  }, [router, checkAuth])

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="absolute inset-0 w-full h-full">
        <BackgroundBeams className="h-full w-full" />
      </div>
      
      <motion.div 
        className="relative z-10 w-full max-w-md px-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full border-opacity-50 shadow-xl bg-white/95 dark:bg-gray-900/90 backdrop-blur-sm">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            {status === "pending" && (
              <motion.div 
                className="py-8 flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-primary/20"></div>
                  </div>
                </div>
                <h2 className="text-xl font-bold mb-2">Authenticating</h2>
                <p className="text-gray-500 dark:text-gray-400">Please wait while we complete your authentication...</p>
              </motion.div>
            )}
            
            {status === "success" && (
              <motion.div 
                className="py-8 flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="mb-4 text-green-500 dark:text-green-400">
                  <CheckCircle className="w-16 h-16" />
                </div>
                <h2 className="text-xl font-bold mb-2">Authentication Successful!</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  You are now signed in. Redirecting to home page...
                </p>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                  <span className="text-primary font-bold">{countdown}</span>
                </div>
              </motion.div>
            )}
            
            {status === "failed" && (
              <motion.div 
                className="py-8 flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="mb-4 text-red-500 dark:text-red-400">
                  <XCircle className="w-16 h-16" />
                </div>
                <h2 className="text-xl font-bold mb-2">Authentication Failed</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  {message}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">
                  Redirecting to login page...
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}