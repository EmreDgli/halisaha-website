"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Star,
  Eye,
  Calendar,
  MapPin,
  Play,
  Pause,
  Volume2,
  Maximize,
  ThumbsUp,
  MessageCircle,
  Share2,
  Flag,
  Home,
  User,
} from "lucide-react"
import Link from "next/link"

interface Goal {
  id: number
  minute: number
  second: number
  player: string
  team: string
  likes: number
  userLiked: boolean
}

interface Comment {
  id: number
  user: string
  comment: string
  timestamp: string
  likes: number
}

export default function VideoDetailPage({ params }: { params: { id: string } }) {
  const [userRating, setUserRating] = useState(0)
  const [hasRated, setHasRated] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 1,
      minute: 12,
      second: 34,
      player: "Ahmet Yılmaz",
      team: "Yıldızlar FC",
      likes: 15,
      userLiked: false,
    },
    {
      id: 2,
      minute: 28,
      second: 45,
      player: "Mehmet Kaya",
      team: "Galibiyetspor",
      likes: 12,
      userLiked: false,
    },
    {
      id: 3,
      minute: 67,
      second: 12,
      player: "Ali Demir",
      team: "Yıldızlar FC",
      likes: 23,
      userLiked: true,
    },
  ])

  const [comments] = useState<Comment[]>([
    {
      id: 1,
      user: "Futbol Sevdalısı",
      comment: "Muhteşem bir maçtı! Özellikle 67. dakikadaki gol harikaydı.",
      timestamp: "2 saat önce",
      likes: 8,
    },
    {
      id: 2,
      user: "Spor Tutkunu",
      comment: "Her iki takım da çok iyi oynadı. Kaliteli futbol izledik.",
      timestamp: "5 saat önce",
      likes: 5,
    },
  ])

  // Sample video data
  const video = {
    id: Number.parseInt(params.id),
    title: "Yıldızlar FC vs Galibiyetspor - Muhteşem Maç",
    description:
      "Harika goller ve müthiş aksiyonlarla dolu maç. Son dakika golü ile kazanılan nefes kesen karşılaşma. Her iki takım da mükemmel bir performans sergiledi.",
    videoUrl: "/videos/match1.mp4",
    duration: "1:45:30",
    uploadDate: "2024-01-10",
    views: 245,
    rating: 4.5,
    totalRatings: 32,
    match: {
      homeTeam: "Yıldızlar FC",
      awayTeam: "Galibiyetspor",
      date: "2024-01-08",
      time: "19:00",
      score: "3-2",
      field: "Merkez Halı Saha",
    },
    uploader: {
      name: "Merkez Halı Saha",
      type: "field_owner",
    },
  }

  const handleRating = (rating: number) => {
    if (!hasRated) {
      setUserRating(rating)
      setHasRated(true)
      // In real app, send rating to backend
      console.log("User rated:", rating)
    }
  }

  const handleGoalLike = (goalId: number) => {
    setGoals(
      goals.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              likes: goal.userLiked ? goal.likes - 1 : goal.likes + 1,
              userLiked: !goal.userLiked,
            }
          : goal,
      ),
    )
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      // In real app, send comment to backend
      console.log("New comment:", newComment)
      setNewComment("")
    }
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
            <Link href="/videos" className="flex items-center text-green-600 hover:text-green-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Videolara Dön
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/" className="flex items-center text-green-600 hover:text-green-700">
              <Home className="w-4 h-4 mr-2" />
              Anasayfa
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/dashboard/player">
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                Panelim
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Paylaş
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Main Video Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <Card className="shadow-lg overflow-hidden">
              <div className="relative aspect-video bg-black">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Play className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg">Video Player</p>
                    <p className="text-sm opacity-75">Süre: {video.duration}</p>
                  </div>
                </div>

                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center space-x-4 text-white">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                    <div className="flex-1 bg-white/30 rounded-full h-1">
                      <div className="bg-green-500 h-1 rounded-full w-1/3"></div>
                    </div>
                    <span className="text-sm">32:15 / {video.duration}</span>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      <Volume2 className="w-5 h-5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      <Maximize className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Video Info */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-green-800 mb-2">{video.title}</CardTitle>
                    <CardDescription className="text-base">{video.description}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Paylaş
                    </Button>
                    <Button variant="outline" size="sm">
                      <Flag className="w-4 h-4 mr-2" />
                      Şikayet
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">İzlenme:</span>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{video.views}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Yükleme Tarihi:</span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{video.uploadDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Yükleyen:</span>
                      <span className="font-medium">{video.uploader.name}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Maç Tarihi:</span>
                      <span className="font-medium">{video.match.date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Saha:</span>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{video.match.field}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Skor:</span>
                      <span className="font-bold text-green-600 text-lg">{video.match.score}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rating Section */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-800">Bu Videoyu Puanlayın</CardTitle>
                <CardDescription>Maç kalitesi ve video kalitesi için puanınızı verin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRating(star)}
                          disabled={hasRated}
                          className={`transition-colors ${hasRated ? "cursor-not-allowed" : "cursor-pointer hover:scale-110"}`}
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= (userRating || video.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">
                      {hasRated ? (
                        <span className="text-green-600 font-medium">Puanınız: {userRating} yıldız</span>
                      ) : (
                        <span>Puanlamak için yıldızlara tıklayın</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-bold">{video.rating}</span>
                    </div>
                    <div className="text-sm text-gray-500">{video.totalRatings} değerlendirme</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Goals Section */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-800">Gol Anları</CardTitle>
                <CardDescription>Maçın gol anlarını izleyin ve beğenin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{formatTime(goal.minute, goal.second)}</div>
                          <div className="text-xs text-gray-500">Dakika</div>
                        </div>
                        <div>
                          <div className="font-medium">{goal.player}</div>
                          <div className="text-sm text-gray-600">{goal.team}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGoalLike(goal.id)}
                          className={goal.userLiked ? "bg-green-50 border-green-200" : ""}
                        >
                          <ThumbsUp className={`w-4 h-4 mr-1 ${goal.userLiked ? "text-green-600" : ""}`} />
                          {goal.likes}
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Play className="w-4 h-4 mr-1" />
                          İzle
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Yorumlar ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add Comment */}
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <Textarea
                    placeholder="Bu video hakkında yorumunuzu yazın..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-3"
                    rows={3}
                  />
                  <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={!newComment.trim()}>
                    Yorum Yap
                  </Button>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-green-100 text-green-700">
                          {comment.user.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{comment.user}</span>
                          <span className="text-sm text-gray-500">{comment.timestamp}</span>
                        </div>
                        <p className="text-gray-700 mb-2">{comment.comment}</p>
                        <Button size="sm" variant="ghost" className="text-gray-500 hover:text-green-600">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {comment.likes}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Match Info */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-800">Maç Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-800 mb-2">{video.match.homeTeam}</div>
                  <div className="text-4xl font-bold text-green-600 my-4">{video.match.score}</div>
                  <div className="text-2xl font-bold text-green-800">{video.match.awayTeam}</div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tarih:</span>
                    <span className="font-medium">{video.match.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saat:</span>
                    <span className="font-medium">{video.match.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saha:</span>
                    <span className="font-medium">{video.match.field}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Videos */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-800">İlgili Videolar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="w-20 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                      <Play className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2">Örnek Maç Videosu {i}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-500">4.{i}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">1{i}0 izlenme</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Video Stats */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-800">Video İstatistikleri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam İzlenme:</span>
                  <span className="font-medium">{video.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ortalama Puan:</span>
                  <span className="font-medium">{video.rating}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Oy:</span>
                  <span className="font-medium">{video.totalRatings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gol Sayısı:</span>
                  <span className="font-medium">{goals.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Yorum Sayısı:</span>
                  <span className="font-medium">{comments.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
