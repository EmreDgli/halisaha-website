# Supabase Tabloları Kurtarma Rehberi

## 🚨 Acil Durum Çözümleri

### 1. Environment Dosyası Oluşturun
Proje kök dizininde `.env.local` dosyası oluşturun:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Supabase bilgilerini nereden alırsınız:**
1. [Supabase Dashboard](https://supabase.com/dashboard) → Projenizi seçin
2. Settings → API
3. Project URL ve anon public key'i kopyalayın

### 2. Supabase Dashboard'da Tabloları Kontrol Edin

#### A. Database → Tables
- Tabloların mevcut olup olmadığını kontrol edin
- Eğer tablolar yoksa, SQL Editor'da scriptleri çalıştırın

#### B. SQL Editor'da Scriptleri Çalıştırın
```sql
-- 1. Önce tabloları oluşturun (scripts/01-create-tables.sql içeriği)
-- 2. Sonra RLS policy'lerini ekleyin (scripts/02-create-rls-policies.sql içeriği)
```

### 3. RLS (Row Level Security) Sorununu Çözün

#### Geçici Çözüm - RLS'yi Devre Dışı Bırakın:
```sql
-- SQL Editor'da çalıştırın
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE fields DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
```

#### Kalıcı Çözüm - Policy'leri Ekleyin:
```sql
-- Users tablosu için policy'ler
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Teams tablosu için policy'ler
CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Team managers can update their teams" ON public.teams FOR UPDATE USING (auth.uid() = manager_id);
CREATE POLICY "Authenticated users can create teams" ON public.teams FOR INSERT WITH CHECK (auth.uid() = manager_id);
```

### 4. Test Scriptlerini Çalıştırın

```bash
# Bağlantıyı test edin
node test-supabase-connection.js

# Tabloları yeniden oluşturun (dikkatli kullanın!)
node recreate-tables.js

# Mevcut scriptleri kullanın
npm run check-schema
npm run check-rls
```

## 🔧 Adım Adım Çözüm

### Adım 1: Environment Dosyası
1. `.env.local` dosyası oluşturun
2. Supabase bilgilerini ekleyin
3. Projeyi yeniden başlatın: `npm run dev`

### Adım 2: Supabase Dashboard Kontrolü
1. Supabase Dashboard'a gidin
2. Database → Tables bölümünü kontrol edin
3. Eğer tablolar yoksa SQL Editor'da scriptleri çalıştırın

### Adım 3: RLS Sorununu Çözün
1. Database → Authentication → Policies
2. Eksik policy'leri ekleyin
3. Veya geçici olarak RLS'yi devre dışı bırakın

### Adım 4: Test Edin
1. Uygulamayı çalıştırın: `npm run dev`
2. Kayıt olmayı deneyin
3. Giriş yapmayı deneyin

## 🚨 Yaygın Hatalar ve Çözümleri

### "relation does not exist" Hatası
- **Neden**: Tablolar oluşturulmamış
- **Çözüm**: SQL scriptleri çalıştırın

### "permission denied" Hatası  
- **Neden**: RLS policy sorunu
- **Çözüm**: Policy'leri ekleyin veya RLS'yi devre dışı bırakın

### "Invalid API key" Hatası
- **Neden**: Yanlış API key
- **Çözüm**: Environment dosyasını kontrol edin

### "Failed to fetch" Hatası
- **Neden**: Yanlış Supabase URL
- **Çözüm**: URL'yi kontrol edin

## 📞 Yardım

Eğer hala sorun yaşıyorsanız:

1. **Browser Console'u kontrol edin** (F12 → Console)
2. **Network sekmesini kontrol edin** (F12 → Network)
3. **Supabase Dashboard → Logs** bölümünü kontrol edin
4. **Environment variables'ları kontrol edin**

## ✅ Başarı Kriterleri

- [ ] `.env.local` dosyası mevcut
- [ ] Supabase bağlantısı çalışıyor
- [ ] Tüm tablolar mevcut
- [ ] RLS policy'leri tanımlı
- [ ] Kayıt olma çalışıyor
- [ ] Giriş yapma çalışıyor
- [ ] Dashboard'lara erişim var
