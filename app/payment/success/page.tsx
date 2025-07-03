"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Home, Calendar, Receipt } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function PaymentSuccessPage() {
  const [countdown, setCountdown] = useState(10)
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push("/dashboard/player")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-green-200">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Ödeme Başarılı!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-green-700">Ödemeniz başarıyla tamamlandı. Maç rezervasyonunuz onaylanmıştır.</p>
            <p className="text-sm text-green-600">
              İşlem numarası: <span className="font-mono">TXN_{Date.now()}</span>
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">📧 Ödeme onayı e-posta adresinize gönderilmiştir.</p>
          </div>

          <div className="space-y-3">
            <Link href="/dashboard/player">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                <Home className="w-4 h-4 mr-2" />
                Panele Dön
              </Button>
            </Link>

            <Link href="/matches">
              <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                <Calendar className="w-4 h-4 mr-2" />
                Maçlarım
              </Button>
            </Link>

            <Link href="/payments">
              <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                <Receipt className="w-4 h-4 mr-2" />
                Ödeme Geçmişi
              </Button>
            </Link>
          </div>

          <div className="text-sm text-green-600">
            {countdown} saniye sonra otomatik olarak panele yönlendirileceksiniz...
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
