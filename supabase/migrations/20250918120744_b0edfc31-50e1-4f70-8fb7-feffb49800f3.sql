-- Create user profiles table to store display names
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL UNIQUE,
    nickname text,
    avatar_url text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on user profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user profiles
CREATE POLICY "Users can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to auto-generate nicknames from emails
CREATE OR REPLACE FUNCTION public.extract_nickname_from_email(email_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    nickname text;
BEGIN
    -- Extract local part (before @) and sanitize
    nickname := split_part(email_text, '@', 1);
    
    -- Remove any non-alphanumeric characters and limit length
    nickname := regexp_replace(nickname, '[^a-zA-Z0-9]', '', 'g');
    nickname := substring(nickname from 1 for 20);
    
    -- Capitalize first letter
    nickname := initcap(nickname);
    
    -- If empty after sanitization, return null
    IF nickname = '' OR nickname IS NULL THEN
        RETURN null;
    END IF;
    
    RETURN nickname;
END;
$$;

-- Populate user_profiles for all existing users with email-based nicknames
INSERT INTO public.user_profiles (user_id, nickname)
SELECT 
    au.id,
    public.extract_nickname_from_email(au.email)
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO UPDATE SET
    nickname = COALESCE(public.user_profiles.nickname, public.extract_nickname_from_email((
        SELECT email FROM auth.users WHERE id = public.user_profiles.user_id
    )));

-- Update the handle_new_user trigger to also create profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Create user points record
    INSERT INTO public.user_points (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create user profile with nickname from email
    INSERT INTO public.user_profiles (user_id, nickname)
    VALUES (NEW.id, public.extract_nickname_from_email(NEW.email))
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$;