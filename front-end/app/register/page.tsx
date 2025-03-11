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

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)
  const { register, loginWithGoogle, loginWithGithub, isLoading, error } = useAuth()
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match")
      return
    }
    
    if (!firstName.trim()) {
      setLocalError("First name is required")
      return
    }
    
    if (!lastName.trim()) {
      setLocalError("Last name is required")
      return
    }
    
    const success = await register(email, password, confirmPassword, firstName, lastName)
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
            <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
            <CardDescription className="text-center">
              Sign up for free or use a social provider
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
                <Mail className="mr-2 h-4 w-4" /> Sign up with Google
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={loginWithGithub} 
                disabled={isLoading}
              >
                <Github className="mr-2 h-4 w-4" /> Sign up with GitHub
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2">Or register with email</span>
              </div>
            </div>
            
            <form onSubmit={handleRegister} className="space-y-4">
              {(error || localError) && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{localError || error}</span>
                </div>
              )}
              
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    id="firstName"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="lastName"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
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
              <div className="space-y-2">
                <Input
                  id="confirmPassword"
                  placeholder="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-center w-full">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}