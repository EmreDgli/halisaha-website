-- RLS sorununu çözmek için bu scripti Supabase SQL Editor'da çalıştırın

-- 1. RLS'yi geçici olarak devre dışı bırak
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_join_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- 2. Tag kolonunu kontrol et ve yoksa ekle
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'tag'
    ) THEN
        ALTER TABLE users ADD COLUMN tag VARCHAR(10);
        CREATE INDEX idx_users_tag ON users(tag);
        RAISE NOTICE 'Tag kolonu eklendi';
    ELSE
        RAISE NOTICE 'Tag kolonu zaten mevcut';
    END IF;
END $$;

-- 3. Mevcut kullanıcılara tag ata (eğer yoksa)
UPDATE users 
SET tag = '#' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0')
WHERE tag IS NULL;

-- 4. Durumu kontrol et
SELECT 
    tablename,
    rowsecurity,
    'users' as table_name,
    COUNT(*) as user_count,
    COUNT(tag) as users_with_tag,
    COUNT(*) - COUNT(tag) as users_without_tag
FROM pg_tables 
LEFT JOIN users ON true
WHERE schemaname = 'public' 
AND tablename IN ('users', 'teams', 'team_members', 'team_join_requests', 'notifications')
GROUP BY tablename, rowsecurity; 