"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  Video,
  Search,
  TrendingUp,
  Settings,
  LogOut,
  Home,
  MapPin,
  Users,
  Plus,
  Bell,
  CheckCircle,
  X,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { logoutUser } from "@/lib/api/auth"
import { getUserTeams } from "@/lib/api/teams"
import { getUserMatches } from "@/lib/api/matches"
import { useAuthContext } from "@/components/AuthProvider"
import React from "react"
import { getJoinRequestsForManager, handleTeamJoinRequest } from "@/lib/api/teams";

interface Team {
  id: string
  name: string
  city?: string
  district?: string
  skill_level?: string
  max_players?: number
  member_count?: number
  role?: string
  created_at?: string
  owner_id?: string
}

interface Match {
  id: string
  title: string
  match_date: string
  status: "pending" | "confirmed" | "completed"
  field?: {
    name: string
    address: string
  }
  organizer_team?: {
    name: string
  }
  opponent_team?: {
    name: string
  }
}

interface JoinRequest {
  id: number
  teamName: string
  playerName: string
  message: string
  time: string
  status: "pending" | "accepted" | "rejected"
}

function JoinRequestsPanel() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      const { data } = await getJoinRequestsForManager();
      setRequests(data || []);
      setLoading(false);
    };
    fetchRequests();
  }, []);

  const handleAction = async (id: string, approve: boolean) => {
    await handleTeamJoinRequest(id, approve);
    setRequests((prev) => prev.filter((req) => req.id !== id));
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
        <span className="mr-2">Katılma İstekleri</span>
        <span className="text-green-600">({requests.length})</span>
      </h2>
      {requests.length === 0 ? (
        <div className="text-green-600">Bekleyen katılma isteği yok.</div>
      ) : (
        requests.map((req) => (
          <div key={req.id} className="bg-green-50 rounded-lg p-4 mb-4 flex justify-between items-center">
            <div>
              <div className="font-semibold text-green-800">{req.user?.full_name}</div>
              <div className="text-green-700">{req.team?.name} takımına katılmak istiyor</div>
              <div className="text-green-700">{req.message}</div>
              <div className="text-xs text-green-500 mt-1">{/* Burada başvuru zamanı gösterilebilir */}</div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-red-200 text-red-600"
                onClick={() => handleAction(req.id, false)}
              >
                <XCircle className="w-4 h-4 mr-1" /> Reddet
              </Button>
              <Button
                className="bg-green-600 text-white"
                onClick={() => handleAction(req.id, true)}
              >
                <CheckCircle className="w-4 h-4 mr-1" /> Kabul Et
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function PlayerDashboard() {
  const { user, loading: authLoading, error: authError, isAuthenticated } = useAuthContext()
  const [myTeams, setMyTeams] = useState<Team[]>([])
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)

  const recentVideos = [
    {
      id: 1,
      title: "Beşiktaş Gençlik vs Kadıköy United",
      thumbnail: "/placeholder.svg?height=120&width=200",
      duration: "45:30",
      views: 234,
    },
    {
      id: 2,
      title: "Antrenman Highlights",
      thumbnail: "/placeholder.svg?height=120&width=200",
      duration: "12:45",
      views: 89,
    },
  ]

  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [authLoading, isAuthenticated, router])

  // Load user data when authenticated
  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthenticated || !user) return

      setDataLoading(true)
      try {
        // Load user teams
        const { data: teamsData, error: teamsError } = await getUserTeams()
        if (teamsError) {
          console.error("Error loading teams:", teamsError)
        } else if (teamsData) {
          const processedTeams = teamsData.map((team: any) => ({
            ...team,
            id: team.id || team.team_id || team.slug || team.name || crypto.randomUUID(),
            name: team.name || team.team_name, // <-- Burası önemli!
            owner_id: team.owner_id || team.manager_id
          }));
          setMyTeams(processedTeams);
          localStorage.setItem("userTeams", JSON.stringify(processedTeams));
        }

        // Load user matches
        const { data: matchesData, error: matchesError } = await getUserMatches()
        if (matchesError) {
          console.error("Error loading matches:", matchesError)
        } else if (matchesData) {
          setUpcomingMatches(matchesData.filter((match) => match.status !== "completed"))
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        setDataLoading(false)
      }
    }

    loadUserData()
  }, [isAuthenticated, user])

  const handleLogout = async () => {
    try {
      await logoutUser()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // myTeams dizisini ikiye ayır (tip güvenli karşılaştırma)
  const ownedTeams = myTeams.filter(team => String(team.owner_id) === String(user.id));
  const memberTeams = myTeams.filter(team => String(team.owner_id) !== String(user.id));

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Kimlik doğrulama hatası: {authError}</p>
          <Button onClick={() => router.push("/auth/login")} className="bg-green-600 hover:bg-green-700">
            Giriş Yap
          </Button>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null
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
                Oyuncu Paneli
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Panel geçiş butonu */}
              {user?.profile?.roles?.includes("player") && user?.profile?.roles?.includes("field_owner") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-600 text-green-700 hover:bg-green-50"
                  onClick={() => router.push("/dashboard/owner")}
                >
                  Saha Sahibi Paneline Geç
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-green-700 hover:text-green-800 hover:bg-green-50 relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-4 w-4" />
                {/* pendingRequests.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 min-w-[20px] h-5">
                    {pendingRequests.length}
                  </Badge>
                ) */}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-700 hover:text-green-800 hover:bg-green-50"
                onClick={() => router.push("/settings")}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-700 hover:text-green-800 hover:bg-green-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-green-200">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.profile?.avatar_url || "/placeholder.svg"} alt={user.profile?.full_name} />
              <AvatarFallback className="bg-gradient-to-r from-green-500 to-green-600 text-white text-lg">
                {user.profile?.full_name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("") || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-green-800">
                Hoş geldin, {user.profile?.full_name || user.full_name || "Kullanıcı"}
                {user.profile?.tag && (
                  <span className="ml-2 inline-block bg-green-100 text-green-700 text-sm px-2 py-0.5 rounded align-middle">{user.profile.tag}</span>
                )}
                !
              </h2>
              <p className="text-green-600">{user.profile?.email}</p>
              <div className="flex space-x-4 mt-2">
                <Badge className="bg-green-100 text-green-700 border-green-200">{myTeams.length} Takım</Badge>
                <Badge className="bg-green-100 text-green-700 border-green-200">{upcomingMatches.length} Maç</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Data Loading Indicator */}
        {dataLoading && (
          <Alert className="mb-8 border-green-200 bg-green-50">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
              <span className="text-green-700">Veriler yükleniyor...</span>
            </div>
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/teams/search">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-200 hover:border-green-300">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Search className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-medium text-center text-green-800">Takım Ara</h3>
              </CardContent>
            </Card>
          </Link>

          <Link href="/matches/suggestions">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-200 hover:border-green-300">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-medium text-center text-green-800">Önerilen Maçlar</h3>
              </CardContent>
            </Card>
          </Link>

          <Link href="/videos">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-200 hover:border-green-300">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Video className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-medium text-center text-green-800">Maç Videoları</h3>
              </CardContent>
            </Card>
          </Link>

          <Link href="/fields/reservations">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-200 hover:border-green-300">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <MapPin className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-medium text-center text-green-800">Saha Rezervasyonları</h3>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Teams */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-green-800">
                <span className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Takımlarım ({myTeams.length})
                </span>
                <Link href="/teams/create">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="h-4 w-4 mr-1" />
                    Yeni
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {myTeams.length > 0 ? (
                myTeams.map((team, index) => (
                  <div
                    key={team.id || team.name || index}
                    className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div>
                      <h4 className="font-medium text-green-800 text-lg mb-1 flex items-center">
                        {team.name}
                        {String(team.owner_id) === String(user.id) && (
                          <Badge className="ml-2 bg-green-700 text-white">Takım Sahibi</Badge>
                        )}
                      </h4>
                      <p className="text-sm text-green-600">
                        {team.role || "Üye"} • {team.member_count || 1} üye
                      </p>
                      <p className="text-sm text-green-500">
                        {team.city} {team.district && `• ${team.district}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-600 text-white">{team.role || "Üye"}</Badge>
                      <Link href={`/teams/${team.id}/manage`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-300 text-green-700 hover:bg-green-100"
                        >
                          Yönet
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-green-600 text-sm">Henüz bir takıma katılmadınız veya oluşturmadınız.</div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Matches */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-green-800">
                <span className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Yaklaşan Maçlar ({upcomingMatches.length})
                </span>
                <Link href="/matches/create">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="h-4 w-4 mr-1" />
                    Yeni
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingMatches.length > 0 ? (
                upcomingMatches.map((match) => (
                  <Link key={match.id} href={`/matches/${match.id}/details`}>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors cursor-pointer">
                      <div>
                        <h4 className="font-medium text-green-800">{match.title}</h4>
                        <p className="text-sm text-green-600">
                          {new Date(match.match_date).toLocaleDateString("tr-TR")} •{" "}
                          {new Date(match.match_date).toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-sm text-green-500">{match.field?.name}</p>
                      </div>
                      <Badge
                        className={
                          match.status === "confirmed"
                            ? "bg-green-600 text-white"
                            : "bg-green-100 text-green-700 border-green-200"
                        }
                      >
                        {match.status === "confirmed" ? "Onaylandı" : "Bekliyor"}
                      </Badge>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-green-400 mb-4" />
                  <p className="text-green-600 mb-4">Yaklaşan maçınız yok</p>
                  <Link href="/matches/create">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Maç Organize Edin
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Videos */}
        <Card className="mt-8 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Video className="h-5 w-5 mr-2" />
              Son Videolar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentVideos.map((video) => (
              <div key={video.id} className="flex space-x-3">
                <div className="relative">
                  <img
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    className="w-20 h-12 object-cover rounded border border-green-200"
                  />
                  <span className="absolute bottom-1 right-1 bg-green-800 bg-opacity-75 text-white text-xs px-1 rounded">
                    {video.duration}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-green-800">{video.title}</h4>
                  <p className="text-xs text-green-600">{video.views} görüntüleme</p>
                </div>
              </div>
            ))}
            <Link href="/videos">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Tüm Videoları İzle</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Dynamic Join Requests Panel */}
        <JoinRequestsPanel />
      </div>
    </div>
  )
}
