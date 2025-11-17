"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, User, MapPin, Clock, Target, Star, Calendar, Trophy, RefreshCw } from "lucide-react"
import { useAuthContext } from "@/components/AuthProvider"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface ProfileData {
  position: string
  skill_level: string
  preferred_city: string
  availability: string
  experience_years: number
  preferred_time: string
  bio?: string
}

export default function ProfileEditPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    position: '',
    skill_level: '',
    preferred_city: '',
    availability: '',
    experience_years: 0,
    preferred_time: '',
    bio: ''
  })

  useEffect(() => {
    if (!user) {
      console.error('❌ useEffect - No user found in context')
      router.push('/auth/login')
      return
    }
    
    console.log('✅ useEffect - User found:', user)
    console.log('✅ useEffect - User ID:', user.id)
    console.log('✅ useEffect - User profile:', user.profile)
    console.log('✅ useEffect - Nested user.id:', user.user?.id)
    console.log('✅ useEffect - Full user structure:', JSON.stringify(user, null, 2))
    
    // Her sayfa ziyaretinde güncel verileri yükle
    loadProfileData()
  }, [user, router])

  // Sayfa focus olduğunda da verileri yenile
  useEffect(() => {
    const handleFocus = () => {
      if (user && !isLoading) {
        console.log('🔄 Page focused, refreshing profile data...')
        loadProfileData()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user, isLoading])

  const loadProfileData = async () => {
    try {
      setIsLoading(true)
      
      if (!user) {
        console.error('❌ No user found in context')
        return
      }

      // Debug: User objesinin yapısını kontrol et
      console.log('🔍 User object structure:', user)
      console.log('🔍 User ID:', user.id)
      console.log('🔍 User user_id:', user.user_id)
      console.log('🔍 User profile:', user.profile)
      console.log('🔍 Nested user.id:', user.user?.id)

      // user_id'yi doğru şekilde al - nested yapı için
      const userId = user.user?.id || user.id || user.user_id
      
      if (!userId) {
        console.error('❌ No valid user ID found:', { user })
        toast({
          title: "❌ Hata",
          description: "Geçerli kullanıcı ID'si bulunamadı. Lütfen tekrar giriş yapın.",
          variant: "destructive",
          duration: 5000,
        })
        return
      }
      
      console.log('🔍 Loading profile data for user:', userId)
      
      // Profil bilgilerini getir
      console.log('🔍 Fetching profile from profiles table...')
      const { data: profileResult, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      console.log('📊 Profile query result:', { profileResult, profileError })

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // PGRST116 is "not found" error, which is expected for new users
          console.log('ℹ️ No profile found for user (this is normal for new users)')
          // Yeni kullanıcı için mevcut state'i koru, sıfırlama
          console.log('ℹ️ Keeping existing form data for new user')
        } else {
          console.error('❌ Profile fetch error:', profileError)
          throw profileError
        }
      } else if (profileResult) {
        console.log('✅ Profile data loaded:', profileResult)
        // Mevcut verileri güncelle, sıfırlama
        setProfileData(prev => ({
          ...prev, // Mevcut verileri koru
          position: profileResult.position || prev.position,
          skill_level: profileResult.skill_level || prev.skill_level,
          preferred_city: profileResult.preferred_city || prev.preferred_city,
          availability: profileResult.availability || prev.availability,
          experience_years: profileResult.experience_years || prev.experience_years,
          preferred_time: profileResult.preferred_time || prev.preferred_time,
          bio: profileResult.bio || prev.bio
        }))
      }

    } catch (error) {
      console.error('❌ Error loading profile:', error)
      toast({
        title: "Hata",
        description: "Profil bilgileri yüklenirken bir hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      if (!user) {
        console.error('❌ No user found in context')
        toast({
          title: "❌ Hata",
          description: "Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.",
          variant: "destructive",
          duration: 5000,
        })
        return
      }

      // Debug: User objesinin yapısını kontrol et
      console.log('🔍 User object structure:', user)
      console.log('🔍 User ID:', user.id)
      console.log('🔍 User user_id:', user.user_id)
      console.log('🔍 User profile:', user.profile)

      // user_id'yi doğru şekilde al
      const userId = user.id || user.user_id
      
      if (!userId) {
        console.error('❌ No valid user ID found:', { user })
        toast({
          title: "❌ Hata",
          description: "Geçerli kullanıcı ID'si bulunamadı. Lütfen tekrar giriş yapın.",
          variant: "destructive",
          duration: 5000,
        })
        return
      }

      console.log('💾 Saving profile data:', { user_id: userId, ...profileData })

      // Profil bilgilerini kaydet/güncelle
      const { data: upsertResult, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          ...profileData
        }, {
          onConflict: 'user_id'
        })
        .select()

      console.log('📝 Upsert result:', { upsertResult, profileError })

      if (profileError) {
        console.error('❌ Profile upsert error:', profileError)
        throw profileError
      }

      console.log('✅ Profile saved successfully:', upsertResult)

      // Başarılı kaydetme bildirimi
      toast({
        title: "🎉 Profil Kaydedildi!",
        description: "Futbol profil bilgileriniz başarıyla güncellendi. Artık daha iyi maçlar bulabilirsiniz!",
        duration: 4000, // 4 saniye göster
      })

      // 2 saniye sonra profil sayfasına yönlendir
      setTimeout(() => {
        router.push('/profile')
      }, 2000)

    } catch (error) {
      console.error('❌ Error saving profile:', error)
      toast({
        title: "❌ Kaydetme Hatası",
        description: "Profil bilgileri kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
        duration: 5000, // 5 saniye göster
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:bg-white hover:shadow-md transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Profil Düzenle</h1>
            <p className="text-gray-600 text-lg">Futbol profilini ve kişisel bilgilerini güncelle</p>
          </div>
          
          {/* Debug Butonu */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('🔍 Debug - User Context:', user)
              console.log('🔍 Debug - Profile Data:', profileData)
              console.log('🔍 Debug - Is Loading:', isLoading)
              console.log('🔍 Debug - Is Saving:', isSaving)
            }}
            className="ml-auto border-red-300 text-red-600 hover:bg-red-50"
          >
            Debug
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sol Taraf - Futbol Profili Ana Bilgiler */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6" />
                Futbol Profili
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-600" />
                    Mevki
                  </Label>
                  <Select
                    value={profileData.position}
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, position: value }))}
                  >
                    <SelectTrigger className="border-gray-200 hover:border-green-300 focus:border-green-500">
                      <SelectValue placeholder="Mevki seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kaleci">Kaleci</SelectItem>
                      <SelectItem value="Defans">Defans</SelectItem>
                      <SelectItem value="Orta Saha">Orta Saha</SelectItem>
                      <SelectItem value="Forvet">Forvet</SelectItem>
                      <SelectItem value="Joker">Joker</SelectItem>
                      <SelectItem value="Kaleci Hariç Her Yer">Kaleci Hariç Her Yer</SelectItem>
                      <SelectItem value="Her Yer">Her Yer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="skill_level" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Seviye
                  </Label>
                  <Select
                    value={profileData.skill_level}
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, skill_level: value }))}
                  >
                    <SelectTrigger className="border-gray-200 hover:border-green-300 focus:border-green-500">
                      <SelectValue placeholder="Seviye seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Başlangıç">Başlangıç</SelectItem>
                      <SelectItem value="Orta">Orta</SelectItem>
                      <SelectItem value="İleri">İleri</SelectItem>
                      <SelectItem value="Profesyonel">Profesyonel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="preferred_city" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  Tercih Ettiğin Şehir
                </Label>
                <Input
                  id="preferred_city"
                  value={profileData.preferred_city}
                  onChange={(e) => setProfileData(prev => ({ ...prev, preferred_city: e.target.value }))}
                  placeholder="Örn: İstanbul, Ankara, İzmir"
                  className="border-gray-200 hover:border-red-300 focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="availability" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Müsaitlik
                  </Label>
                  <Select
                    value={profileData.availability}
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, availability: value }))}
                  >
                    <SelectTrigger className="border-gray-200 hover:border-blue-300 focus:border-blue-500">
                      <SelectValue placeholder="Müsaitlik seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hafta içi">Hafta içi</SelectItem>
                      <SelectItem value="Hafta sonu">Hafta sonu</SelectItem>
                      <SelectItem value="Her zaman">Her zaman</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="preferred_time" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-500" />
                    Tercih Ettiğin Saat (Opsiyonel)
                  </Label>
                  <Select
                    value={profileData.preferred_time || 'none'}
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, preferred_time: value === 'none' ? '' : value }))}
                  >
                    <SelectTrigger className="border-gray-200 hover:border-purple-300 focus:border-purple-500">
                      <SelectValue placeholder="Saat seçin (opsiyonel)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Belirtilmemiş</SelectItem>
                      <SelectItem value="Sabah">Sabah</SelectItem>
                      <SelectItem value="Öğlen">Öğlen</SelectItem>
                      <SelectItem value="Akşam">Akşam</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Bu alan opsiyoneldir, boş bırakabilirsin.
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="experience_years" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-600" />
                  Deneyim (Yıl)
                </Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  max="50"
                  value={profileData.experience_years}
                  onChange={(e) => setProfileData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="border-gray-200 hover:border-amber-300 focus:border-amber-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sağ Taraf - Hakkımda ve Kaydet */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" />
                Hakkımda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div>
                <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                  Kendin Hakkında
                </Label>
                <Textarea
                  id="bio"
                  value={profileData.bio || ''}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Futbol deneyimin, oyun tarzın, hedeflerin hakkında kısa bir açıklama yaz..."
                  rows={8}
                  className="border-gray-200 hover:border-purple-300 focus:border-purple-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Bu bilgi diğer oyuncular ve takım yöneticileri tarafından görülebilir.
                </p>
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => {
                    console.log('🔍 Save button clicked!')
                    console.log('🔍 User:', user)
                    console.log('🔍 Profile Data:', profileData)
                    console.log('🔍 Is Saving:', isSaving)
                    
                    if (!user) {
                      console.error('❌ No user found!')
                      toast({
                        title: "❌ Hata",
                        description: "Kullanıcı bilgisi bulunamadı!",
                        variant: "destructive"
                      })
                      return
                    }
                    
                    if (isSaving) {
                      console.log('⏳ Already saving, ignoring click')
                      return
                    }
                    
                    console.log('✅ Calling handleSave...')
                    handleSave()
                  }}
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Kaydediliyor...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-5 w-4" />
                      <span>Profili Kaydet</span>
                    </div>
                  )}
                </Button>
                
                {/* Kaydetme durumu bilgisi */}
                {isSaving && (
                  <p className="text-sm text-green-600 text-center mt-2">
                    Profil bilgileriniz kaydediliyor, lütfen bekleyin...
                  </p>
                )}
              </div>

              <div className="text-center">
                <Button
                  onClick={loadProfileData}
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Yenile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alt Bilgi Kartı */}
        <Card className="mt-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Profil Bilgilerin Neden Önemli?</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div className="flex flex-col items-center">
                  <Target className="h-8 w-8 text-green-600 mb-2" />
                  <p><strong>Mevki:</strong> Takımlar seni doğru pozisyonda değerlendirir</p>
                </div>
                <div className="flex flex-col items-center">
                  <Star className="h-8 w-8 text-yellow-500 mb-2" />
                  <p><strong>Seviye:</strong> Uygun maçlar ve takımlar bulunur</p>
                </div>
                <div className="flex flex-col items-center">
                  <MapPin className="h-8 w-8 text-red-500 mb-2" />
                  <p><strong>Şehir:</strong> Yakındaki oyuncular ve sahalar bulunur</p>
                </div>
                <div className="flex flex-col items-center">
                  <Calendar className="h-8 w-8 text-blue-500 mb-2" />
                  <p><strong>Müsaitlik:</strong> Uygun zamanlarda maçlar organize edilir</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
