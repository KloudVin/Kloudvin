# Azure Deployment Guide

Complete guide for deploying KloudVin to Azure Static Web Apps with Azure SQL Database and Azure Functions.

---

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Azure Resources Overview](#azure-resources-overview)
3. [Step 1: Prepare Your Code](#step-1-prepare-your-code)
4. [Step 2: Deploy Azure SQL Database](#step-2-deploy-azure-sql-database)
5. [Step 3: Deploy Azure Functions](#step-3-deploy-azure-functions)
6. [Step 4: Deploy Static Web App](#step-4-deploy-static-web-app)
7. [Step 5: Configure Environment](#step-5-configure-environment)
8. [Step 6: Test Deployment](#step-6-test-deployment)
9. [Post-Deployment Tasks](#post-deployment-tasks)
10. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Required Azure Resources
- [ ] Azure Subscription (active)
- [ ] Azure SQL Database (already created: kloudvin-db)
- [ ] Azure Storage Account (already created: kloudvin)
- [ ] Azure Function App (already created: kloudvin-functions-geftgkb3dehxhag7)
- [ ] Azure Static Web App (to be created)

### Required Tools
- [ ] Git installed
- [ ] Azure CLI installed (optional but recommended)
- [ ] Node.js installed (for local testing)
- [ ] Code editor (VS Code recommended)

### Required Information
- [ ] Azure SQL connection string
- [ ] Storage account connection string
- [ ] EmailJS credentials (Service ID, Template IDs, Public Key)
- [ ] Custom domain (optional): kloudvin.com

---

## Azure Resources Overview

### Current Resources

**1. Azure SQL Database**
- Name: `kloudvin-db`
- Server: `kloudvin-server.database.windows.net`
- Database: `kloudvin`
- Purpose: Store users, articles, and application data

**2. Azure Storage Account**
- Name: `kloudvin`
- Container: `images` (public blob access)
- Purpose: Store uploaded images
- URL: `https://kloudvin.blob.core.windows.net/images/`

**3. Azure Function App**
- Name: `kloudvin-functions-geftgkb3dehxhag7`
- Region: Central US
- Functions:
  - `uploadImage` - Upload images to blob storage
  - `convertDocx` - Convert DOCX to Markdown
- URL: `https://kloudvin-functions-geftgkb3dehxhag7.centralus-01.azurewebsites.net/api/`

**4. Azure Static Web App** (to be created)
- Name: `kloudvin` (suggested)
- Region: Central US (recommended)
- Purpose: Host the website

---

## Step 1: Prepare Your Code

### 1.1 Update Configuration Files

**Check `staticwebapp.config.json`:**
```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/images/*.{png,jpg,gif,svg}", "/css/*", "/js/*"]
  },
  "routes": [
    {
      "route": "/data-api/*",
      "allowedRoles": ["anonymous"]
    }
  ],
  "responseOverrides": {
    "404": {
      "rewrite": "/index.html"
    }
  },
  "globalHeaders": {
    "content-security-policy": "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:;"
  },
  "mimeTypes": {
    ".json": "application/json",
    ".md": "text/markdown"
  }
}
```

### 1.2 Update Database Configuration

**Check `swa-db-connections/staticwebapp.database.config.json`:**
- Ensure connection string is configured
- Verify entity permissions
- Check REST endpoints

### 1.3 Remove Sensitive Files

**Create/Update `.gitignore`:**
```
# Environment files
.env
.env.local
.env.production

# Logs
*.log
output.log

# OS files
.DS_Store
Thumbs.db

# Node modules
node_modules/

# Build outputs
dist/
build/

# IDE
.vscode/
.idea/

# Test files
test-*.html
test-*.js
```

### 1.4 Clean Up Unnecessary Files

Files to keep:
- `index.html`
- `pages/` folder (blog.html, article.html, about.html)
- `css/` folder
- `js/` folder
- `swa-db-connections/` folder
- `staticwebapp.config.json`
- `package.json`
- `README.md`
- `DATABASE-SETUP.md`
- `DEPLOYMENT-CHECKLIST.md`
- `ARTICLE-CREATION-GUIDE.md`
- `DEPLOYMENT-GUIDE.md` (this file)
- Favicon files

Files already removed:
- All test files
- Redundant documentation
- Development logs

---

## Step 2: Deploy Azure SQL Database

### 2.1 Database Already Created

Your database is already set up:
- Server: `kloudvin-server.database.windows.net`
- Database: `kloudvin`
- Tables: Users, Articles

### 2.2 Verify Database Schema

**Connect to database and verify tables exist:**

```sql
-- Check Users table
SELECT TOP 5 * FROM Users;

-- Check Articles table
SELECT TOP 5 * FROM Articles;
```

### 2.3 Configure Firewall Rules

**Add your deployment IP:**
1. Go to Azure Portal
2. Navigate to SQL Server: `kloudvin-server`
3. Settings → Networking
4. Add client IP address
5. Enable "Allow Azure services and resources to access this server"
6. Save

### 2.4 Get Connection String

**From Azure Portal:**
1. Go to SQL Database: `kloudvin-db`
2. Settings → Connection strings
3. Copy ADO.NET connection string
4. Replace `{your_password}` with actual password
5. Save for later use

---

## Step 3: Deploy Azure Functions

### 3.1 Functions Already Deployed

Your Azure Functions are already deployed:
- Function App: `kloudvin-functions-geftgkb3dehxhag7`
- Region: Central US
- Runtime: Node.js

### 3.2 Verify Functions

**Test uploadImage function:**
```bash
curl -X POST https://kloudvin-functions-geftgkb3dehxhag7.centralus-01.azurewebsites.net/api/uploadImage \
  -H "Content-Type: multipart/form-data" \
  -F "image=@test-image.png"
```

**Test convertDocx function:**
```bash
curl -X POST https://kloudvin-functions-geftgkb3dehxhag7.centralus-01.azurewebsites.net/api/convertDocx \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test-document.docx"
```

### 3.3 Configure Function App Settings

**Required Application Settings:**
1. Go to Function App in Azure Portal
2. Settings → Configuration
3. Add/verify these settings:
   - `AzureWebJobsStorage`: Storage account connection string
   - `STORAGE_CONNECTION_STRING`: Same as above
   - `WEBSITE_NODE_DEFAULT_VERSION`: `~18`

### 3.4 Configure CORS

**Allow your domain:**
1. Function App → API → CORS
2. Add allowed origins:
   - `https://kloudvin.com`
   - `https://www.kloudvin.com`
   - `http://localhost:5000` (for local testing)
3. Save

---

## Step 4: Deploy Static Web App

### 4.1 Create Static Web App

**Option A: Using Azure Portal**

1. Go to Azure Portal
2. Click "Create a resource"
3. Search for "Static Web App"
4. Click "Create"

**Configuration:**
- Subscription: Your subscription
- Resource Group: Same as other resources
- Name: `kloudvin`
- Plan type: Free (or Standard for custom domain)
- Region: Central US
- Source: GitHub (or Azure DevOps)
- Organization: Your GitHub username
- Repository: Your repository name
- Branch: `main` or `master`
- Build Presets: Custom
- App location: `/kloudvin`
- Api location: (leave empty - using separate Function App)
- Output location: (leave empty)

5. Click "Review + create"
6. Click "Create"

**Option B: Using Azure CLI**

```bash
# Login to Azure
az login

# Create Static Web App
az staticwebapp create \
  --name kloudvin \
  --resource-group your-resource-group \
  --source https://github.com/your-username/your-repo \
  --location "Central US" \
  --branch main \
  --app-location "/kloudvin" \
  --login-with-github
```

### 4.2 Configure Build Settings

**GitHub Actions Workflow** (auto-created):

The deployment will create `.github/workflows/azure-static-web-apps-*.yml`

Verify it contains:
```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    runs_on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/kloudvin"
          api_location: ""
          output_location: ""
```

### 4.3 Configure Custom Domain (Optional)

**Add kloudvin.com:**

1. Go to Static Web App in Azure Portal
2. Settings → Custom domains
3. Click "Add"
4. Enter: `kloudvin.com`
5. Choose DNS provider: Azure DNS or External
6. Follow instructions to add DNS records:
   - Type: CNAME
   - Name: `www` or `@`
   - Value: Your Static Web App URL
7. Wait for DNS propagation (can take up to 48 hours)
8. SSL certificate is automatically provisioned

---

## Step 5: Configure Environment

### 5.1 Configure Data API Builder

**Update connection string in Azure:**

1. Go to Static Web App
2. Settings → Configuration
3. Add application setting:
   - Name: `DATABASE_CONNECTION_STRING`
   - Value: Your SQL connection string
4. Save

**Verify `staticwebapp.database.config.json`:**
- Located in `swa-db-connections/` folder
- Defines REST API endpoints
- Configures entity permissions

### 5.2 Configure EmailJS

**No server-side configuration needed!**

EmailJS is configured client-side:
1. Login as Administrator
2. Click gear icon → Site Settings
3. EmailJS tab
4. Enter your credentials:
   - Service ID: `service_a77xl0o`
   - Template ID (OTP): `template_hjp6pqq`
   - Template ID (Welcome): `template_fcr2nyl`
   - Public Key: `d8N6hPb8vYE1MfFFH`
5. Save

### 5.3 Configure Storage Account

**Already configured:**
- Storage account: `kloudvin`
- Container: `images`
- Access level: Public blob access
- CORS: Configured for your domain

**Verify CORS settings:**
1. Go to Storage Account
2. Settings → Resource sharing (CORS)
3. Blob service should have:
   - Allowed origins: `*` or your domain
   - Allowed methods: GET, POST, PUT
   - Allowed headers: `*`
   - Exposed headers: `*`
   - Max age: 3600

---

## Step 6: Test Deployment

### 6.1 Access Your Site

**Default URL:**
- `https://[your-static-web-app-name].azurestaticapps.net`

**Custom Domain (if configured):**
- `https://kloudvin.com`

### 6.2 Test Core Functionality

**1. Homepage:**
- [ ] Page loads correctly
- [ ] Topic cards display
- [ ] Featured articles load
- [ ] Navigation works

**2. Blog Page:**
- [ ] Articles load from database
- [ ] Category filters work
- [ ] Article cards display correctly
- [ ] Clicking article opens full view

**3. Article Page:**
- [ ] Article content displays
- [ ] Images load correctly
- [ ] Code blocks have syntax highlighting
- [ ] Markdown renders properly

**4. Login:**
- [ ] Login modal opens
- [ ] Can login with credentials
- [ ] Badge shows username
- [ ] Logout works

**5. New Article:**
- [ ] Editor opens
- [ ] Can write in Markdown
- [ ] Preview works
- [ ] Image upload works
- [ ] DOCX upload works
- [ ] Publishing works
- [ ] Article appears on blog

**6. Site Settings (Admin):**
- [ ] Settings modal opens
- [ ] EmailJS tab loads
- [ ] Site Config tab loads
- [ ] Categories tab loads
- [ ] Articles tab loads
- [ ] Can edit/delete articles

### 6.3 Test Database Connection

**Check Data API:**
```bash
# Test Users endpoint
curl https://your-site.azurestaticapps.net/data-api/rest/User

# Test Articles endpoint
curl https://your-site.azurestaticapps.net/data-api/rest/Article
```

### 6.4 Test Azure Functions

**Test Image Upload:**
1. Login as admin/editor
2. Click "New Article"
3. Click image upload button
4. Select an image
5. Verify image uploads successfully
6. Check image URL is inserted

**Test DOCX Conversion:**
1. Click "Upload" tab
2. Select a .docx file
3. Click "Convert & Load"
4. Verify content is converted
5. Check images are extracted

---

## Post-Deployment Tasks

### 7.1 Create Initial Users

**Create Administrator Account:**
1. Access your site
2. Open browser console (F12)
3. Run this script:

```javascript
// Create admin user
const adminUser = {
  username: 'admin',
  email: 'admin@kloudvin.com',
  password_hash: 'your-secure-password',
  is_admin: true,
  role: 'Administrator',
  phone: '+91 9900069073'
};

fetch('/data-api/rest/User', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(adminUser)
}).then(r => r.json()).then(console.log);
```

**Or use SQL:**
```sql
INSERT INTO Users (username, email, password_hash, is_admin, role, phone, created_at)
VALUES ('admin', 'admin@kloudvin.com', 'your-password', 1, 'Administrator', '+91 9900069073', GETDATE());
```

### 7.2 Configure EmailJS Templates

**Template 1: Password Reset OTP**
- Template ID: `template_hjp6pqq`
- Variables: `{{to_email}}`, `{{to_name}}`, `{{otp_code}}`

**Template 2: Welcome & Notifications**
- Template ID: `template_fcr2nyl`
- Variables: `{{to_email}}`, `{{to_name}}`, `{{message}}`

### 7.3 Set Up Monitoring

**Application Insights (Optional):**
1. Create Application Insights resource
2. Link to Static Web App
3. Monitor:
   - Page views
   - Performance
   - Errors
   - User behavior

**Azure Monitor:**
- Set up alerts for:
  - Database connection failures
  - Function execution errors
  - High response times
  - Storage quota

### 7.4 Configure Backup

**Database Backup:**
1. Go to SQL Database
2. Settings → Backups
3. Configure automated backups:
   - Retention: 7-35 days
   - Geo-redundant: Enabled

**Storage Backup:**
- Blob soft delete: Enabled (7 days)
- Versioning: Enabled

### 7.5 Security Hardening

**SQL Database:**
- [ ] Enable Advanced Threat Protection
- [ ] Configure firewall rules (whitelist only)
- [ ] Use strong passwords
- [ ] Enable auditing

**Storage Account:**
- [ ] Enable soft delete
- [ ] Configure network rules
- [ ] Use SAS tokens for sensitive operations
- [ ] Enable logging

**Static Web App:**
- [ ] Configure custom domain with SSL
- [ ] Enable authentication (if needed)
- [ ] Configure security headers
- [ ] Set up WAF (Web Application Firewall)

---

## Troubleshooting

### Common Issues

**1. Site Not Loading**
- Check deployment status in Azure Portal
- Verify GitHub Actions workflow completed
- Check browser console for errors
- Clear browser cache

**2. Database Connection Errors**
- Verify connection string is correct
- Check firewall rules allow Azure services
- Verify Data API Builder configuration
- Check database is online

**3. Images Not Uploading**
- Verify Function App is running
- Check CORS settings on Function App
- Verify storage connection string
- Check blob container exists and is public

**4. DOCX Conversion Failing**
- Check Function App logs
- Verify file size < 10MB
- Ensure file is .docx format
- Check Function App has enough memory

**5. Articles Not Saving**
- Check database connection
- Verify user has permissions
- Check browser console for errors
- Verify Data API endpoints are working

**6. Login Not Working**
- Check database connection
- Verify user exists in database
- Check password is correct
- Clear browser cache and cookies

### Debugging Tools

**Browser Console (F12):**
- Check for JavaScript errors
- Monitor network requests
- View API responses

**Azure Portal:**
- Function App → Monitor → Logs
- Static Web App → Monitoring → Metrics
- SQL Database → Query editor

**Azure CLI:**
```bash
# View Static Web App logs
az staticwebapp show --name kloudvin --resource-group your-rg

# View Function App logs
az functionapp log tail --name kloudvin-functions-geftgkb3dehxhag7 --resource-group your-rg

# Test database connection
az sql db show-connection-string --name kloudvin --server kloudvin-server
```

---

## Maintenance

### Regular Tasks

**Weekly:**
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Review security alerts

**Monthly:**
- [ ] Review and optimize database
- [ ] Clean up old images (if needed)
- [ ] Update dependencies
- [ ] Review backup retention

**Quarterly:**
- [ ] Security audit
- [ ] Performance optimization
- [ ] Cost optimization review
- [ ] Update documentation

### Updating the Site

**Code Updates:**
1. Make changes locally
2. Test thoroughly
3. Commit to Git
4. Push to GitHub
5. GitHub Actions deploys automatically
6. Verify deployment

**Database Updates:**
1. Test changes in development
2. Create backup
3. Run migration scripts
4. Verify data integrity
5. Update Data API config if needed

---

## Cost Optimization

### Current Costs (Estimated)

**Azure SQL Database:**
- Basic tier: ~$5/month
- Standard tier: ~$15-30/month

**Azure Storage:**
- First 50GB: ~$1/month
- Bandwidth: ~$0.05/GB

**Azure Functions:**
- Consumption plan: First 1M executions free
- Typical usage: < $1/month

**Azure Static Web Apps:**
- Free tier: $0
- Standard tier: $9/month (for custom domain)

**Total Estimated:** $10-50/month depending on tier

### Cost Saving Tips

1. **Use Free Tiers:**
   - Static Web Apps: Free tier
   - Functions: Consumption plan
   - SQL: Basic tier for development

2. **Optimize Storage:**
   - Compress images before upload
   - Set lifecycle policies to archive old data
   - Use CDN for static assets

3. **Optimize Database:**
   - Use appropriate tier for traffic
   - Scale down during low usage
   - Archive old articles

4. **Monitor Usage:**
   - Set up cost alerts
   - Review monthly bills
   - Identify unused resources

---

## Support and Resources

**Azure Documentation:**
- Static Web Apps: https://docs.microsoft.com/azure/static-web-apps/
- Azure Functions: https://docs.microsoft.com/azure/azure-functions/
- Azure SQL: https://docs.microsoft.com/azure/azure-sql/

**Community:**
- Azure Forums: https://docs.microsoft.com/answers/
- Stack Overflow: Tag `azure-static-web-apps`
- GitHub Issues: Your repository

**Contact:**
- Azure Support: Through Azure Portal
- Site Administrator: admin@kloudvin.com

---

**Last Updated:** February 2026  
**Version:** 1.0
