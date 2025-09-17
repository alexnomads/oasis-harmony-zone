-- Fix Security Definer functions by adding proper search_path settings
-- This prevents search path attacks while maintaining necessary elevated privileges

-- Update handle_new_user_pet function with secure search path
CREATE OR REPLACE FUNCTION public.handle_new_user_pet()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, auth
AS $function$
BEGIN
    -- Create companion pet with error handling
    BEGIN
        INSERT INTO public.companion_pets (user_id, pet_name, evolution_stage, experience_points, level, accessories)
        VALUES (NEW.id, 'Rose', 0, 0, 1, '[]'::jsonb)
        ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Failed to create companion pet for user %: %', NEW.id, SQLERRM;
    END;
    
    -- Create currency record with error handling
    BEGIN
        INSERT INTO public.roj_currency (user_id, roj_points, stars)
        VALUES (NEW.id, 0, 0)
        ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Failed to create currency record for user %: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$function$;

-- Update initialize_existing_user_pets function with secure search path
CREATE OR REPLACE FUNCTION public.initialize_existing_user_pets()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, auth
AS $function$
DECLARE
    user_record RECORD;
BEGIN
    -- Loop through all users who don't have pet records
    FOR user_record IN 
        SELECT u.id
        FROM auth.users u
        LEFT JOIN public.companion_pets cp ON u.id = cp.user_id
        WHERE cp.user_id IS NULL
    LOOP
        -- Create pet record
        INSERT INTO public.companion_pets (user_id, pet_name, evolution_stage, experience_points, level, accessories)
        VALUES (user_record.id, 'Rose', 0, 0, 1, '[]'::jsonb)
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE LOG 'Created pet for existing user: %', user_record.id;
    END LOOP;
    
    -- Loop through all users who don't have currency records
    FOR user_record IN 
        SELECT u.id
        FROM auth.users u
        LEFT JOIN public.roj_currency rc ON u.id = rc.user_id
        WHERE rc.user_id IS NULL
    LOOP
        -- Create currency record
        INSERT INTO public.roj_currency (user_id, roj_points, stars)
        VALUES (user_record.id, 0, 0)
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE LOG 'Created currency for existing user: %', user_record.id;
    END LOOP;
END;
$function$;

-- Update handle_new_user function with secure search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $function$
BEGIN
    INSERT INTO public.user_points (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$function$;