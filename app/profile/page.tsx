"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, User, MapPin, Clock, Target, Star, Calendar, Trophy, CalendarDays } from "lucide-react"
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

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    
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
        return
      }
      
      console.log('🔍 Loading profile data for user:', userId)
      
      // Profil bilgilerini getir - her zaman güncel veri
      console.log('🔍 Fetching latest profile from profiles table...')
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
          setProfileData(null)
        } else {
          console.error('❌ Profile fetch error:', profileError)
          throw profileError
        }
      } else if (profileResult) {
        console.log('✅ Latest profile data loaded:', profileResult)
        // Her zaman güncel verileri kullan
        setProfileData({
          position: profileResult.position || '',
          skill_level: profileResult.skill_level || '',
          preferred_city: profileResult.preferred_city || '',
          availability: profileResult.availability || '',
          experience_years: profileResult.experience_years || 0,
          preferred_time: profileResult.preferred_time || '',
          bio: profileResult.bio || ''
        })
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

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'Başlangıç': return 'bg-green-100 text-green-800 border-green-200'
      case 'Orta': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'İleri': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Profesyonel': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'Kaleci': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Defans': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Orta Saha': return 'bg-green-100 text-green-800 border-green-200'
      case 'Forvet': return 'bg-red-100 text-red-800 border-red-200'
      case 'Joker': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Kaleci Hariç Her Yer': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'Her Yer': return 'bg-pink-100 text-pink-800 border-pink-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Profilim</h1>
            <p className="text-gray-600 text-lg">Futbol profilini ve kişisel bilgilerini görüntüle</p>
          </div>
          <Button
            onClick={() => router.push('/profile/edit')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Edit className="h-4 w-4 mr-2" />
            Profili Düzenle
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
              {profileData ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">Mevki</p>
                      <Badge className={`mt-2 ${getPositionColor(profileData.position)}`}>
                        {profileData.position || 'Belirtilmemiş'}
                      </Badge>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">Seviye</p>
                      <Badge className={`mt-2 ${getSkillLevelColor(profileData.skill_level)}`}>
                        {profileData.skill_level || 'Belirtilmemiş'}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <MapPin className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Tercih Ettiğin Şehir</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {profileData.preferred_city || 'Belirtilmemiş'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">Müsaitlik</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {profileData.availability || 'Belirtilmemiş'}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">Tercih Ettiğin Saat (Opsiyonel)</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {profileData.preferred_time === 'none' ? 'Belirtilmemiş' : (profileData.preferred_time || 'Belirtilmemiş')}
                      </p>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Trophy className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Deneyim</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {profileData.experience_years} yıl
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Profil Bilgisi Bulunamadı</h3>
                  <p className="text-gray-500 mb-4">Henüz profil bilgilerini doldurmamışsın.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sağ Taraf - Hakkımda */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" />
                Hakkımda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {profileData?.bio ? (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 leading-relaxed">{profileData.bio}</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Hakkında Bilgisi Yok</h3>
                  <p className="text-gray-500 mb-4">Kendin hakkında bilgi eklememişsin.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alt Bilgi Kartı */}
        {profileData && (
          <Card className="mt-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Profil Özeti</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                    <Target className="h-8 w-8 text-green-600 mb-2" />
                    <p className="text-sm font-medium text-gray-700">Mevki</p>
                    <p className="text-lg font-bold text-green-800">{profileData.position}</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                    <Star className="h-8 w-8 text-blue-600 mb-2" />
                    <p className="text-sm font-medium text-gray-700">Seviye</p>
                    <p className="text-lg font-bold text-blue-800">{profileData.skill_level}</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-red-50 rounded-lg">
                    <MapPin className="h-8 w-8 text-red-600 mb-2" />
                    <p className="text-sm font-medium text-gray-700">Şehir</p>
                    <p className="text-lg font-bold text-red-800">{profileData.preferred_city}</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
                    <Trophy className="h-8 w-8 text-purple-600 mb-2" />
                    <p className="text-sm font-medium text-gray-700">Deneyim</p>
                    <p className="text-lg font-bold text-purple-800">{profileData.experience_years} yıl</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profil Tamamlama Uyarısı */}
        {!profileData && (
          <Card className="mt-8 shadow-lg border-0 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="text-center">
                <CalendarDays className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-yellow-800 mb-2">Profilini Tamamla</h3>
                <p className="text-yellow-700 mb-4">
                  Profil bilgilerini doldurarak daha iyi maçlar bulabilir ve takımlara katılabilirsin!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
