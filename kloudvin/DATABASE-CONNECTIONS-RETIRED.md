# Azure Static Web Apps Database Connections - RETIRED FEATURE

## Critical Discovery

**The Azure Static Web Apps Database Connections feature has been RETIRED as of November 30, 2025.**

According to Microsoft's official documentation:
> **Important**  
> **Retirement notice: Database Connections for Static Web Apps ends November 30, 2025. Migrate now to avoid disruption.**

Source: [https://learn.microsoft.com/azure/static-web-apps/database-overview](https://learn.microsoft.com/azure/static-web-apps/database-overview)

## Why the Data API Returns 500 Errors

The `/data-api/*` endpoints are returning HTTP 500 errors because:
1. The Database Connections feature has been retired
2. Azure Static Web Apps no longer processes `staticwebapp.database.config.json`
3. The Data API Builder integration is no longer available in Azure Static Web Apps

## Current Situation

- ✅ Local development works perfectly with `swa start . --data-api-location ./swa-db-connections`
  - This uses the local Data API Builder runtime
- ❌ Azure deployment returns 500 errors
  - Azure no longer supports this feature

## Migration Options

You have three options to restore database functionality:

### Option 1: Azure Functions API (Recommended)

Create a custom Azure Functions API to handle database operations.

**Pros:**
- Fully supported by Azure Static Web Apps
- Available on Free tier
- Complete control over API logic
- Can reuse existing database connection

**Cons:**
- Requires writing backend code
- More complex than Data API Builder

**Implementation:**
1. Create Azure Functions in the `kloudvin-api` folder (already exists!)
2. Add functions for:
   - `getArticles` - GET /api/articles
   - `getArticle` - GET /api/articles/{id}
   - `createArticle` - POST /api/articles
   - `updateArticle` - PUT /api/articles/{id}
   - `deleteArticle` - DELETE /api/articles/{id}
   - Similar functions for Users
3. Update frontend code to use `/api/*` instead of `/data-api/*`

### Option 2: Bring Your Own API

Deploy Data API Builder as a separate Azure service.

**Pros:**
- Keep using Data API Builder
- Minimal code changes
- Configuration-based

**Cons:**
- Requires separate Azure service (Azure Container Apps or App Service)
- Additional cost
- More complex deployment

**Implementation:**
1. Deploy Data API Builder to Azure Container Apps
2. Configure CORS to allow requests from kloudvin.com
3. Update frontend to point to the new API URL

### Option 3: Azure API Management + Azure Functions

Use Azure API Management as a gateway to Azure Functions.

**Pros:**
- Professional API management
- Rate limiting, caching, monitoring
- Swagger/OpenAPI support

**Cons:**
- Most expensive option
- Overkill for simple applications

## Recommended Solution: Azure Functions

Given your existing setup, I recommend Option 1 (Azure Functions). Here's why:

1. You already have `kloudvin-api` folder with Azure Functions setup
2. Azure Functions are free on Static Web Apps Free tier
3. You have existing functions (`convertDocx`, `uploadImage`)
4. Simple to implement and maintain

## Implementation Plan

### Step 1: Create Database Functions

Create these files in `kloudvin-api/src/functions/`:

1. `getArticles.js` - List all articles
2. `getArticle.js` - Get single article by ID
3. `createArticle.js` - Create new article
4. `updateArticle.js` - Update existing article
5. `deleteArticle.js` - Delete article
6. `getUsers.js` - List users (for authentication)
7. `getUser.js` - Get single user
8. `createUser.js` - Create new user
9. `updateUser.js` - Update user

### Step 2: Update Frontend

Update `kloudvin/js/db.js` to change:
```javascript
// OLD
const DB_API_BASE = '/data-api/rest';

// NEW
const DB_API_BASE = '/api';
```

Update all database functions to use the new API endpoints.

### Step 3: Deploy

1. Commit and push changes
2. Azure DevOps pipeline will deploy automatically
3. Test the new API endpoints

## Estimated Effort

- Creating Azure Functions: 2-3 hours
- Updating frontend code: 1 hour
- Testing and debugging: 1-2 hours
- **Total: 4-6 hours**

## Alternative: Use Client-Side Storage

If you want a quick temporary solution:

1. Keep using localStorage (already implemented in your code)
2. Add export/import functionality (already exists in `migrate.js`)
3. Users can backup/restore their data manually

This is not ideal for production but works for personal/demo use.

## Next Steps

Please decide which option you prefer:

1. **Azure Functions** (recommended) - I can help you implement this
2. **Bring Your Own API** - Deploy Data API Builder separately
3. **Client-Side Storage** - Use localStorage temporarily

Let me know your preference and I'll help you implement the solution!

## Files to Keep

These files are still useful for local development:
- `swa-db-connections/staticwebapp.database.config.json` - For local SWA CLI
- `swa-db-connections/schema.sql` - Database schema
- `swa-db-connections/migration-*.sql` - Database migrations

## Files to Remove (After Migration)

Once you migrate to Azure Functions:
- `staticwebapp.database.config.json` (root) - No longer used by Azure
- Can keep in `swa-db-connections/` for local development reference
