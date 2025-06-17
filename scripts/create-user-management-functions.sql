-- Create a function to get all users with their roles (for admin use)
CREATE OR REPLACE FUNCTION get_all_users_with_roles()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  user_metadata JSONB,
  role TEXT
) 
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    au.created_at,
    au.last_sign_in_at,
    au.raw_user_meta_data as user_metadata,
    COALESCE(ur.role, 'user') as role
  FROM auth.users au
  LEFT JOIN user_roles ur ON au.id = ur.user_id
  ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a function to invite a user (admin only)
CREATE OR REPLACE FUNCTION admin_invite_user(
  user_email TEXT,
  user_role TEXT DEFAULT 'user'
)
RETURNS JSONB
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if the current user is an admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Validate role
  IF user_role NOT IN ('admin', 'user', 'manager') THEN
    RAISE EXCEPTION 'Invalid role. Must be admin, user, or manager.';
  END IF;

  -- Note: The actual user invitation should be handled by the client
  -- using Supabase Auth Admin API. This function can be used for logging
  -- or additional validation.

  result := jsonb_build_object(
    'success', true,
    'message', 'User invitation prepared',
    'email', user_email,
    'role', user_role
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;
