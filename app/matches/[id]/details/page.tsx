"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Home,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getMatchDetails } from '@/lib/api/matches';

interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  date: string
  time: string
  field: string
  status: "confirmed" | "pending" | "completed"
  matchType: string
  duration: string
  matchFee: string
  notes?: string
  createdBy: string
  participants: Player[]
  pendingRequests: Player[]
  maxPlayers?: number; // Added for max players
  max_members?: number; // Added for max members
  max_players?: number; // Added for max players
}

interface Player {
  id: string
  name: string
  team: string
  position: string
  paymentStatus: "paid" | "pending" | "failed"
  joinedAt: string
}

export default function MatchDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchMatch = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await getMatchDetails(id);
        if (error || !data) {
          setError('Maç bulunamadı veya erişim hatası oluştu.');
        } else {
          setMatch(data);
        }
      } catch (err) {
        setError('Maç bilgileri alınırken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
    // Kullanıcıyı localStorage veya auth'dan çek (gerekirse Supabase'den de alınabilir)
    const userRaw = localStorage.getItem("authUser");
    if (userRaw) setCurrentUser(JSON.parse(userRaw));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600">Maç detayları yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-green-600 mb-4">Maç bilgisi bulunamadı.</p>
        </div>
      </div>
    )
  }

  const homeTeamPlayers = match.participants.filter((p: any) => p.team === match.homeTeam)
  const awayTeamPlayers = match.participants.filter((p: any) => p.team === match.awayTeam)
  const paidPlayers = match.participants.filter((p: any) => p.paymentStatus === "paid")
  const pendingPayments = match.participants.filter((p: any) => p.paymentStatus === "pending")
  const currentUserPaymentStatus = match.participants.find((p: any) => p.name === "Ahmet Yılmaz")?.paymentStatus

  // Katılım isteği gönder
  const handleJoinRequest = () => {
    if (!match || !currentUser) return
    // Zaten pending veya participant ise tekrar ekleme
    if (
      match.pendingRequests.some((p: any) => p.id === currentUser.id) ||
      match.participants.some((p: any) => p.id === currentUser.id)
    ) return
    const updatedMatch: Match = {
      ...match,
      pendingRequests: [...match.pendingRequests, {
        id: currentUser.id,
        name: currentUser.profile?.full_name || "Kullanıcı",
        team: match.homeTeam,
        position: "Oyuncu",
        paymentStatus: "pending",
        joinedAt: new Date().toISOString(),
      }],
    }
    updateMatchInStorage(updatedMatch)
    setMatch(updatedMatch)
  }
  // Takım sahibi onayla/reddet
  const handleApprove = (playerId: string) => {
    if (!match) return
    const player = match.pendingRequests.find((p: any) => p.id === playerId)
    if (!player) return
    const updatedMatch: Match = {
      ...match,
      participants: [...match.participants, { ...player, paymentStatus: "pending" }],
      pendingRequests: match.pendingRequests.filter((p: any) => p.id !== playerId),
    }
    updateMatchInStorage(updatedMatch)
    setMatch(updatedMatch)
  }
  const handleReject = (playerId: string) => {
    if (!match) return
    const updatedMatch = {
      ...match,
      pendingRequests: match.pendingRequests.filter((p: any) => p.id !== playerId),
    }
    updateMatchInStorage(updatedMatch)
    setMatch(updatedMatch)
  }
  // localStorage güncelle
  function updateMatchInStorage(updatedMatch: Match) {
    const userMatches = JSON.parse(localStorage.getItem("userMatches") || "[]")
    const idx = userMatches.findIndex((m: Match) => String(m.id) === String(updatedMatch.id))
    if (idx !== -1) {
      userMatches[idx] = updatedMatch
      localStorage.setItem("userMatches", JSON.stringify(userMatches))
    }
  }

  // Takım üyelerini çek
  function getTeamMembers(teamName: string) {
    const userTeamsRaw = localStorage.getItem("userTeams")
    const userTeams = JSON.parse(!userTeamsRaw || userTeamsRaw === 'undefined' ? '[]' : userTeamsRaw)
    const team = userTeams.find((t: any) => t.name === teamName)
    return team && Array.isArray(team.members) ? team.members : []
  }

  const isOwner = currentUser && match && match.createdBy === currentUser.id
  const homeTeamMembers = match ? getTeamMembers(match.homeTeam) : []
  const awayTeamMembers = match ? getTeamMembers(match.awayTeam) : []

  // Katılımcı ve bekleyenler sadece takımda olanlardan oluşsun
  const filteredParticipants = (match?.participants || []).filter((p: any) =>
    homeTeamMembers.some((m: any) => m.id === p.id) ||
    awayTeamMembers.some((m: any) => m.id === p.id)
  )
  const filteredPendingRequests = (match?.pendingRequests || []).filter((p: any) =>
    homeTeamMembers.some((m: any) => m.id === p.id) ||
    awayTeamMembers.some((m: any) => m.id === p.id)
  )
  // Katılım isteği gönderen kişi gerçekten takımda mı?
  const canJoin = !isOwner &&
    !filteredParticipants.some((p: any) => p.id === currentUser?.id) &&
    !filteredPendingRequests.some((p: any) => p.id === currentUser?.id) &&
    (homeTeamMembers.some((m: any) => m.id === currentUser?.id) ||
     awayTeamMembers.some((m: any) => m.id === currentUser?.id))

  // Katılımcı listesi ve bekleyenler
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
          {/* Match Header */}
          <Card className="mb-8 border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-green-800 flex items-center">
                    <Calendar className="w-6 h-6 mr-2" />
                    {match.homeTeam} vs {match.awayTeam}
                  </CardTitle>
                  <div className="flex items-center space-x-4 mt-2 text-green-600">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {match.date} • {match.time}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {match.field?.name}
                    </span>
                  </div>
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
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-green-700">Takım Başına: ₺{match.matchFee}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <span className="text-green-700">Süre: {match.duration} dakika</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-green-700">Tür: {match.matchType}</span>
                </div>
              </div>
              {match.notes && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-700 text-sm">{match.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Status Alert */}
          {currentUserPaymentStatus === "pending" && (
            <Alert className="mb-8 border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700">
                <div className="flex items-center justify-between">
                  <span>
                    <strong>Ödeme Bekleniyor:</strong> Maça katılabilmek için ödemenizi tamamlamanız gerekiyor.
                  </span>
                  <Link href="/payment">
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Ödeme Yap
                    </Button>
                  </Link>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Teams and Players */}
            <div className="space-y-6">
              {/* Home Team */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800 flex items-center justify-between">
                    <span className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      {match.homeTeam}
                    </span>
                    <Badge className="bg-green-100 text-green-700">{homeTeamPlayers.length} oyuncu</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {homeTeamPlayers.map((player: Player) => (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-green-200 text-green-700 text-xs">
                            {player.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-green-800">{player.name}</p>
                          <p className="text-sm text-green-600">{player.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={
                            player.paymentStatus === "paid"
                              ? "bg-green-600 text-white"
                              : "bg-orange-100 text-orange-700"
                          }
                        >
                          {player.paymentStatus === "paid" ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Ödendi
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Bekliyor
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Away Team */}
              {match.awayTeam !== "Rakip Aranıyor" && (
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-800 flex items-center justify-between">
                      <span className="flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        {match.awayTeam}
                      </span>
                      <Badge className="bg-green-100 text-green-700">{awayTeamPlayers.length} oyuncu</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {awayTeamPlayers.map((player: Player) => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-green-200 text-green-700 text-xs">
                              {player.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-green-800">{player.name}</p>
                            <p className="text-sm text-green-600">{player.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={
                              player.paymentStatus === "paid"
                                ? "bg-green-600 text-white"
                                : "bg-orange-100 text-orange-700"
                            }
                          >
                            {player.paymentStatus === "paid" ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Ödendi
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Bekliyor
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Match Statistics and Actions */}
            <div className="space-y-6">
              {/* Payment Summary */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Ödeme Durumu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">{paidPlayers.length}</div>
                      <div className="text-sm text-green-700">Ödeme Tamamlandı</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-2xl font-bold text-orange-600">{pendingPayments.length}</div>
                      <div className="text-sm text-orange-700">Ödeme Bekliyor</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Toplam Gelir:</span>
                      <span className="font-medium text-green-800">
                        ₺{(paidPlayers.length * Number.parseInt(match.matchFee)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Beklenen Gelir:</span>
                      <span className="font-medium text-green-800">
                        ₺{(pendingPayments.length * Number.parseInt(match.matchFee)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Match Actions */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">İşlemler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/chat/match-${match.id}`}>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => console.log("Match chat clicked")}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Maç Sohbeti
                    </Button>
                  </Link>

                  {currentUserPaymentStatus === "pending" && (
                    <Link href="/payment">
                      <Button
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                        onClick={() => console.log("Payment clicked")}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Ödeme Yap
                      </Button>
                    </Link>
                  )}

                  <Button
                    variant="outline"
                    className="w-full border-green-200 text-green-700 hover:bg-green-50"
                    onClick={() => alert("Maç düzenleme özelliği yakında!")}
                  >
                    Maçı Düzenle
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (confirm("Maçtan çıkmak istediğinizden emin misiniz?")) {
                        router.push("/dashboard/player")
                      }
                    }}
                  >
                    Maçtan Çık
                  </Button>
                </CardContent>
              </Card>

              {/* Match Info */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">Maç Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-600">Oluşturan:</span>
                    <span className="text-green-800">{match.createdBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Toplam Oyuncu:</span>
                    <span className="text-green-800">{match.participants.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Durum:</span>
                    <span className="text-green-800">{match.status === "confirmed" ? "Onaylandı" : "Bekliyor"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Maks Üye:</span>
                    <span className="text-green-800">{match.maxPlayers || match.max_members || match.max_players || '-'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Katılımcılar */}
          <Card className="border-green-200 mt-8">
            <CardHeader>
              <CardTitle className="text-lg text-green-800 flex items-center justify-between">
                <span className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Katılımcılar
                </span>
                <Badge className="bg-green-100 text-green-700">{filteredParticipants.length} kişi</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredParticipants.map((player: Player) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-green-200 text-green-700 text-xs">
                        {player.name.split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-green-800">{player.name}</p>
                      <p className="text-sm text-green-600">{player.position}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-600 text-white">Katıldı</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          {isOwner && filteredPendingRequests.length > 0 && (
            <Card className="border-green-200 mt-4">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">Onay Bekleyenler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredPendingRequests.map((player: Player) => (
                  <div key={player.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-orange-200 text-orange-700 text-xs">
                          {player.name.split(" ").map((n: string) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-orange-800">{player.name}</p>
                        <p className="text-sm text-orange-600">{player.position}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-green-600 text-white" onClick={() => handleApprove(player.id)}>
                        Onayla
                      </Button>
                      <Button size="sm" className="bg-red-600 text-white" onClick={() => handleReject(player.id)}>
                        Reddet
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {canJoin && (
            <Button className="mt-4 bg-green-600 text-white" onClick={handleJoinRequest}>
              Katılmak İstiyorum
            </Button>
          )}
          {!isOwner && (match.pendingRequests || []).some((p: any) => p.id === currentUser?.id) && (
            <Alert className="mt-4 border-orange-200 bg-orange-50">
              <AlertDescription className="text-orange-700">Katılım isteğiniz onay bekliyor.</AlertDescription>
            </Alert>
          )}
          {!isOwner && (match.participants || []).some((p: any) => p.id === currentUser?.id) && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <AlertDescription className="text-green-700">Maça katılımınız onaylandı!</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}
