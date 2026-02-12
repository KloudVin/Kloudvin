# KloudVin Quick Start Guide

Get up and running with KloudVin in 5 minutes!

## 📚 Confused About Where Things Run?

Before starting, read these if you're new to Azure or cloud development:
- 🎯 [WHERE-DOES-IT-RUN.md](./WHERE-DOES-IT-RUN.md) - Simple visual guide
- 📖 [SETUP-EXPLAINED.md](./SETUP-EXPLAINED.md) - Detailed explanation

## Understanding the Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT (Local)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Your Computer                          Azure Cloud          │
│  ┌──────────────┐                      ┌──────────────┐     │
│  │   Browser    │                      │  Azure SQL   │     │
│  │ localhost:   │  ◄──── connects ───► │  Database    │     │
│  │   4280       │       to cloud       │              │     │
│  └──────────────┘                      └──────────────┘     │
│         ▲                                                    │
│         │                                                    │
│  ┌──────────────┐                                           │
│  │  SWA CLI     │                                           │
│  │  (npm start) │                                           │
│  └──────────────┘                                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   PRODUCTION (Azure)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  User's Browser                     Azure Cloud              │
│  ┌──────────────┐                  ┌──────────────┐         │
│  │   Internet   │                  │ Static Web   │         │
│  │   Browser    │  ◄─── visits ──► │    App       │         │
│  │              │                  │ (your site)  │         │
│  └──────────────┘                  └──────┬───────┘         │
│                                            │                 │
│                                            │ connects        │
│                                            ▼                 │
│                                    ┌──────────────┐         │
│                                    │  Azure SQL   │         │
│                                    │  Database    │         │
│                                    └──────────────┘         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Two Phases: Development → Production

1. **Development (Steps 1-6)**: Run locally on your computer, connect to Azure database
2. **Production (Deploy section)**: Deploy your site to Azure so anyone can access it

---

## Prerequisites

- Node.js 16+ installed
- Azure subscription (for production deployment)
- Git installed

## Local Development (Without Database)

If you just want to see the site without database setup:

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/kloudvin.git
cd kloudvin

# Install SWA CLI
npm install -g @azure/static-web-apps-cli

# Start without database (uses localStorage)
npm run start:no-db

# Open browser
open http://localhost:4280
```

Default admin credentials:
- Username: `admin`
- Password: `kloudvin@2026`

## Local Development (With Database)

### Step 1: Install Dependencies

```bash
npm install -g @azure/static-web-apps-cli
```

### Step 2: Set Up Azure SQL Database

**Quick Azure CLI Setup:**

```bash
# Login to Azure
az login

# Set variables
RESOURCE_GROUP="kloudvin-rg"
LOCATION="eastus"
SERVER_NAME="kloudvin-sql-$(date +%s)"
DATABASE_NAME="kloudvin"
ADMIN_USER="sqladmin"
ADMIN_PASSWORD="SecurePass123!"

# Create resources
az group create --name $RESOURCE_GROUP --location $LOCATION

az sql server create \
  --name $SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --admin-user $ADMIN_USER \
  --admin-password $ADMIN_PASSWORD

az sql db create \
  --resource-group $RESOURCE_GROUP \
  --server $SERVER_NAME \
  --name $DATABASE_NAME \
  --service-objective Basic

# Allow Azure services
az sql server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SERVER_NAME \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Get connection string (ADO.NET format - this is what you need!)
echo "Copy this connection string to your .env file:"
echo ""
az sql db show-connection-string \
  --server $SERVER_NAME \
  --name $DATABASE_NAME \
  --client ado.net

echo ""
echo "⚠️  IMPORTANT: Replace <username> with: $ADMIN_USER"
echo "⚠️  IMPORTANT: Replace <password> with: $ADMIN_PASSWORD"
```

**Note**: Azure Portal shows connection strings in multiple formats (ADO.NET, JDBC, ODBC, PHP, Go). **Use ADO.NET** for this project!

### Step 3: Run Database Schema

1. Open Azure Portal → SQL databases → Query editor
2. Login with your credentials
3. Copy and paste contents of `swa-db-connections/schema.sql`
4. Click "Run"

### Step 4: Configure Environment (On Your Local Machine)

The `.env` file is created **on your local computer** but contains the connection string to your **Azure SQL Database** (which runs on Azure).

#### Get Your Connection String from Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **SQL databases** → **kloudvin**
3. Click **Connection strings** (left menu)
4. **Select ADO.NET tab** (not JDBC, ODBC, PHP, or Go)
5. Copy the connection string

**📖 Confused about connection strings?** See [CONNECTION-STRING-GUIDE.md](./CONNECTION-STRING-GUIDE.md) for detailed explanation.

It will look like this:
```
Server=tcp:kloudvin-sql-1234567890.database.windows.net,1433;Initial Catalog=kloudvin;Persist Security Info=False;User ID=<username>;Password=<password>;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

#### Create .env File

```bash
# On your local machine, in the kloudvin folder:

# Copy example env file
cp .env.example .env

# Edit .env with your connection string
# Use nano, vim, VS Code, or any text editor
nano .env
```

#### Update .env File

Replace the placeholder with your actual connection string from Azure Portal:

```env
# Replace this entire line with your ADO.NET connection string from Azure Portal
DATABASE_CONNECTION_STRING="Server=tcp:kloudvin-sql-1234567890.database.windows.net,1433;Initial Catalog=kloudvin;Persist Security Info=False;User ID=sqladmin;Password=SecurePass123!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
```

**Important Notes:**
- ✅ Use **ADO.NET** format (not JDBC, ODBC, PHP, or Go)
- ✅ Replace `<username>` with your actual username (e.g., `sqladmin`)
- ✅ Replace `<password>` with your actual password
- ✅ Keep it all on one line
- ✅ Keep the quotes around the connection string

### Step 5: Start Development Server (Runs Locally)

This runs a **local development server** on your computer that connects to the **Azure SQL Database** in the cloud:

```bash
# Run this on your local machine
npm start
```

You should see output like:
```
Azure Static Web Apps CLI (1.1.0)

Using configuration "staticwebapp.config.json"
Serving static content: .
Data API location: swa-db-connections

Azure Static Web Apps emulator started at http://localhost:4280
```

Open http://localhost:4280 in your browser - this is your **local** website connecting to **Azure** database.

### Step 6: Test the Connection

1. Open http://localhost:4280 in your browser
2. Click the lock icon (bottom right) to login
3. Use default credentials:
   - Username: `admin`
   - Password: `kloudvin@2026`
4. Click "New Article" button
5. Create a test article and publish
6. **Refresh the page** - the article should still be there!
7. Close your browser completely and reopen - article persists!

**What's happening:**
- Your browser → Local SWA CLI (localhost:4280) → Azure SQL Database (cloud)
- Data is stored in Azure, not your browser

## Deploy to Azure (Production)

Once local development works, deploy to Azure so your site is publicly accessible.

### What Gets Deployed Where?

- **Your Code** (HTML/CSS/JS) → Azure Static Web Apps (cloud hosting)
- **Your Database** → Already on Azure SQL (from Step 2)
- **Connection** → Static Web App connects to SQL Database

### Option 1: GitHub Actions (Recommended)

**Step 1: Create Static Web App on Azure**

```bash
# This creates the hosting environment for your website
az staticwebapp create \
  --name kloudvin \
  --resource-group kloudvin-rg \
  --source https://github.com/YOUR_USERNAME/kloudvin \
  --location eastus \
  --branch main \
  --app-location "/" \
  --output-location "."
```

**Step 2: Configure Database Connection in Azure**

Now tell your Azure-hosted website how to connect to your Azure SQL Database:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Static Web App (kloudvin)
3. Click **Configuration** → **Application settings**
4. Click **+ Add**
5. Add new setting:
   - **Name**: `DATABASE_CONNECTION_STRING`
   - **Value**: Same connection string from your local `.env` file
6. Click **OK** then **Save**

**Step 3: Deploy Your Code**

```bash
# Get deployment token
az staticwebapp secrets list \
  --name kloudvin \
  --resource-group kloudvin-rg \
  --query "properties.apiKey" -o tsv

# Add this token to GitHub Secrets:
# 1. Go to your GitHub repo → Settings → Secrets and variables → Actions
# 2. Click "New repository secret"
# 3. Name: AZURE_STATIC_WEB_APPS_API_TOKEN
# 4. Value: (paste the token from above)

# Push to trigger automatic deployment
git add .
git commit -m "Deploy to Azure"
git push origin main
```

**Step 4: Access Your Live Site**

After deployment completes (2-3 minutes):
1. Go to Azure Portal → Your Static Web App
2. Click the URL (e.g., https://kloudvin-abc123.azurestaticapps.net)
3. Your site is now live!

### Option 2: Direct Deploy with SWA CLI

```bash
# Login to Azure
swa login

# Deploy directly
npm run deploy
```

Then configure the database connection in Azure Portal (same as Option 1, Step 2).

### Verify Production Deployment

1. Open your Azure Static Web App URL
2. Test login (admin / kloudvin@2026)
3. Create a test article
4. Refresh - article should persist
5. Open in different browser - article still there!

**Now your site is:**
- ✅ Publicly accessible on the internet
- ✅ Using Azure SQL Database for storage
- ✅ Data persists permanently

## Migrate Existing Data

If you have data in localStorage:

```javascript
// Open browser console on your site
migrateLocalStorageToDatabase();
```

## Common Commands

```bash
# Start with database
npm start

# Start without database
npm run start:no-db

# Deploy to production
npm run deploy

# View logs
# Check terminal output where SWA CLI is running
```

## Troubleshooting

### Can't connect to database
```bash
# Check firewall rules
az sql server firewall-rule list \
  --resource-group kloudvin-rg \
  --server YOUR-SERVER

# Add your IP
az sql server firewall-rule create \
  --resource-group kloudvin-rg \
  --server YOUR-SERVER \
  --name MyIP \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP
```

### Data API returns 404
```bash
# Ensure you started with --data-api-location flag
swa start . --data-api-location swa-db-connections

# Check config file exists
ls -la swa-db-connections/staticwebapp.database.config.json
```

### Login not working
```bash
# Check if user exists in database
# In Azure Portal Query Editor:
SELECT * FROM dbo.Users WHERE username = 'admin';

# If not found, run schema.sql again
```

## Next Steps

1. ✅ Change default admin password
2. ✅ Create your first article
3. ✅ Customize the about page
4. ✅ Update branding and colors
5. ✅ Set up custom domain
6. ✅ Configure SSL certificate
7. ✅ Set up monitoring

## Resources

- 📖 [Full Documentation](./README.md)
- 🗄️ [Database Setup Guide](./DATABASE-SETUP.md)
- 🛠️ [SWA CLI Reference](./SWA-CLI-GUIDE.md)
- 📋 [Migration Summary](./MIGRATION-SUMMARY.md)

## Get Help

- Check browser console for errors
- Review SWA CLI terminal output
- Verify connection string format
- Ensure firewall rules are correct
- Check Azure SQL Database is running

## Default Credentials

⚠️ **Change these immediately in production!**

- Username: `admin`
- Password: `kloudvin@2026`

To change:
1. Login to Azure Portal
2. Go to SQL databases → Query editor
3. Run:
   ```sql
   UPDATE dbo.Users 
   SET password_hash = 'YourNewPassword' 
   WHERE username = 'admin';
   ```

## Success Checklist

- [ ] Database created and schema applied
- [ ] Connection string configured
- [ ] SWA CLI starts without errors
- [ ] Can login with admin credentials
- [ ] Can create new articles
- [ ] Articles persist after refresh
- [ ] Ready to deploy to Azure!

---

**Need more details?** Check the full documentation in [README.md](./README.md)
