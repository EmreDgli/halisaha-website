"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, ArrowLeft, Users, MapPin, Clock, Trophy, Info, Home } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createTeam } from "@/lib/api/teams"
import { getCurrentUser } from "@/lib/api/auth"

export default function CreateTeamPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    city: "",
    district: "",
    preferredTime: "",
    skillLevel: "",
    maxMembers: "11",
    lookingForPlayers: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await getCurrentUser()
      if (!data) {
        router.push("/auth/login")
        return
      }
      setIsAuthenticated(true)
    }
    checkAuth()
  }, [router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Takım adı zorunludur"
    if (formData.name.length < 3) newErrors.name = "Takım adı en az 3 karakter olmalıdır"
    if (!formData.city) newErrors.city = "Şehir seçimi zorunludur"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const { data, error } = await createTeam({
        name: formData.name,
        description: formData.description,
        city: formData.city,
        district: formData.district,
        skill_level: formData.skillLevel,
        max_players: Number.parseInt(formData.maxMembers),
      })

      if (error) {
        console.error("Team creation error:", error)
        setErrors({ general: "Takım oluşturulurken bir hata oluştu. Lütfen tekrar deneyin." })
        return
      }

      if (data) {
        console.log("Team created successfully:", data)
        router.push("/dashboard/player")
      }
    } catch (error) {
      console.error("Team creation error:", error)
      setErrors({ general: "Bir hata oluştu. Lütfen tekrar deneyin." })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <header className="bg-white shadow-sm border-b border-green-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/player" className="flex items-center text-green-600 hover:text-green-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Panele Dön
            </Link>
            <Link href="/" className="flex items-center text-green-600 hover:text-green-700">
              <Home className="w-4 h-4 mr-2" />
              Anasayfa
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-green-200">
              <CardHeader>
                <CardTitle className="text-2xl text-green-800 flex items-center">
                  <Users className="w-6 h-6 mr-2" />
                  Yeni Takım Oluştur
                </CardTitle>
                <CardDescription>Takımınızı oluşturun ve oyuncu arkadaşlarınızı davet edin</CardDescription>
              </CardHeader>
              <CardContent>
                {errors.general && (
                  <Alert className="mb-6 border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{errors.general}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Team Logo Upload */}
                  <div className="space-y-2">
                    <Label className="flex items-center text-green-800">
                      <Upload className="w-4 h-4 mr-2" />
                      Takım Logosu
                    </Label>
                    <div className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto text-green-400 mb-4" />
                      <p className="text-green-700 font-medium">Logo yüklemek için tıklayın</p>
                      <p className="text-sm text-green-600 mt-2">PNG, JPG formatında, maksimum 2MB</p>
                    </div>
                  </div>

                  {/* Team Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center text-green-800">
                      <Trophy className="w-4 h-4 mr-2" />
                      Takım Adı *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Örn: Kartal Gençlik Spor, Yıldızlar FC, Şampiyonlar SK"
                      className={`border-green-200 focus:border-green-500 focus:ring-green-500 ${errors.name ? "border-red-500" : ""}`}
                      required
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-green-800">
                      Takım Açıklaması
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Takımınız hakkında kısa bir açıklama yazın. Örn: 2015'ten beri birlikte oynayan arkadaş grubu, her hafta düzenli maçlar yapıyoruz..."
                      rows={4}
                      className="border-green-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="flex items-center text-green-800">
                        <MapPin className="w-4 h-4 mr-2" />
                        Şehir *
                      </Label>
                      <Select
                        value={formData.city}
                        onValueChange={(value) => setFormData({ ...formData, city: value })}
                      >
                        <SelectTrigger
                          className={`border-green-200 focus:border-green-500 focus:ring-green-500 ${errors.city ? "border-red-500" : ""}`}
                        >
                          <SelectValue placeholder="Şehir seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="istanbul">İstanbul</SelectItem>
                          <SelectItem value="ankara">Ankara</SelectItem>
                          <SelectItem value="izmir">İzmir</SelectItem>
                          <SelectItem value="bursa">Bursa</SelectItem>
                          <SelectItem value="antalya">Antalya</SelectItem>
                          <SelectItem value="adana">Adana</SelectItem>
                          <SelectItem value="konya">Konya</SelectItem>
                          <SelectItem value="gaziantep">Gaziantep</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district" className="text-green-800">
                        İlçe
                      </Label>
                      <Input
                        id="district"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        placeholder="Örn: Kadıköy, Beşiktaş, Üsküdar"
                        className="border-green-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center text-green-800">
                        <Clock className="w-4 h-4 mr-2" />
                        Tercih Edilen Oyun Saati
                      </Label>
                      <Select
                        value={formData.preferredTime}
                        onValueChange={(value) => setFormData({ ...formData, preferredTime: value })}
                      >
                        <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                          <SelectValue placeholder="Saat dilimi seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Sabah (08:00-12:00)</SelectItem>
                          <SelectItem value="afternoon">Öğleden Sonra (12:00-17:00)</SelectItem>
                          <SelectItem value="evening">Akşam (17:00-22:00)</SelectItem>
                          <SelectItem value="night">Gece (22:00-24:00)</SelectItem>
                          <SelectItem value="weekend">Sadece Hafta Sonu</SelectItem>
                          <SelectItem value="flexible">Esnek</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-green-800">Takım Seviyesi</Label>
                      <Select
                        value={formData.skillLevel}
                        onValueChange={(value) => setFormData({ ...formData, skillLevel: value })}
                      >
                        <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                          <SelectValue placeholder="Oyun seviyesi seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Başlangıç - Yeni başlayanlar</SelectItem>
                          <SelectItem value="intermediate">Orta - Düzenli oynayan</SelectItem>
                          <SelectItem value="advanced">İleri - Deneyimli oyuncular</SelectItem>
                          <SelectItem value="professional">Profesyonel - Yarı profesyonel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Max Members */}
                  <div className="space-y-2">
                    <Label htmlFor="maxMembers" className="text-green-800">
                      Maksimum Üye Sayısı
                    </Label>
                    <Select
                      value={formData.maxMembers}
                      onValueChange={(value) => setFormData({ ...formData, maxMembers: value })}
                    >
                      <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 Kişi (Halı Saha - Küçük Takım)</SelectItem>
                        <SelectItem value="11">11 Kişi (Futbol - Standart)</SelectItem>
                        <SelectItem value="15">15 Kişi (Geniş Kadro)</SelectItem>
                        <SelectItem value="20">20 Kişi (Büyük Takım)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-green-600">Yedek oyuncular dahil toplam üye sayısı</p>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
                      onClick={() => router.back()}
                    >
                      İptal
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Oluşturuluyor...
                        </div>
                      ) : (
                        "Takımı Oluştur"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <Card className="shadow-lg border-green-200">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">Takım Oluşturma İpuçları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-sm font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-green-800">Açıklayıcı İsim Seçin</p>
                      <p className="text-xs text-green-600">
                        Takım adınız diğer oyuncuların sizi bulmasını kolaylaştırır
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-sm font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-green-800">Logo Yükleyin</p>
                      <p className="text-xs text-green-600">Takım logosu profesyonel görünüm sağlar</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-sm font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-green-800">Seviye Belirtin</p>
                      <p className="text-xs text-green-600">Doğru seviye seçimi uygun rakipler bulmanızı sağlar</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert className="border-green-200 bg-green-50">
              <Info className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                <strong>Bilgi:</strong> Takım oluşturduktan sonra arkadaşlarınızı davet edebilir, maç organize edebilir
                ve takım sohbet odasını kullanabilirsiniz.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  )
}
