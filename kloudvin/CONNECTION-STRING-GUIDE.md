# Azure SQL Connection String Guide

## Which Connection String Format to Use?

Azure Portal shows **5 different formats** for connection strings. Here's which one to use:

```
Azure Portal → SQL Database → Connection strings
┌─────────────────────────────────────────────────┐
│ Tabs Available:                                  │
│                                                   │
│ ✅ ADO.NET    ← USE THIS ONE!                   │
│ ❌ JDBC       ← For Java apps                   │
│ ❌ ODBC       ← For ODBC drivers                │
│ ❌ PHP        ← For PHP apps                    │
│ ❌ Go         ← For Go apps                     │
└─────────────────────────────────────────────────┘
```

## Why ADO.NET?

Azure Static Web Apps Database Connections uses **Data API Builder**, which is a .NET-based tool. It requires the **ADO.NET** connection string format.

## How to Get the Correct Connection String

### Method 1: Azure Portal (Recommended)

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **SQL databases**
3. Click on your database (e.g., `kloudvin`)
4. In the left menu, click **Connection strings**
5. **Click the ADO.NET tab** at the top
6. Click **Copy** button
7. Replace `<username>` with your actual username
8. Replace `<password>` with your actual password

### Method 2: Azure CLI

```bash
# Get ADO.NET connection string
az sql db show-connection-string \
  --server YOUR-SERVER-NAME \
  --name kloudvin \
  --client ado.net

# Output will be:
# Server=tcp:YOUR-SERVER.database.windows.net,1433;Initial Catalog=kloudvin;...
```

## Connection String Format Comparison

### ✅ ADO.NET (Correct for this project)

```
Server=tcp:kloudvin-sql-123.database.windows.net,1433;Initial Catalog=kloudvin;Persist Security Info=False;User ID=sqladmin;Password=YourPass123!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

**Key characteristics:**
- Starts with `Server=tcp:`
- Uses `Initial Catalog=` for database name
- Includes `Persist Security Info=False`
- Includes `MultipleActiveResultSets=False`
- Includes `Encrypt=True`
- Includes `TrustServerCertificate=False`

### ❌ JDBC (Wrong - Don't use)

```
jdbc:sqlserver://kloudvin-sql-123.database.windows.net:1433;database=kloudvin;user=sqladmin@kloudvin-sql-123;password={your_password_here};encrypt=true;trustServerCertificate=false;
```

### ❌ ODBC (Wrong - Don't use)

```
Driver={ODBC Driver 17 for SQL Server};Server=tcp:kloudvin-sql-123.database.windows.net,1433;Database=kloudvin;Uid=sqladmin;Pwd={your_password_here};Encrypt=yes;TrustServerCertificate=no;
```

### ❌ PHP (Wrong - Don't use)

```
Server: kloudvin-sql-123.database.windows.net,1433
SQL Database: kloudvin
User Name: sqladmin
Password: {your_password_here}
```

### ❌ Go (Wrong - Don't use)

```
server=kloudvin-sql-123.database.windows.net;port=1433;database=kloudvin;user id=sqladmin;password={your_password_here};encrypt=true
```

## Common Mistakes

### Mistake 1: Using the wrong format

```env
❌ WRONG:
DATABASE_CONNECTION_STRING="jdbc:sqlserver://server.database.windows.net..."

✅ CORRECT:
DATABASE_CONNECTION_STRING="Server=tcp:server.database.windows.net,1433;Initial Catalog=..."
```

### Mistake 2: Forgetting to replace placeholders

```env
❌ WRONG:
DATABASE_CONNECTION_STRING="...User ID=<username>;Password=<password>;..."

✅ CORRECT:
DATABASE_CONNECTION_STRING="...User ID=sqladmin;Password=YourPass123!;..."
```

### Mistake 3: Breaking the string across multiple lines

```env
❌ WRONG:
DATABASE_CONNECTION_STRING="Server=tcp:server.database.windows.net,1433;
Initial Catalog=kloudvin;
User ID=sqladmin;..."

✅ CORRECT:
DATABASE_CONNECTION_STRING="Server=tcp:server.database.windows.net,1433;Initial Catalog=kloudvin;User ID=sqladmin;..."
```

### Mistake 4: Missing quotes

```env
❌ WRONG:
DATABASE_CONNECTION_STRING=Server=tcp:server.database.windows.net...

✅ CORRECT:
DATABASE_CONNECTION_STRING="Server=tcp:server.database.windows.net..."
```

## Step-by-Step: Creating Your .env File

### Step 1: Copy the example file

```bash
cp .env.example .env
```

### Step 2: Get your connection string from Azure Portal

1. Azure Portal → SQL databases → kloudvin
2. Connection strings → **ADO.NET tab**
3. Copy the connection string

### Step 3: Edit your .env file

```bash
nano .env
# or use VS Code, vim, etc.
```

### Step 4: Paste and modify

Replace the entire line with your connection string:

```env
DATABASE_CONNECTION_STRING="Server=tcp:kloudvin-sql-1234567890.database.windows.net,1433;Initial Catalog=kloudvin;Persist Security Info=False;User ID=sqladmin;Password=YourSecurePass123!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
```

### Step 5: Verify

Check that:
- ✅ Starts with `Server=tcp:`
- ✅ Contains `Initial Catalog=kloudvin`
- ✅ Has your actual username (not `<username>`)
- ✅ Has your actual password (not `<password>`)
- ✅ All on one line
- ✅ Wrapped in quotes

## Testing Your Connection String

### Test Locally

```bash
# Start SWA CLI
npm start

# If connection string is correct, you'll see:
# ✓ Azure Static Web Apps emulator started at http://localhost:4280
# ✓ Data API location: swa-db-connections

# If connection string is wrong, you'll see errors like:
# ✗ Failed to connect to database
# ✗ Invalid connection string format
```

### Test with curl

```bash
# Try to fetch users
curl http://localhost:4280/.data-api/rest/User

# Success response:
# {"value":[...]}

# Error response:
# {"error":"Database connection failed"}
```

## Troubleshooting

### Error: "Invalid connection string format"

**Cause**: Using wrong format (JDBC, ODBC, PHP, or Go instead of ADO.NET)

**Solution**: Get the ADO.NET connection string from Azure Portal

### Error: "Login failed for user"

**Cause**: Wrong username or password in connection string

**Solution**: 
1. Check Azure Portal → SQL Server → Properties for correct admin username
2. Verify password is correct
3. Ensure you replaced `<username>` and `<password>` placeholders

### Error: "Cannot open server"

**Cause**: Firewall rules not configured

**Solution**:
```bash
# Add your IP to firewall
az sql server firewall-rule create \
  --resource-group kloudvin-rg \
  --server YOUR-SERVER \
  --name MyIP \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP

# Allow Azure services
az sql server firewall-rule create \
  --resource-group kloudvin-rg \
  --server YOUR-SERVER \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### Error: "Database 'kloudvin' does not exist"

**Cause**: Database name in connection string doesn't match actual database

**Solution**: Verify database name in Azure Portal and update connection string

## Production Configuration

When deploying to Azure Static Web Apps:

1. Go to Azure Portal → Your Static Web App
2. Configuration → Application settings
3. Add new setting:
   - **Name**: `DATABASE_CONNECTION_STRING`
   - **Value**: Same ADO.NET connection string from your .env file
4. Save

**Important**: Use the exact same connection string format (ADO.NET) in production!

## Security Best Practices

### ✅ Do:
- Use strong passwords
- Store connection string in .env (not in code)
- Add .env to .gitignore
- Use Azure Key Vault for production
- Rotate credentials regularly

### ❌ Don't:
- Commit .env to Git
- Share connection strings in chat/email
- Use weak passwords
- Hardcode connection strings in code
- Use same password for dev and production

## Quick Reference

```
┌─────────────────────────────────────────────────────────┐
│ Connection String Checklist                              │
├─────────────────────────────────────────────────────────┤
│ ✅ Using ADO.NET format (not JDBC/ODBC/PHP/Go)          │
│ ✅ Replaced <username> with actual username             │
│ ✅ Replaced <password> with actual password             │
│ ✅ All on one line (no line breaks)                     │
│ ✅ Wrapped in quotes                                     │
│ ✅ Saved in .env file                                    │
│ ✅ .env file in .gitignore                              │
│ ✅ Firewall rules configured                            │
└─────────────────────────────────────────────────────────┘
```

## Need Help?

- Check [DATABASE-SETUP.md](./DATABASE-SETUP.md) for database setup
- Check [QUICK-START.md](./QUICK-START.md) for step-by-step guide
- Check [SETUP-EXPLAINED.md](./SETUP-EXPLAINED.md) for detailed explanation
