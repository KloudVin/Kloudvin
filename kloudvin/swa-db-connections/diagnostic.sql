-- KloudVin Database Diagnostic Script
-- Run this in Azure Portal Query Editor to diagnose setup issues
-- This script checks if everything is configured correctly

PRINT '========================================';
PRINT 'KloudVin Database Diagnostic Report';
PRINT '========================================';
PRINT '';

-- Check 1: Users table exists
PRINT '1. Checking if Users table exists...';
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL
    PRINT '   ✓ Users table exists'
ELSE
BEGIN
    PRINT '   ✗ Users table does NOT exist'
    PRINT '   → ACTION: Run schema.sql to create tables'
END
PRINT '';

-- Check 2: Articles table exists
PRINT '2. Checking if Articles table exists...';
IF OBJECT_ID('dbo.Articles', 'U') IS NOT NULL
    PRINT '   ✓ Articles table exists'
ELSE
BEGIN
    PRINT '   ✗ Articles table does NOT exist'
    PRINT '   → ACTION: Run schema.sql to create tables'
END
PRINT '';

-- Check 3: Admin user exists
PRINT '3. Checking if admin user exists...';
IF EXISTS (SELECT 1 FROM dbo.Users WHERE username = 'admin')
BEGIN
    PRINT '   ✓ Admin user exists'
    
    -- Show admin user details
    SELECT 
        username,
        email,
        is_admin,
        created_at,
        last_login
    FROM dbo.Users 
    WHERE username = 'admin';
END
ELSE
BEGIN
    PRINT '   ✗ Admin user does NOT exist'
    PRINT '   → ACTION: Creating admin user now...'
    
    INSERT INTO dbo.Users (username, email, password_hash, is_admin)
    VALUES ('admin', 'admin@kloudvin.com', 'kloudvin@2026', 1);
    
    PRINT '   ✓ Admin user created successfully'
    PRINT '   Username: admin'
    PRINT '   Password: kloudvin@2026'
END
PRINT '';

-- Check 4: Admin user has correct password
PRINT '4. Checking admin password...';
IF EXISTS (SELECT 1 FROM dbo.Users WHERE username = 'admin' AND password_hash = 'kloudvin@2026')
    PRINT '   ✓ Admin password is correct (kloudvin@2026)'
ELSE
BEGIN
    PRINT '   ✗ Admin password is NOT the default'
    PRINT '   → INFO: Password may have been changed'
    PRINT '   → ACTION: To reset password, run:'
    PRINT '     UPDATE dbo.Users SET password_hash = ''kloudvin@2026'' WHERE username = ''admin'';'
END
PRINT '';

-- Check 5: Admin user has admin privileges
PRINT '5. Checking admin privileges...';
DECLARE @isAdmin BIT;
SELECT @isAdmin = is_admin FROM dbo.Users WHERE username = 'admin';

IF @isAdmin = 1
    PRINT '   ✓ Admin user has admin privileges'
ELSE
BEGIN
    PRINT '   ✗ Admin user does NOT have admin privileges'
    PRINT '   → ACTION: Run this to fix:'
    PRINT '     UPDATE dbo.Users SET is_admin = 1 WHERE username = ''admin'';'
END
PRINT '';

-- Check 6: Count users
PRINT '6. Checking total users...';
DECLARE @userCount INT;
SELECT @userCount = COUNT(*) FROM dbo.Users;
PRINT '   Total users: ' + CAST(@userCount AS VARCHAR(10));

IF @userCount = 0
BEGIN
    PRINT '   ✗ No users found'
    PRINT '   → ACTION: Run schema.sql to create default admin user'
END
ELSE IF @userCount = 1
    PRINT '   ✓ Default admin user only (expected for new setup)'
ELSE
    PRINT '   ✓ Multiple users found (additional users created)'
PRINT '';

-- Check 7: Count articles
PRINT '7. Checking total articles...';
DECLARE @articleCount INT;
SELECT @articleCount = COUNT(*) FROM dbo.Articles;
PRINT '   Total articles: ' + CAST(@articleCount AS VARCHAR(10));

IF @articleCount = 0
    PRINT '   ℹ No articles yet (expected for new setup)'
ELSE
    PRINT '   ✓ Articles found'
PRINT '';

-- Check 8: Show all users
PRINT '8. All users in database:';
SELECT 
    id,
    username,
    email,
    is_admin,
    created_at,
    last_login
FROM dbo.Users
ORDER BY created_at;
PRINT '';

-- Check 9: Show recent articles
PRINT '9. Recent articles (last 5):';
IF EXISTS (SELECT 1 FROM dbo.Articles)
BEGIN
    SELECT TOP 5
        id,
        title,
        category,
        date_published,
        created_at
    FROM dbo.Articles
    ORDER BY created_at DESC;
END
ELSE
    PRINT '   No articles found';
PRINT '';

-- Summary
PRINT '========================================';
PRINT 'Diagnostic Summary';
PRINT '========================================';

DECLARE @issuesFound BIT = 0;

IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
    PRINT '✗ ISSUE: Users table missing';
    SET @issuesFound = 1;
END

IF OBJECT_ID('dbo.Articles', 'U') IS NULL
BEGIN
    PRINT '✗ ISSUE: Articles table missing';
    SET @issuesFound = 1;
END

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE username = 'admin')
BEGIN
    PRINT '✗ ISSUE: Admin user missing (created automatically above)';
    SET @issuesFound = 1;
END

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE username = 'admin' AND is_admin = 1)
BEGIN
    PRINT '✗ ISSUE: Admin user lacks admin privileges';
    SET @issuesFound = 1;
END

IF @issuesFound = 0
BEGIN
    PRINT '';
    PRINT '✓✓✓ ALL CHECKS PASSED ✓✓✓';
    PRINT '';
    PRINT 'Your database is configured correctly!';
    PRINT '';
    PRINT 'You can now login with:';
    PRINT '  Username: admin';
    PRINT '  Password: kloudvin@2026';
    PRINT '';
    PRINT 'Next steps:';
    PRINT '  1. Configure .env file with connection string';
    PRINT '  2. Run: npm start';
    PRINT '  3. Open: http://localhost:4280';
    PRINT '  4. Login and test';
END
ELSE
BEGIN
    PRINT '';
    PRINT 'Issues found - see details above';
    PRINT 'Most issues have been auto-fixed';
    PRINT 'Re-run this script to verify';
END

PRINT '';
PRINT '========================================';
PRINT 'End of Diagnostic Report';
PRINT '========================================';
