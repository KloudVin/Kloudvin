# Azure Static Web Apps Data API Troubleshooting

## Current Status
The Azure Static Web App is deployed and accessible at https://kloudvin.com, but the Data API endpoints are returning 500 errors with the message "Data API call failure".

## What's Working ✅
1. Local development with `swa start . --data-api-location ./swa-db-connections` works perfectly
2. Database connection string is set in Azure Static Web App configuration
3. SQL Server firewall allows Azure services (rule: `AllowAllWindowsAzureIps`)
4. Database is online and accessible
5. Azure DevOps pipeline is deploying successfully
6. Static website files are serving correctly

## What's Not Working ❌
- All Data API endpoints return HTTP 500: "Data API call failure"
- Examples:
  - `GET /data-api/rest/Article` → 500
  - `GET /data-api/rest/User` → 500

## Changes Made

### 1. Database Configuration File Location
**Issue**: Azure Static Web Apps expects `staticwebapp.database.config.json` in the repository root.

**Fix Applied**:
- Copied `swa-db-connections/staticwebapp.database.config.json` to root directory
- Commit: `7b12de7`

### 2. Azure DevOps Pipeline Trigger
**Issue**: Pipeline was configured to trigger on `main` branch, but repository uses `master`.

**Fix Applied**:
- Updated `azure-pipelines.yml` to trigger on both `master` and `main`
- Commit: `0ce36b2`

### 3. Data API Mode
**Issue**: Configuration had `mode: "development"` which might not work in Azure production.

**Fix Applied**:
- Changed to `mode: "production"` in both config files
- Commit: `2ce973c`

### 4. Platform API Runtime
**Issue**: Missing platform configuration in `staticwebapp.config.json`.

**Fix Applied**:
- Added `platform.apiRuntime: "node:18"`
- Commit: `15988a2`

## Possible Root Causes

### Theory 1: Database Connection Not Linked in Azure Portal
Azure Static Web Apps might require the database connection to be explicitly linked through the Azure Portal's "Database connection" feature, not just through environment variables.

**How to Check**:
1. Go to Azure Portal → Static Web Apps → kloudvin
2. Look for "Database connection" in the left menu
3. Check if a connection is configured

**How to Fix** (if this is the issue):
The Azure CLI extension for database connections has a bug (`ModuleNotFoundError: No module named 'msrestazure'`), so this must be done through the Azure Portal:

1. In Azure Portal, navigate to your Static Web App
2. Go to Settings → Database connection
3. Click "Link existing database" or "Add"
4. Select your SQL Server: `kloudvin.database.windows.net`
5. Select database: `kloudvin`
6. Authentication: SQL Authentication
7. Username: `kloudvin`
8. Password: `Vins@6579`
9. Save and wait for deployment

### Theory 2: Data API Builder Version Incompatibility
The Data API Builder runtime in Azure might be using a different version than the local SWA CLI, causing configuration incompatibilities.

**How to Check**:
- Check Azure Static Web Apps documentation for the current Data API Builder version
- Compare with local SWA CLI version: `swa --version`

### Theory 3: Environment Variable Not Being Resolved
The `@env('DATABASE_CONNECTION_STRING')` syntax might not be working in Azure production.

**How to Test**:
Try hardcoding the connection string temporarily (NOT recommended for production, only for testing):
```json
"connection-string": "Server=tcp:kloudvin.database.windows.net,1433;Initial Catalog=kloudvin;..."
```

### Theory 4: Missing Data API Builder Configuration
Azure might need additional configuration or the Data API feature might not be fully enabled.

**How to Check**:
1. Verify in Azure Portal that Data API is enabled
2. Check if there are any feature flags or preview features that need to be enabled

## Next Steps for User

### Step 1: Check Azure Portal Database Connection
1. Log into Azure Portal: https://portal.azure.com
2. Navigate to: Resource Groups → Kloudvin → kloudvin (Static Web App)
3. In the left menu, look for "Database connection" or "Data API"
4. Take a screenshot of what you see
5. If there's an option to "Link database" or "Configure", try setting it up with:
   - Server: `kloudvin.database.windows.net`
   - Database: `kloudvin`
   - Username: `kloudvin`
   - Password: `Vins@6579`

### Step 2: Check Application Insights / Logs
1. In Azure Portal → Static Web App → kloudvin
2. Look for "Application Insights" or "Logs" in the left menu
3. Check for any error messages related to Data API
4. Look for errors mentioning:
   - Database connection
   - Configuration file
   - Authentication

### Step 3: Verify Data API Feature
1. In Azure Portal → Static Web App → kloudvin → Configuration
2. Check if there's a "Data API" section
3. Verify it's enabled
4. Check if there are any additional settings or requirements

### Step 4: Test with Diagnostic Script
Run this in your browser console on https://kloudvin.com:

```javascript
// Test Data API endpoints
const tests = [
  '/data-api/rest/Article',
  '/data-api/rest/User',
  '/data-api/rest/$metadata'
];

for (const endpoint of tests) {
  fetch(endpoint)
    .then(r => r.text().then(body => ({status: r.status, body})))
    .then(({status, body}) => console.log(`${endpoint}: ${status}`, body))
    .catch(e => console.error(`${endpoint}: ERROR`, e));
}
```

## Configuration Files

### Current staticwebapp.database.config.json (root)
```json
{
  "$schema": "https://github.com/Azure/data-api-builder/releases/latest/download/dab.draft.schema.json",
  "data-source": {
    "database-type": "mssql",
    "connection-string": "@env('DATABASE_CONNECTION_STRING')",
    "options": {
      "set-session-context": false
    }
  },
  "runtime": {
    "rest": {
      "enabled": true,
      "path": "/rest"
    },
    "graphql": {
      "enabled": false
    },
    "host": {
      "cors": {
        "origins": ["*"],
        "allow-credentials": false
      },
      "authentication": {
        "provider": "StaticWebApps"
      },
      "mode": "production"
    }
  },
  "entities": {
    "User": {
      "source": "dbo.Users",
      "permissions": [{"role": "anonymous", "actions": ["create", "read", "update", "delete"]}]
    },
    "Article": {
      "source": "dbo.Articles",
      "permissions": [{"role": "anonymous", "actions": ["create", "read", "update", "delete"]}]
    }
  }
}
```

### Environment Variables in Azure
```
DATABASE_CONNECTION_STRING=Server=tcp:kloudvin.database.windows.net,1433;Initial Catalog=kloudvin;Persist Security Info=False;User ID=kloudvin;Password=Vins@6579;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

## Resources
- [Azure Static Web Apps Data API Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/database-overview)
- [Data API Builder Documentation](https://learn.microsoft.com/en-us/azure/data-api-builder/)
- [Azure Static Web Apps Configuration](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration)

## Contact
If you need further assistance, please provide:
1. Screenshots from Azure Portal showing Database connection settings
2. Any error messages from Application Insights/Logs
3. Results from the diagnostic script above
