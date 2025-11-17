-- RLS Policy Setup Script
-- Bu scripti Supabase SQL Editor'da çalıştırın

-- 1. Users tablosu için RLS Policy'leri
-- Users tablosunda RLS'yi aktif et
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
-- Teams tablosunda RLS'yi aktif et
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
-- Team_members tablosunda RLS'yi aktif et
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

-- 4. Fields tablosu için RLS Policy'leri
-- Fields tablosunda RLS'yi aktif et
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;

-- Tüm kullanıcılar sahaları okuyabilir
CREATE POLICY "Anyone can read fields" ON fields
    FOR SELECT USING (true);

-- Saha sahipleri kendi sahalarını güncelleyebilir
CREATE POLICY "Field owners can update own fields" ON fields
    FOR UPDATE USING (auth.uid() = owner_id);

-- Saha sahipleri kendi sahalarını silebilir
CREATE POLICY "Field owners can delete own fields" ON fields
    FOR DELETE USING (auth.uid() = owner_id);

-- Kullanıcılar saha oluşturabilir
CREATE POLICY "Users can create fields" ON fields
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- 5. Team_invites tablosu için RLS Policy'leri
-- Team_invites tablosunda RLS'yi aktif et
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi davetlerini okuyabilir
CREATE POLICY "Users can read own invites" ON team_invites
    FOR SELECT USING (auth.uid() = invited_user_id);

-- Takım sahipleri kendi takımlarının davetlerini okuyabilir
CREATE POLICY "Team owners can read team invites" ON team_invites
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM teams 
            WHERE teams.id = team_invites.team_id 
            AND teams.manager_id = auth.uid()
        )
    );

-- Kullanıcılar davet oluşturabilir
CREATE POLICY "Users can create invites" ON team_invites
    FOR INSERT WITH CHECK (auth.uid() = invited_by);

-- Kullanıcılar kendi davetlerini güncelleyebilir
CREATE POLICY "Users can update own invites" ON team_invites
    FOR UPDATE USING (auth.uid() = invited_user_id);

-- 6. Matches tablosu için RLS Policy'leri
-- Matches tablosunda RLS'yi aktif et
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Tüm kullanıcılar maçları okuyabilir
CREATE POLICY "Anyone can read matches" ON matches
    FOR SELECT USING (true);

-- Maç organizatörleri kendi maçlarını güncelleyebilir
CREATE POLICY "Match organizers can update own matches" ON matches
    FOR UPDATE USING (auth.uid() = organizer_id);

-- Maç organizatörleri kendi maçlarını silebilir
CREATE POLICY "Match organizers can delete own matches" ON matches
    FOR DELETE USING (auth.uid() = organizer_id);

-- Kullanıcılar maç oluşturabilir
CREATE POLICY "Users can create matches" ON matches
    FOR INSERT WITH CHECK (auth.uid() = organizer_id);

-- 7. Videos tablosu için RLS Policy'leri
-- Videos tablosunda RLS'yi aktif et
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Tüm kullanıcılar videoları okuyabilir
CREATE POLICY "Anyone can read videos" ON videos
    FOR SELECT USING (true);

-- Video sahipleri kendi videolarını güncelleyebilir
CREATE POLICY "Video owners can update own videos" ON videos
    FOR UPDATE USING (auth.uid() = uploader_id);

-- Video sahipleri kendi videolarını silebilir
CREATE POLICY "Video owners can delete own videos" ON videos
    FOR DELETE USING (auth.uid() = uploader_id);

-- Kullanıcılar video yükleyebilir
CREATE POLICY "Users can upload videos" ON videos
    FOR INSERT WITH CHECK (auth.uid() = uploader_id);

-- 8. Notifications tablosu için RLS Policy'leri
-- Notifications tablosunda RLS'yi aktif et
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

-- 9. Payments tablosu için RLS Policy'leri
-- Payments tablosunda RLS'yi aktif et
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi ödemelerini okuyabilir
CREATE POLICY "Users can read own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

-- Kullanıcılar kendi ödemelerini oluşturabilir
CREATE POLICY "Users can create own payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar kendi ödemelerini güncelleyebilir
CREATE POLICY "Users can update own payments" ON payments
    FOR UPDATE USING (auth.uid() = user_id);

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