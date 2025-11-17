"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Search, Filter, MapPin, Users, Clock, Star, UserPlus, RefreshCw, Target, Trophy, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthContext } from "@/components/AuthProvider"
import { searchPlayersForTeams, sendTeamInvite } from "@/lib/api/users"
import { useToast } from "@/hooks/use-toast"

interface Player {
  id: string
  full_name: string
  avatar_url?: string
  tag: string
  roles: string[]
  phone?: string
  profiles: {
    position: string
    skill_level: string
    preferred_city: string
    availability: string
    experience_years: number
    preferred_time: string
  }
  stats: {
    totalMatches: number
    wins: number
    draws: number
    losses: number
    winRate: number
  }
  teamMemberships: string[]
  lastActive: string
}

interface Filters {
  position: string
  skillLevel: string
  city: string
  availability: string
}

export default function PlayerSearchPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<Filters>({
    position: "",
    skillLevel: "",
    city: "",
    availability: ""
  })
  const [showFilters, setShowFilters] = useState(false)
  const [invitingPlayer, setInvitingPlayer] = useState<string | null>(null)
  const [teamId, setTeamId] = useState("")
  const [inviteMessage, setInviteMessage] = useState("")
  const [showInviteModal, setShowInviteModal] = useState(false)

  const { user } = useAuthContext()
  const { toast } = useToast()
  const userCity = user?.profile?.city || user?.profile?.preferred_city || ""

  // Kullanıcının takımını getir
  useEffect(() => {
    const loadUserTeam = async () => {
      if (user?.profile?.roles?.includes("player")) {
        // Kullanıcının takımını bul
        // Bu kısım daha sonra implement edilebilir
        setTeamId("user-team-id") // Placeholder
      }
    }
    loadUserTeam()
  }, [user])

  // Oyuncuları yükle
  useEffect(() => {
    loadPlayers()
  }, [])

// Kullanıcının bulunduğu şehre göre listeyi filtrele
useEffect(() => {
  if (userCity) {
    setFilters((prev) => (prev.city === userCity ? prev : { ...prev, city: userCity }))
    loadPlayers({ city: userCity })
  }
}, [userCity])

  const loadPlayers = async (overrideFilters?: Partial<Filters>) => {
    setIsLoading(true)
    try {
      const appliedFilters = { ...filters, ...overrideFilters }
      const apiFilters = {
        position: appliedFilters.position || undefined,
        skillLevel: appliedFilters.skillLevel || undefined,
        city: appliedFilters.city || undefined,
        availability: appliedFilters.availability || undefined,
      }
      const result = await searchPlayersForTeams(apiFilters)
      if (result.data) {
        setPlayers(result.data as unknown as Player[])
        setFilteredPlayers(result.data as unknown as Player[])
      }
    } catch (error) {
      console.error("Oyuncular yüklenirken hata:", error)
      toast({
        title: "Hata",
        description: "Oyuncular yüklenirken bir hata oluştu",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filtreleme
  useEffect(() => {
    let filtered = players

    // Arama terimi
    if (searchTerm) {
      filtered = filtered.filter(player =>
        player.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtreler
    if (filters.position) {
      filtered = filtered.filter(player => player.profiles.position === filters.position)
    }
    if (filters.skillLevel) {
      filtered = filtered.filter(player => player.profiles.skill_level === filters.skillLevel)
    }
    if (filters.city) {
      filtered = filtered.filter(player => 
        player.profiles.preferred_city.toLowerCase().includes(filters.city.toLowerCase())
      )
    }
    if (filters.availability) {
      filtered = filtered.filter(player => player.profiles.availability === filters.availability)
    }

    setFilteredPlayers(filtered)
  }, [players, searchTerm, filters])

  const handleRefresh = () => {
    loadPlayers()
  }

  const handleInvitePlayer = async (playerId: string) => {
    setInvitingPlayer(playerId)
    setShowInviteModal(true)
  }

  const sendInvite = async () => {
    if (!invitingPlayer || !teamId) return

    try {
      const result = await sendTeamInvite(invitingPlayer, teamId, inviteMessage)
      if (result.data) {
        toast({
          title: "Başarılı",
          description: "Davet başarıyla gönderildi",
        })
        setShowInviteModal(false)
        setInvitingPlayer(null)
        setInviteMessage("")
      } else {
        throw new Error((result.error as { message?: string })?.message || "Davet gönderilemedi")
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Davet gönderilirken bir hata oluştu",
        variant: "destructive"
      })
    }
  }

  const getPositionText = (position: string) => {
    const positions: { [key: string]: string } = {
      "Kaleci": "Kaleci",
      "Defans": "Defans",
      "Orta Saha": "Orta Saha",
      "Forvet": "Forvet",
      "Joker": "Joker",
      "Kaleci Hariç Her Yer": "Kaleci Hariç Her Yer",
      "Her Yer": "Her Yer"
    }
    return positions[position] || position
  }

  const getSkillLevelText = (skillLevel: string) => {
    const levels: { [key: string]: string } = {
      "Başlangıç": "Başlangıç",
      "Orta": "Orta",
      "İleri": "İleri",
      "Profesyonel": "Profesyonel"
    }
    return levels[skillLevel] || skillLevel
  }

  const getSkillLevelColor = (skillLevel: string) => {
    const colors: { [key: string]: string } = {
      "Başlangıç": "bg-blue-100 text-blue-700 border-blue-200",
      "Orta": "bg-green-100 text-green-700 border-green-200",
      "İleri": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "Profesyonel": "bg-red-100 text-red-700 border-red-200"
    }
    return colors[skillLevel] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  const getAvailabilityText = (availability: string) => {
    const availabilities: { [key: string]: string } = {
      "Hafta içi": "Hafta İçi",
      "Hafta sonu": "Hafta Sonu",
      "Her zaman": "Her Zaman",
      "Sabah": "Sabah",
      "Öğlen": "Öğlen",
      "Akşam": "Akşam"
    }
    return availabilities[availability] || availability
  }

  const clearFilters = () => {
    setFilters({
      position: "",
      skillLevel: "",
      city: "",
      availability: ""
    })
    setSearchTerm("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white/90 shadow-sm border-b border-green-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-green-700 hover:bg-green-50">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-green-800">Oyuncu Ara</h1>
                <p className="text-green-600">Takımınız için uygun oyuncuları bulun</p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Oyuncu adı veya etiketi ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-green-200 focus:border-green-500"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtreler
            </Button>
          </div>

          {showFilters && (
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Filtreler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="position" className="text-green-700">Mevki</Label>
                    <Select value={filters.position} onValueChange={(value) => setFilters({...filters, position: value})}>
                      <SelectTrigger className="border-green-200">
                        <SelectValue placeholder="Tüm mevkiler" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tüm mevkiler</SelectItem>
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
                    <Label htmlFor="skillLevel" className="text-green-700">Seviye</Label>
                    <Select value={filters.skillLevel} onValueChange={(value) => setFilters({...filters, skillLevel: value})}>
                      <SelectTrigger className="border-green-200">
                        <SelectValue placeholder="Tüm seviyeler" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tüm seviyeler</SelectItem>
                        <SelectItem value="Başlangıç">Başlangıç</SelectItem>
                        <SelectItem value="Orta">Orta</SelectItem>
                        <SelectItem value="İleri">İleri</SelectItem>
                        <SelectItem value="Profesyonel">Profesyonel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="city" className="text-green-700">Şehir</Label>
                    <Input
                      id="city"
                      placeholder="Şehir ara..."
                      value={filters.city}
                      onChange={(e) => setFilters({...filters, city: e.target.value})}
                      className="border-green-200 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="availability" className="text-green-700">Müsaitlik</Label>
                    <Select value={filters.availability} onValueChange={(value) => setFilters({...filters, availability: value})}>
                      <SelectTrigger className="border-green-200">
                        <SelectValue placeholder="Tüm müsaitlikler" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tüm müsaitlikler</SelectItem>
                        <SelectItem value="Hafta içi">Hafta İçi</SelectItem>
                        <SelectItem value="Hafta sonu">Hafta Sonu</SelectItem>
                        <SelectItem value="Her zaman">Her Zaman</SelectItem>
                        <SelectItem value="Sabah">Sabah</SelectItem>
                        <SelectItem value="Öğlen">Öğlen</SelectItem>
                        <SelectItem value="Akşam">Akşam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Filtreleri Temizle
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-green-800">
            {filteredPlayers.length} oyuncu bulundu
          </h2>
          <span className="text-sm text-green-600">
            Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}
          </span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-green-200 animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Players Grid */}
        {!isLoading && filteredPlayers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((player) => (
              <Card key={player.id} className="border-green-200 hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-6">
                  {/* Player Header */}
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="h-12 w-12 border-2 border-green-200">
                      <AvatarImage src={player.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-green-600 to-green-700 text-white text-lg font-bold">
                        {player.full_name?.charAt(0) || "O"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-green-800 mb-1">{player.full_name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0 text-xs">
                          #{player.tag}
                        </Badge>
                        <span className="text-xs text-green-600">• {getPositionText(player.profiles.position)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Player Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <Target className="w-4 h-4" />
                      <span>Seviye: {getSkillLevelText(player.profiles.skill_level)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <MapPin className="w-4 h-4" />
                      <span>Şehir: {player.profiles.preferred_city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <Clock className="w-4 h-4" />
                      <span>Müsaitlik: {getAvailabilityText(player.profiles.availability)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <Users className="w-4 h-4" />
                      <span>Deneyim: {player.profiles.experience_years} yıl</span>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-3 gap-4 text-center text-sm mb-4">
                    <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                      <p className="font-semibold text-green-800">{player.stats.totalMatches}</p>
                      <p className="text-green-600">Toplam Maç</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                      <p className="font-semibold text-blue-800">{player.stats.winRate}%</p>
                      <p className="text-blue-600">Kazanma</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2 border border-purple-100">
                      <p className="font-semibold text-purple-800">{player.stats.wins}W-{player.stats.draws}D-{player.stats.losses}L</p>
                      <p className="text-purple-600">Sonuçlar</p>
                    </div>
                  </div>

                  {/* Team Memberships */}
                  {player.teamMemberships.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-green-600 mb-2">Mevcut Takımlar:</p>
                      <div className="flex flex-wrap gap-1">
                        {player.teamMemberships.map((teamName, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-green-200 text-green-700">
                            {teamName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Last Active */}
                  <div className="text-xs text-green-600 mb-4">
                    Son aktif: {player.lastActive}
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleInvitePlayer(player.id)}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Takıma Davet Et
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredPlayers.length === 0 && (
          <Card className="border-green-200 text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                {players.length === 0 ? "Henüz oyuncu bulunamadı" : "Filtrelere uygun oyuncu bulunamadı"}
              </h3>
              <p className="text-green-600 mb-4">
                {players.length === 0 
                  ? "Platform henüz yeni, yakında birçok oyuncu katılacak!"
                  : "Farklı filtreler deneyebilir veya arama terimini değiştirebilirsiniz."
                }
              </p>
              {players.length > 0 && (
                <Button onClick={clearFilters} variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                  Filtreleri Temizle
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Oyuncuyu Davet Et</CardTitle>
              <CardDescription>
                Oyuncuya özel bir mesaj gönderebilirsiniz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="message" className="text-green-700">Mesaj (Opsiyonel)</Label>
                <Input
                  id="message"
                  placeholder="Takımınız hakkında bilgi verin..."
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  className="border-green-200 focus:border-green-500"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={sendInvite}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  Davet Gönder
                </Button>
                <Button
                  onClick={() => setShowInviteModal(false)}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  İptal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
