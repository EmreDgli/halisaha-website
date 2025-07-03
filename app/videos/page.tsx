"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Video, Star, Eye, Search, Filter, Play, Clock, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface MatchVideo {
  id: number
  title: string
  description: string
  thumbnailUrl: string
  duration: string
  uploadDate: string
  views: number
  rating: number
  totalRatings: number
  match: {
    homeTeam: string
    awayTeam: string
    date: string
    score: string
    field: string
  }
  uploader: {
    name: string
    type: "field_owner"
  }
}

export default function VideosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filterBy, setFilterBy] = useState("all")

  const [videos] = useState<MatchVideo[]>([
    {
      id: 1,
      title: "Yıldızlar FC vs Galibiyetspor - Muhteşem Maç",
      description:
        "Harika goller ve müthiş aksiyonlarla dolu maç. Son dakika golü ile kazanılan nefes kesen karşılaşma.",
      thumbnailUrl: "/thumbnails/match1.jpg",
      duration: "1:45:30",
      uploadDate: "2024-01-10",
      views: 245,
      rating: 4.5,
      totalRatings: 32,
      match: {
        homeTeam: "Yıldızlar FC",
        awayTeam: "Galibiyetspor",
        date: "2024-01-08",
        score: "3-2",
        field: "Merkez Halı Saha",
      },
      uploader: {
        name: "Merkez Halı Saha",
        type: "field_owner",
      },
    },
    {
      id: 2,
      title: "Şampiyonlar vs Dostluk SK - Penaltılarla Final",
      description: "Penaltılarla sonuçlanan dramatik maç. Her iki takım da mükemmel performans sergiledi.",
      thumbnailUrl: "/thumbnails/match2.jpg",
      duration: "2:10:15",
      uploadDate: "2024-01-12",
      views: 189,
      rating: 4.2,
      totalRatings: 28,
      match: {
        homeTeam: "Şampiyonlar",
        awayTeam: "Dostluk SK",
        date: "2024-01-11",
        score: "2-2 (4-3 pen)",
        field: "Spor Kompleksi",
      },
      uploader: {
        name: "Spor Kompleksi",
        type: "field_owner",
      },
    },
    {
      id: 3,
      title: "Kartallar FC vs Aslanlar SK - Gol Düellosu",
      description: "Gol yağmuru altında geçen heyecanlı karşılaşma. Toplam 7 gol atıldı.",
      thumbnailUrl: "/thumbnails/match3.jpg",
      duration: "1:55:45",
      uploadDate: "2024-01-14",
      views: 312,
      rating: 4.8,
      totalRatings: 45,
      match: {
        homeTeam: "Kartallar FC",
        awayTeam: "Aslanlar SK",
        date: "2024-01-13",
        score: "4-3",
        field: "Yeşil Alan Halı Saha",
      },
      uploader: {
        name: "Yeşil Alan Halı Saha",
        type: "field_owner",
      },
    },
    {
      id: 4,
      title: "Dostluk Maçı - Veteranlar vs Gençler",
      description: "Eğlenceli dostluk maçında deneyim gençlikle buluştu. Harika anlar yaşandı.",
      thumbnailUrl: "/thumbnails/match4.jpg",
      duration: "1:30:20",
      uploadDate: "2024-01-15",
      views: 156,
      rating: 4.0,
      totalRatings: 22,
      match: {
        homeTeam: "Veteranlar",
        awayTeam: "Gençler",
        date: "2024-01-14",
        score: "2-3",
        field: "Mini Stadyum",
      },
      uploader: {
        name: "Mini Stadyum",
        type: "field_owner",
      },
    },
  ])

  const filteredAndSortedVideos = videos
    .filter((video) => {
      const matchesSearch =
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.match.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.match.awayTeam.toLowerCase().includes(searchTerm.toLowerCase())

      if (filterBy === "all") return matchesSearch
      if (filterBy === "high_rated") return matchesSearch && video.rating >= 4.0
      if (filterBy === "popular") return matchesSearch && video.views >= 200
      return matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        case "oldest":
          return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
        case "most_viewed":
          return b.views - a.views
        case "highest_rated":
          return b.rating - a.rating
        default:
          return 0
      }
    })

  const totalViews = videos.reduce((sum, video) => sum + video.views, 0)
  const averageRating = videos.reduce((sum, video) => sum + video.rating, 0) / videos.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                  Maç Videoları
                </h1>
                <p className="text-gray-600 mt-1">En iyi maç anlarını izleyin ve puanlayın</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4 mr-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{videos.length}</div>
                  <div className="text-xs text-gray-500">Video</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalViews}</div>
                  <div className="text-xs text-gray-500">İzlenme</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{averageRating.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">Ortalama Puan</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Link href="/">
                  <Button variant="outline" size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    Anasayfa
                  </Button>
                </Link>
                <Link href="/dashboard/player">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Panele Dön
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <Card className="shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Video, takım veya maç ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sıralama" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">En Yeni</SelectItem>
                    <SelectItem value="oldest">En Eski</SelectItem>
                    <SelectItem value="most_viewed">En Çok İzlenen</SelectItem>
                    <SelectItem value="highest_rated">En Yüksek Puan</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Videolar</SelectItem>
                    <SelectItem value="high_rated">Yüksek Puanlı (4.0+)</SelectItem>
                    <SelectItem value="popular">Popüler (200+ izlenme)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Videos Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedVideos.map((video) => (
            <Card key={video.id} className="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="p-0">
                <div className="relative group">
                  <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                    <Video className="w-16 h-16 text-gray-400" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Video Duration */}
                  <Badge className="absolute bottom-2 right-2 bg-black/70 text-white text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {video.duration}
                  </Badge>

                  {/* Views Badge */}
                  <Badge className="absolute top-2 right-2 bg-green-600 text-white text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    {video.views}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Video Title */}
                  <div>
                    <h3 className="font-semibold text-green-800 line-clamp-2 leading-tight">{video.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {video.match.homeTeam} vs {video.match.awayTeam}
                    </p>
                  </div>

                  {/* Match Info */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Skor:</span>
                      <span className="font-semibold text-green-600">{video.match.score}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Tarih:</span>
                      <span className="text-gray-700">{video.match.date}</span>
                    </div>
                    <div className="text-sm text-gray-500 truncate">{video.match.field}</div>
                  </div>

                  {/* Rating and Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{video.rating}</span>
                      <span className="text-sm text-gray-500">({video.totalRatings})</span>
                    </div>
                    <span className="text-xs text-gray-500">{video.uploadDate}</span>
                  </div>

                  {/* Uploader */}
                  <div className="text-xs text-gray-500">
                    <span>Yükleyen: {video.uploader.name}</span>
                  </div>

                  {/* Watch Button */}
                  <Link href={`/videos/${video.id}`} className="block">
                    <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                      <Play className="w-4 h-4 mr-2" />
                      İzle
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredAndSortedVideos.length === 0 && (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <Video className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Video bulunamadı</h3>
              <p className="text-gray-500 mb-6">
                Arama kriterlerinize uygun video bulunamadı. Farklı anahtar kelimeler deneyin.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setFilterBy("all")
                  setSortBy("newest")
                }}
              >
                Filtreleri Temizle
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Featured Section */}
        {searchTerm === "" && filterBy === "all" && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-green-800 mb-6">Öne Çıkan Videolar</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos
                .filter((video) => video.rating >= 4.5)
                .slice(0, 3)
                .map((video) => (
                  <Card key={video.id} className="shadow-lg border-2 border-yellow-200">
                    <CardHeader className="p-0">
                      <div className="relative">
                        <div className="aspect-video bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-t-lg flex items-center justify-center">
                          <Video className="w-12 h-12 text-yellow-600" />
                        </div>
                        <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Öne Çıkan
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-green-800 mb-2">{video.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {video.match.homeTeam} vs {video.match.awayTeam} • {video.match.score}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{video.rating}</span>
                          <span className="text-sm text-gray-500">({video.totalRatings})</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Eye className="w-4 h-4" />
                          <span>{video.views}</span>
                        </div>
                      </div>
                      <Link href={`/videos/${video.id}`}>
                        <Button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white">
                          <Play className="w-4 h-4 mr-2" />
                          İzle
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
