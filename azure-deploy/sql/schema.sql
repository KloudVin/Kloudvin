-- ============================================
-- KloudVin Blog - Azure SQL Database Schema
-- Run this in Azure SQL Query Editor
-- ============================================

-- Users table
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    name NVARCHAR(255),
    role NVARCHAR(50) DEFAULT 'editor',
    created_at DATETIME2 DEFAULT GETUTCDATE()
);

-- Articles table
CREATE TABLE articles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    slug NVARCHAR(500) NOT NULL UNIQUE,
    title NVARCHAR(500) NOT NULL,
    category NVARCHAR(100),
    description NVARCHAR(1000),
    content NVARCHAR(MAX),
    author NVARCHAR(255) DEFAULT 'Vinod',
    read_time NVARCHAR(50),
    published BIT DEFAULT 1,
    views INT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE()
);

-- Categories table
CREATE TABLE categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    slug NVARCHAR(100) NOT NULL UNIQUE,
    name NVARCHAR(100) NOT NULL,
    icon NVARCHAR(50),
    description NVARCHAR(500),
    subcategories NVARCHAR(MAX)  -- JSON array as string e.g. '["AWS","Azure","GCP"]'
);

-- Subscribers table
CREATE TABLE subscribers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL UNIQUE,
    subscribed_at DATETIME2 DEFAULT GETUTCDATE(),
    active BIT DEFAULT 1
);

-- Indexes
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published ON articles(published);
CREATE INDEX idx_articles_created ON articles(created_at DESC);

-- ============================================
-- Seed Data
-- ============================================

-- Seed Categories
INSERT INTO categories (slug, name, icon, description, subcategories) VALUES
('cloud', 'Cloud', 'Cloud', 'Cloud computing and services', '["AWS","Azure","GCP","Multi-Cloud"]'),
('devops', 'DevOps', 'Infinity', 'DevOps & CI/CD practices', '["Jenkins","GitHub Actions","ArgoCD","GitOps"]'),
('kubernetes', 'Kubernetes', 'Container', 'Container orchestration', '["Docker","K8s","Helm","Istio"]'),
('networking', 'Networking', 'Shield', 'Networking & Security', '["VPC","Zero Trust","IAM","SSL/TLS"]'),
('linux', 'Linux', 'Terminal', 'Linux / Windows systems', '["Linux","Bash","PowerShell","Windows Server"]'),
('iac', 'IaC', 'Package', 'Infrastructure as Code', '["Terraform","Pulumi","Ansible","CloudFormation"]');

-- NOTE: Admin user must be seeded via the /api/seed endpoint or manually:
-- Run the seed endpoint after first deployment: POST /api/seed
-- Or insert manually (replace HASH with bcrypt hash of your password):
-- INSERT INTO users (email, password_hash, name, role) VALUES ('admin@kloudvin.com', 'BCRYPT_HASH_HERE', 'Vinod H', 'admin');
