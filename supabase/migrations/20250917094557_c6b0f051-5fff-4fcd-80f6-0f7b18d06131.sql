-- Update the fitness points calculation to be more balanced with meditation
CREATE OR REPLACE FUNCTION public.update_fitness_points()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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