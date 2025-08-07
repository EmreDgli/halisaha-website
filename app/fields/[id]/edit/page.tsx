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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function EditFieldPage() {
  const router = useRouter()
  const params = useParams() as { id: string }
  const [form, setForm] = useState({
    name: "",
    address: "",
    hourly_rate: "",
    description: "",
    city: "",
    district: "",
    field_count: "1",
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
          city: data.city || "",
          district: data.district || "",
          field_count: data.field_count?.toString() || "1",
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
        city: form.city,
        district: form.district,
        field_count: Number(form.field_count),
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

  // Türkiye şehir/ilçe örnek verisi
  const cityDistricts: { [key: string]: string[] } = {
    "Antalya": [
      "Aksu", "Alanya", "Demre", "Döşemealtı", "Elmalı", "Finike", "Gazipaşa", "Gündoğmuş", "İbradı", "Kaş", "Kemer", "Kepez", "Konyaaltı", "Korkuteli", "Kumluca", "Manavgat", "Muratpaşa", "Serik"
    ]
  };
  const cityOptions = Object.keys(cityDistricts);
  const districtOptions = form.city && cityDistricts[form.city] ? cityDistricts[form.city] : [];

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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-green-800">Şehir *</Label>
                <Select value={form.city} onValueChange={value => setForm({ ...form, city: value, district: "" })}>
                  <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500 appearance-none bg-none">
                    <SelectValue placeholder="Şehir seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {cityOptions.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="district" className="text-green-800">İlçe *</Label>
                <Select value={form.district} onValueChange={value => setForm({ ...form, district: value })} disabled={!form.city}>
                  <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500 appearance-none bg-none">
                    <SelectValue placeholder="İlçe seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {districtOptions.map((district: string) => (
                      <SelectItem key={district} value={district}>{district}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-green-800">Adres *</Label>
              <Input id="address" name="address" value={form.address} onChange={handleChange} required className="border-green-200 focus:border-green-500 focus:ring-green-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="field_count" className="text-green-800">Saha Sayısı *</Label>
              <Input id="field_count" name="field_count" type="number" min="1" step="1" value={form.field_count} onChange={handleChange} required className="border-green-200 focus:border-green-500 focus:ring-green-500" />
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