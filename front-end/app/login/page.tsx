"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Mail } from "lucide-react"
import { useAuth } from "@/lib/auth"
import Link from "next/link"
import { BackgroundBeams } from "@/components/ui/background-beams"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, loginWithGoogle, loginWithGithub, isLoading, error } = useAuth()
  const router = useRouter()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await login(email, password)
    if (success) {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="absolute inset-0 w-full h-full">
        <BackgroundBeams className="h-full w-full" />
      </div>
      
      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Choose your preferred sign in method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={loginWithGoogle} 
                disabled={isLoading}
              >
                <Mail className="mr-2 h-4 w-4" /> Sign in with Google
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={loginWithGithub} 
                disabled={isLoading}
              >
                <Github className="mr-2 h-4 w-4" /> Sign in with GitHub
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2">Or continue with</span>
              </div>
            </div>
            
            <form onSubmit={handleEmailLogin} className="space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              <div className="space-y-2">
                <Input
                  id="email"
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="password"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-center w-full">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}