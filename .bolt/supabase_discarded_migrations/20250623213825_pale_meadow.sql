/*
  # Add function to check if user exists by email

  1. Function
    - `check_user_exists_by_email(email_to_check)` - Checks if a user exists with the given email
    - Returns a record with exists (boolean) and user_id (uuid, nullable)
    - Uses SECURITY DEFINER to access auth.users table

  2. Security
    - Function is accessible to authenticated users only
    - Only returns existence status and user ID, no sensitive data
*/

-- Create function to check if user exists by email
CREATE OR REPLACE FUNCTION public.check_user_exists_by_email(email_to_check text)
RETURNS TABLE (
  exists boolean,
  user_id uuid
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE WHEN u.id IS NOT NULL THEN true ELSE false END as exists,
    u.id as user_id
  FROM auth.users u
  WHERE u.email = email_to_check
  LIMIT 1;
  
  -- If no user found, return false with null user_id
  IF NOT FOUND THEN
    RETURN QUERY SELECT false as exists, null::uuid as user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_user_exists_by_email(text) TO authenticated;