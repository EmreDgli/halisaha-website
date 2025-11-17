"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuthContext } from "@/components/AuthProvider"
import { getTeamDetails, deleteTeam, getTeamStats } from "@/lib/api/teams"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Users, Crown, User, Star, MapPin, Settings, Trash2, Edit3, Save, X, AlertTriangle, Trophy, Calendar, TrendingUp, Target } from "lucide-react"
import Link from "next/link"

interface TeamMember {
  id: string
  position?: string
  jersey_number?: number
  joined_at: string
  user: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

interface Team {
  id: string
  name: string
  description?: string
  city?: string
  district?: string
  skill_level?: string
  max_players?: number
  member_count?: number
  manager: {
    id: string
    full_name: string
    avatar_url?: string
  }
  members: TeamMember[]
}

interface TeamStats {
  totalMatches: number
  wins: number
  draws: number
  losses: number
  winRate: number
  recentMatches: any[]
  upcomingMatches: number
}

export default function TeamMembersPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuthContext()
  const [team, setTeam] = useState<Team | null>(null)
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTeamName, setEditedTeamName] = useState("")
  const [editedTeamCity, setEditedTeamCity] = useState("")
  const [editedTeamSkillLevel, setEditedTeamSkillLevel] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const teamId = params.id as string

  useEffect(() => {
    // Authentication kontrolü
    if (!authLoading && !isAuthenticated) {
      console.log("TeamMembersPage - Not authenticated, redirecting to login")
      router.push("/auth/login")
      return
    }

    // Authentication henüz hazır değilse bekle
    if (authLoading || !isAuthenticated) {
      console.log("TeamMembersPage - Auth not ready yet:", { authLoading, isAuthenticated })
      return
    }

    const loadTeamData = async () => {
      try {
        console.log("TeamMembersPage - Loading team data for ID:", teamId)
        setLoading(true)
        
        // Load team details and stats in parallel
        const [teamResult, statsResult] = await Promise.all([
          getTeamDetails(teamId),
          getTeamStats(teamId)
        ])
        
        if (teamResult.error) {
          console.error("TeamMembersPage - Team details error:", teamResult.error)
          setError("Takım bilgileri yüklenemedi")
        } else if (teamResult.data) {
          console.log("TeamMembersPage - Team details loaded:", teamResult.data.name)
          setTeam(teamResult.data)
        } else {
          console.log("TeamMembersPage - No team data received")
          setError("Takım bulunamadı")
        }

        if (statsResult.data) {
          setTeamStats(statsResult.data)
        }
      } catch (err) {
        console.error("TeamMembersPage - Load team data error:", err)
        setError("Bir hata oluştu")
      } finally {
        setLoading(false)
      }
    }

    if (teamId && isAuthenticated) {
      loadTeamData()
    }
  }, [teamId, authLoading, isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error || "Takım bulunamadı"}</p>
            <Link href="/dashboard/player">
              <Button>Oyuncu Paneline Dön</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isManager = user?.user?.id === team.manager.id

  // Settings modal functions
  const openSettingsModal = () => {
    setEditedTeamName(team.name)
    setEditedTeamCity(team.city || "")
    setEditedTeamSkillLevel(team.skill_level || "")
    setShowSettingsModal(true)
  }

  const handleSaveChanges = async () => {
    // Burada takım güncelleme API'si çağrılacak
    console.log("Saving changes:", {
      name: editedTeamName,
      city: editedTeamCity,
      skill_level: editedTeamSkillLevel
    })
    setIsEditing(false)
    // Takım bilgilerini güncelle
    setTeam(prev => prev ? {
      ...prev,
      name: editedTeamName,
      city: editedTeamCity,
      skill_level: editedTeamSkillLevel
    } : null)
  }

  const handleDeleteTeam = async () => {
    if (!confirm("Bu takımı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
      return
    }

    setIsDeleting(true)
    try {
      const { error } = await deleteTeam(teamId)
      if (error) {
        alert("Takım silinirken bir hata oluştu")
      } else {
        alert("Takım başarıyla silindi")
        router.push("/dashboard/player")
      }
    } catch (err) {
      alert("Takım silinirken bir hata oluştu")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100">
      {/* Modern Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-green-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-6">
              <Link href="/dashboard/player">
                <Button variant="ghost" size="sm" className="hover:bg-green-50 text-gray-700 hover:text-green-700 transition-colors">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Oyuncu Paneline Dön</span>
                  <span className="sm:hidden">Geri</span>
                </Button>
              </Link>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{team.name}</h1>
                  <p className="text-sm sm:text-base text-gray-600 font-medium">Takım Üyeleri</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 bg-green-50 px-3 sm:px-4 py-2 rounded-full border border-green-200">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <span className="text-sm sm:text-base text-green-700 font-semibold">
                  {team.member_count || team.members.length} üye
                </span>
              </div>
              {isManager && (
                <Button
                  onClick={openSettingsModal}
                  variant="outline"
                  size="sm"
                  className="border-green-300 text-green-700 hover:bg-green-50 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Sol Kolon - Ana İçerik */}
          <div className="lg:col-span-2 space-y-6">
            {/* Takım Bilgileri - Compact Card */}
            <div className="group relative bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-50/30 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">ℹ️</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Takım Bilgileri</h2>
                  </div>
                  {isManager && (
                    <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0 shadow-sm px-3 py-1 text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Takım Sahibi
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 hover:bg-green-50 transition-colors border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-gray-600">Şehir</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{team.city || "Belirtilmemiş"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 hover:bg-green-50 transition-colors border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">⭐</span>
                      <span className="text-xs font-medium text-gray-600">Seviye</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{team.skill_level || "Belirtilmemiş"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 hover:bg-green-50 transition-colors border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-gray-600">Maksimum Üye</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{team.max_players || "Sınırsız"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Takım Üyeleri - Modern Card */}
            <div className="group relative bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-50/30 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow-md">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Takım Üyeleri</h2>
                    <p className="text-sm text-gray-600">{team.members.length} üye</p>
                  </div>
                </div>
                
                {team.members.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-base">Henüz üye yok</p>
                    <p className="text-gray-400 text-sm">Takıma katılmak için davet bekleyin</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {team.members.map((member, index) => (
                      <div
                        key={member.id}
                        className="group/item relative bg-gray-50 rounded-lg p-4 hover:bg-green-50 hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-green-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                              <AvatarImage src={member.user.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-br from-green-600 to-green-700 text-white font-semibold text-sm">
                                {member.user.full_name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-base font-semibold text-gray-900 mb-1">{member.user.full_name}</h3>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3 text-green-600" />
                                  <span>Üye</span>
                                </div>
                                {member.position && (
                                  <div className="flex items-center gap-1">
                                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                    <span>{member.position}</span>
                                  </div>
                                )}
                                {member.jersey_number && (
                                  <div className="flex items-center gap-1">
                                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                    <span className="font-mono">#{member.jersey_number}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                              {new Date(member.joined_at).toLocaleDateString("tr-TR")}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sağ Kolon - Takım İstatistikleri */}
          <div className="space-y-6">
            {/* Takım İstatistikleri */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Takım İstatistikleri</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Genel İstatistikler */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-2xl font-bold text-blue-700">{teamStats?.totalMatches || 0}</div>
                    <div className="text-xs text-blue-700 font-medium">Toplam Maç</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-2xl font-bold text-green-700">{teamStats?.winRate || 0}%</div>
                    <div className="text-xs text-green-700 font-medium">Kazanma Oranı</div>
                  </div>
                </div>

                {/* Maç Sonuçları */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <span className="text-sm font-medium text-green-700">Galibiyet</span>
                    </div>
                    <span className="text-lg font-bold text-green-700">{teamStats?.wins || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                      <span className="text-sm font-medium text-yellow-700">Beraberlik</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-700">{teamStats?.draws || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                      <span className="text-sm font-medium text-red-700">Mağlubiyet</span>
                    </div>
                    <span className="text-lg font-bold text-red-700">{teamStats?.losses || 0}</span>
                  </div>
                </div>

                {/* Yaklaşan Maçlar */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Yaklaşan Maçlar</span>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-xl font-bold text-blue-700">{teamStats?.upcomingMatches || 0}</div>
                    <div className="text-xs text-blue-700">Planlanan Maç</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hızlı Eylemler */}
            {isManager && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Hızlı Eylemler</h2>
                  </div>
                </div>
                
                <div className="p-6 space-y-3">
                  <Button
                    onClick={openSettingsModal}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Takım Ayarları
                  </Button>
                  <Link href={`/teams/${teamId}/manage`}>
                    <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                      <Users className="w-4 h-4 mr-2" />
                      Üye Yönetimi
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Takım Durumu */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Takım Durumu</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Üye Sayısı</span>
                  <span className="text-lg font-bold text-gray-900">{team.members.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Maksimum Üye</span>
                  <span className="text-lg font-bold text-gray-900">{team.max_players || "∞"}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-600 to-green-700 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${team.max_players ? Math.min((team.members.length / team.max_players) * 100, 100) : 0}%` 
                    }}
                  ></div>
                </div>
                <div className="text-center">
                  <span className="text-xs text-gray-500">
                    {team.max_players ? `${team.members.length}/${team.max_players}` : `${team.members.length} üye`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Takım Ayarları</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettingsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Takım Adı */}
                <div>
                  <Label htmlFor="teamName" className="text-sm font-medium text-gray-700 mb-2 block">
                    Takım Adı
                  </Label>
                  {isEditing ? (
                    <Input
                      id="teamName"
                      value={editedTeamName}
                      onChange={(e) => setEditedTeamName(e.target.value)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900 font-medium">{team.name}</p>
                    </div>
                  )}
                </div>

                {/* Şehir */}
                <div>
                  <Label htmlFor="teamCity" className="text-sm font-medium text-gray-700 mb-2 block">
                    Şehir
                  </Label>
                  {isEditing ? (
                    <Input
                      id="teamCity"
                      value={editedTeamCity}
                      onChange={(e) => setEditedTeamCity(e.target.value)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">{team.city || "Belirtilmemiş"}</p>
                    </div>
                  )}
                </div>

                {/* Seviye */}
                <div>
                  <Label htmlFor="teamSkillLevel" className="text-sm font-medium text-gray-700 mb-2 block">
                    Seviye
                  </Label>
                  {isEditing ? (
                    <Input
                      id="teamSkillLevel"
                      value={editedTeamSkillLevel}
                      onChange={(e) => setEditedTeamSkillLevel(e.target.value)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">{team.skill_level || "Belirtilmemiş"}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSaveChanges}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Kaydet
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        İptal
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Düzenle
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowSettingsModal(false)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Kapat
                      </Button>
                    </>
                  )}
                </div>

                {/* Delete Team Button */}
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    onClick={handleDeleteTeam}
                    disabled={isDeleting}
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                  >
                    {isDeleting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    {isDeleting ? "Siliniyor..." : "Takımı Sil"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 