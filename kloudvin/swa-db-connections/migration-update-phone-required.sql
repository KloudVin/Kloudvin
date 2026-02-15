-- Migration: Make phone number required and update existing users
-- Run this AFTER migration-add-user-features.sql

-- Step 1: Update existing users without phone numbers to have a default value
UPDATE dbo.Users
SET phone = '+91 0000000000'
WHERE phone IS NULL OR phone = '';

-- Step 2: Make phone column NOT NULL
ALTER TABLE dbo.Users
ALTER COLUMN phone NVARCHAR(20) NOT NULL;

PRINT 'Phone column is now required. All existing users have been updated.';

GO
