"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  username?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  loginWithGoogle: () => void
  loginWithGithub: () => void
  checkAuth: () => Promise<boolean>
  register: (email: string, password1: string, password2: string, firstName: string, lastName: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  })
  
  const router = useRouter()
  
  const checkAuth = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/status/`, {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        setState({
          ...state,
          user: data.user || null,
          isAuthenticated: data.isAuthenticated,
          isLoading: false,
          error: null
        })
        return data.isAuthenticated
      } else {
        setState({
          ...state,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        })
        return false
      }
    } catch (error) {
      setState({
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Authentication check failed'
      })
      return false
    }
  }
  
  // Check auth status on mount
  useEffect(() => {
    checkAuth()
  }, [])
  
  const login = async (email: string, password: string): Promise<boolean> => {
    setState({ ...state, isLoading: true, error: null })
    try {
      // First, get a CSRF token
      const csrfResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/csrf-token/`, 
        { credentials: 'include' }
      )
      
      const { csrfToken } = await csrfResponse.json()
      
      // Now make the login request with the CSRF token
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/login/`, 
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken  // Include the CSRF token here
          },
          body: JSON.stringify({ email, password }),
          credentials: 'include'
        }
      )
      
      if (response.ok) {
        await checkAuth()
        return true
      } else {
        const error = await response.json()
        setState({
          ...state,
          isLoading: false,
          error: error.detail || 'Login failed'
        })
        return false
      }
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: 'Login request failed'
      })
      return false
    }
  }
  
  const logout = async (): Promise<void> => {
    setState({ ...state, isLoading: true })
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/logout/`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      })
      router.push('/login')
    }
  }
  
  const loginWithGoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/accounts/google/login/`
  }
  
  const loginWithGithub = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/accounts/github/login/`
  }

  const register = async (email: string, password1: string, password2: string, firstName: string, lastName: string): Promise<boolean> => {
    setState({ ...state, isLoading: true, error: null })
    try {
      // First, get a CSRF token
      const csrfResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/csrf-token/`, 
        { credentials: 'include' }
      )
      
      const { csrfToken } = await csrfResponse.json()
      
      // Log what we're sending
      console.log("Registration data:", { 
        email, 
        password1: "***", 
        password2: "***",
        first_name: firstName,
        last_name: lastName,
        // Add username if your Django requires it
        username: email
      });
      
      // Make registration request with complete data
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/registration/`, 
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          },
          body: JSON.stringify({ 
            email, 
            password1, 
            password2,
            first_name: firstName,
            last_name: lastName,
            // Add username if your Django requires it
            username: email
          }),
          credentials: 'include'
        }
      )
      
      // Log full response for debugging
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Registration error:", errorData);
        const errorMessage = errorData.email || 
                            errorData.password1 || 
                            errorData.password2 || 
                            errorData.first_name ||
                            errorData.last_name ||
                            errorData.non_field_errors ||
                            'Registration failed';
        
        setState({
          ...state,
          isLoading: false,
          error: Array.isArray(errorMessage) ? errorMessage[0] : errorMessage
        });
        return false;
      }
      
      await checkAuth();
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      setState({
        ...state,
        isLoading: false,
        error: 'Registration request failed'
      });
      return false;
    }
  }
  
  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        loginWithGoogle,
        loginWithGithub,
        checkAuth,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}