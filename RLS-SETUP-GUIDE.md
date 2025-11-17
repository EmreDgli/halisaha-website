# RLS (Row Level Security) Setup Rehberi

## 🔍 Sorun Tespiti

RLS aktif olduğunda tablolara erişim için doğru policy'lerin tanımlanması gerekir. Eğer policy'ler eksikse giriş yapamazsınız.

## 🛠️ Çözüm Adımları

### 1. Supabase Dashboard'a Gidin
- [Supabase Dashboard](https://supabase.com/dashboard)
- Projenizi seçin
- SQL Editor'ı açın

### 2. RLS Policy'lerini Kontrol Edin
```sql
-- Mevcut policy'leri kontrol et
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 3. Eksik Policy'leri Ekleyin
`setup-rls-policies.sql` dosyasındaki SQL kodunu Supabase SQL Editor'da çalıştırın.

### 4. Test Edin
```bash
npm run check-rls
```

## 📋 Gerekli Policy'ler

### Users Tablosu
- ✅ Kullanıcılar kendi profillerini okuyabilir
- ✅ Kullanıcılar kendi profillerini güncelleyebilir
- ✅ Yeni kullanıcılar kayıt olabilir

### Teams Tablosu
- ✅ Tüm kullanıcılar takımları okuyabilir
- ✅ Takım sahipleri kendi takımlarını güncelleyebilir
- ✅ Kullanıcılar takım oluşturabilir

### Team_members Tablosu
- ✅ Kullanıcılar kendi takım üyeliklerini okuyabilir
- ✅ Takım sahipleri kendi takımlarının üyelerini okuyabilir
- ✅ Kullanıcılar takıma katılabilir

### Fields Tablosu
- ✅ Tüm kullanıcılar sahaları okuyabilir
- ✅ Saha sahipleri kendi sahalarını güncelleyebilir
- ✅ Kullanıcılar saha oluşturabilir

## 🚨 Acil Durum Çözümü

Eğer hiç giriş yapamıyorsanız:

### Geçici Olarak RLS'yi Devre Dışı Bırakın
```sql
-- Tüm tablolarda RLS'yi geçici olarak devre dışı bırak
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE fields DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
```

### Policy'leri Ekledikten Sonra RLS'yi Tekrar Aktif Edin
```sql
-- RLS'yi tekrar aktif et
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
```

## 🔧 Test Scriptleri

### RLS Kontrolü
```bash
npm run check-rls
```

### Database Schema Kontrolü
```bash
npm run check-schema
```

### Kullanıcı Etiketleri Kontrolü
```bash
npm run test-tags
```

## 📞 Yardım

Eğer hala sorun yaşıyorsanız:

1. **Console log'larını kontrol edin** (F12 → Console)
2. **Network sekmesini kontrol edin** (F12 → Network)
3. **Supabase Dashboard'da Authentication > Users** bölümünü kontrol edin
4. **Supabase Dashboard'da Database > Logs** bölümünü kontrol edin

## ✅ Başarı Kriterleri

- [ ] Tüm tablolarda RLS aktif
- [ ] Tüm tablolarda gerekli policy'ler tanımlı
- [ ] Kullanıcı kayıt olabiliyor
- [ ] Kullanıcı giriş yapabiliyor
- [ ] Dashboard'lara erişim var
- [ ] Takım oluşturma çalışıyor
- [ ] Saha oluşturma çalışıyor 