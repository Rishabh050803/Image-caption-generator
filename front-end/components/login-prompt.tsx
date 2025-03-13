"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Lock } from "lucide-react"
import Link from "next/link"

interface LoginPromptProps {
  title?: string
  description?: string
  variant?: "inline" | "card" | "banner" | "overlay"
  className?: string
}

export function LoginPrompt({
  title = "Feature Requires Login",
  description = "Please log in or create an account to access this feature.",
  variant = "card",
  className = ""
}: LoginPromptProps) {
  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-2 text-sm border rounded-md p-2 mt-2 ${className}`}>
        <Lock className="h-4 w-4" />
        <p>{description}</p>
        <div className="ml-auto space-x-2">
          <Link href="/login">
            <Button variant="link" size="sm" className="p-0 h-auto">
              Log In
            </Button>
          </Link>
          <span>/</span>
          <Link href="/register">
            <Button variant="link" size="sm" className="p-0 h-auto">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (variant === "banner") {
    return (
      <div className={`bg-muted/50 p-3 rounded-md flex items-center ${className}`}>
        <Lock className="h-5 w-5 mr-2 flex-shrink-0" />
        <p className="text-sm flex-1">{description}</p>
        <div className="space-x-2">
          <Link href="/login">
            <Button size="sm" variant="secondary">Log In</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Sign Up</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (variant === "overlay") {
    return (
      <div className={`absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 ${className}`}>
        <Lock className="h-12 w-12 mb-4" />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-center mb-6">{description}</p>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="outline">Log In</Button>
          </Link>
          <Link href="/register">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Default card variant
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-end gap-3">
        <Link href="/login">
          <Button variant="outline">Log In</Button>
        </Link>
        <Link href="/register">
          <Button>Sign Up</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}