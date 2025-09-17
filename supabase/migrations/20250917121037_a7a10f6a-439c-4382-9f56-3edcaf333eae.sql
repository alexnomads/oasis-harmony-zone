-- Fix remaining Security Definer functions by adding proper search_path settings
-- This prevents search path attacks while maintaining necessary elevated privileges

-- Update update_fitness_points function with secure search path
CREATE OR REPLACE FUNCTION public.update_fitness_points()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $function$
BEGIN
    -- Award points for verified fitness sessions (now auto-verified)
    IF NEW.verified = TRUE THEN
        -- Calculate fitness points: duration-based system similar to meditation
        DECLARE
            base_points INTEGER;
            rep_bonus INTEGER := (NEW.reps_completed / 20) * 2; -- +2 points per 20 reps
            consistency_bonus INTEGER := CASE WHEN NEW.duration >= 300 THEN 2 ELSE 0 END;
            total_fitness_points INTEGER;
        BEGIN
            -- Calculate base points based on duration (similar to meditation system)
            IF NEW.duration <= 60 THEN
                base_points := 2; -- 1 minute
            ELSIF NEW.duration <= 120 THEN
                base_points := 4; -- 2 minutes
            ELSIF NEW.duration <= 300 THEN
                base_points := 8; -- 5 minutes
            ELSIF NEW.duration <= 600 THEN
                base_points := 18; -- 10 minutes
            ELSIF NEW.duration <= 900 THEN
                base_points := 28; -- 15 minutes
            ELSE
                base_points := 40; -- 30+ minutes
            END IF;
            
            total_fitness_points := base_points + rep_bonus + consistency_bonus;
            
            -- Insert or update user points
            INSERT INTO public.user_points (user_id, fitness_points, total_points, fitness_streak, last_fitness_date)
            VALUES (
                NEW.user_id,
                total_fitness_points,
                total_fitness_points,
                1,
                CURRENT_DATE
            )
            ON CONFLICT (user_id) DO UPDATE SET
                fitness_points = public.user_points.fitness_points + total_fitness_points,
                total_points = public.user_points.total_points + total_fitness_points,
                fitness_streak = CASE
                    -- If last fitness was yesterday, increment streak
                    WHEN public.user_points.last_fitness_date = CURRENT_DATE - INTERVAL '1 day'
                    THEN public.user_points.fitness_streak + 1
                    -- If last fitness was today, keep current streak
                    WHEN public.user_points.last_fitness_date = CURRENT_DATE
                    THEN public.user_points.fitness_streak
                    -- Otherwise reset streak to 1
                    ELSE 1
                END,
                last_fitness_date = CURRENT_DATE,
                updated_at = NOW();
        END;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Update get_all_completed_sessions function with secure search path
CREATE OR REPLACE FUNCTION public.get_all_completed_sessions()
RETURNS SETOF meditation_sessions 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public
AS $function$
  SELECT * FROM public.meditation_sessions 
  WHERE status = 'completed';
$function$;

-- Update get_filtered_completed_sessions function with secure search path
CREATE OR REPLACE FUNCTION public.get_filtered_completed_sessions(start_date timestamp with time zone)
RETURNS SETOF meditation_sessions 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public
AS $function$
  SELECT * FROM public.meditation_sessions 
  WHERE status = 'completed'
  AND created_at >= start_date;
$function$;

-- Update get_users_by_meditation_period function with secure search path
CREATE OR REPLACE FUNCTION public.get_users_by_meditation_period(start_date timestamp with time zone)
RETURNS TABLE(user_id uuid) 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public
AS $function$
  SELECT DISTINCT user_id FROM public.meditation_sessions 
  WHERE status = 'completed'
  AND created_at >= start_date;
$function$;

-- Update increment_meditation_time function with secure search path
CREATE OR REPLACE FUNCTION public.increment_meditation_time(user_id_param uuid, seconds_param integer)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $function$
BEGIN
  -- Note: This function references a 'users' table that doesn't exist in the current schema
  -- It should probably update user_points or another existing table instead
  -- For now, keeping the original logic but with secure search path
  UPDATE public.users
  SET total_meditation_time = COALESCE(total_meditation_time, 0) + seconds_param
  WHERE id = user_id_param;
END;
$function$;

-- Update get_all_meditation_users function with secure search path
CREATE OR REPLACE FUNCTION public.get_all_meditation_users()
RETURNS TABLE(user_id uuid) 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public
AS $function$
  SELECT DISTINCT user_id FROM public.meditation_sessions 
  WHERE status = 'completed';
$function$;