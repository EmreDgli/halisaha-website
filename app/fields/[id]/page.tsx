"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getFieldDetails } from "@/lib/api/fields"
import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function FieldDetailPage() {
  const params = useParams() as { id: string }
  const [field, setField] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userRating, setUserRating] = useState<number | null>(null)
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  useEffect(() => {
    const fetchField = async () => {
      setLoading(true)
      setError("")
      try {
        const { data, error } = await getFieldDetails(params.id)
        if (error || !data) setError("Saha bulunamadı.")
        else setField(data)
      } catch (e) {
        setError("Saha bulunamadı.")
      } finally {
        setLoading(false)
      }
    }
    fetchField()
  }, [params.id])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-green-700">Yükleniyor...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>
  if (!field) return null

  const images = field.images && field.images.length > 0 ? field.images : [
    "/placeholder.jpg",
    "/placeholder-user.jpg",
    "/placeholder-logo.png"
  ];
  const visibleImages = images.slice(currentIndex, currentIndex + 3)
  const canGoLeft = currentIndex > 0
  const canGoRight = currentIndex + 3 < images.length

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canGoLeft) setCurrentIndex(currentIndex - 1)
  }
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canGoRight) setCurrentIndex(currentIndex + 1)
  }

  const handleRate = (rating: number) => {
    setUserRating(rating)
    // Burada API'ye puan gönderme işlemi eklenebilir
  }

  const avgRating = field.rating || 0
  const totalRatings = field.total_ratings || 0

  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex flex-col items-center justify-center py-8 px-2 w-full">
      <div className="w-full max-w-6xl mx-auto">
        {/* Geri Dön Butonu */}
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 px-4 py-2 rounded bg-green-100 hover:bg-green-200 text-green-800 font-medium transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Maç Oluşturmaya Devam Et
        </button>
        {/* Başlık */}
        <div className="text-3xl text-green-800 text-center font-bold mb-2">{field.name}</div>
        <div className="text-green-700 text-base text-center mb-6">{field.city} / {field.district}</div>

        {/* Görsel slider */}
        <div className="flex items-center justify-center gap-2 mb-8 relative w-full">
          <button
            onClick={handlePrev}
            disabled={!canGoLeft}
            className={`p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-700 transition disabled:opacity-30 absolute left-0 z-10`}
            style={{ top: '50%', transform: 'translateY(-50%)' }}
            aria-label="Önceki görsel"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <div className="flex gap-6 mx-16 w-full justify-center">
            {visibleImages.map((img: string, i: number) => (
              <img key={i + currentIndex} src={img} alt="Saha görseli" className="rounded w-[420px] h-80 object-cover border border-green-100 bg-white shadow" />
            ))}
          </div>
          <button
            onClick={handleNext}
            disabled={!canGoRight}
            className={`p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-700 transition disabled:opacity-30 absolute right-0 z-10`}
            style={{ top: '50%', transform: 'translateY(-50%)' }}
            aria-label="Sonraki görsel"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>

        {/* Saha Bilgileri */}
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          <div className="flex flex-col items-start min-w-[220px]">
            <span className="uppercase font-bold text-green-800 text-sm mb-1">Adres:</span>
            <span className="font-normal text-gray-700 text-base">{field.address}</span>
          </div>
          <div className="flex flex-col items-start min-w-[220px]">
            <span className="uppercase font-bold text-green-800 text-sm mb-1">Saatlik Ücret:</span>
            <span className="font-normal text-gray-700 text-base">₺{field.hourly_rate}</span>
          </div>
          {field.description && (
            <div className="flex flex-col items-start min-w-[220px]">
              <span className="uppercase font-bold text-green-800 text-sm mb-1">Açıklama:</span>
              <span className="font-normal text-gray-700 text-base">{field.description}</span>
            </div>
          )}
        </div>

        {/* Harita kutusu */}
        <div className="mt-6 p-6 border border-green-100 rounded bg-green-50 text-center text-green-700 w-full max-w-3xl mx-auto">
          <div className="font-medium mb-2 text-lg">Konum (Map için buraya embed eklenecek)</div>
          <div className="text-sm text-green-500">Saha konumunu eklediğinizde burada harita görünecek.</div>
        </div>

        {/* Puanlama ve kullanıcı yorumları */}
        <div className="mt-10 w-full max-w-3xl mx-auto">
          <div className="mb-6 flex flex-col items-center">
            <div className="uppercase font-bold text-green-800 text-base mb-2">Puanlama</div>
            <div className="flex items-center gap-1 mb-1">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="focus:outline-none"
                >
                  <Star className={`w-6 h-6 ${((hoverRating || userRating || avgRating) >= star) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <div className="text-sm text-green-700">
              {userRating ? `Puanınız: ${userRating}` : totalRatings > 0 ? `Ortalama: ${avgRating.toFixed(1)} / 5 (${totalRatings} oy)` : "Henüz puan yok"}
            </div>
          </div>
          <div className="mt-8">
            <div className="uppercase font-bold text-green-800 text-base mb-2">Kullanıcı Yorumları</div>
            <div className="space-y-3">
              {/* Örnek yorum kutusu */}
              <div className="p-3 border border-green-100 rounded bg-white text-green-900">
                <div className="font-semibold mb-1">Kullanıcı Adı</div>
                <div className="text-sm text-gray-700">Çok güzel bir saha, zemini harika!</div>
              </div>
              <div className="p-3 border border-green-100 rounded bg-white text-green-900">
                <div className="font-semibold mb-1">Başka Bir Kullanıcı</div>
                <div className="text-sm text-gray-700">Aydınlatması gece maçları için çok iyi.</div>
              </div>
              {/* Gerçek yorumlar API'den çekilerek burada listelenebilir */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 