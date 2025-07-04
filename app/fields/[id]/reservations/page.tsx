"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import { getFieldDetails, getFieldReservations } from "@/lib/api/fields"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

export default function FieldReservationsPage() {
  const params = useParams() as { id: string }
  const [fieldName, setFieldName] = useState("")
  const [loading, setLoading] = useState(true)
  const [reservations, setReservations] = useState<any[]>([])
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newRes, setNewRes] = useState({
    title: '',
    start: '',
    end: '',
    description: ''
  })
  const { toast } = useToast()

  // FullCalendar ve plugin'leri sadece client-side'da require et
  let FullCalendar, dayGridPlugin, timeGridPlugin, interactionPlugin, trLocale
  if (typeof window !== "undefined") {
    FullCalendar = require("@fullcalendar/react").default
    dayGridPlugin = require("@fullcalendar/daygrid").default
    timeGridPlugin = require("@fullcalendar/timegrid").default
    interactionPlugin = require("@fullcalendar/interaction").default
    trLocale = require("@fullcalendar/core/locales/tr").default
  }

  useEffect(() => {
    const loadField = async () => {
      setLoading(true)
      try {
        const { data } = await getFieldDetails(params.id)
        setFieldName(data?.name || "")
        const reservationsData = await getFieldReservations(params.id)
        setReservations(reservationsData || [])
      } finally {
        setLoading(false)
      }
    }
    loadField()
  }, [params.id])

  // Takvimde event tıklanınca detay modalı aç
  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event)
    setShowEventModal(true)
  }
  // Takvimde boş alana tıklayınca yeni rezervasyon modalı aç
  const handleDateSelect = (selectInfo: any) => {
    setNewRes({
      title: '',
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      description: ''
    })
    setShowAddModal(true)
  }
  // Yeni rezervasyon ekle (örnek, gerçek API ile entegre edilebilir)
  const handleAddReservation = async (e: React.FormEvent) => {
    e.preventDefault()
    setShowAddModal(false)
    toast({ title: 'Rezervasyon eklendi (örnek)', description: `${newRes.title} (${newRes.start} - ${newRes.end})` })
    // Burada Supabase'e ekleme yapılabilir
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-green-700">Yükleniyor...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-4xl shadow-xl border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-2xl text-green-800 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-green-600" />
              {fieldName} - Rezervasyon Takvimi
            </CardTitle>
            <Link href="/dashboard/owner">
              <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
                Geri Dön
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-4">
            {typeof window !== "undefined" && FullCalendar && (
              <>
                <div className="flex justify-end mb-4">
                  <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
                    + Yeni Rezervasyon
                  </Button>
                </div>
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  locale={trLocale}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                  }}
                  height={600}
                  events={reservations.map(r => ({
                    id: r.id,
                    title: r.title || 'Rezerve',
                    start: r.start_time,
                    end: r.end_time,
                    description: r.description,
                    backgroundColor: '#16a34a',
                    borderColor: '#16a34a',
                    textColor: '#fff',
                  }))}
                  eventDisplay="block"
                  nowIndicator
                  eventClick={handleEventClick}
                  selectable
                  select={handleDateSelect}
                />
                {/* Rezervasyon Detay Modalı */}
                <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rezervasyon Detayı</DialogTitle>
                      <DialogDescription>
                        {selectedEvent && (
                          <div className="space-y-2 mt-2">
                            <div><b>Başlık:</b> {selectedEvent.title}</div>
                            <div><b>Başlangıç:</b> {selectedEvent.start?.toLocaleString()}</div>
                            <div><b>Bitiş:</b> {selectedEvent.end?.toLocaleString()}</div>
                            <div><b>Açıklama:</b> {selectedEvent.extendedProps?.description || '-'}</div>
                          </div>
                        )}
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
                {/* Yeni Rezervasyon Ekle Modalı */}
                <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Yeni Rezervasyon Ekle</DialogTitle>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={handleAddReservation}>
                      <div>
                        <Label>Başlık</Label>
                        <Input value={newRes.title} onChange={e => setNewRes({ ...newRes, title: e.target.value })} required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Başlangıç</Label>
                          <Input type="datetime-local" value={newRes.start} onChange={e => setNewRes({ ...newRes, start: e.target.value })} required />
                        </div>
                        <div>
                          <Label>Bitiş</Label>
                          <Input type="datetime-local" value={newRes.end} onChange={e => setNewRes({ ...newRes, end: e.target.value })} required />
                        </div>
                      </div>
                      <div>
                        <Label>Açıklama</Label>
                        <Textarea value={newRes.description} onChange={e => setNewRes({ ...newRes, description: e.target.value })} />
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">Kaydet</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 