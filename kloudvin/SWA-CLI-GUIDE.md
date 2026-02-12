# Azure Static Web Apps CLI Quick Reference

This guide provides quick commands for working with Azure Static Web Apps CLI and Database Connections.

## Installation

```bash
# Install globally
npm install -g @azure/static-web-apps-cli

# Verify installation
swa --version
```

## Local Development

### Start with Database Connections

```bash
# Start SWA with Data API
swa start . --data-api-location swa-db-connections

# Start with custom port
swa start . --port 4280 --data-api-location swa-db-connections

# Start with environment file
swa start . --data-api-location swa-db-connections --env-file .env
```

### Start without Database (Static Only)

```bash
# Basic start
swa start .

# With custom port
swa start . --port 8080
```

## Environment Variables

### Create .env file

```bash
# Copy example
cp .env.example .env

# Edit with your values
nano .env
```

### .env Format

```env
DATABASE_CONNECTION_STRING="Server=tcp:your-server.database.windows.net,1433;Database=kloudvin;User ID=admin;Password=password;Encrypt=true;Connection Timeout=30;"
```

## Database Configuration

### Config File Location

```
swa-db-connections/
└── staticwebapp.database.config.json
```

### Validate Configuration

```bash
# Check if config is valid
cat swa-db-connections/staticwebapp.database.config.json | jq .
```

## Testing Data API Endpoints

### Using curl

```bash
# List all users
curl http://localhost:4280/.data-api/rest/User

# Get specific user
curl "http://localhost:4280/.data-api/rest/User?$filter=username eq 'admin'"

# Create user (POST)
curl -X POST http://localhost:4280/.data-api/rest/User \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password_hash": "password123"
  }'

# List all articles
curl http://localhost:4280/.data-api/rest/Article

# Get specific article
curl http://localhost:4280/.data-api/rest/Article/id/multi-cloud-strategy

# Create article (POST)
curl -X POST http://localhost:4280/.data-api/rest/Article \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-article",
    "title": "Test Article",
    "description": "A test article",
    "content": "## Test Content",
    "category": "Cloud",
    "read_time": "5 min read",
    "tags": "test,demo",
    "date_published": "Feb 12, 2026"
  }'

# Update article (PATCH)
curl -X PATCH http://localhost:4280/.data-api/rest/Article/id/test-article \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Test Article"
  }'

# Delete article (DELETE)
curl -X DELETE http://localhost:4280/.data-api/rest/Article/id/test-article
```

### Using Browser DevTools

```javascript
// In browser console

// Get all users
fetch('/.data-api/rest/User')
  .then(r => r.json())
  .then(console.log);

// Get user by username
fetch("/.data-api/rest/User?$filter=username eq 'admin'")
  .then(r => r.json())
  .then(console.log);

// Create article
fetch('/.data-api/rest/Article', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'test-article',
    title: 'Test Article',
    description: 'Test description',
    content: '## Test',
    category: 'Cloud',
    read_time: '5 min read',
    tags: 'test',
    date_published: 'Feb 12, 2026'
  })
})
.then(r => r.json())
.then(console.log);
```

## Deployment

### Deploy to Azure

```bash
# Login to Azure
az login

# Deploy with SWA CLI
swa deploy --env production

# Deploy with specific deployment token
swa deploy --deployment-token YOUR_TOKEN
```

### Build and Deploy

```bash
# If you have a build step
npm run build
swa deploy --env production
```

## Configuration Management

### View Current Config

```bash
# Show SWA config
cat staticwebapp.config.json

# Show database config
cat swa-db-connections/staticwebapp.database.config.json
```

### Update Database Config

```bash
# Edit the config file
nano swa-db-connections/staticwebapp.database.config.json

# Restart SWA CLI to apply changes
# Press Ctrl+C to stop, then restart
swa start . --data-api-location swa-db-connections
```

## Troubleshooting

### Check Logs

```bash
# SWA CLI shows logs in terminal
# Look for errors related to:
# - Database connection
# - Data API initialization
# - HTTP requests
```

### Common Issues

#### Database Connection Failed

```bash
# Verify connection string
echo $DATABASE_CONNECTION_STRING

# Test connection with Azure CLI
az sql db show-connection-string \
  --server your-server \
  --name kloudvin \
  --client ado.net
```

#### Data API Not Found (404)

```bash
# Ensure you started with --data-api-location flag
swa start . --data-api-location swa-db-connections

# Verify config file exists
ls -la swa-db-connections/staticwebapp.database.config.json
```

#### CORS Issues

```bash
# Check CORS settings in staticwebapp.database.config.json
# Ensure origins include your development URL
```

### Clear Cache

```bash
# Clear browser cache
# In Chrome: Ctrl+Shift+Delete

# Clear sessionStorage
# In browser console:
sessionStorage.clear();
localStorage.clear();
```

## OData Query Syntax

The Data API supports OData query parameters:

### Filter

```bash
# Equal
$filter=category eq 'Cloud'

# Not equal
$filter=category ne 'Cloud'

# Greater than
$filter=id gt 100

# Contains (use functions)
$filter=contains(title, 'Kubernetes')

# Multiple conditions
$filter=category eq 'Cloud' and read_time eq '8 min read'
```

### Order By

```bash
# Ascending
$orderby=created_at

# Descending
$orderby=created_at desc

# Multiple fields
$orderby=category,created_at desc
```

### Select

```bash
# Specific fields
$select=id,title,category

# Multiple fields
$select=id,title,description,date_published
```

### Top and Skip (Pagination)

```bash
# Get first 10
$top=10

# Skip first 10, get next 10
$skip=10&$top=10

# Page 3 (items 21-30)
$skip=20&$top=10
```

### Combined Example

```bash
curl "http://localhost:4280/.data-api/rest/Article?\$filter=category eq 'Cloud'&\$orderby=created_at desc&\$top=5&\$select=id,title,date_published"
```

## Azure Portal Configuration

### Add Connection String

1. Navigate to your Static Web App in Azure Portal
2. Go to **Configuration** → **Application settings**
3. Click **+ Add**
4. Name: `DATABASE_CONNECTION_STRING`
5. Value: Your connection string
6. Click **OK** and **Save**

### Link Database Connection

1. Go to **Database connection** in left menu
2. Click **Link existing database**
3. Select your Azure SQL Database
4. The config from `swa-db-connections/` will be used automatically

## Useful Commands

```bash
# Check SWA CLI version
swa --version

# Get help
swa --help
swa start --help
swa deploy --help

# Initialize new SWA project
swa init

# Login to Azure
swa login

# List available commands
swa
```

## Development Workflow

```bash
# 1. Start development server
swa start . --data-api-location swa-db-connections

# 2. Make changes to code

# 3. Test in browser (auto-reload)
# http://localhost:4280

# 4. Test API endpoints
curl http://localhost:4280/.data-api/rest/Article

# 5. Commit changes
git add .
git commit -m "Your changes"

# 6. Push to trigger deployment
git push origin main
```

## Resources

- [SWA CLI Documentation](https://azure.github.io/static-web-apps-cli/)
- [Data API Builder Docs](https://learn.microsoft.com/azure/data-api-builder/)
- [OData Query Syntax](https://www.odata.org/getting-started/basic-tutorial/)
- [Azure Static Web Apps Docs](https://learn.microsoft.com/azure/static-web-apps/)
