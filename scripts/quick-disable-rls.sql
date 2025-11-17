-- RLS'yi hızlıca devre dışı bırak
-- Bu scripti Supabase SQL Editor'da çalıştırın

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_join_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Durumu kontrol et
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'teams', 'team_members', 'team_join_requests', 'notifications')
ORDER BY tablename; 