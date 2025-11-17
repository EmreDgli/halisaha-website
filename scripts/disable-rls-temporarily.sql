-- RLS'yi geçici olarak devre dışı bırak
-- Bu scripti Supabase SQL Editor'da çalıştırın

-- Users tablosunda RLS'yi devre dışı bırak
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Teams tablosunda RLS'yi devre dışı bırak
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;

-- Team_members tablosunda RLS'yi devre dışı bırak
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;

-- Fields tablosunda RLS'yi devre dışı bırak
ALTER TABLE fields DISABLE ROW LEVEL SECURITY;

-- Team_invites tablosunda RLS'yi devre dışı bırak
ALTER TABLE team_invites DISABLE ROW LEVEL SECURITY;

-- Team_join_requests tablosunda RLS'yi devre dışı bırak
ALTER TABLE team_join_requests DISABLE ROW LEVEL SECURITY;

-- Notifications tablosunda RLS'yi devre dışı bırak
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Matches tablosunda RLS'yi devre dışı bırak
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;

-- Videos tablosunda RLS'yi devre dışı bırak
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;

-- Payments tablosunda RLS'yi devre dışı bırak
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- RLS durumunu kontrol et
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'teams', 'team_members', 'fields', 'team_invites', 'team_join_requests', 'notifications', 'matches', 'videos', 'payments')
ORDER BY tablename; 