# Local Development Setup

Guide to run KloudVin locally for development and testing.

---

## Prerequisites

- Node.js 18+ installed
- Azure SQL Database access
- Git installed

---

## Quick Setup

### 1. Install Azure Static Web Apps CLI

```bash
npm install -g @azure/static-web-apps-cli
```

### 2. Configure Environment Variables

**Create `.env` file:**

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your values
nano .env  # or use any text editor
```

**Fill in your values:**

```env
DATABASE_CONNECTION_STRING="Server=tcp:kloudvin.database.windows.net,1433;Initial Catalog=kloudvin;Persist Security Info=False;User ID=kloudvin;Password=YOUR_ACTUAL_PASSWORD;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
```

**Get your SQL password:**
- You set this when creating the SQL Server
- Or reset it in Azure Portal → SQL Server → Settings → Reset password

### 3. Configure Database Firewall

**Add your local IP to SQL Server firewall:**

1. Go to Azure Portal
2. Navigate to: SQL Server `kloudvin`
3. Settings → Networking
4. Click "Add client IP"
5. Your current IP will be added automatically
6. Click "Save"

### 4. Start Local Development Server

```bash
# Navigate to project directory
cd kloudvin

# Start the development server
swa start . --data-api-location ./swa-db-connections
```

**Alternative (if above doesn't work):**

```bash
# Start with specific port
swa start . --port 4280 --data-api-location ./swa-db-connections
```

### 5. Access Your Site

Open browser and go to:
```
http://localhost:4280
```

---

## Troubleshooting

### Error: "DATABASE_CONNECTION_STRING not found"

**Solution:**
1. Make sure `.env` file exists in `kloudvin/` folder
2. Check the connection string is correct
3. Restart the SWA CLI

### Error: "Cannot connect to database"

**Solution 1: Check Firewall**
```bash
# Test connection from command line
sqlcmd -S kloudvin.database.windows.net -d kloudvin -U kloudvin -P YOUR_PASSWORD
```

If this fails, add your IP to firewall rules.

**Solution 2: Verify Connection String**
- Check server name: `kloudvin.database.windows.net`
- Check database name: `kloudvin`
- Check username: `kloudvin`
- Check password is correct

### Error: "500 Internal Server Error" on Data API

**Solution:**
1. Check `.env` file has correct connection string
2. Verify database is online in Azure Portal
3. Check firewall rules allow your IP
4. Restart SWA CLI

### Error: "swa: command not found"

**Solution:**
```bash
# Install globally
npm install -g @azure/static-web-apps-cli

# Or use npx
npx @azure/static-web-apps-cli start . --data-api-location ./swa-db-connections
```

---

## Alternative: Use Azure Portal Query Editor

If you can't run locally, you can still test database queries:

1. Go to Azure Portal
2. Navigate to: SQL Database `kloudvin`
3. Click "Query editor"
4. Login with SQL credentials
5. Run queries directly

**Example queries:**

```sql
-- Check users
SELECT * FROM Users;

-- Check articles
SELECT * FROM Articles;

-- Create admin user
INSERT INTO Users (username, email, password_hash, is_admin, role, phone, created_at)
VALUES ('admin', 'admin@kloudvin.com', 'n0n3w0rld', 1, 'Administrator', '+91 9900069073', GETDATE());
```

---

## Testing Without Local Setup

### Option 1: Deploy to Azure First

1. Follow [FINAL-DEPLOYMENT-STEPS.md](FINAL-DEPLOYMENT-STEPS.md)
2. Deploy to Azure Static Web Apps
3. Test on the live site
4. Make changes and redeploy

### Option 2: Use Cleanup Tool Directly

The cleanup tool (`cleanup-unused-images.html`) can work on the deployed site:

1. Deploy your site to Azure
2. Access: `https://kloudvin.com/cleanup-unused-images.html`
3. Login as admin
4. Run the analysis

---

## Development Workflow

### Making Changes

1. **Edit files locally**
   ```bash
   # Edit HTML, CSS, JS files
   code .
   ```

2. **Test locally**
   ```bash
   # Start dev server
   swa start . --data-api-location ./swa-db-connections
   
   # Open http://localhost:4280
   ```

3. **Commit changes**
   ```bash
   git add .
   git commit -m "Your changes"
   ```

4. **Push to deploy**
   ```bash
   git push origin main
   # Azure DevOps pipeline deploys automatically
   ```

### Hot Reload

The SWA CLI supports hot reload:
- Edit HTML/CSS/JS files
- Save the file
- Browser refreshes automatically
- No need to restart server

---

## Database Management

### View Data

```sql
-- List all users
SELECT id, username, email, role, is_admin, created_at 
FROM Users 
ORDER BY created_at DESC;

-- List all articles
SELECT id, title, category, date_published, author_id
FROM Articles
ORDER BY date_published DESC;
```

### Create Test Data

```sql
-- Create test user
INSERT INTO Users (username, email, password_hash, is_admin, role, phone, created_at)
VALUES ('testuser', 'test@example.com', 'testpass', 0, 'Editor', '+1234567890', GETDATE());

-- Create test article
INSERT INTO Articles (title, description, content, category, date_published, created_at, author_id)
VALUES (
  'Test Article',
  'This is a test article',
  '# Test Article\n\nThis is test content.',
  'Cloud',
  GETDATE(),
  GETDATE(),
  1
);
```

### Reset Data

```sql
-- Delete all articles (careful!)
DELETE FROM Articles;

-- Delete all users except admin
DELETE FROM Users WHERE username != 'admin';

-- Reset identity columns
DBCC CHECKIDENT ('Articles', RESEED, 0);
DBCC CHECKIDENT ('Users', RESEED, 1);
```

---

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_CONNECTION_STRING` | Azure SQL connection string | Yes |
| `AZURE_STORAGE_CONNECTION_STRING` | Storage account for images | No* |
| `EMAILJS_SERVICE_ID` | EmailJS service ID | No* |
| `EMAILJS_TEMPLATE_OTP` | EmailJS OTP template | No* |
| `EMAILJS_TEMPLATE_WELCOME` | EmailJS welcome template | No* |
| `EMAILJS_PUBLIC_KEY` | EmailJS public key | No* |

*Can be configured in the UI after deployment

---

## Common Commands

```bash
# Start development server
swa start . --data-api-location ./swa-db-connections

# Start with specific port
swa start . --port 4280 --data-api-location ./swa-db-connections

# Start with verbose logging
swa start . --data-api-location ./swa-db-connections --verbose

# Build for production (not needed for SWA)
# SWA serves files directly

# Test database connection
sqlcmd -S kloudvin.database.windows.net -d kloudvin -U kloudvin -P YOUR_PASSWORD -Q "SELECT @@VERSION"
```

---

## Tips

1. **Use VS Code**
   - Install "Azure Static Web Apps" extension
   - Install "SQL Server (mssql)" extension
   - Better debugging and IntelliSense

2. **Keep .env Secure**
   - Never commit `.env` to Git
   - It's already in `.gitignore`
   - Use `.env.example` for documentation

3. **Test Before Deploying**
   - Always test locally first
   - Check browser console for errors
   - Verify database queries work

4. **Use Browser DevTools**
   - Press F12 to open DevTools
   - Check Console for errors
   - Check Network tab for API calls
   - Use Application tab to view localStorage

---

## Next Steps

1. ✅ Set up local environment
2. ✅ Test database connection
3. ✅ Create admin user
4. ✅ Test core features
5. ✅ Make changes
6. ✅ Deploy to Azure

---

**Need Help?**
- Check [FINAL-DEPLOYMENT-STEPS.md](FINAL-DEPLOYMENT-STEPS.md) for deployment
- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues
- Review Azure Portal logs for errors

---

**Last Updated:** February 2026  
**Version:** 1.0
