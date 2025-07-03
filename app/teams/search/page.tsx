"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Home, Search, Filter, MapPin, Users, Clock, Star, MessageCircle, UserPlus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

// Mock data for teams
const mockTeams = [
  {
    id: 1,
    name: "Beşiktaş Gençlik",
    location: "Beşiktaş, İstanbul",
    skillLevel: 4,
    playersCount: 11,
    preferredTime: "Akşam",
    avatar: "/placeholder.svg?height=60&width=60",
    description: "Hafta sonları maç arayan deneyimli takım",
    lastActive: "2 saat önce",
    matchesPlayed: 15,
    winRate: 73,
    lookingForPlayers: true,
  },
  {
    id: 2,
    name: "Kadıköy United",
    location: "Kadıköy, İstanbul",
    skillLevel: 3,
    playersCount: 9,
    preferredTime: "Öğleden sonra",
    avatar: "/placeholder.svg?height=60&width=60",
    description: "Eğlenceli ve fair play odaklı takım",
    lastActive: "1 gün önce",
    matchesPlayed: 8,
    winRate: 62,
    lookingForPlayers: true,
  },
  {
    id: 3,
    name: "Şişli Spor",
    location: "Şişli, İstanbul",
    skillLevel: 5,
    playersCount: 11,
    preferredTime: "Gece",
    avatar: "/placeholder.svg?height=60&width=60",
    description: "Profesyonel seviyede maçlar arıyoruz",
    lastActive: "30 dakika önce",
    matchesPlayed: 22,
    winRate: 86,
    lookingForPlayers: false,
  },
  {
    id: 4,
    name: "Bakırköy FC",
    location: "Bakırköy, İstanbul",
    skillLevel: 2,
    playersCount: 8,
    preferredTime: "Sabah",
    avatar: "/placeholder.svg?height=60&width=60",
    description: "Yeni başlayanlar için ideal takım",
    lastActive: "3 saat önce",
    matchesPlayed: 5,
    winRate: 40,
    lookingForPlayers: true,
  },
  {
    id: 5,
    name: "Ataşehir Warriors",
    location: "Ataşehir, İstanbul",
    skillLevel: 4,
    playersCount: 10,
    preferredTime: "Akşam",
    avatar: "/placeholder.svg?height=60&width=60",
    description: "Rekabetçi ve organize takım",
    lastActive: "1 saat önce",
    matchesPlayed: 18,
    winRate: 67,
    lookingForPlayers: true,
  },
  {
    id: 6,
    name: "Üsküdar Gençlik",
    location: "Üsküdar, İstanbul",
    skillLevel: 3,
    playersCount: 11,
    preferredTime: "Öğleden sonra",
    avatar: "/placeholder.svg?height=60&width=60",
    description: "Dostluk maçları tercih ediyoruz",
    lastActive: "4 saat önce",
    matchesPlayed: 12,
    winRate: 58,
    lookingForPlayers: false,
  },
]

export default function TeamSearchPage() {
  const [teams, setTeams] = useState(mockTeams)
  const [filteredTeams, setFilteredTeams] = useState(mockTeams)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    location: "",
    skillLevels: [] as number[],
    timePreferences: [] as string[],
    lookingForPlayers: false,
    minPlayers: "",
    maxPlayers: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  // Filter teams based on criteria
  useEffect(() => {
    let filtered = teams

    // Search by name or description
    if (searchTerm) {
      filtered = filtered.filter(
        (team) =>
          team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter((team) => team.location.toLowerCase().includes(filters.location.toLowerCase()))
    }

    // Filter by skill levels
    if (filters.skillLevels.length > 0) {
      filtered = filtered.filter((team) => filters.skillLevels.includes(team.skillLevel))
    }

    // Filter by time preferences
    if (filters.timePreferences.length > 0) {
      filtered = filtered.filter((team) => filters.timePreferences.includes(team.preferredTime))
    }

    // Filter by looking for players
    if (filters.lookingForPlayers) {
      filtered = filtered.filter((team) => team.lookingForPlayers)
    }

    // Filter by player count
    if (filters.minPlayers) {
      filtered = filtered.filter((team) => team.playersCount >= Number.parseInt(filters.minPlayers))
    }
    if (filters.maxPlayers) {
      filtered = filtered.filter((team) => team.playersCount <= Number.parseInt(filters.maxPlayers))
    }

    setFilteredTeams(filtered)
  }, [searchTerm, filters, teams])

  const handleJoinRequest = async (teamId: number) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    alert("Takıma katılma isteği gönderildi!")
    setIsLoading(false)
  }

  const getSkillLevelText = (level: number) => {
    const levels = ["", "Başlangıç", "Orta", "İyi", "Çok İyi", "Profesyonel"]
    return levels[level] || "Bilinmiyor"
  }

  const getSkillLevelColor = (level: number) => {
    if (level <= 2) return "bg-green-100 text-green-800"
    if (level <= 3) return "bg-green-200 text-green-800"
    if (level <= 4) return "bg-green-300 text-green-800"
    return "bg-green-400 text-green-800"
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilters({
      location: "",
      skillLevels: [],
      timePreferences: [],
      lookingForPlayers: false,
      minPlayers: "",
      maxPlayers: "",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/player">
                <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-800 hover:bg-green-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Geri
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-800 hover:bg-green-50">
                  <Home className="h-4 w-4 mr-2" />
                  Anasayfa
                </Button>
              </Link>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
              Takım Arama
            </h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-green-200">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 h-4 w-4" />
              <Input
                placeholder="Takım adı veya açıklama ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-green-200 focus:border-green-400 focus:ring-green-400"
              />
            </div>

            {/* Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtreler
                  {(filters.skillLevels.length > 0 ||
                    filters.timePreferences.length > 0 ||
                    filters.location ||
                    filters.lookingForPlayers ||
                    filters.minPlayers ||
                    filters.maxPlayers) && (
                    <Badge className="ml-2 bg-green-600 text-white">
                      {
                        [
                          ...filters.skillLevels,
                          ...filters.timePreferences,
                          filters.location ? 1 : 0,
                          filters.lookingForPlayers ? 1 : 0,
                          filters.minPlayers ? 1 : 0,
                          filters.maxPlayers ? 1 : 0,
                        ].filter(Boolean).length
                      }
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle className="text-green-800">Filtreler</SheetTitle>
                  <SheetDescription>Arama kriterlerinizi belirleyin</SheetDescription>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  {/* Location Filter */}
                  <div>
                    <Label className="text-green-800 font-medium">Konum</Label>
                    <Select
                      value={filters.location}
                      onValueChange={(value) => setFilters({ ...filters, location: value })}
                    >
                      <SelectTrigger className="border-green-200">
                        <SelectValue placeholder="Konum seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm konumlar</SelectItem>
                        <SelectItem value="Beşiktaş">Beşiktaş</SelectItem>
                        <SelectItem value="Kadıköy">Kadıköy</SelectItem>
                        <SelectItem value="Şişli">Şişli</SelectItem>
                        <SelectItem value="Bakırköy">Bakırköy</SelectItem>
                        <SelectItem value="Ataşehir">Ataşehir</SelectItem>
                        <SelectItem value="Üsküdar">Üsküdar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Skill Level Filter */}
                  <div>
                    <Label className="text-green-800 font-medium">Seviye</Label>
                    <div className="space-y-2 mt-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div key={level} className="flex items-center space-x-2">
                          <Checkbox
                            id={`skill-${level}`}
                            checked={filters.skillLevels.includes(level)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFilters({ ...filters, skillLevels: [...filters.skillLevels, level] })
                              } else {
                                setFilters({ ...filters, skillLevels: filters.skillLevels.filter((l) => l !== level) })
                              }
                            }}
                          />
                          <Label htmlFor={`skill-${level}`} className="text-sm">
                            {getSkillLevelText(level)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Time Preference Filter */}
                  <div>
                    <Label className="text-green-800 font-medium">Zaman Tercihi</Label>
                    <div className="space-y-2 mt-2">
                      {["Sabah", "Öğleden sonra", "Akşam", "Gece"].map((time) => (
                        <div key={time} className="flex items-center space-x-2">
                          <Checkbox
                            id={`time-${time}`}
                            checked={filters.timePreferences.includes(time)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFilters({ ...filters, timePreferences: [...filters.timePreferences, time] })
                              } else {
                                setFilters({
                                  ...filters,
                                  timePreferences: filters.timePreferences.filter((t) => t !== time),
                                })
                              }
                            }}
                          />
                          <Label htmlFor={`time-${time}`} className="text-sm">
                            {time}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Player Count Filter */}
                  <div>
                    <Label className="text-green-800 font-medium">Oyuncu Sayısı</Label>
                    <div className="flex space-x-2 mt-2">
                      <Input
                        placeholder="Min"
                        type="number"
                        value={filters.minPlayers}
                        onChange={(e) => setFilters({ ...filters, minPlayers: e.target.value })}
                        className="border-green-200"
                      />
                      <Input
                        placeholder="Max"
                        type="number"
                        value={filters.maxPlayers}
                        onChange={(e) => setFilters({ ...filters, maxPlayers: e.target.value })}
                        className="border-green-200"
                      />
                    </div>
                  </div>

                  {/* Looking for Players */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="looking-for-players"
                      checked={filters.lookingForPlayers}
                      onCheckedChange={(checked) => setFilters({ ...filters, lookingForPlayers: !!checked })}
                    />
                    <Label htmlFor="looking-for-players" className="text-sm text-green-800">
                      Sadece oyuncu arayan takımlar
                    </Label>
                  </div>

                  <Button onClick={clearFilters} variant="outline" className="w-full border-green-200 text-green-700">
                    Filtreleri Temizle
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-green-600">{filteredTeams.length} takım bulundu</p>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card key={team.id} className="hover:shadow-lg transition-shadow duration-200 border-green-200">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={team.avatar || "/placeholder.svg"} alt={team.name} />
                    <AvatarFallback className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                      {team.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg text-green-800">{team.name}</CardTitle>
                    <p className="text-sm text-green-600 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {team.location}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-green-700">{team.description}</p>

                <div className="flex flex-wrap gap-2">
                  <Badge className={getSkillLevelColor(team.skillLevel)}>
                    <Star className="h-3 w-3 mr-1" />
                    {getSkillLevelText(team.skillLevel)}
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <Users className="h-3 w-3 mr-1" />
                    {team.playersCount}/11
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <Clock className="h-3 w-3 mr-1" />
                    {team.preferredTime}
                  </Badge>
                  {team.lookingForPlayers && <Badge className="bg-green-600 text-white">Oyuncu Arıyor</Badge>}
                </div>

                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <p className="font-semibold text-green-800">{team.matchesPlayed}</p>
                    <p className="text-green-600">Maç</p>
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">%{team.winRate}</p>
                    <p className="text-green-600">Galibiyet</p>
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">{team.lastActive}</p>
                    <p className="text-green-600">Son aktif</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleJoinRequest(team.id)}
                    disabled={isLoading || !team.lookingForPlayers}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    {team.lookingForPlayers ? "Katılma İsteği Gönder" : "Kadro Dolu"}
                  </Button>
                  <Button variant="outline" size="icon" className="border-green-200 text-green-700 hover:bg-green-50">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8 border border-green-200">
              <Search className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-800 mb-2">Takım bulunamadı</h3>
              <p className="text-green-600 mb-4">Arama kriterlerinizi değiştirerek tekrar deneyin.</p>
              <Button onClick={clearFilters} className="bg-green-600 hover:bg-green-700 text-white">
                Filtreleri Temizle
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
