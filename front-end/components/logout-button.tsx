"use client"

import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const { logout } = useAuth()

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={logout} 
      className="rounded-full"
    >
      <LogOut className="h-5 w-5" />
      <span className="sr-only">Logout</span>
    </Button>
  )
}