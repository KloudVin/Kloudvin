# Azure Data API Fix - Root Cause and Solution

## Problem
The Azure Static Web App was returning 500 errors on all Data API endpoints (`/data-api/rest/*`), even though:
- Local development worked perfectly with `swa start . --data-api-location ./swa-db-connections`
- `DATABASE_CONNECTION_STRING` environment variable was correctly set in Azure
- SQL Server firewall was configured to allow Azure services
- Database configuration file was correct

## Root Cause
**Azure Static Web Apps expects the database configuration file to be in the root directory of the repository, not in a subdirectory.**

The file was located at:
```
❌ swa-db-connections/staticwebapp.database.config.json
```

But Azure expects it at:
```
✅ staticwebapp.database.config.json (root of repository)
```

## Solution Applied
1. Copied `staticwebapp.database.config.json` from `swa-db-connections/` to the root directory
2. Committed and pushed the change to trigger Azure deployment
3. Azure DevOps pipeline automatically deploys the updated configuration

## Verification Steps
After deployment completes (usually 2-5 minutes), verify the fix:

### Test 1: Check Data API Endpoint
```bash
curl "https://kloudvin.com/data-api/rest/Article?\$orderby=created_at%20desc"
```

Expected: JSON response with articles (not "Data API call failure")

### Test 2: Open the Website
1. Go to https://kloudvin.com
2. Articles should load on the homepage
3. No 500 errors in browser console

### Test 3: Test Login
1. Click "Login" button
2. Enter username: `admin`, password: `n0n3w0rld`
3. Should successfully authenticate

## Why Local Development Worked
The SWA CLI command `swa start . --data-api-location ./swa-db-connections` explicitly tells the local emulator where to find the database configuration file. However, Azure Static Web Apps in production has a fixed expectation for the file location.

## Files Modified
- ✅ Added: `staticwebapp.database.config.json` (root directory)
- ℹ️ Kept: `swa-db-connections/staticwebapp.database.config.json` (for local development reference)

## Deployment Status
- Commit: `7b12de7` - "Add database config to root for Azure Data API"
- Branch: `master`
- Status: Deploying via Azure DevOps pipeline
- Expected completion: 2-5 minutes from push

## Next Steps
1. Wait for Azure deployment to complete
2. Test the endpoints using the verification steps above
3. If issues persist, check Azure Static Web App logs in Azure Portal
