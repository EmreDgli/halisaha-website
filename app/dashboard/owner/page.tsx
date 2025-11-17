"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, DollarSign, Plus, Clock, MapPin, Video, Upload, Eye, Star, Home, User } from "lucide-react"
import Link from "next/link"
import { getOwnerFields, getFieldReservations } from "@/lib/api/fields"
import { logoutUser } from '@/lib/api/auth'
import { useRouter } from 'next/navigation'
import { useAuthContext } from "@/components/AuthProvider"

interface MatchVideo {
  id: number
  matchId: number
  title: string
  description: string
  videoUrl: string
  uploadDate: string
  views: number
  rating: number
  totalRatings: number
  match: {
    homeTeam: string
    awayTeam: string
    date: string
    score: string
  }
}

interface BookingSummary {
  id: string | number
  fieldName: string
  team: string
  startTime?: string
  endTime?: string
  amount?: number
  status?: string
}

export default function OwnerDashboard() {
  const [myFields, setMyFields] = useState<any[]>([])
  const [fieldsLoading, setFieldsLoading] = useState(true)
  const [fieldsError, setFieldsError] = useState("")
  const [upcomingBookings, setUpcomingBookings] = useState<BookingSummary[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookingsError, setBookingsError] = useState("")
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated, isInitialized } = useAuthContext()

  useEffect(() => {
    if (!authLoading && isInitialized && !isAuthenticated) {
      console.log("Unauthenticated user, redirecting to login");
      router.push("/auth/login");
    }
  }, [authLoading, isInitialized, isAuthenticated, router]);

  // Show loading state while auth is loading
  if (authLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Show loading state if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600">Giriş yapılıyor...</p>
        </div>
      </div>
    )
  }

  const [myVideos] = useState<MatchVideo[]>([
    {
      id: 1,
      matchId: 1,
      title: "Yıldızlar FC vs Galibiyetspor - Muhteşem Maç",
      description: "Harika goller ve müthiş aksiyonlarla dolu maç",
      videoUrl: "/videos/match1.mp4",
      uploadDate: "2024-01-10",
      views: 245,
      rating: 4.5,
      totalRatings: 32,
      match: {
        homeTeam: "Yıldızlar FC",
        awayTeam: "Galibiyetspor",
        date: "2024-01-08",
        score: "3-2",
      },
    },
    {
      id: 2,
      matchId: 2,
      title: "Şampiyonlar vs Dostluk SK - Nefes Kesen Final",
      description: "Penaltılarla sonuçlanan dramatik maç",
      videoUrl: "/videos/match2.mp4",
      uploadDate: "2024-01-12",
      views: 189,
      rating: 4.2,
      totalRatings: 28,
      match: {
        homeTeam: "Şampiyonlar",
        awayTeam: "Dostluk SK",
        date: "2024-01-11",
        score: "2-2 (4-3 pen)",
      },
    },
  ])

  const totalRevenue = myFields.reduce((sum, field) => sum + (Number(field.revenue) || 0), 0)
  const totalBookings = myFields.reduce((sum, field) => sum + (Number(field.bookings) || 0), 0)
  const totalVideoViews = myVideos.reduce((sum, video) => sum + (Number(video.views) || 0), 0)

  useEffect(() => {
    const loadFields = async () => {
      setFieldsLoading(true)
      setFieldsError("")
      try {
        const { data, error } = await getOwnerFields()
        if (error) setFieldsError("Sahalar yüklenemedi.")
        else setMyFields(data || [])
      } catch (e) {
        setFieldsError("Sahalar yüklenemedi.")
      } finally {
        setFieldsLoading(false)
      }
    }
    loadFields()
  }, [])

  useEffect(() => {
    if (fieldsLoading || !isAuthenticated) return

    let isMounted = true

    const loadUpcomingBookings = async () => {
      setBookingsLoading(true)
      setBookingsError("")

      if (!myFields.length) {
        if (isMounted) {
          setUpcomingBookings([])
          setBookingsLoading(false)
        }
        return
      }

      try {
        const reservationsByField = await Promise.all(
          myFields.map(async (field) => {
            try {
              const reservations = await getFieldReservations(field.id)
              return { field, reservations: reservations || [] }
            } catch (error) {
              console.error("Rezervasyonlar yüklenirken hata:", error)
              return { field, reservations: [] }
            }
          })
        )

        const now = new Date()
        const normalized = reservationsByField.flatMap(({ field, reservations }) =>
          (reservations || []).map((reservation: any) => ({
            id: reservation.id,
            fieldName: field.name,
            team:
              reservation.title ||
              reservation.team_name ||
              reservation.contact_name ||
              "Rezerve",
            startTime: reservation.start_time,
            endTime: reservation.end_time,
            amount:
              Number(
                reservation.amount ??
                  reservation.price ??
                  reservation.total_price ??
                  field.hourly_rate
              ) || undefined,
            status: reservation.status || "pending",
          }))
        )

        const upcoming = normalized
          .filter((booking) => booking.startTime && new Date(booking.startTime) >= now)
          .sort(
            (a, b) =>
              new Date(a.startTime || 0).getTime() - new Date(b.startTime || 0).getTime()
          )
          .slice(0, 5)

        if (isMounted) {
          setUpcomingBookings(upcoming)
        }
      } catch (error) {
        console.error("Yaklaşan rezervasyonlar yüklenirken hata:", error)
        if (isMounted) {
          setBookingsError("Rezervasyonlar yüklenemedi.")
          setUpcomingBookings([])
        }
      } finally {
        if (isMounted) {
          setBookingsLoading(false)
        }
      }
    }

    loadUpcomingBookings()

    return () => {
      isMounted = false
    }
  }, [myFields, fieldsLoading, isAuthenticated])

  const formatBookingDate = (iso?: string) => {
    if (!iso) return "-"
    try {
      return new Date(iso).toLocaleDateString("tr-TR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    } catch {
      return "-"
    }
  }

  const formatBookingTimeRange = (start?: string, end?: string) => {
    if (!start) return "-"
    try {
      const startLabel = new Date(start).toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      })
      if (!end) return startLabel
      const endLabel = new Date(end).toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      })
      return `${startLabel} - ${endLabel}`
    } catch {
      return "-"
    }
  }

  const getStatusLabel = (status?: string) => {
    if (!status) return "Bekliyor"
    const map: Record<string, string> = {
      confirmed: "Onaylandı",
      pending: "Bekliyor",
      cancelled: "İptal",
      completed: "Tamamlandı",
    }
    return map[status] || status
  }

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const handleLogout = async () => {
    await logoutUser()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                Saha Sahibi Paneli
              </h1>
              <p className="text-gray-600">Sahalarınızı yönetin ve videolarınızı paylaşın</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/profile">
              <Button variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                <User className="w-4 h-4 mr-2" />
                Profilim
              </Button>
            </Link>
            <Link href="/videos">
              <Button variant="outline" size="sm">
                <Video className="w-4 h-4 mr-2" />
                Tüm Videolar
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Anasayfa
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Çıkış Yap
            </Button>
            {/* Panel geçiş butonu */}
            {typeof window !== 'undefined' && window.localStorage && (() => {
              try {
                const userStr = window.localStorage.getItem('currentUser');
                if (userStr) {
                  const user = JSON.parse(userStr);
                  if (user?.roles?.includes("player") && user?.roles?.includes("field_owner")) {
                    return (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-600 text-green-700 hover:bg-green-50"
                        onClick={() => window.location.href = "/dashboard/player"}
                      >
                        Oyuncu Paneline Geç
                      </Button>
                    );
                  }
                }
              } catch (e) {}
              return null;
            })()}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Genel Bakış
            </TabsTrigger>
            <TabsTrigger value="fields" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Sahalarım
            </TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Rezervasyonlar
            </TabsTrigger>
            <TabsTrigger value="videos" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Videolarım
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Analitik
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-5 gap-6">
              <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Toplam Gelir</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₺{totalRevenue.toLocaleString()}</div>
                  <p className="text-xs opacity-75">Bu ay</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Toplam Rezervasyon</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBookings}</div>
                  <p className="text-xs opacity-75">Bu ay</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Aktif Sahalar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{myFields.length}</div>
                  <p className="text-xs opacity-75">Toplam</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Yüklenen Video</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{myVideos.length}</div>
                  <p className="text-xs opacity-75">Toplam</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Video İzlenme</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalVideoViews}</div>
                  <p className="text-xs opacity-75">Toplam</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Bookings */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-green-800">
                  <span className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Yaklaşan Rezervasyonlar
                  </span>
                  <Link href="/bookings">
                    <Button variant="outline" size="sm">
                      Tümünü Gör
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="text-center text-green-600 py-6">Rezervasyonlar yükleniyor...</div>
                ) : bookingsError ? (
                  <div className="text-center text-red-600 py-6">{bookingsError}</div>
                ) : upcomingBookings.length === 0 ? (
                  <div className="text-center text-gray-500 py-6">Yaklaşan rezervasyon bulunmuyor.</div>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-1">
                          <div className="font-medium">{booking.team}</div>
                          <div className="text-sm text-gray-600">{booking.fieldName}</div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatBookingDate(booking.startTime)} •{" "}
                            {formatBookingTimeRange(booking.startTime, booking.endTime)}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="font-semibold text-green-600">
                            {booking.amount ? `₺${booking.amount}` : "-"}
                          </div>
                          <Badge variant={getStatusVariant(booking.status)}>
                            {getStatusLabel(booking.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-green-800">Hızlı İşlemler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/fields/create">
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => console.log("Create field clicked")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Yeni Saha Ekle
                    </Button>
                  </Link>
                  <Link href="/videos/upload">
                    <Button
                      className="w-full justify-start bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      onClick={() => console.log("Upload video clicked")}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Maç Videosu Yükle
                    </Button>
                  </Link>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => alert("Fiyat güncelleme özelliği yakında!")}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Fiyat Güncelle
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-green-800">En Popüler Video</CardTitle>
                </CardHeader>
                <CardContent>
                  {myVideos[0] && (
                    <div className="space-y-2">
                      <div className="font-semibold">{myVideos[0].title}</div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Eye className="w-4 h-4 mr-1" />
                        {myVideos[0].views} izlenme
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                        {myVideos[0].rating} ({myVideos[0].totalRatings} oy)
                      </div>
                      <div className="text-sm text-gray-600">
                        {myVideos[0].match.homeTeam} vs {myVideos[0].match.awayTeam}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fields" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-green-800">Sahalarım</h2>
              <Link href="/fields/create">
                <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Saha
                </Button>
              </Link>
            </div>

            {fieldsLoading ? (
              <div className="text-center text-green-600 py-8">Sahalar yükleniyor...</div>
            ) : fieldsError ? (
              <div className="text-center text-red-600 py-8">{fieldsError}</div>
            ) : myFields.length === 0 ? (
              <div className="text-center text-green-600 py-8">Henüz hiç saha eklemediniz.</div>
            ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {myFields.map((field) => (
                <Card key={field.id} className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-green-800">
                      {field.name}
                      <Badge variant="default" className="bg-green-100 text-green-700">
                        Aktif
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      <MapPin className="w-4 h-4 inline mr-1" />
                        {field.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Saatlik Ücret:</span>
                          <span className="font-semibold">₺{Number(field.hourly_rate) || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Şehir / İlçe:</span>
                        <span className="font-semibold">{field.city || "-"} / {field.district || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Açıklama:</span>
                        <span className="font-semibold">{field.description || "-"}</span>
                      </div>
                      <div className="flex space-x-2 pt-2">
                          <Link href={`/fields/${field.id}/edit`} className="flex-1">
                            <Button size="sm" variant="outline" className="w-full">
                          Düzenle
                        </Button>
                          </Link>
                          <Link href={`/fields/${field.id}/reservations`} className="flex-1">
                            <Button size="sm" variant="outline" className="w-full">
                          Takvim
                        </Button>
                          </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <h2 className="text-2xl font-bold text-green-800">Rezervasyon Yönetimi</h2>

            {bookingsLoading ? (
              <div className="text-center text-green-600 py-8">Rezervasyonlar yükleniyor...</div>
            ) : bookingsError ? (
              <div className="text-center text-red-600 py-8">{bookingsError}</div>
            ) : upcomingBookings.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Henüz yaklaşan rezervasyon bulunmuyor.</div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <Card key={booking.id} className="shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="font-semibold text-lg">{booking.team}</div>
                          <div className="text-sm text-gray-600">{booking.fieldName}</div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatBookingDate(booking.startTime)} •{" "}
                              {formatBookingTimeRange(booking.startTime, booking.endTime)}
                            </div>
                            <div className="font-semibold text-green-600">
                              {booking.amount ? `₺${booking.amount}` : "-"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusVariant(booking.status)}>
                            {getStatusLabel(booking.status)}
                          </Badge>
                          {booking.status === "pending" && (
                            <div className="space-x-2">
                              <Button size="sm" variant="outline">
                                Reddet
                              </Button>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                Onayla
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="videos" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-green-800">Videolarım</h2>
              <Link href="/videos/upload">
                <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                  <Upload className="w-4 h-4 mr-2" />
                  Video Yükle
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myVideos.map((video) => (
                <Card key={video.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="p-0">
                    <div className="relative">
                      <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                        <Video className="w-12 h-12 text-gray-400" />
                      </div>
                      <Badge className="absolute top-2 right-2 bg-black/70 text-white">{video.views} izlenme</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-green-800 line-clamp-2">{video.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {video.match.homeTeam} vs {video.match.awayTeam}
                        </p>
                        <p className="text-sm text-gray-500">
                          {video.match.date} • {video.match.score}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{video.rating}</span>
                          <span className="text-sm text-gray-500">({video.totalRatings})</span>
                        </div>
                        <span className="text-xs text-gray-500">{video.uploadDate}</span>
                      </div>

                      <div className="flex space-x-2">
                        <Link href={`/videos/${video.id}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full">
                            <Eye className="w-4 h-4 mr-1" />
                            İzle
                          </Button>
                        </Link>
                        <Link href={`/videos/${video.id}/edit`} className="flex-1">
                          <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                            Düzenle
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {myVideos.length === 0 && (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <Video className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Henüz video yüklemediniz</h3>
                  <p className="text-gray-500 mb-6">
                    Sahalarınızda oynanan maçların videolarını yükleyerek izleyicilerle paylaşın
                  </p>
                  <Link href="/videos/upload">
                    <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                      <Upload className="w-4 h-4 mr-2" />
                      İlk Videonuzu Yükleyin
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold text-green-800">Analitik ve Raporlar</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-green-800">Aylık Gelir Trendi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Grafik burada görüntülenecek
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-green-800">Video İzlenme İstatistikleri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myVideos.map((video) => (
                      <div key={video.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="truncate">{video.title}</span>
                          <span>{video.views} izlenme</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(video.views / Math.max(...myVideos.map((v) => v.views))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-green-800">Saha Doluluk Oranları</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myFields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{field.name}</span>
                          <span>78%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: "78%" }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-green-800">Video Puanları</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {myVideos.map((video) => (
                      <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{video.title}</p>
                          <p className="text-sm text-gray-500">{video.totalRatings} değerlendirme</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{video.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
