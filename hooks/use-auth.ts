"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase-client"
import { getCurrentUser } from "@/lib/api/auth"

interface AuthUser {
  user: User
  profile: any
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log("useAuth: Initial session check starting...")
        const { data, error }:any = await getCurrentUser()
        if (error) {
          console.log("useAuth: Initial session error:", error)
          setError(error.message)
        } else if (data) {
          console.log("useAuth: Initial session success:", data)
          setUser(data)
          if (data.profile?.teams) {
            localStorage.setItem("userTeams", JSON.stringify(data.profile.teams))
          }
        } else {
          console.log("useAuth: No initial session found")
        }
      } catch (err) {
        console.log("useAuth: Initial session exception:", err)
        setError(err instanceof Error ? err.message : "Authentication error")
      } finally {
        setLoading(false)
        setIsInitialized(true)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("useAuth: Auth state changed:", event, session?.user?.id)

      if (session?.user) {
        try {
          console.log("useAuth: Session found, getting user data...")
          const { data, error }:any = await getCurrentUser()
          if (error) {
            console.log("useAuth: GetCurrentUser error:", error)
            setError(error.message)
            setUser(null)
          } else if (data) {
            console.log("useAuth: GetCurrentUser success:", data)
            setUser(data)
            setError(null)
            if (data.profile?.teams) {
              localStorage.setItem("userTeams", JSON.stringify(data.profile.teams))
            }
          }
        } catch (err) {
          console.log("useAuth: GetCurrentUser exception:", err)
          setError(err instanceof Error ? err.message : "Authentication error")
          setUser(null)
        }
      } else {
        console.log("useAuth: No session, clearing user")
        setUser(null)
        setError(null)
      }

      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    setUser,
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isInitialized,
  }
}
