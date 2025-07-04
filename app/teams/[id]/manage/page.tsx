"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Users,
  MessageCircle,
  Settings,
  UserPlus,
  Crown,
  Shield,
  User,
  Search,
  MoreVertical,
  Home,
  Calendar,
  Trophy,
} from "lucide-react"
import Link from "next/link"

interface Team {
  id: string
  name: string
  description?: string
  city?: string
  district?: string
  skillLevel?: string
  maxMembers?: string
  role: string
  members: number
  wins: number
  losses: number
  draws: number
  createdAt?: string
}

interface TeamMember {
  id: number
  name: string
  position: string
  role: "Kaptan" | "Yardımcı Kaptan" | "Oyuncu"
  joinDate: string
  matchesPlayed: number
  goals: number
  assists: number
  online: boolean
  lastSeen?: string
}

export default function TeamManagePage({ params }: { params: any }) {
  const { id } = use(params) as any
  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Load team details from localStorage
    const userTeamsRaw = localStorage.getItem("userTeams");
    const storedTeams = JSON.parse(!userTeamsRaw || userTeamsRaw === 'undefined' ? '[]' : userTeamsRaw);
    console.log("[DEBUG] storedTeams:", storedTeams)
    storedTeams.forEach((t: any, i: number) => console.log(`[DEBUG] storedTeams[${i}].id:`, t.id))
    console.log("[DEBUG] params.id:", id)
    const foundTeam = storedTeams.find((t: Team) => String(t.id) === String(id))

    if (foundTeam) {
      setTeam(foundTeam)

      // Mock team members data
      setMembers([
        {
          id: 1,
          name: "Ahmet Yılmaz",
          position: "Orta Saha",
          role: "Kaptan",
          joinDate: "2023-01-15",
          matchesPlayed: 25,
          goals: 8,
          assists: 12,
          online: true,
        },
        {
          id: 2,
          name: "Mehmet Kaya",
          position: "Forvet",
          role: "Yardımcı Kaptan",
          joinDate: "2023-02-20",
          matchesPlayed: 23,
          goals: 15,
          assists: 6,
          online: true,
        },
        {
          id: 3,
          name: "Ali Demir",
          position: "Defans",
          role: "Oyuncu",
          joinDate: "2023-03-10",
          matchesPlayed: 20,
          goals: 2,
          assists: 4,
          online: false,
          lastSeen: "2 saat önce",
        },
        {
          id: 4,
          name: "Can Özkan",
          position: "Kaleci",
          role: "Oyuncu",
          joinDate: "2023-04-05",
          matchesPlayed: 18,
          goals: 0,
          assists: 1,
          online: true,
        },
        {
          id: 5,
          name: "Emre Yıldız",
          position: "Orta Saha",
          role: "Oyuncu",
          joinDate: "2023-05-12",
          matchesPlayed: 15,
          goals: 5,
          assists: 8,
          online: false,
          lastSeen: "1 gün önce",
        },
      ])
    }
  }, [id])

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.position.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const onlineMembers = members.filter((m) => m.online)

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600">Takım bilgileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Kaptan":
        return <Crown className="w-4 h-4 text-yellow-600" />
      case "Yardımcı Kaptan":
        return <Shield className="w-4 h-4 text-blue-600" />
      default:
        return <User className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Kaptan":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Yardımcı Kaptan":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
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
        <div className="max-w-6xl mx-auto">
          {/* Team Header */}
          <Card className="mb-8 border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-green-800 flex items-center">
                    <Users className="w-6 h-6 mr-2" />
                    {team.name}
                  </CardTitle>
                  <div className="flex items-center space-x-4 mt-2 text-green-600">
                    <span>
                      {team.city} {team.district && `• ${team.district}`}
                    </span>
                    <span>•</span>
                    <span>{members.length} üye</span>
                    <span>•</span>
                    <span>{onlineMembers.length} çevrimiçi</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link href={`/chat/${id}`}>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Takım Sohbeti
                    </Button>
                  </Link>
                  <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{team.wins}</div>
                  <div className="text-sm text-green-700">Galibiyet</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-600">{team.losses}</div>
                  <div className="text-sm text-red-700">Mağlubiyet</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-600">{team.draws}</div>
                  <div className="text-sm text-yellow-700">Beraberlik</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{team.wins + team.losses + team.draws}</div>
                  <div className="text-sm text-blue-700">Toplam Maç</div>
                </div>
              </div>
              {team.description && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-700 text-sm">{team.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Team Members */}
            <div className="lg:col-span-2">
              <Card className="border-green-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-green-800 flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Takım Üyeleri ({members.length})
                    </CardTitle>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      <UserPlus className="w-4 h-4 mr-1" />
                      Davet Et
                    </Button>
                  </div>
                  <div className="mt-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-4 h-4" />
                      <Input
                        placeholder="Üye ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-green-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-green-200 text-green-700">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          {member.online && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-green-800">{member.name}</p>
                            {getRoleIcon(member.role)}
                          </div>
                          <p className="text-sm text-green-600">{member.position}</p>
                          <p className="text-xs text-green-500">
                            {member.online ? "Çevrimiçi" : `Son görülme: ${member.lastSeen}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right text-xs text-green-600">
                          <div>{member.matchesPlayed} maç</div>
                          <div>
                            {member.goals}G • {member.assists}A
                          </div>
                        </div>
                        <Badge className={getRoleBadgeColor(member.role)}>{member.role}</Badge>
                        <Link href={`/chat/private/${member.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-200 text-green-700 hover:bg-green-100"
                            onClick={() => console.log(`Private chat with ${member.name}`)}
                          >
                            <MessageCircle className="w-3 h-3" />
                          </Button>
                        </Link>

                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-200 text-green-700 hover:bg-green-100"
                          onClick={() => alert("Üye seçenekleri yakında!")}
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Team Actions & Stats */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">Hızlı İşlemler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/chat/${id}`}>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => console.log("Team chat clicked")}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Takım Sohbeti
                    </Button>
                  </Link>

                  <Link href="/matches/create">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => console.log("Create match clicked")}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Maç Organize Et
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    className="w-full border-green-200 text-green-700 hover:bg-green-50"
                    onClick={() => alert("Oyuncu davet özelliği yakında!")}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Oyuncu Davet Et
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-green-200 text-green-700 hover:bg-green-50"
                    onClick={() => alert("Takım ayarları yakında!")}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Takım Ayarları
                  </Button>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800 flex items-center">
                    <Trophy className="w-5 h-5 mr-2" />
                    En İyi Performans
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-2">En Çok Gol</h4>
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-green-200 text-green-700 text-xs">MK</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-green-800">Mehmet Kaya</span>
                      <Badge className="bg-green-100 text-green-700 text-xs">15 gol</Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-2">En Çok Asist</h4>
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-green-200 text-green-700 text-xs">AY</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-green-800">Ahmet Yılmaz</span>
                      <Badge className="bg-green-100 text-green-700 text-xs">12 asist</Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-2">En Çok Maç</h4>
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-green-200 text-green-700 text-xs">AY</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-green-800">Ahmet Yılmaz</span>
                      <Badge className="bg-green-100 text-green-700 text-xs">25 maç</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team Info */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">Takım Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-600">Kuruluş:</span>
                    <span className="text-green-800">
                      {team.createdAt ? new Date(team.createdAt).toLocaleDateString("tr-TR") : "Bilinmiyor"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Seviye:</span>
                    <span className="text-green-800">{team.skillLevel || "Belirtilmemiş"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Maks. Üye:</span>
                    <span className="text-green-800">{team.maxMembers || "Sınırsız"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Aktif Üye:</span>
                    <span className="text-green-800">
                      {onlineMembers.length}/{members.length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
