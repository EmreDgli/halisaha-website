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

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data, error }:any = await getCurrentUser()
        if (error) {
          setError(error.message)
        } else {
          setUser(data)
          localStorage.setItem("userTeams", JSON.stringify(data.teams))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication error")
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id)

      if (session?.user) {
        try {
          const { data, error }:any = await getCurrentUser()
          if (error) {
            setError(error.message)
            setUser(null)
          } else {
            setUser(data)
            setError(null)
            localStorage.setItem("userTeams", JSON.stringify(data.teams))
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Authentication error")
          setUser(null)
        }
      } else {
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
  }
}
