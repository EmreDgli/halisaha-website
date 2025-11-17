"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Building2, Loader2, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthContext } from "@/components/AuthProvider"

interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  companyName?: string
  roles: ("player" | "field_owner")[]
  createdAt: string
  full_name?: string
}

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const router = useRouter()
  const { user: authUser, loading: authLoading, isAuthenticated } = useAuthContext()

  useEffect(() => {
    if (authLoading) return;
    
    // Kullanıcı giriş yapmamışsa login'e yönlendir
    if (!isAuthenticated || !authUser) {
      console.log("Kullanıcı giriş yapmamış, login'e yönlendiriliyor");
      router.push("/auth/login");
      return;
    }

    // Kullanıcının tek rolü varsa direkt dashboard'a yönlendir
    if (authUser.profile?.roles?.length === 1) {
      const role = authUser.profile.roles[0];
      console.log("Kullanıcının tek rolü var, dashboard'a yönlendiriliyor:", role);
      if (role === "player") {
        router.push("/dashboard/player");
      } else if (role === "field_owner" || role === "owner") {
        router.push("/dashboard/owner");
      }
      return;
    }

    // Kullanıcının birden fazla rolü varsa role-selection'da kal
    if (authUser.profile?.roles?.length > 1) {
      console.log("Kullanıcının birden fazla rolü var, role-selection'da kalıyor");
      setUser({
        id: authUser.user.id,
        firstName: authUser.profile.full_name?.split(" ")[0] || "Kullanıcı",
        lastName: authUser.profile.full_name?.split(" ")[1] || "",
        email: authUser.user.email || "",
        password: "",
        phone: authUser.profile.phone || "",
        roles: authUser.profile.roles || [],
        createdAt: authUser.user.created_at || "",
        full_name: authUser.profile.full_name || "",
      });
      return;
    }

    // Kullanıcının hiç rolü yoksa anasayfaya yönlendir
    console.log("Kullanıcının hiç rolü yok, anasayfaya yönlendiriliyor");
    router.push("/");
  }, [authUser, authLoading, isAuthenticated, router]);

  const handleRoleSelection = (role: string) => {
    console.log("Seçilen rol:", role)
    
    // Seçilen role göre yönlendir
    if (role === "player") {
      console.log("Player dashboard'a yönlendiriliyor")
      router.push("/dashboard/player")
    } else if (role === "field_owner" || role === "owner") {
      console.log("Owner dashboard'a yönlendiriliyor")
      router.push("/dashboard/owner")
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
  }

  // Kullanıcı adı ve soyadı için güvenli fallback
  const firstName = user?.firstName || (user?.full_name ? user.full_name.split(" ")[0] : "Kullanıcı");
  const lastName = user?.lastName || (user?.full_name ? user.full_name.split(" ")[1] || "" : "");

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Header with Home Link */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-green-600 hover:text-green-700 transition-colors">
            <ArrowRight className="w-5 h-5 rotate-180" />
          </Link>
          <div className="text-sm text-gray-500">HalıSaha Pro</div>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* User Avatar and Greeting */}
            <div className="text-center mb-8">
              <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-green-100">
                <AvatarImage src="/placeholder.svg" alt={`${firstName} ${lastName}`} />
                <AvatarFallback className="bg-gradient-to-r from-green-600 to-green-700 text-white text-xl font-semibold">
                  {`${firstName[0] || "K"}${lastName[0] || ""}`.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <h1 className="text-2xl font-bold text-gray-800 mb-2">Hoş geldiniz, {firstName}!</h1>

              <p className="text-gray-600 text-sm leading-relaxed">
                Birden fazla rolünüz bulunuyor. Nasıl devam etmek istediğinizi seçin:
              </p>
            </div>

            {/* Role Selection Buttons */}
            <div className="space-y-4">
              {user.roles.includes("player") && (
                <Button
                  onClick={() => handleRoleSelection("player")}
                  disabled={isLoading}
                  className={`
                    w-full h-16 text-left justify-start relative overflow-hidden
                    bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                    text-white shadow-lg hover:shadow-xl transition-all duration-300
                    transform hover:scale-[1.02] active:scale-[0.98]
                    ${selectedRole === "player" ? "ring-4 ring-blue-200" : ""}
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
              )}

              {user.roles.includes("field_owner") && (
                <Button
                  onClick={() => handleRoleSelection("field_owner")}
                  disabled={isLoading}
                  className={`
                    w-full h-16 text-left justify-start relative overflow-hidden
                    bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800
                    text-white shadow-lg hover:shadow-xl transition-all duration-300
                    transform hover:scale-[1.02] active:scale-[0.98]
                    ${selectedRole === "field_owner" ? "ring-4 ring-green-200" : ""}
                  `}
                >
                  <div className="flex items-center space-x-4 relative z-10">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      {isLoading && selectedRole === "field_owner" ? (
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
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center space-x-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Yönlendiriliyor...</span>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Bu seçimi daha sonra profilinizden değiştirebilirsiniz
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
            <div className="text-lg font-bold text-blue-600">Oyuncu</div>
            <div className="text-xs text-gray-600">Takım yönetimi & Maç organizasyonu</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
            <div className="text-lg font-bold text-green-600">Saha Sahibi</div>
            <div className="text-xs text-gray-600">Saha yönetimi & Video paylaşımı</div>
          </div>
        </div>
      </div>
    </div>
  )
}
