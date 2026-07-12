-- 0004_standard_auth_flow.sql
-- Standard email/password and OAuth account lifecycle.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text;

DROP POLICY IF EXISTS "profiles own insert" ON public.profiles;
CREATE POLICY "profiles own insert" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    role,
    first_name,
    last_name,
    phone,
    avatar_url,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    'customer',
    coalesce(new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'given_name'),
    coalesce(new.raw_user_meta_data->>'last_name', new.raw_user_meta_data->>'family_name'),
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'avatar_url', ''),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = coalesce(public.profiles.first_name, excluded.first_name),
    last_name = coalesce(public.profiles.last_name, excluded.last_name),
    phone = coalesce(public.profiles.phone, excluded.phone),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
    updated_at = now();

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF raw_user_meta_data ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

INSERT INTO public.profiles (
  id,
  role,
  first_name,
  last_name,
  phone,
  avatar_url,
  created_at,
  updated_at
)
SELECT
  id,
  'customer',
  coalesce(raw_user_meta_data->>'first_name', raw_user_meta_data->>'given_name'),
  coalesce(raw_user_meta_data->>'last_name', raw_user_meta_data->>'family_name'),
  nullif(raw_user_meta_data->>'phone', ''),
  nullif(raw_user_meta_data->>'avatar_url', ''),
  created_at,
  now()
FROM auth.users
ON CONFLICT (id) DO NOTHING;
