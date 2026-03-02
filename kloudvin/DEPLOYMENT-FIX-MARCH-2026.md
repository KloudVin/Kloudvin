# Azure Functions Deployment Fix - March 2, 2026

## Issue
After adding the `listImages` function, the Azure Functions deployment broke all existing functions, returning 500 errors for `/api/users` and `/api/articles`.

## Root Cause
The Azure Functions were using the v4 programming model with `app.http()` but there was no main entry point to load all the function modules. Only the old v1-style functions (convertDocx, uploadImage) with function.json files were being recognized.

## Solution Applied

### 1. Created Main Entry Point
Created `kloudvin-api/src/index.js` to import all function modules:
```javascript
require('./functions/getUsers');
require('./functions/getUser');
require('./functions/createUser');
require('./functions/updateUser');
require('./functions/getArticles');
require('./functions/getArticle');
require('./functions/createArticle');
require('./functions/updateArticle');
require('./functions/deleteArticle');
require('./functions/uploadImage');
require('./functions/convertDocx');
require('./functions/listImages');
```

### 2. Updated package.json
- Added `"main": "src/index.js"` to specify entry point
- Added `@azure/functions` v4 dependency

### 3. Created listImages Function
Created `kloudvin-api/src/functions/listImages.js` to fetch images from Azure Blob Storage:
- Route: `/api/images`
- Returns: `{ images: [...] }` with name, url, size, lastModified
- Uses `AZURE_STORAGE_CONNECTION_STRING` environment variable

### 4. Updated Database Configuration
Increased connection timeouts in `kloudvin-api/src/shared/database.js`:
- `connectTimeout: 30000ms`
- `requestTimeout: 30000ms`
- `connectionTimeout: 30000ms`

### 5. Deployment
```bash
cd kloudvin-api
npm install @azure/functions@^4.0.0
zip -r api-deploy-with-modules.zip . -x ".git/*" -x "*.log" -x "*.zip" -x ".vscode/*"
az functionapp deployment source config-zip --resource-group Kloudvin --name kloudvin-functions --src api-deploy-with-modules.zip --timeout 600
az functionapp restart --name kloudvin-functions --resource-group Kloudvin
```

### 6. Frontend Cache Busting
Updated all HTML files from `v=11` to `v=12`:
- `kloudvin/index.html`
- `kloudvin/pages/blog.html`
- `kloudvin/pages/article.html`
- `kloudvin/pages/about.html`

## Verification

All APIs now working correctly:
- ✅ `/api/users` - Returns 2 users
- ✅ `/api/articles` - Returns 1 article
- ✅ `/api/images` - Returns empty array (no images uploaded yet)

## Image Browser Feature

The "Browse Images" button is available in both tabs:
- **Write Tab**: Toolbar button with images icon
- **Upload Tab**: Button below file upload

### Current Status
- Frontend: ✅ Complete
- Backend API: ✅ Working
- Azure Storage: ⚠️ Empty (0 images)

### Note on Images
The user mentioned images are available at:
`https://kloudvin.blob.core.windows.net/images?sp=rl&st=...`

This is a SAS token URL. The images may exist but:
1. The SAS token has expired (valid until 22:52:52 on March 2, 2026)
2. The images might be in a different container or storage account
3. The user needs to upload images through the website's upload feature

## Next Steps for User

1. **Hard Refresh**: Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux) to clear cache
2. **Test Functions**: 
   - Login as admin
   - Try creating/editing articles
   - Try user management
3. **Upload Images**: Use the "Upload Image" feature to add images to storage
4. **Browse Images**: Click "Browse Images" button to see uploaded images

## Environment Variables Configured

All required environment variables are set in Azure Function App:
- `AZURE_STORAGE_CONNECTION_STRING` ✅
- `DB_SERVER` ✅
- `DB_NAME` ✅
- `DB_USER` ✅
- `DB_PASSWORD` ✅

## Files Modified

### Backend
- `kloudvin-api/src/index.js` (NEW)
- `kloudvin-api/src/functions/listImages.js` (NEW)
- `kloudvin-api/package.json`
- `kloudvin-api/src/shared/database.js`

### Frontend
- `kloudvin/index.html`
- `kloudvin/pages/blog.html`
- `kloudvin/pages/article.html`
- `kloudvin/pages/about.html`

## Deployment Complete ✅

All Azure Functions are now operational and the website should be fully functional.
