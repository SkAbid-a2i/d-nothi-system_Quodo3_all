-- SQL commands to add designation column to users table in TiDB
-- This script can be executed directly in TiDB to add the designation field

-- Add designation column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS designation VARCHAR(255) NULL DEFAULT NULL;

-- Verify the column was added successfully
DESCRIBE users;

-- Optional: Add an index on the designation column for better query performance
-- Uncomment the following line if you plan to frequently search/filter by designation
-- CREATE INDEX idx_users_designation ON users(designation);

-- Example query to verify the new column works
-- SELECT id, username, fullName, designation FROM users LIMIT 5;

-- Example update statement to set designation for existing users
-- UPDATE users SET designation = 'Software Engineer' WHERE id = 1;