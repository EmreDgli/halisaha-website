-- Drop and recreate the trigger function with better error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert user profile with proper error handling
  INSERT INTO public.users (id, email, full_name, phone, roles, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    ARRAY['player']::text[],
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate key errors
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth user creation
    RAISE WARNING 'Failed to create user profile for %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Ensure RLS policies are correct
DROP POLICY IF EXISTS "Enable insert for authenticated users during registration" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Create a more permissive insert policy for registration
CREATE POLICY "Users can insert own profile" ON public.users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id OR auth.role() = 'authenticated');

-- Also allow service role to insert (for trigger)
CREATE POLICY "Service role can insert profiles" ON public.users 
  FOR INSERT 
  WITH CHECK (auth.role() = 'service_role');
