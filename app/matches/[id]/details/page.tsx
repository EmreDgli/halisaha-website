"use client"

import { useState, useEffect, use } from "react"
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
}

interface Player {
  id: number
  name: string
  team: string
  position: string
  paymentStatus: "paid" | "pending" | "failed"
  joinedAt: string
}

export default function MatchDetailsPage({ params }: { params: any }) {
  const { id } = use(params) as any
  const [match, setMatch] = useState<Match | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const router = useRouter()

  useEffect(() => {
    // Load match details from localStorage
    const storedMatches = JSON.parse(localStorage.getItem("userMatches") || "[]")
    console.log("[DEBUG] storedMatches:", storedMatches)
    console.log("[DEBUG] params.id:", id)
    const foundMatch = storedMatches.find((m: Match) => m.id === String(id))

    if (foundMatch) {
      setMatch(foundMatch)

      // Mock players data
      setPlayers([
        {
          id: 1,
          name: "Ahmet Yılmaz",
          team: foundMatch.homeTeam,
          position: "Orta Saha",
          paymentStatus: "paid",
          joinedAt: "2 gün önce",
        },
        {
          id: 2,
          name: "Mehmet Kaya",
          team: foundMatch.homeTeam,
          position: "Forvet",
          paymentStatus: "paid",
          joinedAt: "2 gün önce",
        },
        {
          id: 3,
          name: "Ali Demir",
          team: foundMatch.homeTeam,
          position: "Defans",
          paymentStatus: "pending",
          joinedAt: "1 gün önce",
        },
        {
          id: 4,
          name: "Can Özkan",
          team: foundMatch.awayTeam,
          position: "Kaleci",
          paymentStatus: "paid",
          joinedAt: "1 gün önce",
        },
        {
          id: 5,
          name: "Emre Yıldız",
          team: foundMatch.awayTeam,
          position: "Orta Saha",
          paymentStatus: "pending",
          joinedAt: "6 saat önce",
        },
      ])
    }
  }, [id])

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600">Maç detayları yükleniyor...</p>
        </div>
      </div>
    )
  }

  const homeTeamPlayers = players.filter((p) => p.team === match.homeTeam)
  const awayTeamPlayers = players.filter((p) => p.team === match.awayTeam)
  const paidPlayers = players.filter((p) => p.paymentStatus === "paid")
  const pendingPayments = players.filter((p) => p.paymentStatus === "pending")
  const currentUserPaymentStatus = players.find((p) => p.name === "Ahmet Yılmaz")?.paymentStatus

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
                      {match.field}
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
                  {homeTeamPlayers.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-green-200 text-green-700 text-xs">
                            {player.name
                              .split(" ")
                              .map((n) => n[0])
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
                    {awayTeamPlayers.map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-green-200 text-green-700 text-xs">
                              {player.name
                                .split(" ")
                                .map((n) => n[0])
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
                    <span className="text-green-800">{players.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Durum:</span>
                    <span className="text-green-800">{match.status === "confirmed" ? "Onaylandı" : "Bekliyor"}</span>
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
