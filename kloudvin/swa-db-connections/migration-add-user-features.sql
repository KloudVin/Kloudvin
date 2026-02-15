-- Migration: Add User Management and OTP Features
-- Run this in Azure SQL Query Editor to add new columns to existing Users table

-- Check and add last_login column if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'last_login')
BEGIN
    ALTER TABLE dbo.Users ADD last_login DATETIME2;
    PRINT 'Added last_login column';
END
ELSE
BEGIN
    PRINT 'last_login column already exists';
END

-- Check and add role column if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'role')
BEGIN
    ALTER TABLE dbo.Users ADD role NVARCHAR(20) DEFAULT 'Editor';
    PRINT 'Added role column';
END
ELSE
BEGIN
    PRINT 'role column already exists';
END

-- Check and add otp_code column if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'otp_code')
BEGIN
    ALTER TABLE dbo.Users ADD otp_code NVARCHAR(10);
    PRINT 'Added otp_code column';
END
ELSE
BEGIN
    PRINT 'otp_code column already exists';
END

-- Check and add otp_expires column if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'otp_expires')
BEGIN
    ALTER TABLE dbo.Users ADD otp_expires DATETIME2;
    PRINT 'Added otp_expires column';
END
ELSE
BEGIN
    PRINT 'otp_expires column already exists';
END

-- Check and add otp_type column if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'otp_type')
BEGIN
    ALTER TABLE dbo.Users ADD otp_type NVARCHAR(10);
    PRINT 'Added otp_type column';
END
ELSE
BEGIN
    PRINT 'otp_type column already exists';
END

-- Check and add phone column if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'phone')
BEGIN
    ALTER TABLE dbo.Users ADD phone NVARCHAR(20);
    PRINT 'Added phone column';
END
ELSE
BEGIN
    PRINT 'phone column already exists';
END

-- Update existing admin user to have Administrator role
UPDATE dbo.Users
SET role = 'Administrator'
WHERE is_admin = 1 AND (role IS NULL OR role = 'Editor');

-- Update existing non-admin users to have Editor role
UPDATE dbo.Users
SET role = 'Editor'
WHERE (is_admin = 0 OR is_admin IS NULL) AND role IS NULL;

PRINT 'Migration completed successfully!';

GO
