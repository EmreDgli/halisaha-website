"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"

export type UserRole = "player" | "owner"

interface UseRoleSelectionOptions {
  onRoleSelect?: (role: UserRole) => void
  redirectDelay?: number
}

export function useRoleSelection({ onRoleSelect, redirectDelay = 1000 }: UseRoleSelectionOptions = {}) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const selectRole = useCallback(
    async (role: UserRole) => {
      setSelectedRole(role)
      setIsLoading(true)

      try {
        // Call custom handler if provided
        if (onRoleSelect) {
          await onRoleSelect(role)
          return
        }

        // Default behavior - simulate processing and redirect
        await new Promise((resolve) => setTimeout(resolve, redirectDelay))

        // Redirect to appropriate dashboard
        const dashboardPath = role === "player" ? "/dashboard/player" : "/dashboard/owner"
        router.push(dashboardPath)
      } catch (error) {
        console.error("Role selection error:", error)
        setIsLoading(false)
        setSelectedRole(null)
      }
    },
    [onRoleSelect, redirectDelay, router],
  )

  const reset = useCallback(() => {
    setSelectedRole(null)
    setIsLoading(false)
  }, [])

  return {
    selectedRole,
    isLoading,
    selectRole,
    reset,
  }
}
