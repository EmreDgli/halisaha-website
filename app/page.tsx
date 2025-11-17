"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Trophy, CreditCard, MessageCircle, Shield, Star, CheckCircle, Video, Hash, User } from "lucide-react"
import Link from "next/link"
import { useAuthContext } from "@/components/AuthProvider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const features = [
    {
      icon: Users,
      title: "Takım Yönetimi",
      description: "Takım oluştur, üye davet et ve takım içi sohbet et. Arkadaşlarınla organize ol!",
    },
    {
      icon: Calendar,
      title: "Kolay Maç Organizasyonu",
      description: "Birkaç tıkla maç oluştur, rakip bul ve saha rezervasyonu yap. Hızlı ve pratik!",
    },
    {
      icon: Video,
      title: "Maç Videoları",
      description: "Maç videolarını izle, puan ver ve en iyi gol anlarını keşfet",
    },
    {
      icon: CreditCard,
      title: "Güvenli Ödeme Sistemi",
      description: "Kredi kartı, mobil ödeme veya nakit seçenekleri ile güvenle öde",
    },
    {
      icon: MessageCircle,
      title: "Gerçek Zamanlı Sohbet",
      description: "Takım arkadaşlarınla anlık mesajlaşma ve koordinasyon sağla",
    },
    {
      icon: Shield,
      title: "Güvenli Platform",
      description: "KVKK ve GDPR uyumlu veri güvenliği ile bilgileriniz güvende",
    },
  ]

  const testimonials = [
    {
      name: "Ahmet Yılmaz",
      role: "Takım Kaptanı",
      comment:
        "HalıSaha Pro sayesinde takımımızı organize etmek çok kolay oldu. Artık her hafta düzenli maçlarımız var!",
      rating: 5,
    },
    {
      name: "Mehmet Kaya",
      role: "Saha Sahibi",
      comment: "Sahalarımın rezervasyonlarını yönetmek hiç bu kadar kolay olmamıştı. Gelirlerim %40 arttı!",
      rating: 5,
    },
  ]

  const { user, loading, isAuthenticated } = useAuthContext()
  const router = useRouter()

  console.log("HOME PAGE RENDER", { user, loading, isAuthenticated });
  console.log("USER PROFILE:", user?.profile);
  console.log("USER TAG:", user?.profile?.tag);
  
  // Otomatik yönlendirmeyi kaldırdık - kullanıcılar anasayfada kalabilir
  // useEffect(() => {
  //   if (isAuthenticated && user?.profile) {
  //     console.log("USER PROFILE:", user?.profile);
  //     console.log("USER TAG:", user?.profile?.tag);
  //     
  //     const roles = user.profile.roles;
  //     if (roles.length > 1) {
  //       console.log("Multiple roles, redirecting to role selection");
  //       router.push("/role-selection");
  //     } else if (roles.length === 1) {
  //       const role = roles[0];
  //       console.log("Single role, redirecting to dashboard:", role);
  //       if (role === "player") {
  //         router.push("/dashboard/player");
  //       } else if (role === "field_owner" || role === "owner") {
  //         router.push("/dashboard/owner");
  //       }
  //     }
  //   }
  // }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-green-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
              HalıSaha Pro
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            {!isAuthenticated ? (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-gray-700 hover:text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg transition-all duration-200">
                    Giriş Yap
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 px-6 py-2 rounded-lg font-medium">
                    Hemen Kayıt Ol
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/profile">
                  <Button variant="ghost" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all duration-200">
                    <User className="w-4 h-4 mr-2" />
                    Profilim
                  </Button>
                </Link>
                <Link href="/dashboard/player">
                  <Button variant="ghost" className="text-gray-700 hover:text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg transition-all duration-200">
                    Oyuncu Paneli
                  </Button>
                </Link>
                {user?.profile?.roles?.includes("field_owner") && (
                  <Link href="/dashboard/owner">
                    <Button variant="ghost" className="text-gray-700 hover:text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg transition-all duration-200">
                      Saha Sahibi Paneli
                    </Button>
                  </Link>
                )}
                {user?.profile?.tag && (
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 rounded-full border border-green-200">
                    <Hash className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">{user.profile.tag}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-green-50"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Main Heading */}
            <div className="mb-8">
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Futbol Tutkunları
                <span className="block bg-gradient-to-r from-green-600 via-green-500 to-green-700 bg-clip-text text-transparent">
                  Burada Buluşuyor
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Takım kur, maç organize et, rakip bul. Halı saha deneyimini dijitalleştir ve 
                futbol arkadaşlarınla unutulmaz anlar yaşa.
              </p>
            </div>

            {/* Primary CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/auth/register?type=player">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 px-8 py-4 text-lg font-semibold rounded-xl"
                >
                  🚀 Oyuncu Olarak Başla
                </Button>
              </Link>
              <Link href="/auth/register?type=owner">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 px-8 py-4 text-lg font-semibold rounded-xl"
                >
                  🏟️ Saha Sahibi Ol
                </Button>
              </Link>
            </div>

            {/* Secondary Actions */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <Link href="/teams/search">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg transition-all duration-200"
                >
                  🔍 Takım Ara
                </Button>
              </Link>
              <Link href="/matches/suggestions">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg transition-all duration-200"
                >
                  ⚽ Maç Ara
                </Button>
              </Link>
              <Link href="/videos">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg transition-all duration-200"
                >
                  🎥 Videolar
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center group">
                <div className="text-4xl font-bold text-green-600 group-hover:text-green-700 transition-colors duration-200">500+</div>
                <div className="text-sm text-gray-600 font-medium">Aktif Oyuncu</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl font-bold text-green-600 group-hover:text-green-700 transition-colors duration-200">50+</div>
                <div className="text-sm text-gray-600 font-medium">Kayıtlı Saha</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl font-bold text-green-600 group-hover:text-green-700 transition-colors duration-200">1000+</div>
                <div className="text-sm text-gray-600 font-medium">Tamamlanan Maç</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h3 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Neden HalıSaha Pro?</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Futbol tutkunu arkadaşlarınla buluşmanın en kolay ve eğlenceli yolu
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 bg-white hover:bg-gray-50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group rounded-2xl overflow-hidden"
              >
                <CardHeader className="text-center p-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300 shadow-lg">
                    <feature.icon className="w-10 h-10 text-green-600" />
                  </div>
                  <CardTitle className="text-gray-900 text-xl font-bold mb-4">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h3 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Nasıl Çalışır?</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">3 basit adımda maç organize edin</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-r from-green-600 to-green-700 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white text-3xl font-bold shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                1
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Kayıt Ol & Takım Oluştur</h4>
              <p className="text-gray-600 text-lg leading-relaxed">Hızlıca kayıt ol ve takımını oluştur. Arkadaşlarını davet et!</p>
            </div>

            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-r from-green-600 to-green-700 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white text-3xl font-bold shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                2
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Maç Organize Et</h4>
              <p className="text-gray-600 text-lg leading-relaxed">Tarih, saat ve saha seç. Rakip takım bul veya davet gönder.</p>
            </div>

            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-r from-green-600 to-green-700 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white text-3xl font-bold shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                3
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Oyna & Paylaş</h4>
              <p className="text-gray-600 text-lg leading-relaxed">Maçını oyna, videoları paylaş ve skorları takip et!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h3 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Kullanıcılarımız Ne Diyor?</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Platformumuzu kullanan oyuncu ve saha sahiplerinin deneyimleri</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 p-8 rounded-2xl">
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">"{testimonial.comment}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-700 font-bold text-lg">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                    <div className="text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-green-600 to-green-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h3 className="text-4xl lg:text-5xl font-bold mb-8">Hemen Başla ve Futbol Ağını Genişlet!</h3>
          <p className="text-xl lg:text-2xl mb-10 opacity-95 max-w-3xl mx-auto leading-relaxed">
            Binlerce oyuncu ve saha sahibi seni bekliyor. Ücretsiz kayıt ol ve ilk maçını organize et!
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link href="/auth/register">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-green-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 px-10 py-5 text-lg font-semibold rounded-xl"
                onClick={() => {
                  // Analytics tracking için
                  console.log("Register button clicked")
                }}
              >
                🚀 Ücretsiz Kayıt Ol
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-green-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 px-10 py-5 text-lg font-semibold rounded-xl"
              >
                Zaten Üyeyim
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-base opacity-90">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-3" />
              Ücretsiz Kayıt
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-3" />
              Anında Kullanım
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-3" />
              Güvenli Platform
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">HalıSaha Pro</span>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">Futbol tutkunu arkadaşlarınla buluşmanın en kolay yolu</p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Platform</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="hover:text-green-400 transition-colors duration-200 cursor-pointer">Takım Oluştur</li>
                <li className="hover:text-green-400 transition-colors duration-200 cursor-pointer">Maç Organize Et</li>
                <li className="hover:text-green-400 transition-colors duration-200 cursor-pointer">Saha Kirala</li>
                <li className="hover:text-green-400 transition-colors duration-200 cursor-pointer">İstatistikler</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Destek</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="hover:text-green-400 transition-colors duration-200 cursor-pointer">Yardım Merkezi</li>
                <li className="hover:text-green-400 transition-colors duration-200 cursor-pointer">İletişim</li>
                <li className="hover:text-green-400 transition-colors duration-200 cursor-pointer">SSS</li>
                <li className="hover:text-green-400 transition-colors duration-200 cursor-pointer">Geri Bildirim</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Yasal</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="hover:text-green-400 transition-colors duration-200 cursor-pointer">Kullanım Şartları</li>
                <li className="hover:text-green-400 transition-colors duration-200 cursor-pointer">Gizlilik Politikası</li>
                <li className="hover:text-green-400 transition-colors duration-200 cursor-pointer">KVKK</li>
                <li className="hover:text-green-400 transition-colors duration-200 cursor-pointer">Çerez Politikası</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p className="text-lg">&copy; 2025 HalıSaha Pro. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
