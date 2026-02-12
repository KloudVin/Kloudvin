# Where Does Everything Run?

A simple visual guide to understand what runs where.

## The Simple Answer

```
┌─────────────────────────────────────────────────────────┐
│  DEVELOPMENT: Testing on Your Computer                  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  💻 YOUR COMPUTER          ☁️  AZURE CLOUD              │
│  ─────────────────         ──────────────               │
│                                                           │
│  • Your code files         • SQL Database                │
│  • SWA CLI (npm start)       (stores data)               │
│  • Browser (localhost)                                   │
│                                                           │
│  You edit code here  ────► Data saves here               │
│                                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  PRODUCTION: Live Website on Internet                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  🌐 INTERNET               ☁️  AZURE CLOUD              │
│  ─────────────             ──────────────               │
│                                                           │
│  • Users' browsers         • Static Web App              │
│  • Anyone can visit          (hosts your site)           │
│                            • SQL Database                │
│                              (stores data)               │
│                                                           │
│  Users visit site    ────► Everything runs here          │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## What You Need to Install/Configure

### On Your Computer (Development)

✅ **Install These:**
- Node.js (to run npm commands)
- Azure CLI (to create Azure resources)
- SWA CLI (to run local server)
- Git (to deploy code)

✅ **Create These Files:**
- `.env` (connection string to Azure database)

✅ **Run These Commands:**
```bash
npm start              # Start local development server
```

### On Azure Cloud (Production)

✅ **Create These Resources:**
- Azure SQL Database (stores data)
- Azure Static Web App (hosts website)

✅ **Configure These:**
- Database connection string in Static Web App settings

✅ **Deploy Code:**
```bash
git push origin main   # Triggers automatic deployment
```

## The Database: Always on Azure

**Important**: The database NEVER runs on your computer!

```
❌ WRONG:
   Your Computer
   ├── Code files
   ├── SWA CLI
   └── Database ← NO! Database doesn't run here

✅ CORRECT:
   Your Computer          Azure Cloud
   ├── Code files         ├── SQL Database ← YES! Always here
   └── SWA CLI ──────────►└── (connects to cloud)
```

## The .env File: Why Do You Need It?

The `.env` file is like a phone book entry:

```
.env file on your computer:
┌────────────────────────────────────────┐
│ DATABASE_CONNECTION_STRING=            │
│ "Server=tcp:my-server.database.        │
│  windows.net,1433;Database=kloudvin;   │
│  User ID=admin;Password=pass123;..."   │
└────────────────────────────────────────┘
         │
         │ This tells your local SWA CLI:
         │ "Hey, the database is at this address"
         │
         ▼
   Azure SQL Database
   (actually stores the data)
```

## Development vs Production: Side by Side

| Aspect | Development (Local) | Production (Azure) |
|--------|--------------------|--------------------|
| **Website Code** | On your computer | On Azure Static Web Apps |
| **Database** | On Azure Cloud | On Azure Cloud (same one!) |
| **Access** | Only you (localhost:4280) | Anyone (public URL) |
| **Changes** | Instant (just refresh) | Need to push to GitHub |
| **Purpose** | Testing & development | Live public website |

## Common Scenarios

### Scenario 1: You're Developing Locally

```
You: npm start
  ↓
SWA CLI starts on your computer (localhost:4280)
  ↓
You open browser → localhost:4280
  ↓
You create an article
  ↓
Article is sent to Azure SQL Database
  ↓
Article is stored in the cloud
  ↓
You refresh page
  ↓
Article loads from Azure SQL Database
```

**Where did things run?**
- Browser: Your computer
- SWA CLI: Your computer
- Database: Azure Cloud ☁️

### Scenario 2: Someone Visits Your Live Site

```
User: Opens https://kloudvin.azurestaticapps.net
  ↓
Request goes to Azure Static Web Apps
  ↓
Azure serves your website
  ↓
User creates an article
  ↓
Article is sent to Azure SQL Database
  ↓
Article is stored in the cloud
  ↓
User refreshes page
  ↓
Article loads from Azure SQL Database
```

**Where did things run?**
- Browser: User's computer
- Website: Azure Static Web Apps ☁️
- Database: Azure SQL Database ☁️

## The Connection String: Same Database, Different Access Points

```
Development:
Your Computer ──────► .env file ──────► Azure SQL Database
(localhost)           (local config)    (cloud storage)

Production:
Azure Static ──────► Portal Config ───► Azure SQL Database
Web App              (cloud config)     (cloud storage)
(cloud hosting)                         (same database!)
```

Both point to the **same database**, just configured in different places!

## Quick Decision Tree

**"Where do I run this command?"**

```
Is it an Azure CLI command (az ...)?
├─ YES → Run on your computer (creates Azure resources)
└─ NO → Continue...

Is it npm start or npm run?
├─ YES → Run on your computer (local development)
└─ NO → Continue...

Is it git push?
├─ YES → Run on your computer (deploys to Azure)
└─ NO → Continue...

Is it SQL code?
├─ YES → Run in Azure Portal Query Editor (on Azure)
└─ NO → Ask for help!
```

## Summary in One Sentence

**Development**: Your computer runs a local server that connects to an Azure database.

**Production**: Azure runs your website that connects to the same Azure database.

**Database**: Always on Azure, never on your computer!

## Still Confused?

Think of it like Google Docs:

- **Your Computer** = Your laptop where you edit the document
- **Azure Database** = Google's servers where the document is actually saved
- **Local Development** = Editing the doc on your laptop (but it saves to Google)
- **Production** = Sharing the doc so others can view it (also saved on Google)

The document (data) is always on Google's servers (Azure), whether you're editing it locally or sharing it publicly!

---

**Next Steps:**
1. Read [SETUP-EXPLAINED.md](./SETUP-EXPLAINED.md) for detailed workflow
2. Follow [QUICK-START.md](./QUICK-START.md) for step-by-step commands
