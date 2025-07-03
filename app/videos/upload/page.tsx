"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, ArrowLeft, Video, FileVideo, Info, CheckCircle, Home } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Match {
  id: number
  homeTeam: string
  awayTeam: string
  date: string
  time: string
  field: string
  score?: string
}

export default function VideoUploadPage() {
  const [formData, setFormData] = useState({
    matchId: "",
    title: "",
    description: "",
    videoFile: null as File | null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const router = useRouter()

  // Sample completed matches for the field owner
  const completedMatches: Match[] = [
    {
      id: 1,
      homeTeam: "Yıldızlar FC",
      awayTeam: "Galibiyetspor",
      date: "2024-01-08",
      time: "19:00",
      field: "Merkez Halı Saha",
      score: "3-2",
    },
    {
      id: 2,
      homeTeam: "Şampiyonlar",
      awayTeam: "Dostluk SK",
      date: "2024-01-11",
      time: "20:30",
      field: "Spor Kompleksi",
      score: "2-2",
    },
    {
      id: 3,
      homeTeam: "Kartallar FC",
      awayTeam: "Aslanlar SK",
      date: "2024-01-05",
      time: "18:00",
      field: "Merkez Halı Saha",
      score: "1-0",
    },
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.matchId) newErrors.matchId = "Maç seçimi zorunludur"
    if (!formData.title.trim()) newErrors.title = "Video başlığı zorunludur"
    if (formData.title.length < 5) newErrors.title = "Başlık en az 5 karakter olmalıdır"
    if (!formData.videoFile) newErrors.videoFile = "Video dosyası seçimi zorunludur"

    if (formData.videoFile) {
      const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"]
      if (!allowedTypes.includes(formData.videoFile.type)) {
        newErrors.videoFile = "Sadece MP4, WebM ve MOV formatları desteklenir"
      }

      // Check file size (max 500MB)
      const maxSize = 500 * 1024 * 1024 // 500MB
      if (formData.videoFile.size > maxSize) {
        newErrors.videoFile = "Video dosyası 500MB'dan küçük olmalıdır"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, videoFile: file })

      // Auto-generate title if not set
      if (!formData.title && formData.matchId) {
        const selectedMatch = completedMatches.find((m) => m.id.toString() === formData.matchId)
        if (selectedMatch) {
          setFormData((prev) => ({
            ...prev,
            title: `${selectedMatch.homeTeam} vs ${selectedMatch.awayTeam} - Maç Videosu`,
            videoFile: file,
          }))
        }
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate file upload with progress
      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(uploadInterval)
            return 100
          }
          return prev + 10
        })
      }, 200)

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 3000))

      console.log("Video upload data:", {
        ...formData,
        videoFile: formData.videoFile?.name,
      })

      // Redirect to owner dashboard
      router.push("/dashboard/owner?tab=videos&success=upload")
    } catch (error) {
      console.error("Video upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const selectedMatch = completedMatches.find((m) => m.id.toString() === formData.matchId)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/owner" className="flex items-center text-green-600 hover:text-green-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Saha Sahibi Paneline Dön
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/" className="flex items-center text-green-600 hover:text-green-700">
              <Home className="w-4 h-4 mr-2" />
              Anasayfa
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/videos">
              <Button variant="outline" size="sm">
                <Video className="w-4 h-4 mr-2" />
                Tüm Videolar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-green-800 flex items-center">
                  <Upload className="w-6 h-6 mr-2" />
                  Maç Videosu Yükle
                </CardTitle>
                <CardDescription>
                  Sahalarınızda oynanan maçların videolarını yükleyerek izleyicilerle paylaşın
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Match Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="matchId" className="flex items-center">
                      <Video className="w-4 h-4 mr-2" />
                      Maç Seçimi *
                    </Label>
                    <Select
                      value={formData.matchId}
                      onValueChange={(value) => setFormData({ ...formData, matchId: value })}
                    >
                      <SelectTrigger className={errors.matchId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Videoyu yüklemek istediğiniz maçı seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {completedMatches.map((match) => (
                          <SelectItem key={match.id} value={match.id.toString()}>
                            <div className="flex flex-col">
                              <div className="font-medium">
                                {match.homeTeam} vs {match.awayTeam}
                              </div>
                              <div className="text-sm text-gray-500">
                                {match.date} • {match.field} • {match.score}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.matchId && <p className="text-sm text-red-500">{errors.matchId}</p>}
                  </div>

                  {/* Video Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Video Başlığı *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Örn: Yıldızlar FC vs Galibiyetspor - Muhteşem Maç Anları"
                      className={errors.title ? "border-red-500" : ""}
                      required
                    />
                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                    <p className="text-sm text-gray-500">Açıklayıcı ve çekici bir başlık seçin</p>
                  </div>

                  {/* Video File Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="videoFile" className="flex items-center">
                      <FileVideo className="w-4 h-4 mr-2" />
                      Video Dosyası *
                    </Label>
                    <div className="space-y-4">
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                          errors.videoFile ? "border-red-300" : "border-gray-300 hover:border-green-400"
                        }`}
                      >
                        <input
                          id="videoFile"
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label htmlFor="videoFile" className="cursor-pointer">
                          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-600 font-medium mb-2">
                            Video dosyası seçmek için tıklayın veya sürükleyip bırakın
                          </p>
                          <p className="text-sm text-gray-500">MP4, WebM, MOV formatları desteklenir (Max: 500MB)</p>
                        </label>
                      </div>

                      {formData.videoFile && (
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <FileVideo className="w-5 h-5 text-green-600" />
                          <div className="flex-1">
                            <p className="font-medium text-green-800">{formData.videoFile.name}</p>
                            <p className="text-sm text-green-600">
                              {(formData.videoFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      )}
                    </div>
                    {errors.videoFile && <p className="text-sm text-red-500">{errors.videoFile}</p>}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Video Açıklaması (Opsiyonel)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Video hakkında ek bilgiler, öne çıkan anlar, oyuncu performansları vb."
                      rows={4}
                    />
                    <p className="text-sm text-gray-500">
                      İzleyiciler için video hakkında ek bilgiler ekleyebilirsiniz
                    </p>
                  </div>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Yükleniyor...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
                      İptal
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Yükleniyor...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Upload className="w-4 h-4 mr-2" />
                          Videoyu Yükle
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
            {/* Selected Match Info */}
            {selectedMatch && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">Seçilen Maç</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="font-semibold text-lg">
                      {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
                    </div>
                    <div className="text-sm text-gray-600">{selectedMatch.field}</div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tarih:</span>
                    <span className="font-medium">{selectedMatch.date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Saat:</span>
                    <span className="font-medium">{selectedMatch.time}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Skor:</span>
                    <span className="font-medium text-green-600">{selectedMatch.score}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upload Guidelines */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">Yükleme Kuralları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-sm font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Desteklenen Formatlar</p>
                      <p className="text-xs text-gray-600">MP4, WebM, MOV dosya formatları kabul edilir</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-sm font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Dosya Boyutu</p>
                      <p className="text-xs text-gray-600">Maksimum 500MB boyutunda video yükleyebilirsiniz</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-sm font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Kaliteli İçerik</p>
                      <p className="text-xs text-gray-600">HD kalitede, net görüntülü videolar tercih edilir</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-sm font-bold">4</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Telif Hakları</p>
                      <p className="text-xs text-gray-600">Sadece kendi çektiğiniz videoları yükleyin</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Bilgi:</strong> Yüklenen videolar moderasyon sonrası yayınlanacaktır. Video yükleme işlemi
                tamamlandıktan sonra gol anlarını işaretleyebilirsiniz.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  )
}
