-- Fix remaining functions that might still need secure search paths
-- Check for any remaining utility functions that may need updates

-- Update update_user_points function (if it exists) with secure search path
CREATE OR REPLACE FUNCTION public.update_user_points()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $function$
BEGIN
    -- Insert or update user points
    INSERT INTO public.user_points (user_id, total_points, meditation_streak, last_meditation_date)
    VALUES (
        NEW.user_id,
        NEW.points_earned,
        1,
        CURRENT_DATE
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_points = public.user_points.total_points + NEW.points_earned,
        meditation_streak = CASE
            -- If last meditation was yesterday, increment streak
            WHEN public.user_points.last_meditation_date = CURRENT_DATE - INTERVAL '1 day'
            THEN public.user_points.meditation_streak + 1
            -- If last meditation was today, keep current streak
            WHEN public.user_points.last_meditation_date = CURRENT_DATE
            THEN public.user_points.meditation_streak
            -- Otherwise reset streak to 1
            ELSE 1
        END,
        last_meditation_date = CURRENT_DATE,
        updated_at = NOW();
    
    RETURN NEW;
END;
$function$;

-- Update add_shared_column_if_not_exists function (if it exists) with secure search path
CREATE OR REPLACE FUNCTION public.add_shared_column_if_not_exists()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $function$
BEGIN
    -- Check if the column exists first to avoid errors
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'meditation_sessions'
        AND column_name = 'shared'
        AND table_schema = 'public'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE public.meditation_sessions 
        ADD COLUMN shared BOOLEAN DEFAULT FALSE;
    END IF;
END;
$function$;

-- Update reload_types function (if it exists) with secure search path
CREATE OR REPLACE FUNCTION public.reload_types()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $function$
BEGIN
    -- Ensure the meditation_sessions table has all expected columns
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'meditation_sessions'
        AND column_name = 'shared'
        AND table_schema = 'public'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE public.meditation_sessions 
        ADD COLUMN shared BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- This comment forces the Supabase client to refresh its schema cache
    COMMENT ON TABLE public.meditation_sessions IS 'Table storing meditation session data with schema version 2';
    
    -- Return success
    RETURN;
END;
$function$;