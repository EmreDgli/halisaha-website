"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, User, Bell, Shield, Smartphone, Mail, Eye, EyeOff, CheckCircle, AlertCircle, Hash } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/components/AuthProvider"

interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  companyName?: string
  roles: ("player" | "owner")[]
  createdAt: string
  avatar_url?: string
  tag?: string
}

interface NotificationSettings {
  matchReminders: boolean
  teamInvites: boolean
  paymentReminders: boolean
  newMessages: boolean
  emailNotifications: boolean
  pushNotifications: boolean
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "security">("profile")
  const { user: authUser, loading: authLoading, isAuthenticated } = useAuthContext()
  const router = useRouter()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    companyName: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    tag: "",
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    matchReminders: true,
    teamInvites: true,
    paymentReminders: true,
    newMessages: true,
    emailNotifications: true,
    pushNotifications: false,
  })

  // Authentication kontrolü
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !authUser) {
      console.log("Kullanıcı giriş yapmamış, login'e yönlendiriliyor");
      router.push("/auth/login");
      return;
    }

    // Kullanıcı verilerini ayarla
    if (authUser.profile) {
      const userData: UserData = {
        id: authUser.user.id,
        firstName: authUser.profile.full_name?.split(" ")[0] || "Kullanıcı",
        lastName: authUser.profile.full_name?.split(" ")[1] || "",
        email: authUser.user.email || "",
        password: "",
        phone: authUser.profile.phone || "",
        companyName: "",
        roles: authUser.profile.roles || [],
        createdAt: authUser.user.created_at || "",
        avatar_url: authUser.profile.avatar_url || undefined,
        tag: authUser.profile.tag || undefined,
      };
      setUser(userData);
      setFormData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        companyName: userData.companyName || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        tag: userData.tag || "",
      });
    }

    // Load notification settings
    const savedNotifications = localStorage.getItem("notificationSettings")
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications))
    }
  }, [authUser, authLoading, isAuthenticated, router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setMessage(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update user data
      const updatedUser = {
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        companyName: formData.companyName,
        tag: formData.tag,
      }

      setUser(updatedUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))

      setMessage({ type: "success", text: "Profil başarıyla güncellendi!" })
    } catch (error) {
      setMessage({ type: "error", text: "Profil güncellenirken bir hata oluştu." })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (formData.currentPassword !== user.password) {
      setMessage({ type: "error", text: "Mevcut şifreniz yanlış." })
      return
    }

    if (formData.newPassword.length < 8) {
      setMessage({ type: "error", text: "Yeni şifre en az 8 karakter olmalıdır." })
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Yeni şifreler eşleşmiyor." })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update password
      const updatedUser = { ...user, password: formData.newPassword }

      // Update in users array
      const users = JSON.parse(localStorage.getItem("users") || "[]") as UserData[]
      const userIndex = users.findIndex((u) => u.id === user.id)
      if (userIndex >= 0) {
        users[userIndex] = updatedUser
        localStorage.setItem("users", JSON.stringify(users))
      }

      // Update current user
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      setUser(updatedUser)

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))

      setMessage({ type: "success", text: "Şifreniz başarıyla değiştirildi!" })
    } catch (error) {
      setMessage({ type: "error", text: "Şifre değiştirilirken bir hata oluştu." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    const updatedNotifications = { ...notifications, [key]: value }
    setNotifications(updatedNotifications)
    localStorage.setItem("notificationSettings", JSON.stringify(updatedNotifications))
    setMessage({ type: "success", text: "Bildirim ayarları güncellendi!" })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/player">
                <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-800 hover:bg-green-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Geri Dön
                </Button>
              </Link>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                Ayarlar
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/profile">
                <Button variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  <User className="h-4 w-4 mr-2" />
                  Profilim
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <Card className="mb-8 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.avatar_url || "/placeholder.svg"} alt={user?.firstName} />
                <AvatarFallback className="bg-gradient-to-r from-green-500 to-green-600 text-white text-lg">
                  {user?.firstName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-green-800">{user?.firstName} {user?.lastName}</h2>
                <p className="text-green-600">{user?.email}</p>
                {user?.tag && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Hash className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">{user.tag}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message Alert */}
        {message && (
          <Alert
            className={`mb-6 ${message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === "success" ? "text-green-700" : "text-red-700"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-green-100 p-1 rounded-lg">
          <Button
            variant={activeTab === "profile" ? "default" : "ghost"}
            onClick={() => setActiveTab("profile")}
            className={`flex-1 ${activeTab === "profile" ? "bg-white text-green-800 shadow-sm" : "text-green-700 hover:text-green-800"}`}
          >
            <User className="h-4 w-4 mr-2" />
            Profil
          </Button>
          <Button
            variant={activeTab === "notifications" ? "default" : "ghost"}
            onClick={() => setActiveTab("notifications")}
            className={`flex-1 ${activeTab === "notifications" ? "bg-white text-green-800 shadow-sm" : "text-green-700 hover:text-green-800"}`}
          >
            <Bell className="h-4 w-4 mr-2" />
            Bildirimler
          </Button>
          <Button
            variant={activeTab === "security" ? "default" : "ghost"}
            onClick={() => setActiveTab("security")}
            className={`flex-1 ${activeTab === "security" ? "bg-white text-green-800 shadow-sm" : "text-green-700 hover:text-green-800"}`}
          >
            <Shield className="h-4 w-4 mr-2" />
            Güvenlik
          </Button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Profil Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Ad</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Soyad</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-posta Adresi</Label>
                  <Input id="email" value={user.email} disabled className="bg-gray-50 border-gray-200" />
                  <p className="text-sm text-gray-500">E-posta adresi değiştirilemez</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center text-green-800">
                    <Smartphone className="w-4 h-4 mr-2" />
                    Telefon
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0555 123 45 67"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tag" className="flex items-center text-green-800">
                    <Hash className="w-4 h-4 mr-2" />
                    Kullanıcı Etiketi
                  </Label>
                  <Input
                    id="tag"
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="#1234"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                  <p className="text-xs text-green-600">
                    Bu etiket diğer kullanıcılar tarafından sizi bulmak için kullanılır
                  </p>
                </div>

                {user.roles.includes("owner") && (
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Şirket/Saha Adı</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>
                )}

                <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
                  {isLoading ? "Güncelleniyor..." : "Profili Güncelle"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Bildirim Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-green-600" />
                    <div>
                      <Label className="text-base">Maç Hatırlatmaları</Label>
                      <p className="text-sm text-gray-600">Yaklaşan maçlar için bildirim al</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.matchReminders}
                    onCheckedChange={(checked) => handleNotificationChange("matchReminders", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-green-600" />
                    <div>
                      <Label className="text-base">Takım Davetleri</Label>
                      <p className="text-sm text-gray-600">Takım katılma istekleri için bildirim al</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.teamInvites}
                    onCheckedChange={(checked) => handleNotificationChange("teamInvites", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <Label className="text-base">Ödeme Hatırlatmaları</Label>
                      <p className="text-sm text-gray-600">Bekleyen ödemeler için bildirim al</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.paymentReminders}
                    onCheckedChange={(checked) => handleNotificationChange("paymentReminders", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-green-600" />
                    <div>
                      <Label className="text-base">Yeni Mesajlar</Label>
                      <p className="text-sm text-gray-600">Chat mesajları için bildirim al</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.newMessages}
                    onCheckedChange={(checked) => handleNotificationChange("newMessages", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-green-600" />
                    <div>
                      <Label className="text-base">E-posta Bildirimleri</Label>
                      <p className="text-sm text-gray-600">E-posta ile bildirim al</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-5 w-5 text-green-600" />
                    <div>
                      <Label className="text-base">Push Bildirimleri</Label>
                      <p className="text-sm text-gray-600">Tarayıcı bildirimleri al</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => handleNotificationChange("pushNotifications", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Güvenlik Ayarları</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="border-green-200 focus:border-green-400 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Yeni Şifre</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="border-green-200 focus:border-green-400"
                    placeholder="En az 8 karakter"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Yeni Şifre Tekrar</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="border-green-200 focus:border-green-400"
                    placeholder="Yeni şifrenizi tekrar girin"
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
                  {isLoading ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
