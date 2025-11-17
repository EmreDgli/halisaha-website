-- Güncellenmiş trigger ve fonksiyonlar
-- Bu scripti Supabase SQL Editor'da çalıştırın

-- 1. Önce mevcut trigger'ı kaldır
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Yeni fonksiyon oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Users tablosuna kullanıcı ekle
  INSERT INTO public.users (
    id, 
    email, 
    full_name,
    phone,
    roles,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    ARRAY['player']::user_role[], -- Varsayılan rol
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Hata durumunda log yaz ve devam et
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger'ı yeniden oluştur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Profiles tablosunu kontrol et ve oluştur
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  position TEXT,
  skill_level TEXT,
  preferred_city TEXT,
  availability TEXT,
  experience_years INTEGER DEFAULT 0,
  preferred_time TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 5. Profiles tablosu için RLS aktif et
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Profiles tablosu için policy'ler
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Index'ler oluştur
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_position ON public.profiles(position);
CREATE INDEX IF NOT EXISTS idx_profiles_skill_level ON public.profiles(skill_level);

-- 8. Updated_at trigger'ı
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Grant permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 10. Test için mevcut durumu kontrol et
SELECT 
  'Users table count' as table_name,
  COUNT(*) as count
FROM public.users
UNION ALL
SELECT 
  'Profiles table count' as table_name,
  COUNT(*) as count
FROM public.profiles;
