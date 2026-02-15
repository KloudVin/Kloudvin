-- Azure SQL Database Schema for KloudVin
-- Run this script in your Azure SQL Database to create the required tables

-- Users table for authentication
CREATE TABLE dbo.Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    email NVARCHAR(100) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) DEFAULT 'Editor', -- Administrator or Editor
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    last_login DATETIME2,
    is_admin BIT DEFAULT 0,
    otp_code NVARCHAR(10),
    otp_expires DATETIME2,
    otp_type NVARCHAR(10), -- email or sms
    phone NVARCHAR(20) NOT NULL, -- Required: Format +CountryCode PhoneNumber (e.g., +91 9876543210)
    INDEX IX_Users_Username (username),
    INDEX IX_Users_Email (email)
);

-- Articles table for blog posts
CREATE TABLE dbo.Articles (
    id NVARCHAR(255) PRIMARY KEY,
    title NVARCHAR(500) NOT NULL,
    description NVARCHAR(1000),
    content NVARCHAR(MAX) NOT NULL,
    category NVARCHAR(50) NOT NULL,
    read_time NVARCHAR(20),
    tags NVARCHAR(500), -- Stored as comma-separated values
    date_published NVARCHAR(50),
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE(),
    author_id INT,
    FOREIGN KEY (author_id) REFERENCES dbo.Users(id),
    INDEX IX_Articles_Category (category),
    INDEX IX_Articles_DatePublished (date_published)
);

-- Insert default admin user (password: kloudvin@2026)
-- Note: In production, use proper password hashing (bcrypt, etc.)
INSERT INTO dbo.Users (username, email, password_hash, role, is_admin, phone)
VALUES ('admin', 'admin@kloudvin.com', 'kloudvin@2026', 'Administrator', 1, '+91 0000000000');

GO
