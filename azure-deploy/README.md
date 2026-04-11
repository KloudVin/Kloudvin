# KloudVin Blog - Azure Deployment Guide

## Architecture

```
Azure Static Web Apps (Free)
├── Frontend: React SPA (auto-built from /frontend)
├── API: Azure Functions Python 3.11 (from /api)
└── Routing: staticwebapp.config.json

Azure SQL Database (Free Tier)
└── Tables: users, articles, categories, subscribers
```

## Project Structure for Azure Repos

```
your-repo/
├── api/                            # Azure Functions (Python)
│   ├── function_app.py             # All API endpoints
│   ├── host.json                   # Functions host config
│   ├── requirements.txt            # Python dependencies
│   └── local.settings.json         # Local dev only (DO NOT commit)
├── frontend/                       # React frontend
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── index.css
│   │   ├── api.js                  # *** USE AZURE VERSION ***
│   │   ├── context/
│   │   │   └── AuthContext.js      # *** USE AZURE VERSION ***
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Footer.js
│   │   │   ├── CategoryCard.js
│   │   │   └── ArticleCard.js
│   │   └── pages/
│   │       ├── HomePage.js
│   │       ├── BlogPage.js
│   │       ├── ArticlePage.js
│   │       ├── AboutPage.js
│   │       └── AdminPage.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
├── sql/
│   └── schema.sql                  # Database setup script
├── staticwebapp.config.json        # SWA routing config
├── azure-pipelines.yml             # CI/CD pipeline
└── .gitignore
```

---

## Step-by-Step Deployment

### Step 1: Set Up Azure SQL Database

1. Go to **Azure Portal** > **SQL Databases**
2. Use your existing free-tier Azure SQL Database
3. Open **Query Editor** in the Azure Portal
4. Run the SQL from `sql/schema.sql` to create tables and seed categories

### Step 2: Prepare the Code

1. Download the code from Emergent (ZIP download)
2. Create the Azure Repos project structure:

```bash
# Create a new folder for Azure deployment
mkdir kloudvin-azure && cd kloudvin-azure

# Copy api/ folder (from azure-deploy/api/)
cp -r /path/to/azure-deploy/api/ ./api/

# Copy frontend (from the Emergent frontend)
cp -r /path/to/frontend/ ./frontend/

# IMPORTANT: Replace these 2 files with Azure versions:
cp /path/to/azure-deploy/frontend-changes/api.js ./frontend/src/api.js
cp /path/to/azure-deploy/frontend-changes/AuthContext.js ./frontend/src/context/AuthContext.js

# Copy config files
cp /path/to/azure-deploy/staticwebapp.config.json ./
cp /path/to/azure-deploy/azure-pipelines.yml ./
cp -r /path/to/azure-deploy/sql/ ./sql/
```

3. Remove the Emergent-specific `.env` files from `frontend/` (Azure SWA doesn't need `REACT_APP_BACKEND_URL`)

### Step 3: Configure Azure Functions Settings

In the Azure Portal for your Static Web App:

1. Go to **Configuration** > **Application Settings**
2. Add these environment variables:

| Name | Value |
|------|-------|
| `SQL_CONNECTION_STRING` | `Driver={ODBC Driver 18 for SQL Server};Server=tcp:YOUR_SERVER.database.windows.net,1433;Database=YOUR_DB;Uid=YOUR_USER;Pwd=YOUR_PASSWORD;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;` |
| `JWT_SECRET` | Any random 64-character hex string |
| `ADMIN_EMAIL` | `admin@kloudvin.com` |
| `ADMIN_PASSWORD` | Your secure admin password |

> **Get your SQL connection string:** Azure Portal > SQL Database > Connection strings > ODBC

### Step 4: Push to Azure Repos

```bash
cd kloudvin-azure

# Initialize git
git init
git add .
git commit -m "KloudVin blog - fixed version"

# Add Azure Repos as remote
git remote add origin https://dev.azure.com/YOUR_ORG/YOUR_PROJECT/_git/YOUR_REPO

# Push
git push -u origin main
```

### Step 5: Link Azure Repos to Static Web App

1. Go to **Azure Portal** > **Static Web Apps** > Your app
2. Click **Deployment** > **Manage deployment token** — copy the token
3. In **Azure DevOps** > **Project Settings** > **Pipelines** > **Service Connections**:
   - Not needed for token-based auth
4. In **Azure DevOps** > **Pipelines**:
   - Create new pipeline from `azure-pipelines.yml`
   - Add a pipeline variable: `DEPLOYMENT_TOKEN` = the token from step 2 (mark as secret)
5. Run the pipeline

### Step 6: Seed Admin User

After the first deployment, call the seed endpoint to create the admin user:

```bash
curl -X POST https://YOUR_APP.azurestaticapps.net/api/seed
```

This creates the admin user using the `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your app settings.

---

## Key Differences from Emergent Version

| Feature | Emergent | Azure |
|---------|----------|-------|
| Backend | FastAPI (Python) | Azure Functions (Python) |
| Database | MongoDB | Azure SQL Database |
| Frontend URL | `REACT_APP_BACKEND_URL/api` | `/api` (relative, auto-proxied) |
| Hosting | Emergent Preview | Azure Static Web Apps |
| CI/CD | Auto (Emergent) | Azure Pipelines |
| Article create | `POST /api/articles` | `POST /api/articles_create` |
| Article update | `PUT /api/articles/{slug}` | `PUT /api/articles/{slug}/update` |
| Article delete | `DELETE /api/articles/{slug}` | `DELETE /api/articles/{slug}/delete` |
| Category create | `POST /api/categories` | `POST /api/categories_create` |

> **Note on routes:** Azure Functions managed in Static Web Apps have route limitations for same-path-different-method patterns. The `_create` and `/update`, `/delete` suffixes work around this.

---

## Issues Fixed (vs. Original kloudvin.com)

1. **"undefined" read time** — Now properly calculated based on word count (200 words/min)
2. **Admin panel exposed in DOM** — Admin only renders when authenticated via JWT
3. **Subscription not working** — Backend stores subscribers in Azure SQL
4. **Performance** — React SPA with proper API separation

---

## Local Development

```bash
# Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Frontend
cd frontend && npm install && npm start

# API (in another terminal)
cd api
cp local.settings.json.template local.settings.json
# Edit local.settings.json with your SQL connection string
func start
```

---

## Troubleshooting

- **CORS errors**: Should not occur since API is on same domain. If testing locally, add `"Host": {"CORS": "*"}` in `local.settings.json`
- **pyodbc not found**: Azure Functions Python runtime includes the ODBC driver. Locally, install: `brew install unixodbc` (Mac) or `sudo apt install unixodbc-dev` (Linux)
- **Cold starts**: Free-tier Functions have cold starts. First request may take 5-10 seconds.
- **SQL connection fails**: Verify your Azure SQL firewall allows Azure services (Networking > Allow Azure services)
