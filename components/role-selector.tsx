"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Users, Building2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface RoleSelectorProps {
  onRoleSelect?: (role: "player" | "owner") => void
  disabled?: boolean
}

export function RoleSelector({ onRoleSelect, disabled = false }: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRoleSelection = async (role: "player" | "owner") => {
    if (disabled) return

    setSelectedRole(role)
    setIsLoading(true)

    try {
      // Call parent callback if provided
      if (onRoleSelect) {
        onRoleSelect(role)
        return
      }

      // Default behavior - redirect to dashboard
      await new Promise((resolve) => setTimeout(resolve, 800))

      if (role === "player") {
        router.push("/dashboard/player")
      } else {
        router.push("/dashboard/owner")
      }
    } catch (error) {
      console.error("Role selection error:", error)
      setIsLoading(false)
      setSelectedRole(null)
    }
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={() => handleRoleSelection("player")}
        disabled={isLoading || disabled}
        className={`
          w-full h-16 text-left justify-start relative overflow-hidden
          bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
          text-white shadow-lg hover:shadow-xl transition-all duration-300
          transform hover:scale-[1.02] active:scale-[0.98]
          ${selectedRole === "player" ? "ring-4 ring-blue-200" : ""}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            {isLoading && selectedRole === "player" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Users className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="font-semibold text-lg">Oyuncu Olarak Devam Et</div>
            <div className="text-sm opacity-90">Takımlarınızı yönetin, maç organize edin</div>
          </div>
        </div>
      </Button>

      <Button
        onClick={() => handleRoleSelection("owner")}
        disabled={isLoading || disabled}
        className={`
          w-full h-16 text-left justify-start relative overflow-hidden
          bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800
          text-white shadow-lg hover:shadow-xl transition-all duration-300
          transform hover:scale-[1.02] active:scale-[0.98]
          ${selectedRole === "owner" ? "ring-4 ring-green-200" : ""}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            {isLoading && selectedRole === "owner" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Building2 className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="font-semibold text-lg">Saha Sahibi Olarak Devam Et</div>
            <div className="text-sm opacity-90">Sahalarınızı yönetin, rezervasyonları takip edin</div>
          </div>
        </div>
      </Button>

      {isLoading && (
        <div className="text-center mt-4">
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Yönlendiriliyor...</span>
          </div>
        </div>
      )}
    </div>
  )
}
