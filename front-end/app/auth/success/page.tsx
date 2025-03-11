"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"

export default function AuthSuccess() {
  const router = useRouter()
  const { checkAuth } = useAuth()
  const [status, setStatus] = useState("Completing authentication...")

  useEffect(() => {
    const completeAuth = async () => {
      try {
        // Wait a moment for cookies to properly set
        await new Promise(r => setTimeout(r, 1000))
        
        // Check if authentication was successful
        const isAuthenticated = await checkAuth()
        
        if (isAuthenticated) {
          setStatus("Authentication successful! Redirecting...")
          // Redirect to home page after a short delay
          setTimeout(() => router.push("/"), 500)
        } else {
          setStatus("Authentication failed. Redirecting to login...")
          setTimeout(() => router.push("/login"), 1500)
        }
      } catch (error) {
        console.error("Error completing authentication:", error)
        setStatus("Authentication error. Please try again.")
        setTimeout(() => router.push("/login"), 1500)
      }
    }

    completeAuth()
  }, [router, checkAuth])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Processing Authentication</h1>
      <p className="text-gray-600">{status}</p>
    </div>
  )
}