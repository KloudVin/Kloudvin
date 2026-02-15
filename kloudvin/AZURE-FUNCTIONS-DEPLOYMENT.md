# Azure Functions API Deployment Guide

## What Changed

The Azure Static Web Apps Database Connections feature has been retired. We've migrated to **Azure Functions** as the API backend.

## Changes Made

### 1. Created Azure Functions (in `/api` folder)

**Articles API:**
- `GET /api/articles` - List all articles
- `GET /api/articles/{id}` - Get single article
- `POST /api/articles` - Create article
- `PATCH /api/articles/{id}` - Update article
- `DELETE /api/articles/{id}` - Delete article

**Users API:**
- `GET /api/users` - List all users
- `GET /api/users/{id}` - Get single user
- `POST /api/users` - Create user
- `PATCH /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### 2. Updated Frontend (`js/db.js`)

Changed API base URL from `/data-api/rest` to `/api`

All database calls now use Azure Functions instead of the retired Data API.

### 3. Updated Azure Pipeline

Added API deployment configuration:
- `api_location: 'api'`
- `skip_api_build: false`
- Database environment variables

## Deployment Steps

### Step 1: Add Environment Variables in Azure Portal

1. Go to Azure Portal → Static Web Apps → kloudvin
2. Navigate to Settings → Configuration
3. Add these Application settings:

```
DB_SERVER=kloudvin.database.windows.net
DB_NAME=kloudvin
DB_USER=kloudvin
DB_PASSWORD=Vins@6579
```

4. Click "Save"

### Step 2: Deploy

The code has already been pushed to Azure DevOps. The pipeline will:
1. Build the Azure Functions
2. Deploy them alongside the static web app
3. Configure the `/api/*` routes

### Step 3: Verify Deployment

After deployment completes (2-5 minutes):

1. **Test API endpoints:**
   ```bash
   curl https://kloudvin.com/api/articles
   curl https://kloudvin.com/api/users
   ```

2. **Test the website:**
   - Go to https://kloudvin.com
   - Articles should load on homepage
   - Login should work (username: `admin`, password: `n0n3w0rld`)

## Troubleshooting

### If API returns 500 errors:

1. **Check environment variables:**
   - Azure Portal → Static Web App → Configuration
   - Verify all DB_* variables are set

2. **Check Function App logs:**
   - Azure Portal → Static Web App → Functions
   - Click on a function → Monitor
   - Check for error messages

3. **Verify database connection:**
   - SQL Server firewall allows Azure services
   - Connection string is correct

### If deployment fails:

1. **Check pipeline logs:**
   - Azure DevOps → Pipelines → Latest run
   - Look for errors in the deployment step

2. **Verify API folder structure:**
   ```
   api/
   ├── package.json
   ├── host.json
   └── src/
       ├── functions/
       │   ├── getArticles.js
       │   ├── getUsers.js
       │   └── ...
       └── shared/
           └── database.js
   ```

## Local Development

To test locally:

```bash
cd api
npm install
npm start
```

The Functions will run on `http://localhost:7071`

Update `kloudvin/js/db.js` temporarily:
```javascript
const DB_API_BASE = 'http://localhost:7071/api';
```

## Migration Complete!

Once deployed, your site will be fully functional with:
- ✅ Database connectivity via Azure Functions
- ✅ All CRUD operations working
- ✅ Login/authentication working
- ✅ Article management working

The retired Data API (`/data-api/*`) is no longer used.
