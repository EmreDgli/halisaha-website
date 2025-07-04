"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Plus } from "lucide-react"
import { createField } from "@/lib/api/fields"

export default function CreateFieldPage() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    district: "",
    hourlyRate: "",
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await createField({
        name: form.name,
        address: form.address,
        hourly_rate: Number(form.hourlyRate),
        description: `${form.city} / ${form.district}${form.description ? ' - ' + form.description : ''}`,
      })
      router.push("/dashboard/owner")
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-lg shadow-xl border-green-200">
        <CardHeader>
          <CardTitle className="text-2xl text-green-800 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-green-600" />
            Yeni Saha Ekle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-green-800">Saha Adı *</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required className="border-green-200 focus:border-green-500 focus:ring-green-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-green-800">Adres *</Label>
              <Input id="address" name="address" value={form.address} onChange={handleChange} required className="border-green-200 focus:border-green-500 focus:ring-green-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-green-800">Şehir *</Label>
                <Input id="city" name="city" value={form.city} onChange={handleChange} required className="border-green-200 focus:border-green-500 focus:ring-green-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district" className="text-green-800">İlçe *</Label>
                <Input id="district" name="district" value={form.district} onChange={handleChange} required className="border-green-200 focus:border-green-500 focus:ring-green-500" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourlyRate" className="text-green-800">Saatlik Ücret (₺) *</Label>
              <Input id="hourlyRate" name="hourlyRate" type="number" min="0" value={form.hourlyRate} onChange={handleChange} required className="border-green-200 focus:border-green-500 focus:ring-green-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-green-800">Açıklama</Label>
              <Textarea id="description" name="description" value={form.description} onChange={handleChange} className="border-green-200 focus:border-green-500 focus:ring-green-500" rows={3} />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-lg flex items-center justify-center gap-2" disabled={loading}>
              <Plus className="w-5 h-5" />
              {loading ? "Ekleniyor..." : "Saha Oluştur"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 