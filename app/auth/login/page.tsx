"use client"

import type React from "react"
import { use } from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Home, Calendar, Hash } from "lucide-react"
import { loginUser, testLogin } from "@/lib/api/auth"
import { useAuthContext } from "@/components/AuthProvider"
import Cookies from "js-cookie"
import { getUserTeams } from "@/lib/api/teams"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, setUser } = useAuthContext()
  const [userTeams, setUserTeams] = useState<{ id: string; name: string }[]>([])
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = "E-posta adresi gereklidir"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Geçerli bir e-posta adresi girin"
    }

    if (!formData.password) {
      newErrors.password = "Şifre gereklidir"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("🔐 Login form submit başladı")

    if (!validateForm()) {
      console.log("❌ Form validation başarısız")
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      console.log("📡 Login API çağrısı yapılıyor...")
      
      // Önce test login ile detaylı bilgi al
      console.log("🧪 Test login çalıştırılıyor...")
      const testResult = await testLogin(formData.email, formData.password)
      console.log("🧪 Test login sonucu:", testResult)
      
      const { data, error } : any = await loginUser(formData)
      console.log("📡 Login API sonucu:", { data, error })

      if (error) {
        console.log("❌ Login hatası:", error)
        
        // Kullanıcı dostu hata mesajları
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? (error as any).message 
          : String(error);
          
        if (errorMessage.includes("E-posta adresi veya şifre hatalı") || 
            errorMessage.includes("Invalid login credentials") ||
            errorMessage.includes("invalid credentials")) {
          
          // Test sonucuna göre daha detaylı mesaj
          if (testResult && !testResult.userExists) {
            setErrors({ general: "Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı. Kayıt olmayı deneyin." })
          } else {
            setErrors({ general: "E-posta adresi veya şifre hatalı. Lütfen kontrol edin." })
          }
        } else if (errorMessage.includes("Email not confirmed")) {
          setErrors({ general: "E-posta adresinizi onaylamanız gerekiyor. Lütfen e-postanızı kontrol edin." })
        } else if (errorMessage.includes("Too many requests")) {
          setErrors({ general: "Çok fazla deneme yapıldı. Lütfen bir süre bekleyin." })
        } else if (errorMessage.includes("User not found")) {
          setErrors({ general: "Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı." })
        } else if (errorMessage.includes("Invalid email")) {
          setErrors({ email: "Geçersiz e-posta formatı." })
        } else {
          setErrors({ general: `Giriş başarısız: ${errorMessage}` })
        }
        return
      }

      console.log("✅ Login başarılı, data:", data)

      if (data?.profile) {
        // Login sonrası profile ve roller logu
        console.log("👤 Login sonrası profile:", data.profile);
        console.log("🎭 Login sonrası roller:", data.profile.roles);
        // Profile'ı localStorage'a kaydet
        localStorage.setItem("currentUser", JSON.stringify(data.profile));
        setCurrentUser(data.profile);
        
        // Authentication state'ini manuel olarak güncelle
        if (data.user && data.profile) {
          console.log("🔄 Authentication state güncelleniyor...")
          setUser({ user: data.user, profile: data.profile });
          console.log("✅ Authentication state güncellendi");
        }
        
        // Giriş başarılı olduğunda yönlendirme yap
        const roles = data.profile.roles;
        console.log("🎯 Yönlendirme kararı veriliyor, roller:", roles);
        if (roles.length > 1) {
          console.log("🔄 Kullanıcının birden fazla rolü var, role-selection'a yönlendiriliyor");
          router.push("/role-selection");
        } else if (roles.length === 1) {
          const role = roles[0];
          console.log("🔄 Kullanıcının tek rolü var, dashboard'a yönlendiriliyor:", role);
          if (role === "player") {
            console.log("🏃‍♂️ Player dashboard'a yönlendiriliyor");
            router.push("/dashboard/player");
          } else if (role === "field_owner" || role === "owner") {
            console.log("🏟️ Owner dashboard'a yönlendiriliyor");
            router.push("/dashboard/owner");
          }
        } else {
          // Varsayılan olarak player dashboard'a yönlendir
          console.log("🏃‍♂️ Varsayılan olarak player dashboard'a yönlendiriliyor");
          router.push("/dashboard/player");
        }
      }

      if (data?.user && data?.user?.access_token) {
        console.log("🍪 Auth token cookie'ye kaydediliyor");
        Cookies.set("auth-token", data.user.access_token, { path: "/" })
      }

      // Load user teams
      try {
        console.log("👥 Kullanıcı takımları yükleniyor...")
        const { data: teamsData, error: teamsError } = await getUserTeams()
        if (teamsError) {
          console.error("❌ Error loading teams:", teamsError)
        } else if (teamsData) {
          console.log("✅ Takımlar yüklendi:", teamsData)
          setUserTeams(
            teamsData.map((team: any) => ({
              id: String(team.team_id || Date.now()),
              name: team.team_name,
              // city: team.city, // eğer city varsa ekle
            }))
          )
        }
      } catch (error) {
        console.error("❌ Error loading teams:", error)
      } finally {
        setLoadingTeams(false)
      }
    } catch (error) {
      console.error("❌ Login error:", error)
      setErrors({ general: "Bir hata oluştu. Lütfen tekrar deneyin." })
    } finally {
      setIsLoading(false)
      console.log("🏁 Form submit bitti")
    }
  }

  // useEffect'i kaldırıyoruz çünkü sonsuz döngüye neden oluyor
  // Giriş yapıldıktan sonra handleSubmit içinde yönlendirme yapılıyor

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center space-x-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-800 hover:bg-green-50">
                <Home className="h-4 w-4 mr-2" />
                Anasayfa
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-800 hover:bg-green-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kayıt Ol
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
            Halı Saha Platformu
          </h1>
          <p className="text-green-600 mt-2">Hesabınıza giriş yapın</p>
        </div>

        <Card className="shadow-lg border-green-200">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-green-800">Giriş Yap</CardTitle>
            <CardDescription className="text-center">E-posta adresiniz ve şifrenizle giriş yapın</CardDescription>
          </CardHeader>
          <CardContent>
            {errors.general && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {errors.general}
                  {errors.general.includes("şifre hatalı") && (
                    <div className="mt-2">
                      <Link href="/auth/register">
                        <Button variant="outline" size="sm" className="text-red-700 border-red-300 hover:bg-red-50">
                          Şifremi Unuttum
                        </Button>
                      </Link>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Kullanıcı Bilgileri */}
            {currentUser && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-green-800">
                      Hoş geldiniz, {currentUser.full_name}!
                    </h3>
                    <p className="text-sm text-green-600">{currentUser.email}</p>
                  </div>
                  {currentUser.tag && (
                    <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 rounded-full">
                      <Hash className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">{currentUser.tag}</span>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs text-green-600">
                  Giriş başarılı! Yönlendiriliyor...
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center text-green-800">
                  <Mail className="w-4 h-4 mr-2" />
                  E-posta Adresi
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ornek@email.com"
                  className={`border-green-200 focus:border-green-500 focus:ring-green-500 ${
                    errors.email ? "border-red-500" : ""
                  }`}
                  required
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center text-green-800">
                  <Lock className="w-4 h-4 mr-2" />
                  Şifre
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Şifrenizi girin"
                    className={`border-green-200 focus:border-green-500 focus:ring-green-500 pr-10 ${
                      errors.password ? "border-red-500" : ""
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 hover:text-green-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Giriş yapılıyor...
                  </div>
                ) : (
                  "Giriş Yap"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-green-600">
                Hesabınız yok mu?{" "}
                <Link href="/auth/register" className="text-green-700 hover:text-green-800 font-medium">
                  Kayıt olun
                </Link>
              </p>
              <p className="text-sm text-green-600">
                Şifrenizi mi unuttunuz?{" "}
                <Link href="/auth/register" className="text-green-700 hover:text-green-800 font-medium">
                  Yeni hesap oluşturun
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
