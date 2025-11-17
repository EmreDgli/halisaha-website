"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, MapPin, Send, User } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getTeamDetails, requestToJoinTeam } from "@/lib/api/teams"

interface Team {
  id: string
  name: string
  description?: string
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

export default function JoinTeamPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated } = useAuth()
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const teamId = params.id as string

  useEffect(() => {
    const loadTeamDetails = async () => {
      try {
        setLoading(true)
        const { data, error } = await getTeamDetails(teamId)
        if (error) {
          console.error("Error loading team details:", error)
          setError("Takım bilgileri yüklenemedi")
        } else if (data) {
          setTeam(data)
        }
      } catch (error) {
        console.error("Error loading team details:", error)
        setError("Takım bilgileri yüklenemedi")
      } finally {
        setLoading(false)
      }
    }

    if (teamId) {
      loadTeamDetails()
    }
  }, [teamId])

  const handleJoinRequest = async () => {
    if (!isAuthenticated || !user) {
      setError("Giriş yapmanız gerekiyor")
      return
    }

    if (!team) {
      setError("Takım bilgileri bulunamadı")
      return
    }

    try {
      setSubmitting(true)
      setError("")
      
      const { error } = await requestToJoinTeam(teamId, message)
      
      if (error) {
        console.error("Error requesting to join team:", error)
        setError("Katılım isteği gönderilemedi")
      } else {
        router.push("/dashboard/player?message=join-request-sent")
      }
    } catch (error) {
      console.error("Error requesting to join team:", error)
      setError("Katılım isteği gönderilemedi")
    } finally {
      setSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-center text-green-800 mb-4">
              Giriş Yapın
            </h2>
            <p className="text-center text-green-600 mb-6">
              Takıma katılmak için giriş yapmanız gerekiyor.
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
      <div className="bg-white shadow-sm border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/teams">
                <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-800 hover:bg-green-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Takımlara Dön
                </Button>
              </Link>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                Takıma Katıl
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/player">
                <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-800 hover:bg-green-50">
                  <User className="h-4 w-4 mr-2" />
                  Panelim
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-green-200 rounded w-1/3"></div>
                <div className="h-4 bg-green-200 rounded w-1/2"></div>
                <div className="h-4 bg-green-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-red-800 mb-2">Hata</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <Link href="/teams">
                  <Button variant="outline" className="border-red-600 text-red-700">
                    Takımlara Dön
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : team ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-green-800">
                  <span>{team.name}</span>
                  <Badge className="bg-green-600 text-white">
                    {team.skill_level || "Orta"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {team.description && (
                  <p className="text-green-700">{team.description}</p>
                )}
                
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

                <div className="text-sm text-green-500">
                  Oluşturulma: {new Date(team.created_at || "").toLocaleDateString("tr-TR")}
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Katılım İsteği</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    Mesajınız (İsteğe bağlı)
                  </label>
                  <Textarea
                    placeholder="Takım yöneticisine söylemek istediğiniz bir şey var mı?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="border-green-200 focus:border-green-500"
                    rows={4}
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">Bilgilendirme</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Katılım isteğiniz takım yöneticisine gönderilecek</li>
                    <li>• Yönetici isteğinizi onaylayabilir veya reddedebilir</li>
                    <li>• İşlem sonucu size bildirim olarak gelecek</li>
                    <li>• Onaylandıktan sonra takım üyesi olacaksınız</li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <Link href="/teams">
                    <Button variant="outline" className="border-green-600 text-green-700">
                      İptal
                    </Button>
                  </Link>
                  <Button 
                    onClick={handleJoinRequest}
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700 text-white flex-1"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Katılım İsteği Gönder
                      </>
                    )}
                  </Button>
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-red-800 mb-2">Takım Bulunamadı</h3>
                <p className="text-red-600 mb-4">Aradığınız takım mevcut değil veya silinmiş olabilir.</p>
                <Link href="/teams">
                  <Button variant="outline" className="border-red-600 text-red-700">
                    Takımlara Dön
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 