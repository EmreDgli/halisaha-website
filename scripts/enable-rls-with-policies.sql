-- RLS'yi tekrar aktif et ve policy'leri ekle
-- Bu scripti Supabase SQL Editor'da çalıştırın

-- 1. Users tablosu için RLS Policy'leri
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi profillerini okuyabilir
CREATE POLICY "Users can read own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Kullanıcılar kendi profillerini güncelleyebilir
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Yeni kullanıcılar kayıt olabilir
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Teams tablosu için RLS Policy'leri
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Tüm kullanıcılar takımları okuyabilir
CREATE POLICY "Anyone can read teams" ON teams
    FOR SELECT USING (true);

-- Takım sahipleri kendi takımlarını güncelleyebilir
CREATE POLICY "Team owners can update own teams" ON teams
    FOR UPDATE USING (auth.uid() = manager_id);

-- Takım sahipleri kendi takımlarını silebilir
CREATE POLICY "Team owners can delete own teams" ON teams
    FOR DELETE USING (auth.uid() = manager_id);

-- Kullanıcılar takım oluşturabilir
CREATE POLICY "Users can create teams" ON teams
    FOR INSERT WITH CHECK (auth.uid() = manager_id);

-- 3. Team_members tablosu için RLS Policy'leri
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi takım üyeliklerini okuyabilir
CREATE POLICY "Users can read own team memberships" ON team_members
    FOR SELECT USING (auth.uid() = user_id);

-- Takım sahipleri kendi takımlarının üyelerini okuyabilir
CREATE POLICY "Team owners can read team members" ON team_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM teams 
            WHERE teams.id = team_members.team_id 
            AND teams.manager_id = auth.uid()
        )
    );

-- Kullanıcılar takıma katılabilir
CREATE POLICY "Users can join teams" ON team_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Takım sahipleri üyeleri çıkarabilir
CREATE POLICY "Team owners can remove members" ON team_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM teams 
            WHERE teams.id = team_members.team_id 
            AND teams.manager_id = auth.uid()
        )
    );

-- 4. Team_join_requests tablosu için RLS Policy'leri
ALTER TABLE team_join_requests ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi isteklerini okuyabilir
CREATE POLICY "Users can read own join requests" ON team_join_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Takım sahipleri kendi takımlarının isteklerini okuyabilir
CREATE POLICY "Team owners can read team join requests" ON team_join_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM teams 
            WHERE teams.id = team_join_requests.team_id 
            AND teams.manager_id = auth.uid()
        )
    );

-- Kullanıcılar istek oluşturabilir
CREATE POLICY "Users can create join requests" ON team_join_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Takım sahipleri istekleri güncelleyebilir
CREATE POLICY "Team owners can update join requests" ON team_join_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM teams 
            WHERE teams.id = team_join_requests.team_id 
            AND teams.manager_id = auth.uid()
        )
    );

-- 5. Notifications tablosu için RLS Policy'leri
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi bildirimlerini okuyabilir
CREATE POLICY "Users can read own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Kullanıcılar kendi bildirimlerini güncelleyebilir
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Sistem bildirimleri oluşturabilir
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Policy'lerin başarıyla oluşturulduğunu kontrol et
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