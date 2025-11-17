"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Home, Calendar, MapPin, Clock, Phone, Star, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuthContext } from "@/components/AuthProvider"
import { useRouter } from "next/navigation"
import { getFields, getFieldReservations } from "@/lib/api/fields"
import Image from "next/image"

const timeSlots = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
]

export default function FieldReservationsPage() {
  const [fields, setFields] = useState<any[]>([])
  const [fieldsLoading, setFieldsLoading] = useState(true)
  const [fieldsError, setFieldsError] = useState("")
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [reservationsByDate, setReservationsByDate] = useState<{ [key: string]: string[] }>({})
  const [reservationsLoading, setReservationsLoading] = useState(false)
  const [reservationsError, setReservationsError] = useState("")
  const { user, loading: authLoading, isAuthenticated } = useAuthContext()
  const router = useRouter()
  const userCity = user?.profile?.city || user?.profile?.preferred_city || ""

  // Authentication kontrolü
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) {
      console.log("Kullanıcı giriş yapmamış, login'e yönlendiriliyor");
      router.push("/auth/login");
      return;
    }
  }, [user, authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return

    const loadFields = async () => {
      setFieldsLoading(true)
      setFieldsError("")
      try {
        const { data, error } = await getFields(userCity ? { city: userCity } : undefined)
        if (error) {
          setFieldsError("Sahalar yüklenemedi.")
        } else {
          setFields(data || [])
          const firstField = data?.[0]
          if (firstField) {
            setSelectedField(String(firstField.id))
          }
        }
      } catch (error) {
        setFieldsError("Sahalar yüklenemedi.")
      } finally {
        setFieldsLoading(false)
      }
    }

    loadFields()
  }, [authLoading, isAuthenticated, userCity])

  useEffect(() => {
    if (!selectedField) {
      setReservationsByDate({})
      return
    }

    let isMounted = true

    const loadReservations = async () => {
      setReservationsLoading(true)
      setReservationsError("")
      try {
        const reservations = await getFieldReservations(selectedField)
        if (!isMounted) return
        const map: { [key: string]: string[] } = {}
        reservations?.forEach((reservation: any) => {
          if (!reservation?.start_time) return
          const dateKey = reservation.start_time.slice(0, 10)
          const hour = reservation.start_time.slice(11, 16)
          if (!map[dateKey]) map[dateKey] = []
          if (!map[dateKey].includes(hour)) {
            map[dateKey].push(hour)
          }
        })
        setReservationsByDate(map)
      } catch (error) {
        if (isMounted) {
          setReservationsError("Rezervasyonlar yüklenemedi.")
          setReservationsByDate({})
        }
      } finally {
        if (isMounted) {
          setReservationsLoading(false)
        }
      }
    }

    loadReservations()

    return () => {
      isMounted = false
    }
  }, [selectedField])

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const isSlotReserved = (time: string) => {
    const dateKey = formatDate(selectedDate)
    return reservationsByDate[dateKey]?.includes(time) || false
  }

  const handleDateChange = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate)
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setSelectedDate(newDate)
  }

  const handleReservation = (fieldId: string, time: string) => {
    const field = fields.find((f) => String(f.id) === String(fieldId))
    alert(
      `${field?.name || "Saha"} için ${formatDate(selectedDate)} tarihinde ${time} saatinde rezervasyon talebi gönderildi!`,
    )
  }

  const getDayName = (date: Date) => {
    const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"]
    return days[date.getDay()]
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
              Saha Rezervasyonları
            </h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Field Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-green-200">
          <h2 className="text-lg font-semibold text-green-800 mb-4">Saha Seçin</h2>
          {fieldsLoading ? (
            <div className="py-6 text-center text-green-600">Sahalar yükleniyor...</div>
          ) : fieldsError ? (
            <div className="py-6 text-center text-red-600">{fieldsError}</div>
          ) : fields.length === 0 ? (
            <div className="py-6 text-center text-green-700">
              {userCity ? `${userCity} şehrinde listelenen saha bulunamadı.` : "Henüz saha bulunamadı."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {fields.map((field) => (
                <Card
                  key={field.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    String(selectedField) === String(field.id)
                      ? "ring-2 ring-green-500 border-green-300"
                      : "border-green-200 hover:border-green-300"
                  }`}
                  onClick={() => setSelectedField(String(field.id))}
                >
                  <CardHeader className="pb-3">
                    <div className="w-full h-32 relative mb-3 rounded-md overflow-hidden bg-green-50">
                      <Image
                        src={field.images?.[0] || "/placeholder.svg"}
                        alt={field.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <CardTitle className="text-green-800">{field.name}</CardTitle>
                    <div className="flex items-center text-sm text-green-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      {field.city
                        ? `${field.city}${field.district ? `, ${field.district}` : ""}`
                        : field.address || "Konum bilgisi yok"}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium">{field.rating || "4.5"}</span>
                        </div>
                        <Badge className="bg-green-100 text-green-700">
                          ₺{Number(field.hourly_rate || 0)}/saat
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-green-600">
                        <Phone className="h-3 w-3 mr-1" />
                        {field.owner?.phone || "İletişim bilgisi yok"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {selectedField && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-green-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-green-800">
                {fields.find((f) => String(f.id) === String(selectedField))?.name || "Saha"} - Rezervasyon Takvimi
              </h2>

              {/* Date Navigation */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateChange("prev")}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center">
                  <div className="font-semibold text-green-800">{selectedDate.toLocaleDateString("tr-TR")}</div>
                  <div className="text-sm text-green-600">{getDayName(selectedDate)}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateChange("next")}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Time Slots Grid */}
            {reservationsLoading ? (
              <div className="text-center text-green-600 py-6">Rezervasyon durumu yükleniyor...</div>
            ) : reservationsError ? (
              <div className="text-center text-red-600 py-6">{reservationsError}</div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-3">
                {timeSlots.map((time) => {
                  const isReserved = isSlotReserved(time)
                  return (
                    <Button
                      key={time}
                      variant={isReserved ? "secondary" : "outline"}
                      className={`h-16 flex flex-col items-center justify-center ${
                        isReserved
                          ? "bg-red-100 text-red-700 border-red-200 cursor-not-allowed"
                          : "border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                      }`}
                      disabled={isReserved}
                      onClick={() => !isReserved && selectedField && handleReservation(selectedField, time)}
                    >
                      <Clock className="h-4 w-4 mb-1" />
                      <span className="text-sm font-medium">{time}</span>
                      <span className="text-xs">{isReserved ? "Dolu" : "Boş"}</span>
                    </Button>
                  )
                })}
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 mt-6 pt-6 border-t border-green-200">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
                <span className="text-sm text-green-700">Müsait</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                <span className="text-sm text-green-700">Rezerve</span>
              </div>
            </div>

            {/* Field Info */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-green-800">Rezervasyon Bilgileri</h3>
                  <p className="text-sm text-green-600 mt-1">
                    Saatlik ücret: ₺
                    {Number(fields.find((f) => String(f.id) === String(selectedField))?.hourly_rate || 0)}
                  </p>
                  <p className="text-sm text-green-600">
                    Telefon: {fields.find((f) => String(f.id) === String(selectedField))?.owner?.phone || "-"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="font-medium text-green-800">
                      {fields.find((f) => String(f.id) === String(selectedField))?.rating || "4.5"}
                    </span>
                  </div>
                  <p className="text-sm text-green-600">Değerlendirme</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!selectedField && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8 border border-green-200">
              <Calendar className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-800 mb-2">Saha Seçin</h3>
              <p className="text-green-600">Rezervasyon takvimini görüntülemek için yukarıdan bir saha seçin.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
