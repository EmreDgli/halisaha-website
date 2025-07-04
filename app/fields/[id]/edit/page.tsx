"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Save } from "lucide-react"
import { getFieldDetails, updateField } from "@/lib/api/fields"

export default function EditFieldPage() {
  const router = useRouter()
  const params = useParams() as { id: string }
  const [form, setForm] = useState({
    name: "",
    address: "",
    hourly_rate: "",
    description: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadField = async () => {
      setLoading(true)
      setError("")
      try {
        const { data, error } = await getFieldDetails(params.id)
        if (error || !data) setError("Saha bulunamadı.")
        else setForm({
          name: data.name || "",
          address: data.address || "",
          hourly_rate: data.hourly_rate?.toString() || "",
          description: data.description || "",
        })
      } catch (e) {
        setError("Saha bulunamadı.")
      } finally {
        setLoading(false)
      }
    }
    loadField()
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      await updateField(params.id, {
        name: form.name,
        address: form.address,
        hourly_rate: Number(form.hourly_rate),
        description: form.description,
      })
      router.push("/dashboard/owner")
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-green-700">Yükleniyor...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-lg shadow-xl border-green-200">
        <CardHeader>
          <CardTitle className="text-2xl text-green-800 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-green-600" />
            Saha Bilgilerini Düzenle
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
            <div className="space-y-2">
              <Label htmlFor="hourly_rate" className="text-green-800">Saatlik Ücret (₺) *</Label>
              <Input id="hourly_rate" name="hourly_rate" type="number" min="0" value={form.hourly_rate} onChange={handleChange} required className="border-green-200 focus:border-green-500 focus:ring-green-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-green-800">Açıklama</Label>
              <Textarea id="description" name="description" value={form.description} onChange={handleChange} className="border-green-200 focus:border-green-500 focus:ring-green-500" rows={3} />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-lg flex items-center justify-center gap-2" disabled={saving}>
              <Save className="w-5 h-5" />
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 