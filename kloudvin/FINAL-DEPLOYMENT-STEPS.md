# Final Deployment Steps for KloudVin

Your Azure resources are ready. Follow these steps to deploy.

---

## ✅ Your Azure Resources (Already Created)

| Resource | Name | Status |
|----------|------|--------|
| Azure DevOps | `dev.azure.com/teknohutproject` | ✅ Ready |
| Project | `kloudvin` | ✅ Ready |
| Repository | `Kloudvin` | ✅ Ready |
| Pipeline | `azure-pipelines.yml` | ✅ Ready |
| Resource Group | `Kloudvin` | ✅ Ready |
| Static Web App | `Kloudvin` | ✅ Ready |
| Custom Domain | `https://kloudvin.com` | ✅ Ready |
| SQL Server | `kloudvin.database.windows.net` | ✅ Ready |
| Database | `kloudvin` | ✅ Ready |
| Storage Account | `Kloudvin` | ✅ Ready |
| Container | `Images` | ✅ Ready |
| Function App | `kloudvin-functions` | ✅ Ready |
| DNS Zone | `kloudvin.com` | ✅ Ready |

---

## 🚀 Deployment Steps

### Step 1: Configure Azure DevOps Pipeline

**1.1 Get Static Web App Deployment Token**

1. Go to Azure Portal: https://portal.azure.com
2. Navigate to: Resource Groups → `Kloudvin` → Static Web App `Kloudvin`
3. Click "Overview" → "Manage deployment token"
4. Click "Copy" to copy the deployment token
5. Save it temporarily (you'll need it in next step)

**1.2 Create Variable Group in Azure DevOps**

1. Go to Azure DevOps: https://dev.azure.com/teknohutproject/kloudvin
2. Click "Pipelines" → "Library"
3. Click "+ Variable group"
4. Name: `Kloudvin-deploy`
5. Add variables:
   - **Name:** `DEPLOYMENT_TOKEN`
   - **Value:** [Paste the token you copied]
   - **Important:** Click the 🔒 lock icon to make it secret
   - Click "Add"
6. Add another variable:
   - **Name:** `SITE_URL`
   - **Value:** `https://kloudvin.com`
   - Click "Add"
7. Click "Save"

**1.3 Link Variable Group to Pipeline**

1. Go to "Pipelines" → "Pipelines"
2. Find your pipeline (should be named "Kloudvin" or similar)
3. Click "Edit"
4. Click the three dots (⋮) → "Triggers"
5. Go to "Variables" tab
6. Click "Variable groups"
7. Click "Link variable group"
8. Select `Kloudvin-deploy`
9. Click "Link"
10. Click "Save"

### Step 2: Configure Database Connection in Static Web App

**2.1 Add Database Connection String**

1. Go to Azure Portal
2. Navigate to: Static Web App `Kloudvin`
3. Settings → Configuration
4. Click "+ Add"
5. Add application setting:
   - **Name:** `DATABASE_CONNECTION_STRING`
   - **Value:** 
     ```
     Server=tcp:kloudvin.database.windows.net,1433;Initial Catalog=kloudvin;Persist Security Info=False;User ID=kloudvin;Password=YOUR_PASSWORD;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
     ```
   - Replace `YOUR_PASSWORD` with your actual SQL password
6. Click "OK"
7. Click "Save"

**2.2 Verify Database Firewall Rules**

1. Go to: SQL Server `kloudvin`
2. Security → Networking
3. Ensure these are enabled:
   - ✅ "Allow Azure services and resources to access this server"
   - ✅ Your client IP is added (for management)
4. Click "Save"

### Step 3: Configure Storage Account

**3.1 Verify Container Access**

1. Go to: Storage Account `Kloudvin`
2. Data storage → Containers
3. Click on `Images` container
4. Click "Change access level"
5. Set to: "Blob (anonymous read access for blobs only)"
6. Click "OK"

**3.2 Configure CORS**

1. Storage Account → Settings → Resource sharing (CORS)
2. Blob service tab
3. Add rule:
   - **Allowed origins:** `https://kloudvin.com,https://*.azurestaticapps.net`
   - **Allowed methods:** GET, POST, PUT, OPTIONS
   - **Allowed headers:** `*`
   - **Exposed headers:** `*`
   - **Max age:** `3600`
4. Click "Save"

### Step 4: Configure Function App

**4.1 Verify Function App Settings**

1. Go to: Function App `kloudvin-functions`
2. Settings → Configuration
3. Verify these application settings exist:
   - `AzureWebJobsStorage` (should be auto-configured)
   - `STORAGE_CONNECTION_STRING` (should point to Kloudvin storage)
4. If missing, add them from Storage Account → Access keys

**4.2 Configure CORS**

1. Function App → API → CORS
2. Add allowed origins:
   - `https://kloudvin.com`
   - `https://*.azurestaticapps.net`
   - `http://localhost:5000` (for local testing)
3. Click "Save"

### Step 5: Push Code to Repository

**5.1 Commit and Push**

```bash
# Navigate to your project
cd kloudvin

# Check status
git status

# Add all files
git add .

# Commit
git commit -m "Production deployment ready"

# Push to Azure DevOps
git push origin main
```

**5.2 Monitor Pipeline**

1. Go to Azure DevOps: Pipelines → Pipelines
2. You should see a new run starting automatically
3. Click on the run to watch progress
4. Pipeline stages:
   - ✅ Build & Deploy
   - ✅ Verify Deployment

**5.3 Check Pipeline Logs**

If deployment fails:
1. Click on the failed stage
2. Read the error messages
3. Common issues:
   - Missing DEPLOYMENT_TOKEN
   - Token not marked as secret
   - Wrong app_location in pipeline

### Step 6: Verify Deployment

**6.1 Access Your Site**

1. Open browser
2. Go to: https://kloudvin.com
3. You should see your homepage

**6.2 Test Core Features**

**Homepage:**
- [ ] Page loads correctly
- [ ] Topic cards display
- [ ] Featured articles load
- [ ] Navigation works

**Blog Page:**
- [ ] Articles load from database
- [ ] Category filters work
- [ ] Can click to view article

**Login:**
- [ ] Login modal opens
- [ ] Can login (if you have a user)
- [ ] Badge shows username

**Admin Features (if logged in as admin):**
- [ ] "New Article" button appears
- [ ] Can open article editor
- [ ] Can upload images
- [ ] Can publish articles
- [ ] Site Settings opens

### Step 7: Create Initial Admin User

**Option A: Using SQL Query**

1. Go to Azure Portal → SQL Database `kloudvin`
2. Query editor
3. Login with SQL credentials
4. Run this query:

```sql
INSERT INTO Users (username, email, password_hash, is_admin, role, phone, created_at)
VALUES (
  'admin',
  'admin@kloudvin.com',
  'your-secure-password',  -- Change this!
  1,
  'Administrator',
  '+91 9900069073',
  GETDATE()
);
```

**Option B: Using Browser Console**

1. Open your site: https://kloudvin.com
2. Press F12 to open console
3. Run this script:

```javascript
fetch('/data-api/rest/User', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    email: 'admin@kloudvin.com',
    password_hash: 'your-secure-password',  // Change this!
    is_admin: true,
    role: 'Administrator',
    phone: '+91 9900069073'
  })
}).then(r => r.json()).then(console.log);
```

### Step 8: Configure EmailJS

**8.1 Login to Site**

1. Go to https://kloudvin.com
2. Click login button
3. Login with admin credentials

**8.2 Configure EmailJS**

1. Click gear icon (⚙️) - Site Settings
2. Go to "EmailJS" tab
3. Enter your credentials:
   - **Service ID:** `service_a77xl0o`
   - **Template ID (OTP):** `template_hjp6pqq`
   - **Template ID (Welcome):** `template_fcr2nyl`
   - **Public Key:** `d8N6hPb8vYE1MfFFH`
4. Click "Save EmailJS Config"
5. Click "Test Email" to verify

### Step 9: Test Complete Workflow

**9.1 Create Test Article**

1. Click "New Article" button
2. Fill in:
   - Title: "Test Article"
   - Description: "Testing the deployment"
   - Category: Select any
3. Write some content in Markdown
4. Click "Preview" to check
5. Click "Publish Article"
6. Go to Blog page
7. Verify article appears

**9.2 Test Image Upload**

1. Create new article
2. Click 📷 (camera) icon
3. Select an image
4. Wait for upload
5. Verify image URL is inserted
6. Publish article
7. View article and verify image displays

**9.3 Test DOCX Upload**

1. Create new article
2. Click "Upload" tab
3. Select a .docx file
4. Click "Convert & Load"
5. Verify content is converted
6. Check images are extracted
7. Publish article

**9.4 Test Password Reset**

1. Logout
2. Click "Forgot Password?"
3. Enter username
4. Click "Send Code via Email"
5. Check email for OTP
6. Enter OTP and new password
7. Login with new password

---

## 🔧 Troubleshooting

### Pipeline Fails

**Error: "DEPLOYMENT_TOKEN is EMPTY"**
- Solution: Go to Pipelines → Library → Kloudvin-deploy
- Delete and re-add DEPLOYMENT_TOKEN
- Make sure to click 🔒 lock icon
- Copy fresh token from Azure Portal

**Error: "Could not find app_location"**
- Solution: Check azure-pipelines.yml
- Verify `app_location: '/'` is correct
- Your files should be in root of repo

**Error: "Authentication failed"**
- Solution: Get new deployment token from Azure Portal
- Update in variable group
- Re-run pipeline

### Site Not Loading

**Error: "This site can't be reached"**
- Check DNS propagation (can take up to 48 hours)
- Verify custom domain is configured in Static Web App
- Try default URL: `https://[your-app].azurestaticapps.net`

**Error: "404 Not Found"**
- Check deployment completed successfully
- Verify files are in correct location
- Check staticwebapp.config.json is present

### Database Connection Errors

**Error: "Cannot connect to database"**
- Verify connection string in Static Web App configuration
- Check firewall rules allow Azure services
- Verify database is online
- Test connection from Azure Portal Query Editor

**Error: "403 Forbidden" on Data API**
- Check staticwebapp.database.config.json
- Verify entity permissions
- Check REST endpoint configuration

### Images Not Uploading

**Error: "Failed to upload image"**
- Verify Function App is running
- Check CORS settings on Function App
- Verify storage connection string
- Check container exists and is public

**Error: "CORS error"**
- Add your domain to Function App CORS
- Add your domain to Storage Account CORS
- Clear browser cache

### DOCX Conversion Failing

**Error: "Conversion failed"**
- Check file size < 10MB
- Verify file is .docx format (not .doc)
- Check Function App logs for errors
- Verify Function App has enough memory

---

## 📊 Monitoring

### Azure Portal

**Static Web App:**
- Overview → Metrics
- Monitor → Logs
- Check deployment history

**Function App:**
- Monitor → Logs
- Monitor → Metrics
- Check function executions

**SQL Database:**
- Monitoring → Metrics
- Query Performance Insight
- Check active connections

### Azure DevOps

**Pipeline:**
- View run history
- Check success/failure rate
- Review logs for errors

**Repository:**
- Check commit history
- Review pull requests
- Monitor branch policies

---

## 💰 Cost Monitoring

### Set Up Cost Alerts

1. Go to Azure Portal
2. Cost Management + Billing
3. Cost alerts
4. Create alert:
   - Threshold: $50/month (adjust as needed)
   - Email: Your email
5. Save

### Expected Monthly Costs

- Static Web App: $0 (Free tier) or $9 (Standard)
- SQL Database: $5-30 (depending on tier)
- Storage Account: $1-5
- Function App: $0-1 (Consumption plan)
- **Total:** $10-50/month

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Site loads at https://kloudvin.com
- [ ] Homepage displays correctly
- [ ] Blog page shows articles
- [ ] Can login as admin
- [ ] Can create new article
- [ ] Can upload images
- [ ] Can upload DOCX files
- [ ] Can publish articles
- [ ] Articles appear on blog
- [ ] Password reset works
- [ ] EmailJS sends emails
- [ ] Site Settings works
- [ ] Category management works
- [ ] User management works (admin only)

---

## 📚 Next Steps

1. **Create Content:**
   - Login as admin
   - Create your first real article
   - Add images and formatting
   - Publish and share

2. **Invite Users:**
   - Create editor accounts
   - Share login credentials
   - Train on article creation

3. **Monitor Performance:**
   - Check Azure metrics
   - Review error logs
   - Optimize as needed

4. **Backup:**
   - Configure database backups
   - Export important articles
   - Document configuration

5. **SEO:**
   - Submit sitemap to Google
   - Add meta descriptions
   - Optimize images

---

## 📞 Support

**Documentation:**
- [Article Creation Guide](ARTICLE-CREATION-GUIDE.md)
- [Deployment Guide](DEPLOYMENT-GUIDE.md)
- [Database Setup](DATABASE-SETUP.md)

**Azure Resources:**
- Azure Portal: https://portal.azure.com
- Azure DevOps: https://dev.azure.com/teknohutproject
- Azure Documentation: https://docs.microsoft.com/azure

**Need Help?**
- Check browser console (F12) for errors
- Review Azure Portal logs
- Check pipeline logs in Azure DevOps
- Review this documentation

---

**Ready to Deploy?**

1. ✅ Configure variable group in Azure DevOps
2. ✅ Configure database connection string
3. ✅ Push code to repository
4. ✅ Monitor pipeline execution
5. ✅ Test your site
6. ✅ Create admin user
7. ✅ Configure EmailJS
8. ✅ Start creating content!

**Good luck! 🚀**

---

**Last Updated:** February 2026  
**Version:** 1.0
