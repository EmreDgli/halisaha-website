"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, User, Mail, Lock, Phone, ArrowLeft, Home, Hash } from "lucide-react"
import { registerUser } from "@/lib/api/auth"
import { useAuthContext } from "@/components/AuthProvider"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    termsAccepted: false,
    roles: [] as ("player" | "field_owner")[],
    // Profil bilgileri
    profileData: {
      position: "",
      skill_level: "",
      preferred_city: "",
      availability: "",
      experience_years: 0,
      preferred_time: "",
      bio: ""
    }
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [roleOption, setRoleOption] = useState<"player" | "field_owner" | "both" | "">("")
  const { user, loading: authLoading, isAuthenticated, setUser } = useAuthContext()
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Authentication kontrolü
  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated && user) {
      console.log("Kullanıcı zaten giriş yapmış, dashboard'a yönlendiriliyor");
      // Kullanıcı zaten giriş yapmışsa uygun dashboard'a yönlendir
      if (user.profile?.roles?.length > 1) {
        router.push("/role-selection");
      } else if (user.profile?.roles?.length === 1) {
        const role = user.profile.roles[0];
        if (role === "player") {
          router.push("/dashboard/player");
        } else if (role === "field_owner" || role === "owner") {
          router.push("/dashboard/owner");
        }
      }
      return;
    }
    // Kullanıcı giriş yapmamışsa register sayfasında kalabilir
  }, [user, authLoading, isAuthenticated, router]);

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

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = "Kullanım koşullarını kabul etmelisiniz"
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

  const handleProfileDataChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      profileData: {
        ...prev.profileData,
        [field]: value
      }
    }))
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
      console.log("📝 Register API çağrısı yapılıyor...")
      const { data, error } = await registerUser(formData)
      console.log("📝 Register API sonucu:", { data, error })

      if (error) {
        console.log("❌ Register hatası:", error)
        
        // Kullanıcı dostu hata mesajları
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? (error as any).message 
          : String(error);
          
        if (errorMessage.includes("User already registered") || 
            errorMessage.includes("already registered") ||
            errorMessage.includes("already exists") ||
            errorMessage.includes("duplicate key")) {
          setErrors({ general: "Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin." })
        } else if (errorMessage.includes("password") || errorMessage.includes("Password")) {
          setErrors({ password: "Şifre en az 6 karakter olmalıdır." })
        } else if (errorMessage.includes("email") || errorMessage.includes("Email")) {
          setErrors({ email: "Geçerli bir e-posta adresi giriniz." })
        } else if (errorMessage.includes("Invalid email")) {
          setErrors({ email: "Geçersiz e-posta formatı." })
        } else if (errorMessage.includes("weak_password")) {
          setErrors({ password: "Şifre çok zayıf. Daha güçlü bir şifre seçin." })
        } else {
          setErrors({ general: `Kayıt işlemi başarısız: ${errorMessage}` })
        }
        return
      }

      if (data) {
        console.log("Registration successful", data)
        // Kullanıcı bilgilerini göster
        if (data.profile) {
          setCurrentUser(data.profile)
          
          // Authentication state'ini manuel olarak güncelle
          if (data.user && data.profile) {
            setUser({ user: data.user, profile: data.profile });
            console.log("Authentication state güncellendi");
          }
          
          // Kayıt başarılı olduğunda yönlendirme yap
          const roles = data.profile.roles;
          if (roles.length > 1) {
            console.log("Kullanıcının birden fazla rolü var, role-selection'a yönlendiriliyor");
            router.push("/role-selection");
          } else if (roles.length === 1) {
            const role = roles[0];
            console.log("Kullanıcının tek rolü var, dashboard'a yönlendiriliyor:", role);
            if (role === "player") {
              router.push("/dashboard/player");
            } else if (role === "field_owner" || role === "owner") {
              router.push("/dashboard/owner");
            }
          } else {
            // Varsayılan olarak player dashboard'a yönlendir
            console.log("Varsayılan olarak player dashboard'a yönlendiriliyor");
            router.push("/dashboard/player");
          }
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
                <AlertDescription className="text-red-700">
                  {errors.general}
                  {errors.general.includes("zaten kayıtlı") && (
                    <div className="mt-2">
                      <Link href="/auth/login">
                        <Button variant="outline" size="sm" className="text-red-700 border-red-300 hover:bg-red-50">
                          Giriş Yap
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
                  Hesabınız başarıyla oluşturuldu! Yönlendiriliyor...
                </div>
              </div>
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

              {/* Profil Bilgileri - Sadece Oyuncu Rolü Seçildiğinde */}
              {(roleOption === "player" || roleOption === "both") && (
                <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800">Futbol Profili</h3>
                  
                  {/* Mevki ve Seviye */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="position" className="text-green-800">Mevki</Label>
                      <select
                        id="position"
                        value={formData.profileData.position}
                        onChange={(e) => handleProfileDataChange("position", e.target.value)}
                        className="w-full p-2 border border-green-200 rounded-md focus:border-green-500 focus:ring-green-500"
                      >
                        <option value="">Mevki seçin</option>
                        <option value="Kaleci">Kaleci</option>
                        <option value="Defans">Defans</option>
                        <option value="Orta Saha">Orta Saha</option>
                        <option value="Forvet">Forvet</option>
                        <option value="Joker">Joker</option>
                        <option value="Kaleci Hariç Her Yer">Kaleci Hariç Her Yer</option>
                        <option value="Her Yer">Her Yer</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="skill_level" className="text-green-800">Seviye</Label>
                      <select
                        id="skill_level"
                        value={formData.profileData.skill_level}
                        onChange={(e) => handleProfileDataChange("skill_level", e.target.value)}
                        className="w-full p-2 border border-green-200 rounded-md focus:border-green-500 focus:ring-green-500"
                      >
                        <option value="">Seviye seçin</option>
                        <option value="Başlangıç">Başlangıç</option>
                        <option value="Orta">Orta</option>
                        <option value="İleri">İleri</option>
                        <option value="Profesyonel">Profesyonel</option>
                      </select>
                    </div>
                  </div>

                  {/* Şehir ve Müsaitlik */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preferred_city" className="text-green-800">Tercih Ettiğin Şehir</Label>
                      <Input
                        id="preferred_city"
                        value={formData.profileData.preferred_city}
                        onChange={(e) => handleProfileDataChange("preferred_city", e.target.value)}
                        placeholder="Örn: İstanbul, Ankara"
                        className="border-green-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="availability" className="text-green-800">Müsaitlik</Label>
                      <select
                        id="availability"
                        value={formData.profileData.availability}
                        onChange={(e) => handleProfileDataChange("availability", e.target.value)}
                        className="w-full p-2 border border-green-200 rounded-md focus:border-green-500 focus:ring-green-500"
                      >
                        <option value="">Müsaitlik seçin</option>
                        <option value="Hafta içi">Hafta içi</option>
                        <option value="Hafta sonu">Hafta sonu</option>
                        <option value="Her zaman">Her zaman</option>
                      </select>
                    </div>
                  </div>

                  {/* Deneyim ve Tercih Edilen Saat */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience_years" className="text-green-800">Deneyim (Yıl)</Label>
                      <Input
                        id="experience_years"
                        type="number"
                        min="0"
                        max="50"
                        value={formData.profileData.experience_years}
                        onChange={(e) => handleProfileDataChange("experience_years", parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="border-green-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="preferred_time" className="text-green-800">Tercih Ettiğin Saat</Label>
                      <select
                        id="preferred_time"
                        value={formData.profileData.preferred_time}
                        onChange={(e) => handleProfileDataChange("preferred_time", e.target.value)}
                        className="w-full p-2 border border-green-200 rounded-md focus:border-green-500 focus:ring-green-500"
                      >
                        <option value="">Saat seçin</option>
                        <option value="Sabah">Sabah</option>
                        <option value="Öğlen">Öğlen</option>
                        <option value="Akşam">Akşam</option>
                      </select>
                    </div>
                  </div>

                  {/* Hakkımda */}
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-green-800">Hakkımda (Opsiyonel)</Label>
                    <textarea
                      id="bio"
                      value={formData.profileData.bio}
                      onChange={(e) => handleProfileDataChange("bio", e.target.value)}
                      placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
                      rows={3}
                      className="w-full p-2 border border-green-200 rounded-md focus:border-green-500 focus:ring-green-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Terms */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: checked as boolean })}
                />
                <Label htmlFor="acceptTerms" className="text-sm text-green-700">
                  Kullanım koşullarını ve gizlilik politikasını kabul ediyorum
                </Label>
              </div>
              {errors.termsAccepted && <p className="text-sm text-red-500">{errors.termsAccepted}</p>}

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
