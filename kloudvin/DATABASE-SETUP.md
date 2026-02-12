# Azure SQL Database Setup Guide for KloudVin

This guide walks you through setting up Azure SQL Database with Static Web Apps Database Connections for persistent user and article storage.

## Prerequisites

- Azure subscription
- Azure CLI installed
- SWA CLI installed (`npm install -g @azure/static-web-apps-cli`)

## Step 1: Create Azure SQL Database

### Option A: Using Azure Portal

1. Navigate to [Azure Portal](https://portal.azure.com)
2. Create a new SQL Database:
   - Resource Group: Create new or use existing
   - Database name: `kloudvin`
   - Server: Create new server
   - Compute + storage: Basic tier is sufficient for development
3. Configure firewall rules to allow your IP and Azure services
4. Get the connection string:
   - Go to your database → **Connection strings**
   - **Select ADO.NET tab** (important!)
   - Copy the connection string
   - Replace `<username>` and `<password>` with your actual credentials

### Option B: Using Azure CLI

```bash
# Set variables
RESOURCE_GROUP="kloudvin-rg"
LOCATION="eastus"
SERVER_NAME="kloudvin-sql-server"
DATABASE_NAME="kloudvin"
ADMIN_USER="sqladmin"
ADMIN_PASSWORD="YourSecurePassword123!"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create SQL Server
az sql server create \
  --name $SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --admin-user $ADMIN_USER \
  --admin-password $ADMIN_PASSWORD

# Create database
az sql db create \
  --resource-group $RESOURCE_GROUP \
  --server $SERVER_NAME \
  --name $DATABASE_NAME \
  --service-objective Basic

# Configure firewall (allow Azure services)
az sql server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SERVER_NAME \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Add your IP
az sql server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SERVER_NAME \
  --name AllowMyIP \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP

# Get connection string (ADO.NET format - this is what you need!)
az sql db show-connection-string \
  --server $SERVER_NAME \
  --name $DATABASE_NAME \
  --client ado.net

# Note: Replace <username> with your ADMIN_USER and <password> with ADMIN_PASSWORD
```

**Important**: Azure Portal shows connection strings in multiple formats:
- ✅ **ADO.NET** - Use this one for Azure Static Web Apps!
- ❌ JDBC - For Java applications
- ❌ ODBC - For ODBC drivers
- ❌ PHP - For PHP applications  
- ❌ Go - For Go applications

The Data API Builder (used by Azure Static Web Apps Database Connections) requires the **ADO.NET format**.

## Step 2: Run Database Schema

1. Connect to your Azure SQL Database using:
   - Azure Data Studio
   - SQL Server Management Studio (SSMS)
   - Azure Portal Query Editor

2. Run the schema script:
   ```bash
   # From the project root
   # Copy the contents of swa-db-connections/schema.sql and execute it
   ```

3. Verify tables were created:
   ```sql
   SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo';
   ```

## Step 3: Configure Local Development

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your ADO.NET connection string:
   
   **Get the connection string:**
   - Azure Portal → SQL databases → kloudvin → Connection strings
   - **Select ADO.NET tab**
   - Copy the connection string
   - Replace `<username>` and `<password>` with your actual credentials

   **Example ADO.NET connection string:**
   ```
   Server=tcp:kloudvin-sql-server.database.windows.net,1433;Initial Catalog=kloudvin;Persist Security Info=False;User ID=sqladmin;Password=YourSecurePassword123!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
   ```

   **Your .env file should look like:**
   ```env
   DATABASE_CONNECTION_STRING="Server=tcp:kloudvin-sql-server.database.windows.net,1433;Initial Catalog=kloudvin;Persist Security Info=False;User ID=sqladmin;Password=YourSecurePassword123!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
   ```

3. Start the SWA CLI with database connections:
   ```bash
   swa start . --data-api-location swa-db-connections
   ```

## Step 4: Test the Database Connection

1. Open your browser to `http://localhost:4280`
2. Try logging in with the default admin credentials:
   - Username: `admin`
   - Password: `kloudvin@2026`
3. Create a new article to test database writes
4. Refresh the page - your data should persist!

## Step 5: Deploy to Azure Static Web Apps

### Create Static Web App

```bash
# Using Azure CLI
az staticwebapp create \
  --name kloudvin \
  --resource-group $RESOURCE_GROUP \
  --source https://github.com/YOUR_USERNAME/kloudvin \
  --location $LOCATION \
  --branch main \
  --app-location "/" \
  --output-location "."
```

### Configure Database Connection in Azure

1. Navigate to your Static Web App in Azure Portal
2. Go to "Configuration" → "Application settings"
3. Add the connection string:
   - Name: `DATABASE_CONNECTION_STRING`
   - Value: Your Azure SQL connection string

4. Enable Database Connections:
   - Go to "Database connection" in the left menu
   - Link your Azure SQL Database
   - The system will automatically use the config from `swa-db-connections/staticwebapp.database.config.json`

### Deploy

```bash
# If using GitHub Actions (recommended)
git add .
git commit -m "Add database integration"
git push origin main

# Or deploy directly with SWA CLI
swa deploy --env production
```

## Step 6: Verify Production Deployment

1. Navigate to your Static Web App URL
2. Test login functionality
3. Create a test article
4. Refresh the page to confirm persistence
5. Check Azure SQL Database to see the data

## Security Best Practices

### 1. Password Hashing
The current implementation stores passwords in plain text. For production, implement proper password hashing:

```javascript
// Use bcrypt or similar
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash(password, 10);
```

### 2. Connection String Security
- Never commit connection strings to source control
- Use Azure Key Vault for production secrets
- Rotate credentials regularly

### 3. Database Permissions
- Use least-privilege access
- Create separate users for different environments
- Enable Azure AD authentication

### 4. API Security
Update `staticwebapp.database.config.json` to restrict anonymous access:

```json
{
  "entities": {
    "User": {
      "permissions": [
        {
          "role": "authenticated",
          "actions": ["*"]
        }
      ]
    }
  }
}
```

## Troubleshooting

### Connection Issues
- Verify firewall rules allow your IP
- Check connection string format
- Ensure database is running

### Data API Not Working
- Verify `staticwebapp.database.config.json` is in the correct location
- Check SWA CLI is started with `--data-api-location` flag
- Review browser console for API errors

### Authentication Issues
- Clear browser cache and sessionStorage
- Verify user exists in database
- Check password matches

## Migration from localStorage

The app now uses Azure SQL Database but maintains backward compatibility with localStorage. If the database is unavailable, it will fall back to localStorage automatically.

To migrate existing localStorage data:

1. Export from browser console:
   ```javascript
   console.log(localStorage.getItem('kloudvin_articles'));
   ```

2. Use the initialization function to populate the database with default articles

## Next Steps

- Implement proper password hashing (bcrypt)
- Add user registration functionality
- Implement role-based access control (RBAC)
- Add article editing and deletion features
- Set up automated backups for Azure SQL Database
- Configure monitoring and alerts

## Support

For issues or questions:
- Check Azure SQL Database logs
- Review SWA CLI output
- Inspect browser console for errors
