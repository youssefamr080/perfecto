-- Fix RLS policies for users table
-- This script will allow authentication operations

-- Temporarily disable RLS for users table to fix issues
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "users_select_all" ON users;
DROP POLICY IF EXISTS "users_update_all" ON users;
DROP POLICY IF EXISTS "users_insert_all" ON users;

-- Create comprehensive policies for users
CREATE POLICY "users_select_all" ON users
  FOR SELECT
  USING (true);

CREATE POLICY "users_update_all" ON users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_insert_all" ON users
  FOR INSERT
  WITH CHECK (true);

-- Make sure all needed columns exist
DO $$ 
BEGIN 
    -- Add last_login column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='last_login'
    ) THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
    END IF;
    
    -- Add total_orders column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='total_orders'
    ) THEN
        ALTER TABLE users ADD COLUMN total_orders INTEGER DEFAULT 0;
    END IF;
    
    -- Add total_spent column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='total_spent'
    ) THEN
        ALTER TABLE users ADD COLUMN total_spent FLOAT DEFAULT 0;
    END IF;
END $$;

-- Update existing users with current timestamp for last_login
UPDATE users SET last_login = updated_at WHERE last_login IS NULL;
