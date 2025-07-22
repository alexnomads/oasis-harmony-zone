
-- Fix pet initialization issues

-- Update the existing trigger function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user_pet()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_pet();

-- Add missing RLS policies for better access control
CREATE POLICY "Users can insert own currency"
    ON roj_currency
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create a function to initialize pet data for existing users
CREATE OR REPLACE FUNCTION public.initialize_existing_user_pets()
RETURNS void AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Loop through all users who don't have pet records
    FOR user_record IN 
        SELECT u.id
        FROM auth.users u
        LEFT JOIN companion_pets cp ON u.id = cp.user_id
        WHERE cp.user_id IS NULL
    LOOP
        -- Create pet record
        INSERT INTO companion_pets (user_id, pet_name, evolution_stage, experience_points, level, accessories)
        VALUES (user_record.id, 'Rose', 0, 0, 1, '[]'::jsonb)
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE LOG 'Created pet for existing user: %', user_record.id;
    END LOOP;
    
    -- Loop through all users who don't have currency records
    FOR user_record IN 
        SELECT u.id
        FROM auth.users u
        LEFT JOIN roj_currency rc ON u.id = rc.user_id
        WHERE rc.user_id IS NULL
    LOOP
        -- Create currency record
        INSERT INTO roj_currency (user_id, roj_points, stars)
        VALUES (user_record.id, 0, 0)
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE LOG 'Created currency for existing user: %', user_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the initialization for existing users
SELECT public.initialize_existing_user_pets();
