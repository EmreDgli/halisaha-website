"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Home, Video, Save, Trash2, Plus, User, Info } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Goal {
  id: number
  minute: number
  second: number
  player: string
  team: string
}

export default function EditVideoPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    title: "Yıldızlar FC vs Galibiyetspor - Muhteşem Maç",
    description: "Harika goller ve müthiş aksiyonlarla dolu maç. Son dakika golü ile kazanılan nefes kesen karşılaşma.",
  })

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 1,
      minute: 12,
      second: 34,
      player: "Ahmet Yılmaz",
      team: "Yıldızlar FC",
    },
    {
      id: 2,
      minute: 28,
      second: 45,
      player: "Mehmet Kaya",
      team: "Galibiyetspor",
    },
  ])

  const [newGoal, setNewGoal] = useState({
    minute: "",
    second: "",
    player: "",
    team: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const video = {
    id: Number.parseInt(params.id),
    match: {
      homeTeam: "Yıldızlar FC",
      awayTeam: "Galibiyetspor",
      date: "2024-01-08",
      score: "3-2",
      field: "Merkez Halı Saha",
    },
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Video updated:", { ...formData, goals })
      router.push(`/videos/${params.id}`)
    } catch (error) {
      console.error("Update error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddGoal = () => {
    if (newGoal.minute && newGoal.second && newGoal.player && newGoal.team) {
      const goal: Goal = {
        id: Date.now(),
        minute: Number.parseInt(newGoal.minute),
        second: Number.parseInt(newGoal.second),
        player: newGoal.player,
        team: newGoal.team,
      }
      setGoals([...goals, goal])
      setNewGoal({ minute: "", second: "", player: "", team: "" })
    }
  }

  const handleRemoveGoal = (goalId: number) => {
    setGoals(goals.filter((goal) => goal.id !== goalId))
  }

  const formatTime = (minute: number, second: number) => {
    return `${minute}:${second.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href={`/videos/${params.id}`} className="flex items-center text-green-600 hover:text-green-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Video Detayına Dön
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/videos" className="flex items-center text-green-600 hover:text-green-700">
              <Video className="w-4 h-4 mr-2" />
              Tüm Videolar
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/" className="flex items-center text-green-600 hover:text-green-700">
              <Home className="w-4 h-4 mr-2" />
              Anasayfa
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/dashboard/owner">
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                Saha Sahibi Paneli
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Edit Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-green-800 flex items-center">
                  <Video className="w-6 h-6 mr-2" />
                  Video Düzenle
                </CardTitle>
                <CardDescription>Video bilgilerini ve gol anlarını düzenleyin</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Video Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Video Başlığı</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Video başlığını girin"
                      required
                    />
                  </div>

                  {/* Video Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Video Açıklaması</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Video hakkında açıklama yazın"
                      rows={4}
                    />
                  </div>

                  {/* Goals Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold">Gol Anları</Label>
                      <span className="text-sm text-gray-500">{goals.length} gol</span>
                    </div>

                    {/* Existing Goals */}
                    <div className="space-y-3">
                      {goals.map((goal) => (
                        <div
                          key={goal.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">
                                {formatTime(goal.minute, goal.second)}
                              </div>
                              <div className="text-xs text-gray-500">Dakika</div>
                            </div>
                            <div>
                              <div className="font-medium">{goal.player}</div>
                              <div className="text-sm text-gray-600">{goal.team}</div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveGoal(goal.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Add New Goal */}
                    <Card className="border-dashed border-2 border-gray-300">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <h4 className="font-medium text-green-800">Yeni Gol Ekle</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <Label htmlFor="minute" className="text-sm">
                                Dakika
                              </Label>
                              <Input
                                id="minute"
                                type="number"
                                min="0"
                                max="120"
                                value={newGoal.minute}
                                onChange={(e) => setNewGoal({ ...newGoal, minute: e.target.value })}
                                placeholder="45"
                              />
                            </div>
                            <div>
                              <Label htmlFor="second" className="text-sm">
                                Saniye
                              </Label>
                              <Input
                                id="second"
                                type="number"
                                min="0"
                                max="59"
                                value={newGoal.second}
                                onChange={(e) => setNewGoal({ ...newGoal, second: e.target.value })}
                                placeholder="30"
                              />
                            </div>
                            <div>
                              <Label htmlFor="player" className="text-sm">
                                Oyuncu
                              </Label>
                              <Input
                                id="player"
                                value={newGoal.player}
                                onChange={(e) => setNewGoal({ ...newGoal, player: e.target.value })}
                                placeholder="Oyuncu adı"
                              />
                            </div>
                            <div>
                              <Label htmlFor="team" className="text-sm">
                                Takım
                              </Label>
                              <Input
                                id="team"
                                value={newGoal.team}
                                onChange={(e) => setNewGoal({ ...newGoal, team: e.target.value })}
                                placeholder="Takım adı"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            onClick={handleAddGoal}
                            className="w-full bg-green-600 hover:bg-green-700"
                            disabled={!newGoal.minute || !newGoal.second || !newGoal.player || !newGoal.team}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Gol Ekle
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex space-x-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
                      İptal
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Kaydediliyor...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Save className="w-4 h-4 mr-2" />
                          Değişiklikleri Kaydet
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Match Info */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">Maç Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-800 mb-2">{video.match.homeTeam}</div>
                  <div className="text-3xl font-bold text-green-600 my-3">{video.match.score}</div>
                  <div className="text-xl font-bold text-green-800">{video.match.awayTeam}</div>
                </div>

                <div className="space-y-2 pt-3 border-t">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tarih:</span>
                    <span className="font-medium">{video.match.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saha:</span>
                    <span className="font-medium">{video.match.field}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Guidelines */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">Düzenleme İpuçları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-sm font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Açıklayıcı Başlık</p>
                      <p className="text-xs text-gray-600">Maç hakkında bilgi veren başlık seçin</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-sm font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Gol Anları</p>
                      <p className="text-xs text-gray-600">Doğru dakika ve saniye bilgisi girin</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-sm font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Oyuncu İsimleri</p>
                      <p className="text-xs text-gray-600">Gol atan oyuncuların tam adını yazın</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Bilgi:</strong> Gol anları izleyicilerin videoda hızlıca istediği anları bulmasını sağlar. Doğru
                zaman damgası girdiğinizden emin olun.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  )
}
