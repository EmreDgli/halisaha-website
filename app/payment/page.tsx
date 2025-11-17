"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Smartphone, Banknote, Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/components/AuthProvider"

export default function PaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile" | "cash">("card")
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  })
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { user, loading: authLoading, isAuthenticated } = useAuthContext()

  // Authentication kontrolü
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) {
      console.log("Kullanıcı giriş yapmamış, login'e yönlendiriliyor");
      router.push("/auth/login");
      return;
    }
  }, [user, authLoading, isAuthenticated, router]);

  const matchDetails = {
    homeTeam: "Yıldızlar FC",
    awayTeam: "Galibiyetspor",
    date: "15 Ocak 2024",
    time: "19:00",
    field: "Merkez Halı Saha",
    duration: "90 dakika",
    fieldCost: 200,
    platformFee: 25,
    total: 225,
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsLoading(true)
      console.log("Payment data:", { paymentMethod, cardData })

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock payment success/failure
      const isSuccess = Math.random() > 0.1 // 90% success rate

      if (isSuccess) {
        router.push("/payment/success")
      } else {
        alert("Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.")
      }
    } catch (error) {
      console.error("Payment error:", error)
      alert("Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard/player" className="flex items-center text-green-600 hover:text-green-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Panele Dön
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">Ödeme Bilgileri</CardTitle>
              <CardDescription>Güvenli ödeme yöntemini seçin ve bilgilerinizi girin</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-6">
                {/* Payment Method Selection */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Ödeme Yöntemi</Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value: "card" | "mobile" | "cash") => setPaymentMethod(value)}
                  >
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="card" id="card" />
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        Kredi/Banka Kartı
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="mobile" id="mobile" />
                      <Smartphone className="w-5 h-5 text-purple-600" />
                      <Label htmlFor="mobile" className="flex-1 cursor-pointer">
                        Mobil Ödeme
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="cash" id="cash" />
                      <Banknote className="w-5 h-5 text-green-600" />
                      <Label htmlFor="cash" className="flex-1 cursor-pointer">
                        Nakit (Sahada Ödeme)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Card Payment Form */}
                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Kart Üzerindeki İsim</Label>
                      <Input
                        id="cardName"
                        value={cardData.name}
                        onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                        placeholder="Ad Soyad"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Kart Numarası</Label>
                      <Input
                        id="cardNumber"
                        value={cardData.number}
                        onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Son Kullanma</Label>
                        <Input
                          id="expiry"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Payment */}
                {paymentMethod === "mobile" && (
                  <div className="space-y-4">
                    <div className="text-center p-6 border rounded-lg bg-purple-50">
                      <Smartphone className="w-12 h-12 mx-auto text-purple-600 mb-4" />
                      <p className="font-medium">Mobil Ödeme</p>
                      <p className="text-sm text-gray-600 mt-2">Telefon numaranıza SMS ile onay kodu gönderilecek</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon Numarası</Label>
                      <Input id="phone" type="tel" placeholder="0555 123 45 67" required />
                    </div>
                  </div>
                )}

                {/* Cash Payment */}
                {paymentMethod === "cash" && (
                  <div className="text-center p-6 border rounded-lg bg-green-50">
                    <Banknote className="w-12 h-12 mx-auto text-green-600 mb-4" />
                    <p className="font-medium">Nakit Ödeme</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Ödemeyi maç günü sahada yapabilirsiniz. Rezervasyon onaylanacak.
                    </p>
                  </div>
                )}

                {/* Security Info */}
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-blue-800">Ödeme bilgileriniz SSL ile şifrelenir ve güvenle işlenir</p>
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 py-3" disabled={isLoading}>
                  {isLoading
                    ? "İşleniyor..."
                    : paymentMethod === "cash"
                      ? "Rezervasyonu Onayla"
                      : `₺${matchDetails.total} Öde`}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Maç Özeti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="font-semibold text-lg">
                  {matchDetails.homeTeam} vs {matchDetails.awayTeam}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    📅 {matchDetails.date} - {matchDetails.time}
                  </p>
                  <p>📍 {matchDetails.field}</p>
                  <p>⏱️ {matchDetails.duration}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Saha Kirası</span>
                  <span>₺{matchDetails.fieldCost}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Ücreti</span>
                  <span>₺{matchDetails.platformFee}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Toplam</span>
                  <span>₺{matchDetails.total}</span>
                </div>
                <div className="text-sm text-gray-600">Takım başına: ₺{matchDetails.total / 2}</div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Bilgi:</strong> Rakip takım onayladıktan sonra ödeme alınacak
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
