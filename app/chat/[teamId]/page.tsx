"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, ArrowLeft, Users, MoreVertical, Phone, Video } from "lucide-react"
import Link from "next/link"
import { useAuthContext } from "@/components/AuthProvider"
import { useRouter } from "next/navigation"

interface Message {
  id: number
  sender: string
  message: string
  timestamp: string
  isOwn: boolean
  type: "text" | "system"
}

interface TeamMember {
  name: string
  role: string
  online: boolean
  lastSeen?: string
}

export default function TeamChatPage({ params }: { params: { teamId: string } }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "Sistem",
      message: "Takım sohbeti başlatıldı. Hoş geldiniz!",
      timestamp: "10:00",
      isOwn: false,
      type: "system",
    },
    {
      id: 2,
      sender: "Ahmet Yılmaz",
      message: "Yarınki maç için hazır mısınız? Saat 19:00'da sahada buluşuyoruz.",
      timestamp: "14:30",
      isOwn: false,
      type: "text",
    },
    {
      id: 3,
      sender: "Sen",
      message: "Evet, hazırım! Hangi sahada oynayacağız?",
      timestamp: "14:32",
      isOwn: true,
      type: "text",
    },
    {
      id: 4,
      sender: "Mehmet Kaya",
      message: "Merkez Halı Saha'da. Ben de hazırım, 18:30'da orada olalım ısınma için.",
      timestamp: "14:35",
      isOwn: false,
      type: "text",
    },
    {
      id: 5,
      sender: "Sen",
      message: "Tamam, görüşürüz. Kramponlarımı getirmeyi unutmayayım 😄",
      timestamp: "14:36",
      isOwn: true,
      type: "text",
    },
    {
      id: 6,
      sender: "Ali Demir",
      message: "Ben biraz geç gelebilirim, trafikte kalabilirim. Başlayın siz, ben gelir gelmez dahil olurum.",
      timestamp: "15:20",
      isOwn: false,
      type: "text",
    },
  ])

  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user, loading: authLoading, isAuthenticated } = useAuthContext()
  const router = useRouter()

  // Authentication kontrolü
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) {
      console.log("Kullanıcı giriş yapmamış, login'e yönlendiriliyor");
      router.push("/auth/login");
      return;
    }
  }, [user, authLoading, isAuthenticated, router]);

  const teamName = "Yıldızlar FC"
  const teamMembers: TeamMember[] = [
    { name: "Ahmet Yılmaz", role: "Kaptan", online: true },
    { name: "Mehmet Kaya", role: "Oyuncu", online: true },
    { name: "Ali Demir", role: "Oyuncu", online: false, lastSeen: "5 dakika önce" },
    { name: "Emre Özkan", role: "Oyuncu", online: true },
    { name: "Can Yıldız", role: "Oyuncu", online: false, lastSeen: "2 saat önce" },
    { name: "Burak Kara", role: "Oyuncu", online: true },
  ]

  const onlineMembers = teamMembers.filter((m) => m.online)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Simulate real-time messaging
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate receiving messages occasionally
      if (Math.random() > 0.95) {
        const randomMember = teamMembers[Math.floor(Math.random() * teamMembers.length)]
        const randomMessages = [
          "Maç öncesi toplantı yapalım mı?",
          "Bu hafta antrenman var mı?",
          "Yeni forma siparişi verelim",
          "Rakip takım hakkında bilgi var mı?",
          "Sahada görüşürüz arkadaşlar!",
        ]

        const newMsg: Message = {
          id: messages.length + Math.random(),
          sender: randomMember.name,
          message: randomMessages[Math.floor(Math.random() * randomMessages.length)],
          timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
          isOwn: false,
          type: "text",
        }

        setMessages((prev) => [...prev, newMsg])
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [messages.length, teamMembers])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        sender: "Sen",
        message: newMessage,
        timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
        isOwn: true,
        type: "text",
      }
      setMessages((prev) => [...prev, message])
      setNewMessage("")

      // Simulate typing indicator
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 2000)
    }
  }

  const formatTime = (timestamp: string) => {
    return timestamp
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/player" className="text-green-600 hover:text-green-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-green-800">{teamName}</h1>
                <p className="text-sm text-gray-600">
                  {onlineMembers.length} kişi çevrimiçi • {teamMembers.length} üye
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => alert("Sesli arama özelliği yakında!")}>
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => alert("Video arama özelliği yakında!")}>
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => alert("Daha fazla seçenek yakında!")}>
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <Card className="lg:col-span-3 flex flex-col h-[calc(100vh-200px)]">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Takım Sohbeti</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Aktif
                </Badge>
              </CardTitle>
            </CardHeader>

            {/* Messages Container */}
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id}>
                    {message.type === "system" ? (
                      <div className="text-center">
                        <div className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                          {message.message}
                        </div>
                      </div>
                    ) : (
                      <div className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xs lg:max-w-md ${message.isOwn ? "order-2" : "order-1"}`}>
                          <div
                            className={`px-4 py-3 rounded-2xl ${
                              message.isOwn
                                ? "bg-gradient-to-r from-green-600 to-green-700 text-white"
                                : "bg-white border shadow-sm text-gray-800"
                            }`}
                          >
                            {!message.isOwn && <p className="text-xs font-medium mb-1 opacity-70">{message.sender}</p>}
                            <p className="text-sm leading-relaxed">{message.message}</p>
                          </div>
                          <p
                            className={`text-xs text-gray-500 mt-1 px-1 ${message.isOwn ? "text-right" : "text-left"}`}
                          >
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t bg-white p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    className="flex-1 rounded-full border-gray-300 focus:border-green-500"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-full px-6"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Team Members Sidebar */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Takım Üyeleri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Online Members */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Çevrimiçi ({onlineMembers.length})</h4>
                <div className="space-y-3">
                  {teamMembers
                    .filter((member) => member.online)
                    .map((member, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                        <div className="relative">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-green-100 text-green-700">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Offline Members */}
              {teamMembers.some((member) => !member.online) && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Çevrimdışı ({teamMembers.filter((m) => !m.online).length})
                  </h4>
                  <div className="space-y-3">
                    {teamMembers
                      .filter((member) => !member.online)
                      .map((member, index) => (
                        <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                          <div className="relative">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-gray-600">{member.name}</p>
                            <p className="text-xs text-gray-500">
                              {member.lastSeen ? `Son görülme: ${member.lastSeen}` : member.role}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
