-- Drop the existing view first
DROP VIEW IF EXISTS global_leaderboard;

-- Recreate the view without email exposure
CREATE VIEW global_leaderboard AS
SELECT 
    up.user_id,
    up.total_points,
    up.meditation_streak,
    up.last_meditation_date,
    COALESCE(up.fitness_streak, 0) AS fitness_streak,
    up.last_fitness_date,
    GREATEST(
        CASE
            WHEN ((up.last_meditation_date = CURRENT_DATE) OR (up.last_meditation_date = (CURRENT_DATE - '1 day'::interval))) THEN up.meditation_streak
            ELSE 0
        END,
        CASE
            WHEN ((up.last_fitness_date = CURRENT_DATE) OR (up.last_fitness_date = (CURRENT_DATE - '1 day'::interval))) THEN COALESCE(up.fitness_streak, 0)
            ELSE 0
        END) AS active_streak,
    COALESCE(ms.total_sessions, (0)::bigint) AS total_sessions,
    COALESCE(ms.total_meditation_time, (0)::bigint) AS total_meditation_time,
    COALESCE(fs.total_fitness_sessions, (0)::bigint) AS total_fitness_sessions,
    COALESCE(fs.total_fitness_time, (0)::bigint) AS total_fitness_time,
    -- Use a safer display name that doesn't expose email
    CASE
        WHEN (up.user_id IS NOT NULL) THEN 'User ' || substring(up.user_id::text, 1, 8)
        ELSE 'Anonymous'
    END AS display_name
FROM (user_points up
    LEFT JOIN ( 
        SELECT meditation_sessions.user_id,
               count(*) AS total_sessions,
               sum(meditation_sessions.duration) AS total_meditation_time
        FROM meditation_sessions
        WHERE (meditation_sessions.status = 'completed'::meditation_status)
        GROUP BY meditation_sessions.user_id
    ) ms ON (up.user_id = ms.user_id)
    LEFT JOIN ( 
        SELECT fitness_sessions.user_id,
               count(*) AS total_fitness_sessions,
               sum(fitness_sessions.duration) AS total_fitness_time
        FROM fitness_sessions
        WHERE (fitness_sessions.verified = true)
        GROUP BY fitness_sessions.user_id
    ) fs ON (up.user_id = fs.user_id))
ORDER BY up.total_points DESC;

-- Grant public read access to the view (since it no longer contains sensitive data)
GRANT SELECT ON global_leaderboard TO anon, authenticated;