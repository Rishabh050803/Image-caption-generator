"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Link from "next/link"

interface AuthWrapperProps {
  children: React.ReactNode
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { isLoading, isAuthenticated } = useAuth()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Always show content, regardless of authentication status
    setShowContent(true)
  }, [isLoading])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
        <p className="text-lg">Loading...</p>
      </div>
    )
  }

  return <>{children}</>
}