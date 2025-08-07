"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, ArrowLeft, MapPin, DollarSign, Users, Info, Home } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createMatch } from "@/lib/api/matches"
import { getUserTeams } from "@/lib/api/teams"
import { getFields } from "@/lib/api/fields"
import { getCurrentUser } from "@/lib/api/auth"
import { useAuthContext } from "@/components/AuthProvider"
import FieldAvailability  from "@/components/FieldAvailability"

interface Team {
  id: string
  name: string
  city?: string
}

interface Field {
  id: string
  name: string
  address: string
  hourly_rate: number
  city?: string
  district?: string // <-- ilçe desteği
}

export default function CreateMatchPage() {
  const [formData, setFormData] = useState({
    title: "",
    myTeam: "",
    date: "",
    time: "",
    field: "",
    matchType: "friendly",
    entryFee: "",
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userTeams, setUserTeams] = useState<Team[]>([])
  const [availableFields, setAvailableFields] = useState<Field[]>([])
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [loadingFields, setLoadingFields] = useState(true)
  const router = useRouter()
  const { user } = useAuthContext()
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(1); // 1 veya 2

  // State'ler:
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  // Şehir ve ilçe listeleri (örnek, gerçek veriye göre güncellenebilir):
  // Antalya ve ilçeleri sabit listesi
  const ANTALYA_DISTRICTS = [
    "Aksu", "Alanya", "Demre", "Döşemealtı", "Elmalı", "Finike", "Gazipaşa", "Gündoğmuş", "İbradı", "Kaş", "Kemer", "Kepez", "Konyaaltı", "Korkuteli", "Kumluca", "Manavgat", "Muratpaşa", "Serik"
  ];
  const cityOptions = ["Antalya"];
  const districtOptions = selectedCity === "Antalya" ? ANTALYA_DISTRICTS : [];

  // Filtrelenmiş saha listesi:
  const filteredFields = availableFields.filter(f =>
    (!selectedCity || (f.city || "") === selectedCity) &&
    (!selectedDistrict || (f.district || "") === selectedDistrict)
  );

  // Check authentication and load data
  useEffect(() => {
    const initializePage = async () => {
      // Check authentication
      const { data: userData } = await getCurrentUser()
      if (!userData) {
        router.push("/auth/login")
        return
      }
      setIsAuthenticated(true)

      // Load user teams
      try {
        const { data: teamsData, error: teamsError } = await getUserTeams()
        if (teamsError) {
          console.error("Error loading teams:", teamsError)
        } else if (teamsData) {
          setUserTeams(
            teamsData.map((team: any) => ({
              id: team.team_id,
              name: team.team_name,
              // city: team.city, // eğer city varsa ekle
            }))
          )
        }
      } catch (error) {
        console.error("Error loading teams:", error)
      } finally {
        setLoadingTeams(false)
      }

      // Load available fields
      try {
        const { data: fieldsData, error: fieldsError } = await getFields()
        if (fieldsError) {
          console.error("Error loading fields:", fieldsError)
        } else if (fieldsData) {
          setAvailableFields(fieldsData)
        }
      } catch (error) {
        console.error("Error loading fields:", error)
      } finally {
        setLoadingFields(false)
      }
    }

    initializePage()
  }, [router])

  const selectedField = availableFields.find((f) => f.id === formData.field)
  const fieldCost = selectedField ? selectedField.hourly_rate * selectedDuration : 0;
  const platformFee = fieldCost * 0.1;
  const totalCost = fieldCost + platformFee;

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Maç başlığı zorunludur"
    if (!formData.myTeam) newErrors.myTeam = "Takım seçimi zorunludur"
    if (!formData.date) newErrors.date = "Tarih seçimi zorunludur"
    if (!formData.field) newErrors.field = "Saha seçimi zorunludur"
    if (!formData.time) newErrors.time = "Saat seçimi zorunludur"
    // entryFee kontrolü kaldırıldı

    // Check if date is in the future
    if (formData.date && formData.time) {
      const selectedDate = new Date(formData.date + "T" + formData.time)
      const now = new Date()
      if (selectedDate <= now) {
        newErrors.date = "Maç tarihi gelecekte olmalıdır"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const matchDateTime = new Date(formData.date + "T" + formData.time).toISOString()

      const autoEntryFee = selectedField && selectedTime ? Math.ceil((selectedField.hourly_rate * selectedDuration * 1.1) / 2) : 0;
      const { data, error } = await createMatch({
        title: formData.title,
        description: formData.notes,
        field_id: formData.field,
        organizer_team_id: formData.myTeam,
        match_date: matchDateTime,
        duration_minutes: selectedDuration * 60,
        entry_fee: autoEntryFee,
      })

      if (error) {
        console.error("Match creation error:", error)
        setErrors({ general: "Maç oluşturulurken bir hata oluştu. Lütfen tekrar deneyin." })
        return
      }

      if (data) {
        // Yeni maçı localStorage'a ekle
        const userMatches = JSON.parse(localStorage.getItem("userMatches") || "[]")
        const newMatchId = String(data.id || crypto.randomUUID())
        const homeTeamName = userTeams.find(t => t.id === formData.myTeam)?.name || "Takımım"
        const newMatch = {
          id: newMatchId,
          homeTeam: homeTeamName,
          awayTeam: "Rakip", // Opponent team is removed, so it's always "Rakip"
          date: formData.date,
          time: formData.time,
          field: availableFields.find(f => f.id === formData.field)?.name || "Saha",
          status: "pending",
          matchType: formData.matchType,
          duration: selectedDuration * 60,
          matchFee: autoEntryFee,
          notes: formData.notes,
          createdBy: user?.id || "me",
          participants: [
            {
              id: user?.id || "me",
              name: user?.profile?.full_name || "Maç Sahibi",
              team: homeTeamName,
              position: "Organizatör",
              paymentStatus: "paid",
              joinedAt: new Date().toISOString(),
            }
          ],
          pendingRequests: [],
        }
        userMatches.push(newMatch)
        localStorage.setItem("userMatches", JSON.stringify(userMatches))
        console.log("[DEBUG] userMatches after create:", userMatches)
        console.log("[DEBUG] newMatchId:", newMatchId)
        router.push(`/matches/${newMatchId}/details`)
      }
    } catch (error) {
      console.error("Match creation error:", error)
      setErrors({ general: "Bir hata oluştu. Lütfen tekrar deneyin." })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
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
        <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-green-200">
              <CardHeader>
                <CardTitle className="text-2xl text-green-800 flex items-center">
                  <Calendar className="w-6 h-6 mr-2" />
                  Yeni Maç Organize Et
                </CardTitle>
                <CardDescription>Maç detaylarını belirleyin ve rakip takım davet edin</CardDescription>
              </CardHeader>
              <CardContent>
                {errors.general && (
                  <Alert className="mb-6 border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{errors.general}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Match Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-green-800">
                      Maç Başlığı *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Örn: Dostluk Maçı, Turnuva Karşılaşması"
                      className={`border-green-200 focus:border-green-500 focus:ring-green-500 ${errors.title ? "border-red-500" : ""}`}
                      required
                    />
                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                  </div>

                  {/* Team Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="myTeam" className="flex items-center text-green-800">
                      <Users className="w-4 h-4 mr-2" />
                      Takımınız *
                    </Label>
                    {loadingTeams ? (
                      <div className="flex items-center justify-center p-4 border border-green-200 rounded-md">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                        <span className="text-green-600">Takımlar yükleniyor...</span>
                      </div>
                    ) : userTeams.length === 0 ? (
                      <div className="p-4 border border-green-200 rounded-md bg-green-50">
                        <p className="text-green-700 text-center">
                          Henüz takımınız yok.{" "}
                          <Link href="/teams/create" className="text-green-800 font-medium hover:underline">
                            Takım oluşturun
                          </Link>
                        </p>
                      </div>
                    ) : (
                      <Select
                        value={formData.myTeam}
                        onValueChange={(value) => setFormData({ ...formData, myTeam: value })}
                      >
                        <SelectTrigger
                          className={`border-green-200 focus:border-green-500 focus:ring-green-500 ${errors.myTeam ? "border-red-500" : ""}`}
                        >
                          <SelectValue placeholder="Takımınızı seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {userTeams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name} {team.city && `(${team.city})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {errors.myTeam && <p className="text-sm text-red-500">{errors.myTeam}</p>}
                  </div>


                  {/* Field Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="field" className="flex items-center text-green-800">
                      <MapPin className="w-4 h-4 mr-2" />
                      Saha Seçimi *
                    </Label>
                    {loadingFields ? (
                      <div className="flex items-center justify-center p-4 border border-green-200 rounded-md">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                        <span className="text-green-600">Sahalar yükleniyor...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="flex-1">
                          <Label className="text-green-800">Şehir</Label>
                          <Select value={selectedCity} onValueChange={value => { setSelectedCity(value); setSelectedDistrict(""); }}>
                            <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                              <SelectValue placeholder="Şehir seçin" />
                        </SelectTrigger>
                        <SelectContent>
                              {cityOptions.map(city => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                                </div>
                        <div className="flex-1">
                          <Label className="text-green-800">İlçe</Label>
                          <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedCity}>
                            <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                              <SelectValue placeholder="İlçe seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {districtOptions.map(district => (
                                <SelectItem key={district} value={district}>{district}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                        </div>
                      </div>
                    )}
                    {errors.field && <p className="text-sm text-red-500">{errors.field}</p>}
                  </div>

                  {/* Field Availability (Saat Seçimi) */}
                  {selectedCity && selectedDistrict && (
                    <div className="grid md:grid-cols-2 gap-4 mt-2">
                      {filteredFields.length === 0 ? (
                        <div className="p-4 border border-green-200 rounded-md bg-green-50 text-green-700 col-span-2">Seçilen filtrelere uygun saha bulunamadı.</div>
                      ) : (
                        filteredFields.map(field => (
                          <div
                            key={field.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all duration-150 relative flex flex-col justify-between ${formData.field === field.id ? 'border-green-600 bg-green-50 shadow-lg' : 'border-green-200 bg-white hover:border-green-400'}`}
                            onClick={e => {
                              if ((e.target as HTMLElement).closest('a[data-saha-detay]')) return;
                              setFormData({ ...formData, field: field.id });
                            }}
                      >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-semibold text-green-800 text-lg">{field.name}</div>
                                <div className="text-green-700 font-bold text-md">₺{field.hourly_rate}</div>
                              </div>
                              <div className="text-sm text-gray-700 mb-1">{field.address}</div>
                              <div className="text-xs text-gray-500">{field.city} / {field.district}</div>
                            </div>
                            <div className="flex justify-end mt-4">
                              <a
                                href={`/fields/${field.id}`}
                                data-saha-detay
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded shadow transition-colors duration-100"
                                style={{ minWidth: 120, textAlign: 'center' }}
                                onClick={e => e.stopPropagation()}
                              >
                                Saha Detayı
                              </a>
                            </div>
                          </div>

                        ))
                      )}
                    </div>
                  )}
                  {formData.field && (
                    <>
                      <div className="space-y-2 mb-2">
                        <Label htmlFor="date" className="flex items-center text-green-800">
                          <Calendar className="w-4 h-4 mr-2" />
                          Tarih *
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value, time: "" })}
                          className={`border-green-200 focus:border-green-500 focus:ring-green-500 ${errors.date ? "border-red-500" : ""}`}
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                        {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                      </div>
                      <FieldAvailability
                        fieldId={formData.field}
                        date={formData.date}
                        selectedTime={selectedTime}
                        selectedDuration={selectedDuration}
                        onSelect={(time, duration) => {
                          setSelectedTime(time);
                          setSelectedDuration(duration);
                          setFormData({ ...formData, time });
                        }}
                      />
                      {errors.time && <p className="text-sm text-red-500 mt-1">{errors.time}</p>}
                    </>
                  )}

                  {/* Match Type */}
                    <div className="space-y-2">
                      <Label htmlFor="matchType" className="text-green-800">
                        Maç Türü
                      </Label>
                      <Select
                        value={formData.matchType}
                        onValueChange={(value) => setFormData({ ...formData, matchType: value })}
                      >
                        <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="friendly">Dostluk Maçı</SelectItem>
                          <SelectItem value="tournament">Turnuva Maçı</SelectItem>
                          <SelectItem value="league">Lig Maçı</SelectItem>
                          <SelectItem value="training">Antrenman Maçı</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>

                  {/* Entry Fee */}
                  <div className="space-y-2">
                    <Label className="flex items-center text-green-800">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Maliyet ve Rezervasyon Özeti
                    </Label>
                    <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800">
                      <div className="text-lg font-semibold mb-1">
                        {selectedField && selectedTime ? `${Math.ceil((selectedField.hourly_rate * selectedDuration * 1.1) / 2)} ₺ / Takım` : "Saha ve saat seçin"}
                      </div>
                      {selectedTime && (
                        <div className="text-sm space-y-1">
                          <div><b>Tarih:</b> <span className="font-bold">{formData.date}</span></div>
                          <div><b>Saat:</b> <span className="font-bold">{selectedTime} - {(() => {
                            const HOURS = ["17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00", "01:00", "02:00"];
                            const idx = HOURS.indexOf(selectedTime);
                            return HOURS[idx + selectedDuration] || "?";
                          })()}</span></div>
                          <div><b>Süre:</b> <span className="font-bold">{selectedDuration} saat</span></div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-green-600">Her takım bu ücreti ödeyecektir. Ücret otomatik hesaplanır.</p>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-green-800">
                      Ek Notlar
                    </Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Maç hakkında ek bilgiler, özel kurallar, ekipman gereksinimleri vb."
                      rows={3}
                      className="border-green-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
                      onClick={() => router.back()}
                    >
                      İptal
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      disabled={isLoading || loadingTeams || userTeams.length === 0}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Oluşturuluyor...
                        </div>
                      ) : (
                        "Maçı Oluştur"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Cost Summary */}
          <div className="space-y-6">
            <Card className="shadow-lg border-green-200">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">Maliyet Özeti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedField ? (
                  <>
                    <div className="space-y-2">
                      <div className="font-medium text-green-800">{selectedField.name}</div>
                      <div className="text-sm text-green-600">{selectedField.address}</div>
                      <div className="text-sm text-green-600">
                        {formData.time ? new Date(formData.date + "T" + formData.time).toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' }) : "Süre seçin"}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-green-200">
                      <div className="flex justify-between">
                        <span className="text-green-700">Saha Kirası:</span>
                        <span className="text-green-800">₺{fieldCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Platform Ücreti (10%):</span>
                        <span className="text-green-800">₺{platformFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t border-green-200 pt-2">
                        <span className="text-green-800">Toplam:</span>
                        <span className="text-green-600">₺{totalCost.toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-green-600 text-center">
                        Takım başına: ₺{(totalCost / 2).toFixed(2)}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-green-500 py-8">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Saha seçin</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Alert className="border-green-200 bg-green-50">
              <Info className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                <strong>Bilgi:</strong> Rakip takım maçı onayladıktan sonra ödeme alınacaktır. Maç 24 saat öncesine
                kadar iptal edilebilir.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  )
}
