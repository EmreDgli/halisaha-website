-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('avatars', 'avatars', true),
  ('team-logos', 'team-logos', true),
  ('field-images', 'field-images', true),
  ('match-videos', 'match-videos', true),
  ('video-thumbnails', 'video-thumbnails', true);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for team logos
CREATE POLICY "Team logos are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'team-logos');

CREATE POLICY "Team managers can upload team logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'team-logos' AND 
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE id::text = (storage.foldername(name))[1] 
      AND manager_id = auth.uid()
    )
  );

-- Storage policies for field images
CREATE POLICY "Field images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'field-images');

CREATE POLICY "Field owners can upload field images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'field-images' AND 
    EXISTS (
      SELECT 1 FROM public.fields 
      WHERE id::text = (storage.foldername(name))[1] 
      AND owner_id = auth.uid()
    )
  );

-- Storage policies for match videos
CREATE POLICY "Public match videos are accessible" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'match-videos' AND 
    EXISTS (
      SELECT 1 FROM public.match_videos 
      WHERE video_url LIKE '%' || name || '%' 
      AND is_public = true
    )
  );

CREATE POLICY "Users can upload match videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'match-videos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for video thumbnails
CREATE POLICY "Video thumbnails are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'video-thumbnails');

CREATE POLICY "Users can upload video thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'video-thumbnails' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
