
-- Create a function to reload types cache
CREATE OR REPLACE FUNCTION reload_types()
RETURNS void AS $$
BEGIN
    -- This is a dummy function that does nothing
    -- It's just used as a trigger to force the Supabase client to refresh its schema cache
    NULL;
END;
$$ LANGUAGE plpgsql;
