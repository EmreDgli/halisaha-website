-- Test Profiles Table Connection and Operations
-- Run this in Supabase SQL Editor to test basic functionality

-- 1. Test basic table access
SELECT 'Testing basic table access...' as test_step;

-- Check if we can select from profiles
SELECT COUNT(*) as total_profiles FROM profiles;

-- 2. Test RLS policies
SELECT 'Testing RLS policies...' as test_step;

-- Check current user context
SELECT 
    current_user as current_user,
    session_user as session_user,
    auth.uid() as auth_uid;

-- 3. Test insert operation (this will fail if RLS is blocking)
SELECT 'Testing insert operation...' as test_step;

-- Try to insert a test record (this should work if RLS is set up correctly)
-- Note: This will only work if you're authenticated
INSERT INTO profiles (user_id, position, skill_level, preferred_city, availability, experience_years, preferred_time, bio)
VALUES (
    auth.uid(), 
    'Test Position', 
    'Test Level', 
    'Test City', 
    'Test Availability', 
    1, 
    'Test Time', 
    'Test bio for debugging'
)
ON CONFLICT (user_id) DO UPDATE SET
    position = EXCLUDED.position,
    skill_level = EXCLUDED.skill_level,
    preferred_city = EXCLUDED.preferred_city,
    availability = EXCLUDED.availability,
    experience_years = EXCLUDED.experience_years,
    preferred_time = EXCLUDED.preferred_time,
    bio = EXCLUDED.bio,
    updated_at = NOW();

-- 4. Test select operation
SELECT 'Testing select operation...' as test_step;

-- Try to select the test record we just inserted
SELECT * FROM profiles WHERE user_id = auth.uid();

-- 5. Test update operation
SELECT 'Testing update operation...' as test_step;

-- Try to update the test record
UPDATE profiles 
SET position = 'Updated Position', updated_at = NOW()
WHERE user_id = auth.uid();

-- 6. Verify the update
SELECT 'Verifying update...' as test_step;

SELECT * FROM profiles WHERE user_id = auth.uid();

-- 7. Clean up test data (optional)
SELECT 'Cleaning up test data...' as test_step;

-- Uncomment the line below if you want to remove the test data
-- DELETE FROM profiles WHERE user_id = auth.uid() AND position = 'Updated Position';

-- 8. Final status
SELECT 'All tests completed!' as status;



