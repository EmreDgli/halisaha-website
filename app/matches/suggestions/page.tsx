"use client"

import { useState } from "react"
import { ArrowLeft, Home, Calendar, MapPin, Users, Clock, Star, Trophy, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

// Mock data for match suggestions
const mockSuggestions = [
  {
    id: 1,
    opponent: {
      name: "Beşiktaş Gençlik",
      location: "Beşiktaş, İstanbul",
      skillLevel: 4,
      avatar: "/placeholder.svg?height=60&width=60",
      winRate: 73,
      matchesPlayed: 15,
    },
    matchScore: 92,
    reasons: ["Benzer seviye", "Yakın konum", "Uygun zaman"],
    suggestedDate: "2024-01-15",
    suggestedTime: "19:00",
    field: "Beşiktaş Halı Saha",
    distance: "2.3 km",
  },
  {
    id: 2,
    opponent: {
      name: "Kadıköy United",
      location: "Kadıköy, İstanbul",
      skillLevel: 3,
      avatar: "/placeholder.svg?height=60&width=60",
      winRate: 62,
      matchesPlayed: 8,
    },
    matchScore: 87,
    reasons: ["Fair play odaklı", "Benzer deneyim", "Müsait kadro"],
    suggestedDate: "2024-01-16",
    suggestedTime: "20:00",
    field: "Kadıköy Spor Kompleksi",
    distance: "5.1 km",
  },
  {
    id: 3,
    opponent: {
      name: "Ataşehir Warriors",
      location: "Ataşehir, İstanbul",
      skillLevel: 4,
      avatar: "/placeholder.svg?height=60&width=60",
      winRate: 67,
      matchesPlayed: 18,
    },
    matchScore: 85,
    reasons: ["Rekabetçi seviye", "Organize takım", "Düzenli maçlar"],
    suggestedDate: "2024-01-17",
    suggestedTime: "18:30",
    field: "Ataşehir Futbol Sahası",
    distance: "8.7 km",
  },
  {
    id: 4,
    opponent: {
      name: "Üsküdar Gençlik",
      location: "Üsküdar, İstanbul",
      skillLevel: 3,
      avatar: "/placeholder.svg?height=60&width=60",
      winRate: 58,
      matchesPlayed: 12,
    },
    matchScore: 78,
    reasons: ["Dostluk maçları", "Uygun seviye", "Esnek program"],
    suggestedDate: "2024-01-18",
    suggestedTime: "19:30",
    field: "Üsküdar Halı Saha",
    distance: "6.2 km",
  },
]

export default function MatchSuggestionsPage() {
  const [suggestions, setSuggestions] = useState(mockSuggestions)
  const [isLoading, setIsLoading] = useState(false)

  const handleSendRequest = async (suggestionId: number) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    alert("Maç talebi gönderildi!")
    setIsLoading(false)
  }

  const getSkillLevelText = (level: number) => {
    const levels = ["", "Başlangıç", "Orta", "İyi", "Çok İyi", "Profesyonel"]
    return levels[level] || "Bilinmiyor"
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-gray-600"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/player">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Geri
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Anasayfa
                </Button>
              </Link>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Önerilen Maçlar</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Akıllı Maç Önerileri</h2>
              <p className="text-sm text-gray-600">Takımınıza en uygun rakipleri bulduk</p>
            </div>
          </div>
          <p className="text-gray-600">
            Öneriler takımınızın seviyesi, konum, zaman tercihleri ve geçmiş performansınıza göre hazırlandı.
          </p>
        </div>

        {/* Suggestions Grid */}
        <div className="space-y-6">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={suggestion.opponent.avatar || "/placeholder.svg"}
                        alt={suggestion.opponent.name}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white text-lg">
                        {suggestion.opponent.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">{suggestion.opponent.name}</CardTitle>
                      <p className="text-gray-500 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {suggestion.opponent.location} • {suggestion.distance}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">
                          <Star className="h-3 w-3 mr-1" />
                          {getSkillLevelText(suggestion.opponent.skillLevel)}
                        </Badge>
                        <Badge variant="outline">
                          <Trophy className="h-3 w-3 mr-1" />%{suggestion.opponent.winRate} galibiyet
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getMatchScoreColor(suggestion.matchScore)}`}>
                      %{suggestion.matchScore}
                    </div>
                    <p className="text-sm text-gray-500">Uyumluluk</p>
                    <Progress value={suggestion.matchScore} className="w-20 mt-1" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Match Reasons */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Neden öneriliyor:</h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.reasons.map((reason, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Match Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Önerilen Tarih</p>
                      <p className="text-sm text-gray-600">{suggestion.suggestedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Saat</p>
                      <p className="text-sm text-gray-600">{suggestion.suggestedTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Saha</p>
                      <p className="text-sm text-gray-600">{suggestion.field}</p>
                    </div>
                  </div>
                </div>

                {/* Team Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-lg font-bold text-blue-600">{suggestion.opponent.matchesPlayed}</p>
                    <p className="text-sm text-gray-600">Toplam Maç</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-lg font-bold text-green-600">%{suggestion.opponent.winRate}</p>
                    <p className="text-sm text-gray-600">Galibiyet Oranı</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button className="flex-1" onClick={() => handleSendRequest(suggestion.id)} disabled={isLoading}>
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Users className="h-4 w-4 mr-2" />
                    )}
                    Maç Talebi Gönder
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Farklı Tarih Öner
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Daha Fazla Öneri Göster
          </Button>
        </div>
      </div>
    </div>
  )
}
