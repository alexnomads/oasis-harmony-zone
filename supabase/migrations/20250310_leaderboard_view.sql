
-- Create a view to show the global leaderboard
CREATE VIEW global_leaderboard AS
SELECT
  up.user_id,
  up.total_points,
  up.meditation_streak,
  up.last_meditation_date,
  COUNT(ms.id) as total_sessions,
  SUM(ms.duration) as total_meditation_time,
  p.email,
  COALESCE(p.raw_user_meta_data->>'full_name', p.raw_user_meta_data->>'name', p.email) as display_name
FROM
  user_points up
JOIN
  auth.users p ON up.user_id = p.id
LEFT JOIN
  meditation_sessions ms ON up.user_id = ms.user_id AND ms.status = 'completed'
GROUP BY
  up.user_id, up.total_points, up.meditation_streak, up.last_meditation_date, p.email, p.raw_user_meta_data
ORDER BY
  up.total_points DESC;

-- Grant appropriate permissions for the view
GRANT SELECT ON global_leaderboard TO anon, authenticated, service_role;

