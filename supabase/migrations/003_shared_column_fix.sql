
-- Create a function to add the 'shared' column if it doesn't exist
CREATE OR REPLACE FUNCTION add_shared_column_if_not_exists()
RETURNS void AS $$
BEGIN
    -- Check if the column exists first to avoid errors
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'meditation_sessions'
        AND column_name = 'shared'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE meditation_sessions 
        ADD COLUMN shared BOOLEAN DEFAULT FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION add_shared_column_if_not_exists() TO authenticated, anon, service_role;

-- Update the reload_types function to be more thorough
CREATE OR REPLACE FUNCTION reload_types()
RETURNS void AS $$
BEGIN
    -- Ensure the meditation_sessions table has all expected columns
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'meditation_sessions'
        AND column_name = 'shared'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE meditation_sessions 
        ADD COLUMN shared BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- This comment forces the Supabase client to refresh its schema cache
    COMMENT ON TABLE meditation_sessions IS 'Table storing meditation session data with schema version 2';
    
    -- Return success
    RETURN;
END;
$$ LANGUAGE plpgsql;
