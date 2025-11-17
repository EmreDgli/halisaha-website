"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Plus, 
  Users, 
  MapPin, 
  Star, 
  Filter,
  Home,
  User
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getTeams } from "@/lib/api/teams"

interface Team {
  id: string
  name: string
  city?: string
  district?: string
  skill_level?: string
  max_players?: number
  member_count?: number
  created_at?: string
  manager?: {
    full_name?: string
    email?: string
  }
}

export default function TeamsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedSkillLevel, setSelectedSkillLevel] = useState("")

  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoading(true)
        const { data, error } = await getTeams()
        if (error) {
          console.error("Error loading teams:", error)
        } else if (data) {
          setTeams(data)
          setFilteredTeams(data)
        }
      } catch (error) {
        console.error("Error loading teams:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTeams()
  }, [])

  useEffect(() => {
    let filtered = teams

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.district?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Şehir filtresi
    if (selectedCity) {
      filtered = filtered.filter(team => team.city === selectedCity)
    }

    // Seviye filtresi
    if (selectedSkillLevel) {
      filtered = filtered.filter(team => team.skill_level === selectedSkillLevel)
    }

    setFilteredTeams(filtered)
  }, [teams, searchTerm, selectedCity, selectedSkillLevel])

  // Benzersiz şehirleri al
  const cities = [...new Set(teams.map(team => team.city).filter(Boolean))]

  // Seviye seçenekleri
  const skillLevels = ["Başlangıç", "Orta", "İleri", "Profesyonel"]

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-center text-green-800 mb-4">
              Giriş Yapın
            </h2>
            <p className="text-center text-green-600 mb-6">
              Takımları görüntülemek için giriş yapmanız gerekiyor.
            </p>
            <div className="space-y-3">
              <Link href="/auth/login">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" className="w-full border-green-600 text-green-700">
                  Kayıt Ol
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-800 hover:bg-green-50">
                  <Home className="h-4 w-4 mr-2" />
                  Anasayfa
                </Button>
              </Link>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                Takımlar
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/player">
                <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-800 hover:bg-green-50">
                  <User className="h-4 w-4 mr-2" />
                  Panelim
                </Button>
              </Link>
              <Link href="/teams/create">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="h-4 w-4 mr-1" />
                  Takım Oluştur
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtreler */}
        <Card className="mb-6 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Filter className="h-5 w-5 mr-2" />
              Filtreler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Arama */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 h-4 w-4" />
                <Input
                  placeholder="Takım ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-green-200 focus:border-green-500"
                />
              </div>

              {/* Şehir filtresi */}
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="border border-green-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Tüm Şehirler</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              {/* Seviye filtresi */}
              <select
                value={selectedSkillLevel}
                onChange={(e) => setSelectedSkillLevel(e.target.value)}
                className="border border-green-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Tüm Seviyeler</option>
                {skillLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Takımlar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="border-green-200 animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-green-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-3 bg-green-200 rounded w-1/2"></div>
                    <div className="h-3 bg-green-200 rounded w-2/3"></div>
                    <div className="h-3 bg-green-200 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredTeams.length > 0 ? (
            filteredTeams.map((team) => (
              <Card key={team.id} className="border-green-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-green-800 text-lg">{team.name}</CardTitle>
                    <Badge className="bg-green-600 text-white">
                      {team.skill_level || "Orta"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-green-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {team.city} {team.district && `• ${team.district}`}
                  </div>
                  
                  <div className="flex items-center text-sm text-green-600">
                    <Users className="h-4 w-4 mr-2" />
                    {team.member_count || 1} / {team.max_players || 11} üye
                  </div>

                  {team.manager && (
                    <div className="text-sm text-green-500">
                      Yönetici: {team.manager.full_name || team.manager.email}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <Link href={`/teams/${team.id}/members`}>
                      <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
                        <Users className="w-4 h-4 mr-1" />
                        Üyeleri Gör
                      </Button>
                    </Link>
                    
                    <Link href={`/teams/${team.id}/join`}>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        Katıl
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-green-400 mb-4">
                <Users className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-green-800 mb-2">
                {searchTerm || selectedCity || selectedSkillLevel ? "Arama kriterlerinize uygun takım bulunamadı" : "Henüz takım bulunmuyor"}
              </h3>
              <p className="text-green-600 mb-6">
                {searchTerm || selectedCity || selectedSkillLevel 
                  ? "Filtreleri temizleyip tekrar deneyin" 
                  : "İlk takımı oluşturmak için aşağıdaki butona tıklayın"
                }
              </p>
              {!searchTerm && !selectedCity && !selectedSkillLevel && (
                <Link href="/teams/create">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    İlk Takımı Oluştur
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* İstatistikler */}
        {!loading && teams.length > 0 && (
          <Card className="mt-8 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">İstatistikler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{teams.length}</div>
                  <div className="text-sm text-green-600">Toplam Takım</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {cities.length}
                  </div>
                  <div className="text-sm text-green-600">Şehir</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {teams.reduce((sum, team) => sum + (team.member_count || 1), 0)}
                  </div>
                  <div className="text-sm text-green-600">Toplam Üye</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 