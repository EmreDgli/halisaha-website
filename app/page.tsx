"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Trophy, CreditCard, MessageCircle, Shield, Star, CheckCircle, Video } from "lucide-react"
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

  const { user, loading, setUser } = useAuthContext()
  const router = useRouter()

  console.log("ROLE SELECTION PAGE RENDER", { user, loading });
  useEffect(() => {
    console.log("USEEFFECT", { user, loading });
    if (loading) return;
    if (!user) {
      console.log("user yok, login'e yönlendiriliyor");
      router.push("/auth/login");
      return;
    }
    const roles = user.profile?.roles || [];
    console.log("roles:", roles);
    if (roles.length === 1) {
      if (roles.includes("player")) {
        router.push("/dashboard/player");
      } else if (roles.includes("field_owner")) {
        router.push("/dashboard/owner");
      }
    }
    // 2 rol varsa, kullanıcıya seçim ekranı göster
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
              HalıSaha Pro
            </h1>
          </div>
          <div className="space-x-4">
            <Link href="/auth/login">
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                Giriş Yap
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                Hemen Kayıt Ol
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-100/50 to-green-200/30"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-6xl font-bold text-green-800 mb-6 leading-tight">
              Halı Saha Deneyimini
              <span className="block bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                Yeniden Tanımla
              </span>
            </h2>
            <p className="text-xl text-green-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Takım oluştur, maç organize et, rakip bul ve halı saha rezervasyonunu kolaylaştır. Futbol tutkunu
              arkadaşlarınla buluş ve unutulmaz maçlar yaşa!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/auth/register?type=player">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-8 py-4 text-lg"
                >
                  🏃‍♂️ Oyuncu Olarak Başla
                </Button>
              </Link>
              <Link href="/videos">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 text-lg"
                  onClick={() => {
                    console.log("Videos button clicked")
                  }}
                >
                  🎥 Maç Videoları İzle
                </Button>
              </Link>
              <Link href="/auth/register?type=owner">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 text-lg"
                >
                  🏟️ Saha Sahibi Olarak Başla
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700">500+</div>
                <div className="text-sm text-green-600">Aktif Oyuncu</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700">50+</div>
                <div className="text-sm text-green-600">Kayıtlı Saha</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700">1000+</div>
                <div className="text-sm text-green-600">Tamamlanan Maç</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-green-800 mb-4">Neden HalıSaha Pro?</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Futbol tutkunu arkadaşlarınla buluşmanın en kolay ve eğlenceli yolu
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-green-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-green-200 group-hover:to-green-300 transition-all">
                    <feature.icon className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-green-800 text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-green-800 mb-4">Nasıl Çalışır?</h3>
            <p className="text-xl text-gray-600">3 basit adımda maç organize edin</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h4 className="text-xl font-semibold text-green-800 mb-3">Kayıt Ol & Takım Oluştur</h4>
              <p className="text-gray-600">Hızlıca kayıt ol ve takımını oluştur. Arkadaşlarını davet et!</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h4 className="text-xl font-semibold text-green-800 mb-3">Maç Organize Et</h4>
              <p className="text-gray-600">Tarih, saat ve saha seç. Rakip takım bul veya davet gönder.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h4 className="text-xl font-semibold text-green-800 mb-3">Oyna & Eğlen</h4>
              <p className="text-gray-600">Güvenli ödeme yap, sahaya git ve harika maçlar yaşa!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-green-800 mb-4">Kullanıcılarımız Ne Diyor?</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-green-200 p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.comment}"</p>
                <div>
                  <div className="font-semibold text-green-800">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 text-center relative">
          <h3 className="text-4xl font-bold mb-6">Hemen Başla ve Futbol Ağını Genişlet!</h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Binlerce oyuncu ve saha sahibi seni bekliyor. Ücretsiz kayıt ol ve ilk maçını organize et!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
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
                className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 text-lg"
              >
                Zaten Üyeyim
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-6 text-sm opacity-80">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Ücretsiz Kayıt
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Anında Kullanım
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Güvenli Platform
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Trophy className="w-6 h-6" />
                <span className="text-xl font-bold">HalıSaha Pro</span>
              </div>
              <p className="text-green-200">Futbol tutkunu arkadaşlarınla buluşmanın en kolay yolu</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-green-200">
                <li>Takım Oluştur</li>
                <li>Maç Organize Et</li>
                <li>Saha Kirala</li>
                <li>İstatistikler</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Destek</h4>
              <ul className="space-y-2 text-green-200">
                <li>Yardım Merkezi</li>
                <li>İletişim</li>
                <li>SSS</li>
                <li>Geri Bildirim</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Yasal</h4>
              <ul className="space-y-2 text-green-200">
                <li>Kullanım Şartları</li>
                <li>Gizlilik Politikası</li>
                <li>KVKK</li>
                <li>Çerez Politikası</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-green-700 mt-8 pt-8 text-center text-green-200">
            <p>&copy; 2024 HalıSaha Pro. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
