# KloudVin Setup Explained Simply

This guide explains **where everything runs** and **what you need to do where**.

## The Big Picture

You're building a website that needs to remember data (user accounts, blog articles). To do this, you need:

1. **A database** (to store data) → Lives on **Azure Cloud**
2. **Your website code** (HTML/CSS/JS) → Starts on **your computer**, then moves to **Azure Cloud**
3. **A connection** between them → Configured in **both places**

## Phase 1: Local Development (Your Computer)

**Goal**: Get the website running on your computer so you can test it before making it public.

### What Runs Where?

| Component | Location | Purpose |
|-----------|----------|---------|
| Azure SQL Database | ☁️ Azure Cloud | Stores all your data permanently |
| Your code files | 💻 Your Computer | The website files (HTML/JS/CSS) |
| SWA CLI Server | 💻 Your Computer | Runs a local web server (like a mini Azure) |
| Your browser | 💻 Your Computer | Where you view and test the site |

### The Flow

```
You type: npm start
    ↓
SWA CLI starts a local server on your computer (localhost:4280)
    ↓
You open browser → http://localhost:4280
    ↓
Website loads from your local files
    ↓
When you login or create articles...
    ↓
Data is sent to Azure SQL Database (in the cloud)
    ↓
Data is stored permanently in Azure
```

### Step-by-Step: What You Do

#### Step 1-2: Create Azure SQL Database
**Where**: Azure Portal (website)  
**What**: Create a database in Microsoft's cloud  
**Why**: This is where all data will be stored permanently  
**Result**: You get a "connection string" (like a phone number to reach your database)

#### Step 3: Run Database Schema
**Where**: Azure Portal → Query Editor  
**What**: Copy/paste SQL code to create tables  
**Why**: The database needs structure (like creating folders before saving files)  
**Result**: Database now has Users and Articles tables

#### Step 4: Create .env File
**Where**: Your computer (in the kloudvin folder)  
**What**: Create a file named `.env` with your connection string  
**Why**: Tells your local server how to connect to Azure database  
**Result**: Local server can now talk to Azure database

```
Your Computer                    Azure Cloud
┌─────────────┐                 ┌─────────────┐
│  .env file  │                 │  SQL Server │
│             │                 │             │
│ Connection  │ ─── points ───► │ kloudvin-   │
│ String      │      to         │ sql-123.    │
│             │                 │ database... │
└─────────────┘                 └─────────────┘
```

#### Step 5: Start Local Server
**Where**: Your computer (terminal/command prompt)  
**What**: Run `npm start`  
**Why**: Starts a local web server that can connect to Azure  
**Result**: Website available at http://localhost:4280

```
Terminal shows:
✓ Azure Static Web Apps emulator started at http://localhost:4280
✓ Data API location: swa-db-connections
```

#### Step 6: Test It
**Where**: Your browser (http://localhost:4280)  
**What**: Login, create articles, refresh page  
**Why**: Verify everything works before deploying  
**Result**: Articles persist after refresh (stored in Azure!)

## Phase 2: Production Deployment (Azure Cloud)

**Goal**: Make your website public so anyone on the internet can access it.

### What Changes?

| Before (Development) | After (Production) |
|---------------------|-------------------|
| Code on your computer | Code on Azure Static Web Apps |
| Access via localhost:4280 | Access via https://yoursite.azurestaticapps.net |
| Only you can access | Anyone on internet can access |
| Database still on Azure | Database still on Azure (same one!) |

### The Flow

```
You run: git push origin main
    ↓
GitHub receives your code
    ↓
GitHub Actions automatically deploys to Azure
    ↓
Azure Static Web Apps hosts your website
    ↓
Users visit your public URL
    ↓
Website connects to same Azure SQL Database
```

### Step-by-Step: What You Do

#### Step 1: Create Static Web App
**Where**: Azure Portal or Azure CLI  
**What**: Create hosting space for your website  
**Why**: Need somewhere to host the public website  
**Result**: You get a public URL like https://kloudvin-abc123.azurestaticapps.net

#### Step 2: Configure Database Connection
**Where**: Azure Portal → Static Web App → Configuration  
**What**: Add the same connection string from your .env file  
**Why**: Production site needs to know how to reach the database  
**Result**: Public website can now connect to database

```
Azure Static Web App              Azure SQL Database
┌─────────────────┐              ┌─────────────┐
│ Your Website    │              │ Your Data   │
│ (public)        │              │             │
│                 │              │             │
│ Configuration:  │ ─ connects ─►│ Same DB as  │
│ CONNECTION_     │      to      │ development │
│ STRING          │              │             │
└─────────────────┘              └─────────────┘
```

#### Step 3: Deploy Code
**Where**: Your computer (terminal)  
**What**: Push code to GitHub  
**Why**: Triggers automatic deployment to Azure  
**Result**: Website is live and public!

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

#### Step 4: Test Production
**Where**: Any browser, anywhere  
**What**: Visit your public URL  
**Why**: Verify everything works in production  
**Result**: Website is live with persistent data!

## Common Questions

### Q: Do I need to run the database on my computer?
**A**: No! The database always runs on Azure (in the cloud). You never download or run it locally.

### Q: What's the difference between local and production?
**A**: 
- **Local**: Website runs on your computer (localhost), only you can access it
- **Production**: Website runs on Azure, anyone can access it
- **Database**: Same Azure database in both cases!

### Q: Why do I need .env locally but configure it in Azure Portal for production?
**A**: 
- `.env` file tells your **local** SWA CLI how to connect
- Azure Portal configuration tells your **production** Static Web App how to connect
- Same connection string, different locations

### Q: Can I skip local development and go straight to production?
**A**: You could, but it's not recommended. Local development lets you test changes safely before making them public.

### Q: What if I make changes to my code?
**A**: 
- **Local**: Changes appear immediately (just refresh browser)
- **Production**: Need to push to GitHub to trigger redeployment

### Q: What if I change the database?
**A**: Changes to the database affect both local and production immediately (same database!)

## Visual Summary

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR WORKFLOW                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Create Azure SQL Database (once)                         │
│     ↓                                                         │
│  2. Configure .env locally (once)                            │
│     ↓                                                         │
│  3. Run npm start (every time you develop)                   │
│     ↓                                                         │
│  4. Test at localhost:4280                                   │
│     ↓                                                         │
│  5. When ready, deploy to Azure (once)                       │
│     ↓                                                         │
│  6. Configure connection in Azure Portal (once)              │
│     ↓                                                         │
│  7. Push code to GitHub (every time you update)              │
│     ↓                                                         │
│  8. Website automatically updates                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## File Locations Reference

### On Your Computer
```
kloudvin/
├── .env                          ← You create this (connection string)
├── .env.example                  ← Template provided
├── js/
│   ├── app.js                    ← Your code
│   ├── db.js                     ← Database functions
│   └── migrate.js                ← Migration utilities
├── swa-db-connections/
│   ├── staticwebapp.database.config.json  ← Database config
│   └── schema.sql                ← Database structure
└── package.json                  ← npm scripts
```

### On Azure Cloud
```
Azure Resources:
├── Resource Group (kloudvin-rg)
│   ├── SQL Server (kloudvin-sql-123)
│   │   └── Database (kloudvin)
│   │       ├── Users table
│   │       └── Articles table
│   └── Static Web App (kloudvin)
│       ├── Your website files (deployed from GitHub)
│       └── Configuration
│           └── DATABASE_CONNECTION_STRING
```

## Next Steps

1. Follow [QUICK-START.md](./QUICK-START.md) for detailed commands
2. Use [DATABASE-SETUP.md](./DATABASE-SETUP.md) for database help
3. Check [SWA-CLI-GUIDE.md](./SWA-CLI-GUIDE.md) for CLI reference

## Still Confused?

Think of it like this:

- **Azure SQL Database** = Your storage unit (always in the cloud)
- **Local Development** = Working on your laptop, but saving files to cloud storage
- **Production** = Your finished website on the internet, also saving to same cloud storage
- **.env file** = The key to your storage unit (for local use)
- **Azure Portal Config** = The key to your storage unit (for production use)

Both local and production use the same storage unit (database), they just access it from different places!
