-- Drop all existing policies for users table
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users during registration" ON public.users;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.users;

-- Create simplified and working policies
CREATE POLICY "Enable read access for all users" ON public.users FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.users FOR INSERT WITH CHECK (
  auth.uid() = id OR auth.role() = 'service_role'
);

CREATE POLICY "Enable update for users based on user_id" ON public.users FOR UPDATE USING (
  auth.uid() = id
) WITH CHECK (auth.uid() = id);

-- Recreate the trigger function with better handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_exists boolean;
BEGIN
  -- Check if user already exists
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id = new.id) INTO user_exists;
  
  -- Only insert if user doesn't exist
  IF NOT user_exists THEN
    INSERT INTO public.users (id, email, full_name, phone, roles, created_at, updated_at)
    VALUES (
      new.id,
      new.email,
      COALESCE(new.raw_user_meta_data->>'full_name', ''),
      COALESCE(new.raw_user_meta_data->>'phone', ''),
      ARRAY['player']::text[],
      now(),
      now()
    );
  END IF;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create user profile for %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;

-- Trigger detaylarını göster
SELECT tgname, tgrelid::regclass, tgfoid::regprocedure, tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Fonksiyon var mı?
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';

-- Update roles column to text[]
ALTER TABLE public.users
ALTER COLUMN roles TYPE text[];
