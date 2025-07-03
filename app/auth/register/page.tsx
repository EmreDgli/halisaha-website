"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, User, Mail, Lock, Phone, ArrowLeft, Home } from "lucide-react"
import { registerUser } from "@/lib/api/auth"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    roles: [] as ("player" | "field_owner" | "team_manager")[],
    acceptTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [roleOption, setRoleOption] = useState<"player" | "field_owner" | "both" | "">("")

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "Ad gereklidir"
    if (!formData.lastName.trim()) newErrors.lastName = "Soyad gereklidir"

    if (!formData.email) {
      newErrors.email = "E-posta adresi gereklidir"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Geçerli bir e-posta adresi girin"
    }

    if (!formData.password) {
      newErrors.password = "Şifre gereklidir"
    } else if (formData.password.length < 6) {
      newErrors.password = "Şifre en az 6 karakter olmalıdır"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Şifreler eşleşmiyor"
    }

    if (formData.roles.length === 0) {
      newErrors.roles = "En az bir rol seçmelisiniz"
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Kullanım koşullarını kabul etmelisiniz"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRoleChange = (value: "player" | "field_owner" | "both") => {
    setRoleOption(value)
    if (value === "player") setFormData({ ...formData, roles: ["player"] })
    else if (value === "field_owner") setFormData({ ...formData, roles: ["field_owner"] })
    else if (value === "both") setFormData({ ...formData, roles: ["player", "field_owner"] })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      console.log("Form validation failed", errors, formData);
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const { data, error } = await registerUser({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        roles: formData.roles,
      })

      if (error) {
        console.log("Registration error from registerUser:", error)
        if (typeof error === "object" && error !== null && "message" in error && typeof (error as any).message === "string" && (error as any).message.includes("already registered")) {
          setErrors({ email: "Bu e-posta adresi zaten kayıtlı" })
        } else {
          setErrors({ general: "Kayıt başarısız. Lütfen tekrar deneyin." })
        }
        return
      }

      if (data) {
        console.log("Registration successful, redirecting", data)
        // Registration successful - redirect based on roles
        if (formData.roles.length === 1) {
          if (formData.roles.includes("player")) {
            router.push("/dashboard/player")
          } else if (formData.roles.includes("field_owner")) {
            router.push("/dashboard/owner")
          } else if (formData.roles.includes("team_manager")) {
            router.push("/dashboard/manager")
          }
        } else {
          router.push("/role-selection")
        }
      }
    } catch (error) {
      console.error("Registration error (catch block):", error)
      setErrors({ general: "Bir hata oluştu. Lütfen tekrar deneyin." })
    } finally {
      setIsLoading(false)
    }
  }

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
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-800 hover:bg-green-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Giriş Yap
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
            Halı Saha Platformu
          </h1>
          <p className="text-green-600 mt-2">Yeni hesap oluşturun</p>
        </div>

        <Card className="shadow-lg border-green-200">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-green-800">Kayıt Ol</CardTitle>
            <CardDescription className="text-center">Platforma katılmak için bilgilerinizi girin</CardDescription>
          </CardHeader>
          <CardContent>
            {errors.general && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{errors.general}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="flex items-center text-green-800">
                    <User className="w-4 h-4 mr-2" />
                    Ad
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Adınız"
                    className={`border-green-200 focus:border-green-500 focus:ring-green-500 ${
                      errors.firstName ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-green-800">
                    Soyad
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Soyadınız"
                    className={`border-green-200 focus:border-green-500 focus:ring-green-500 ${
                      errors.lastName ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email */}
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

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center text-green-800">
                  <Phone className="w-4 h-4 mr-2" />
                  Telefon (Opsiyonel)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0555 123 45 67"
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              {/* Password Fields */}
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
                    placeholder="En az 6 karakter"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-green-800">
                  Şifre Tekrar
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Şifrenizi tekrar girin"
                    className={`border-green-200 focus:border-green-500 focus:ring-green-500 pr-10 ${
                      errors.confirmPassword ? "border-red-500" : ""
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 hover:text-green-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>

              {/* Rol Seçimi */}
              <div className="space-y-3">
                <Label className="text-green-800">Rolünüzü seçin:</Label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="role"
                      value="player"
                      checked={roleOption === "player"}
                      onChange={() => handleRoleChange("player")}
                    />
                    <span className="text-green-700">Oyuncu - Takımlara katıl, maçlara katıl</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="role"
                      value="field_owner"
                      checked={roleOption === "field_owner"}
                      onChange={() => handleRoleChange("field_owner")}
                    />
                    <span className="text-green-700">Saha Sahibi - Sahalarını kirala</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="role"
                      value="both"
                      checked={roleOption === "both"}
                      onChange={() => handleRoleChange("both")}
                    />
                    <span className="text-green-700">Hem Oyuncu Hem Saha Sahibi</span>
                  </label>
                </div>
                {errors.roles && <p className="text-sm text-red-500">{errors.roles}</p>}
              </div>

              {/* Terms */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked as boolean })}
                />
                <Label htmlFor="acceptTerms" className="text-sm text-green-700">
                  Kullanım koşullarını ve gizlilik politikasını kabul ediyorum
                </Label>
              </div>
              {errors.acceptTerms && <p className="text-sm text-red-500">{errors.acceptTerms}</p>}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Kayıt oluşturuluyor...
                  </div>
                ) : (
                  "Kayıt Ol"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-green-600">
                Zaten hesabınız var mı?{" "}
                <Link href="/auth/login" className="text-green-700 hover:text-green-800 font-medium">
                  Giriş yapın
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
