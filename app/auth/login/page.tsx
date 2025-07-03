"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Home } from "lucide-react"
import { loginUser } from "@/lib/api/auth"
import { useAuthContext } from "@/components/AuthProvider"
import Cookies from "js-cookie"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter();
  const { user, loading: authLoading, error: authError, isAuthenticated } = useAuthContext()

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
    console.log("Form submit başladı")

    if (!validateForm()) {
      console.log("Form validation başarısız")
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const { data, error } : any = await loginUser(formData)
      console.log("loginUser sonucu", { data, error })

      if (error) {
        setErrors({ general: "Giriş başarısız. E-posta veya şifre hatalı." })
        return
      }

      console.log("Login data:", data)

      if (data?.profile) {
        // Login sonrası profile ve roller logu
        console.log("Login sonrası profile:", data.profile);
        console.log("Login sonrası roller:", data.profile.roles);
        // Profile'ı localStorage'a kaydet
        localStorage.setItem("currentUser", JSON.stringify(data.profile));
        const roles = data.profile.roles;
        // Eğer birden fazla rol varsa role-selection ekranına yönlendir
        if (roles.length > 1) {
          router.push("/role-selection");
          return;
        }
        // Tek rol varsa ilgili dashboard'a yönlendir
        if (roles.length === 1) {
          if (roles.includes("player")) {
            router.push("/dashboard/player");
          } else if (roles.includes("field_owner") || roles.includes("owner")) {
            router.push("/dashboard/owner");
          }
        }
      }

      if (data?.user && data?.user?.access_token) {
        Cookies.set("auth-token", data.user.access_token, { path: "/" })
      }
    } catch (error) {
      console.error("Login error:", error)
      setErrors({ general: "Bir hata oluştu. Lütfen tekrar deneyin." })
    } finally {
      setIsLoading(false)
      console.log("Form submit bitti")
    }
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    // Yönlendirme kaldırıldı, kullanıcı anasayfada kalabilir
  }, [user, authLoading, router]);

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
                <AlertDescription className="text-red-700">{errors.general}</AlertDescription>
              </Alert>
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

            <div className="mt-6 text-center">
              <p className="text-sm text-green-600">
                Hesabınız yok mu?{" "}
                <Link href="/auth/register" className="text-green-700 hover:text-green-800 font-medium">
                  Kayıt olun
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
