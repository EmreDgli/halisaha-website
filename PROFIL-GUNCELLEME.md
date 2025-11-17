# Profil Güncelleme Özellikleri

## Genel Bakış
Bu güncelleme ile kullanıcılar artık detaylı futbol profillerini oluşturabilir, düzenleyebilir ve görüntüleyebilir.

## Yeni Özellikler

### 1. Profil Düzenleme Sayfası (`/profile/edit`)
- **Mevki Seçimi**: Kaleci, Defans, Orta Saha, Forvet, Joker, Kaleci Hariç Her Yer, Her Yer
- **Seviye Belirleme**: Başlangıç, Orta, İleri, Profesyonel
- **Tercih Edilen Şehir**: Kullanıcının oynamayı tercih ettiği şehir
- **Müsaitlik**: Hafta içi, Hafta sonu, Her zaman
- **Tercih Edilen Saat**: Sabah, Öğlen, Akşam
- **Deneyim**: Futbol oynama deneyimi (yıl cinsinden)
- **Hakkımda**: Kullanıcının kendisi hakkında yazabileceği metin alanı

### 2. Profil Görüntüleme Sayfası (`/profile`)
- Sadece profil bilgilerini görüntüleme
- Profil düzenleme sayfasına kolay erişim
- Profil tamamlanmamışsa uyarı mesajı

### 3. Navigation Güncellemeleri
- Ana sayfa header'ında profil linki
- Player dashboard'da profil linki
- Owner dashboard'da profil linki
- Settings sayfasında profil linki

## Teknik Detaylar

### Supabase Veritabanı
- `profiles` tablosu kullanılıyor
- Row Level Security (RLS) aktif
- Kullanıcılar sadece kendi profillerini düzenleyebilir

### Veri Yapısı
```sql
CREATE TABLE profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  position TEXT,
  skill_level TEXT,
  preferred_city TEXT,
  availability TEXT,
  experience_years INTEGER DEFAULT 0,
  preferred_time TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Güvenlik
- Kullanıcılar sadece kendi profillerini görüntüleyebilir ve düzenleyebilir
- RLS politikaları ile veri güvenliği sağlanıyor
- Otomatik `updated_at` timestamp güncellemesi

## Kullanım

### Profil Oluşturma
1. `/profile/edit` sayfasına git
2. Tüm alanları doldur
3. "Profili Kaydet" butonuna tıkla
4. Veriler Supabase'e kaydedilir

### Profil Görüntüleme
1. `/profile` sayfasına git
2. Mevcut profil bilgilerini görüntüle
3. "Profili Düzenle" butonu ile düzenleme yap

### Profil Güncelleme
1. `/profile/edit` sayfasına git
2. Mevcut veriler otomatik yüklenir
3. Değişiklikleri yap
4. "Profili Kaydet" butonuna tıkla

## UI/UX Özellikleri

### Modern Tasarım
- Gradient arka planlar
- Gölgeli kartlar
- Responsive grid layout
- İkonlu etiketler

### Kullanıcı Deneyimi
- Loading states
- Toast bildirimleri
- Form validasyonu
- Kolay navigasyon

### Responsive Tasarım
- Mobil uyumlu
- Tablet uyumlu
- Desktop uyumlu
- Grid sistem ile esnek layout

## Gelecek Geliştirmeler

### Planlanan Özellikler
- Profil fotoğrafı yükleme
- Sosyal medya linkleri
- Oyuncu istatistikleri
- Takım önerileri
- Maç eşleştirme algoritması

### Teknik İyileştirmeler
- Offline veri desteği
- Real-time güncellemeler
- Gelişmiş arama filtreleri
- API rate limiting
- Cache optimizasyonu

## Test

### Test Senaryoları
1. Yeni kullanıcı profil oluşturma
2. Mevcut profil güncelleme
3. Profil verilerini görüntüleme
4. Navigation linklerinin çalışması
5. Responsive tasarım testi

### Test Komutları
```bash
# Development server başlat
npm run dev

# Test build
npm run build

# Lint kontrol
npm run lint
```

## Destek

Herhangi bir sorun yaşarsanız:
1. Console loglarını kontrol edin
2. Network sekmesinde API çağrılarını inceleyin
3. Supabase dashboard'da veritabanı durumunu kontrol edin
4. GitHub issues'da sorun bildirin

## Lisans

Bu proje MIT lisansı altında geliştirilmiştir.


