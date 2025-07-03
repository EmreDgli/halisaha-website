-- Create demo users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'oyuncu@demo.com', crypt('demo123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Demo Oyuncu"}', false, 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440002', 'sahip@demo.com', crypt('demo123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Demo Saha Sahibi"}', false, 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440003', 'yonetici@demo.com', crypt('demo123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Demo Takım Yöneticisi"}', false, 'authenticated');

-- Create user profiles
INSERT INTO public.users (id, email, full_name, roles, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'oyuncu@demo.com', 'Demo Oyuncu', ARRAY['player'], now(), now()),
  ('550e8400-e29b-41d4-a716-446655440002', 'sahip@demo.com', 'Demo Saha Sahibi', ARRAY['field_owner'], now(), now()),
  ('550e8400-e29b-41d4-a716-446655440003', 'yonetici@demo.com', 'Demo Takım Yöneticisi', ARRAY['team_manager', 'player'], now(), now());

-- Create demo teams
INSERT INTO public.teams (id, name, description, manager_id, max_players, city, district, skill_level, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440101', 'Yıldızlar FC', 'Deneyimli oyunculardan oluşan takım', '550e8400-e29b-41d4-a716-446655440003', 11, 'İstanbul', 'Kadıköy', 'İleri', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440102', 'Şampiyonlar SK', 'Genç ve dinamik takım', '550e8400-e29b-41d4-a716-446655440001', 11, 'İstanbul', 'Beşiktaş', 'Orta', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440103', 'Kartallar Spor', 'Hafta sonu maçları yapan takım', '550e8400-e29b-41d4-a716-446655440003', 15, 'İstanbul', 'Üsküdar', 'Başlangıç', now(), now());

-- Create team members
INSERT INTO public.team_members (team_id, user_id, position, jersey_number, joined_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440003', 'Kaptan', 10, now()),
  ('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440001', 'Kaptan', 9, now()),
  ('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440003', 'Kaptan', 7, now()),
  ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', 'Orta Saha', 8, now());

-- Create demo fields
INSERT INTO public.fields (id, name, description, address, owner_id, hourly_rate, capacity, amenities, images, rating, total_ratings, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440201', 'Merkez Halı Saha', 'Modern halı saha kompleksi', 'Kadıköy Merkez, İstanbul', '550e8400-e29b-41d4-a716-446655440002', 200, 22, ARRAY['Soyunma Odası', 'Duş', 'Otopark', 'Kafeterya'], ARRAY['/placeholder.svg'], 4.5, 120, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440202', 'Spor Kompleksi', 'Geniş alan ve modern tesisler', 'Beşiktaş Merkez, İstanbul', '550e8400-e29b-41d4-a716-446655440002', 250, 22, ARRAY['Soyunma Odası', 'Duş', 'Otopark', 'Tribün'], ARRAY['/placeholder.svg'], 4.8, 95, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440203', 'Yeşil Alan Halı Saha', 'Doğal çim görünümlü halı saha', 'Üsküdar Merkez, İstanbul', '550e8400-e29b-41d4-a716-446655440002', 180, 14, ARRAY['Soyunma Odası', 'Otopark'], ARRAY['/placeholder.svg'], 4.2, 78, now(), now());

-- Create demo matches
INSERT INTO public.matches (id, title, description, field_id, organizer_team_id, match_date, duration_minutes, max_players_per_team, entry_fee, status, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440301', 'Dostluk Maçı', 'Hafta sonu dostluk maçı', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440101', (now() + interval '3 days')::timestamp, 90, 11, 150, 'pending', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440302', 'Turnuva Maçı', 'Yerel turnuva karşılaşması', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440102', (now() + interval '5 days')::timestamp, 90, 11, 200, 'confirmed', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440303', 'Antrenman Maçı', 'Takım antrenmanı', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440103', (now() + interval '1 week')::timestamp, 60, 7, 100, 'pending', now(), now());

-- Update match with opponent team
UPDATE public.matches 
SET opponent_team_id = '550e8400-e29b-41d4-a716-446655440102', status = 'confirmed'
WHERE id = '550e8400-e29b-41d4-a716-446655440302';

-- Create demo notifications
INSERT INTO public.notifications (id, user_id, title, message, type, related_id, is_read, created_at)
VALUES 
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Yeni Maç Daveti', 'Dostluk maçına davet edildiniz', 'match_invitation', '550e8400-e29b-41d4-a716-446655440301', false, now()),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'Takım Katılım İsteği', 'Yeni oyuncu katılım isteği', 'team_join_request', '550e8400-e29b-41d4-a716-446655440101', false, now());
