-- Fix Profiles Table Issue
-- Run this script in Supabase SQL Editor to resolve the profile data persistence problem

-- 1. First, let's check if the profiles table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        RAISE NOTICE 'Profiles table does not exist. Creating it...';
        
        -- Create profiles table
        CREATE TABLE public.profiles (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
            position TEXT,
            skill_level TEXT,
            preferred_city TEXT,
            availability TEXT,
            experience_years INTEGER DEFAULT 0,
            preferred_time TEXT,
            bio TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Profiles table created successfully!';
    ELSE
        RAISE NOTICE 'Profiles table already exists.';
    END IF;
END $$;

-- 2. Check current table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Enable RLS if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 5. Create proper RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_position ON public.profiles(position);
CREATE INDEX IF NOT EXISTS idx_profiles_skill_level ON public.profiles(skill_level);
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_city ON public.profiles(preferred_city);

-- 7. Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create the trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 10. Check RLS policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 11. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 12. Show sample data (if any)
SELECT 
    p.*,
    u.email,
    u.full_name
FROM profiles p
JOIN users u ON p.user_id = u.id
LIMIT 5;

-- 13. Test insert (this will help verify the setup)
-- Note: Replace 'your-user-id-here' with an actual user ID from your users table
-- INSERT INTO profiles (user_id, position, skill_level, preferred_city, availability, experience_years, preferred_time, bio)
-- VALUES ('your-user-id-here', 'Orta Saha', 'Orta', 'İstanbul', 'Hafta sonu', 3, 'Akşam', 'Test bio')
-- ON CONFLICT (user_id) DO UPDATE SET
--     position = EXCLUDED.position,
--     skill_level = EXCLUDED.skill_level,
--     preferred_city = EXCLUDED.preferred_city,
--     availability = EXCLUDED.availability,
--     experience_years = EXCLUDED.experience_years,
--     preferred_time = EXCLUDED.preferred_time,
--     bio = EXCLUDED.bio,
--     updated_at = NOW();

-- 14. Final verification
SELECT 
    'Profiles table setup complete!' as status,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN updated_at > created_at THEN 1 END) as updated_profiles
FROM profiles;



