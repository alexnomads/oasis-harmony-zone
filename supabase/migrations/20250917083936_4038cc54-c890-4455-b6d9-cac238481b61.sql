-- Update all existing unverified fitness sessions to be verified
UPDATE fitness_sessions SET verified = true WHERE verified = false;

-- Drop and recreate the update_fitness_points trigger to fire on INSERT as well
DROP TRIGGER IF EXISTS update_fitness_points_trigger ON fitness_sessions;

-- Recreate the trigger function to work on both INSERT and UPDATE
CREATE OR REPLACE FUNCTION public.update_fitness_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Award points for verified fitness sessions (now auto-verified)
    IF NEW.verified = TRUE THEN
        -- Calculate fitness points: base 50 + rep bonus + time bonus
        DECLARE
            base_points INTEGER := 50;
            rep_bonus INTEGER := (NEW.reps_completed / 10) * 10;
            time_bonus INTEGER := CASE WHEN NEW.duration > 300 THEN 25 ELSE 0 END;
            total_fitness_points INTEGER := base_points + rep_bonus + time_bonus;
        BEGIN
            -- Insert or update user points
            INSERT INTO user_points (user_id, fitness_points, total_points, fitness_streak, last_fitness_date)
            VALUES (
                NEW.user_id,
                total_fitness_points,
                total_fitness_points,
                1,
                CURRENT_DATE
            )
            ON CONFLICT (user_id) DO UPDATE SET
                fitness_points = user_points.fitness_points + total_fitness_points,
                total_points = user_points.total_points + total_fitness_points,
                fitness_streak = CASE
                    -- If last fitness was yesterday, increment streak
                    WHEN user_points.last_fitness_date = CURRENT_DATE - INTERVAL '1 day'
                    THEN user_points.fitness_streak + 1
                    -- If last fitness was today, keep current streak
                    WHEN user_points.last_fitness_date = CURRENT_DATE
                    THEN user_points.fitness_streak
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

-- Create trigger that fires on both INSERT and UPDATE
CREATE TRIGGER update_fitness_points_trigger
    AFTER INSERT OR UPDATE ON fitness_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_fitness_points();