# KloudVin Documentation Index

Welcome! This guide helps you find the right documentation for your needs.

## 🎯 Start Here Based on Your Situation

### "I'm completely new to Azure and cloud development"
1. 📖 [WHERE-DOES-IT-RUN.md](./WHERE-DOES-IT-RUN.md) - Understand what runs where
2. 📖 [SETUP-EXPLAINED.md](./SETUP-EXPLAINED.md) - Detailed workflow explanation
3. 🔌 [CONNECTION-STRING-GUIDE.md](./CONNECTION-STRING-GUIDE.md) - Which connection string to use
4. 🚀 [QUICK-START.md](./QUICK-START.md) - Follow step-by-step setup

### "I know Azure, just show me how to set this up"
1. 🚀 [QUICK-START.md](./QUICK-START.md) - Fast setup guide
2. 🗄️ [DATABASE-SETUP.md](./DATABASE-SETUP.md) - Database configuration
3. 🛠️ [SWA-CLI-GUIDE.md](./SWA-CLI-GUIDE.md) - CLI reference

### "I have existing data in localStorage to migrate"
1. 📋 [MIGRATION-SUMMARY.md](./MIGRATION-SUMMARY.md) - What changed
2. 🔄 Open browser console and run: `migrateLocalStorageToDatabase()`
3. 🗄️ [DATABASE-SETUP.md](./DATABASE-SETUP.md) - Ensure database is set up

### "I'm ready to deploy to production"
1. ✅ [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) - Pre-deployment checklist
2. 🚀 [QUICK-START.md](./QUICK-START.md) - See "Deploy to Azure" section
3. 🛠️ [SWA-CLI-GUIDE.md](./SWA-CLI-GUIDE.md) - Deployment commands

### "I need to understand the code changes"
1. 📋 [MIGRATION-SUMMARY.md](./MIGRATION-SUMMARY.md) - All changes explained
2. 📖 [README.md](./README.md) - Project overview
3. 💻 Review code files: `js/db.js`, `js/app.js`

## 📚 Complete Documentation List

### Getting Started Guides

| Document | Purpose | When to Read |
|----------|---------|--------------|
| [WHERE-DOES-IT-RUN.md](./WHERE-DOES-IT-RUN.md) | Visual guide to architecture | First time setup, confused about local vs cloud |
| [SETUP-EXPLAINED.md](./SETUP-EXPLAINED.md) | Detailed workflow explanation | Need to understand the big picture |
| [CONNECTION-STRING-GUIDE.md](./CONNECTION-STRING-GUIDE.md) | Which connection string format to use | Confused about ADO.NET vs JDBC/ODBC/PHP/Go |
| [QUICK-START.md](./QUICK-START.md) | 5-minute setup guide | Ready to start, want step-by-step |
| [README.md](./README.md) | Project overview | Want to understand the project |

### Technical Documentation

| Document | Purpose | When to Read |
|----------|---------|--------------|
| [DATABASE-SETUP.md](./DATABASE-SETUP.md) | Azure SQL Database setup | Setting up database for first time |
| [SWA-CLI-GUIDE.md](./SWA-CLI-GUIDE.md) | CLI commands reference | Need specific commands or API testing |
| [MIGRATION-SUMMARY.md](./MIGRATION-SUMMARY.md) | Code changes explained | Understanding what changed from localStorage |

### Deployment & Operations

| Document | Purpose | When to Read |
|----------|---------|--------------|
| [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) | Pre-deployment checklist | Before deploying to production |
| [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) | Original deployment guide | Alternative deployment methods |

### Reference Files

| File | Purpose |
|------|---------|
| `.env.example` | Template for environment variables |
| `package.json` | npm scripts and dependencies |
| `swa-db-connections/schema.sql` | Database schema |
| `swa-db-connections/staticwebapp.database.config.json` | Data API configuration |

## 🔍 Find Information By Topic

### Database

- **Setup**: [DATABASE-SETUP.md](./DATABASE-SETUP.md)
- **Connection String**: [CONNECTION-STRING-GUIDE.md](./CONNECTION-STRING-GUIDE.md)
- **Schema**: `swa-db-connections/schema.sql`
- **API Configuration**: `swa-db-connections/staticwebapp.database.config.json`

### Local Development

- **Getting Started**: [QUICK-START.md](./QUICK-START.md) Steps 1-6
- **Understanding Architecture**: [WHERE-DOES-IT-RUN.md](./WHERE-DOES-IT-RUN.md)
- **CLI Commands**: [SWA-CLI-GUIDE.md](./SWA-CLI-GUIDE.md)
- **Environment Setup**: [SETUP-EXPLAINED.md](./SETUP-EXPLAINED.md)

### Deployment

- **Quick Deploy**: [QUICK-START.md](./QUICK-START.md) "Deploy to Azure" section
- **Checklist**: [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)
- **GitHub Actions**: [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)
- **Manual Deploy**: [SWA-CLI-GUIDE.md](./SWA-CLI-GUIDE.md)

### Migration

- **From localStorage**: [MIGRATION-SUMMARY.md](./MIGRATION-SUMMARY.md)
- **Migration Utilities**: `js/migrate.js`
- **What Changed**: [MIGRATION-SUMMARY.md](./MIGRATION-SUMMARY.md)

### Troubleshooting

- **Database Connection**: [DATABASE-SETUP.md](./DATABASE-SETUP.md) "Troubleshooting" section
- **CLI Issues**: [SWA-CLI-GUIDE.md](./SWA-CLI-GUIDE.md) "Troubleshooting" section
- **Common Questions**: [SETUP-EXPLAINED.md](./SETUP-EXPLAINED.md) "Common Questions"

## 🎓 Learning Path

### Beginner Path (Never used Azure)

```
Day 1: Understanding
├─ Read: WHERE-DOES-IT-RUN.md
├─ Read: SETUP-EXPLAINED.md
└─ Understand: What runs where

Day 2: Setup Azure Resources
├─ Follow: QUICK-START.md Steps 1-3
├─ Create: Azure SQL Database
└─ Run: Database schema

Day 3: Local Development
├─ Follow: QUICK-START.md Steps 4-6
├─ Configure: .env file
├─ Test: Local development
└─ Verify: Data persistence

Day 4: Deployment
├─ Review: DEPLOYMENT-CHECKLIST.md
├─ Follow: QUICK-START.md "Deploy to Azure"
└─ Verify: Production site works
```

### Intermediate Path (Know Azure basics)

```
Step 1: Quick Setup
├─ Follow: QUICK-START.md
└─ Reference: DATABASE-SETUP.md as needed

Step 2: Deploy
├─ Review: DEPLOYMENT-CHECKLIST.md
└─ Deploy to production

Step 3: Customize
├─ Review: MIGRATION-SUMMARY.md
└─ Modify code as needed
```

### Advanced Path (Experienced developer)

```
1. Skim: README.md
2. Review: MIGRATION-SUMMARY.md
3. Check: swa-db-connections/staticwebapp.database.config.json
4. Run: npm start
5. Deploy: npm run deploy
```

## 🆘 Quick Help

### "I'm stuck on Step X of QUICK-START.md"

| Step | Help Document |
|------|---------------|
| Step 1-2 (Azure SQL) | [DATABASE-SETUP.md](./DATABASE-SETUP.md) |
| Step 3 (Schema) | [DATABASE-SETUP.md](./DATABASE-SETUP.md) "Run Database Schema" |
| Step 4 (.env file) | [CONNECTION-STRING-GUIDE.md](./CONNECTION-STRING-GUIDE.md) |
| Step 5 (npm start) | [SWA-CLI-GUIDE.md](./SWA-CLI-GUIDE.md) "Local Development" |
| Step 6 (Testing) | [WHERE-DOES-IT-RUN.md](./WHERE-DOES-IT-RUN.md) "Scenario 1" |

### "I don't understand..."

| Question | Answer Document |
|----------|-----------------|
| Where does the database run? | [WHERE-DOES-IT-RUN.md](./WHERE-DOES-IT-RUN.md) |
| What is .env for? | [SETUP-EXPLAINED.md](./SETUP-EXPLAINED.md) "Q: Why do I need .env..." |
| Local vs Production? | [WHERE-DOES-IT-RUN.md](./WHERE-DOES-IT-RUN.md) "Development vs Production" |
| What changed from localStorage? | [MIGRATION-SUMMARY.md](./MIGRATION-SUMMARY.md) |
| How do I deploy? | [QUICK-START.md](./QUICK-START.md) "Deploy to Azure" |

### "I need to..."

| Task | Document |
|------|----------|
| Set up database | [DATABASE-SETUP.md](./DATABASE-SETUP.md) |
| Run locally | [QUICK-START.md](./QUICK-START.md) Steps 4-6 |
| Deploy to Azure | [QUICK-START.md](./QUICK-START.md) "Deploy to Azure" |
| Migrate data | [MIGRATION-SUMMARY.md](./MIGRATION-SUMMARY.md) "Migration Path" |
| Test API endpoints | [SWA-CLI-GUIDE.md](./SWA-CLI-GUIDE.md) "Testing Data API" |
| Troubleshoot issues | Each doc has a "Troubleshooting" section |

## 📖 Reading Order Recommendations

### First Time Setup (Read in Order)
1. WHERE-DOES-IT-RUN.md
2. SETUP-EXPLAINED.md
3. QUICK-START.md
4. DATABASE-SETUP.md (as needed)
5. SWA-CLI-GUIDE.md (reference)

### Before Deployment (Read in Order)
1. DEPLOYMENT-CHECKLIST.md
2. QUICK-START.md "Deploy to Azure" section
3. DATABASE-SETUP.md "Security Best Practices"

### Understanding Changes (Read in Order)
1. MIGRATION-SUMMARY.md
2. README.md
3. Code files (js/db.js, js/app.js)

## 🔗 External Resources

- [Azure Static Web Apps Documentation](https://learn.microsoft.com/azure/static-web-apps/)
- [Data API Builder Documentation](https://learn.microsoft.com/azure/data-api-builder/)
- [Azure SQL Database Documentation](https://learn.microsoft.com/azure/azure-sql/)
- [SWA CLI GitHub Repository](https://github.com/Azure/static-web-apps-cli)

## 💡 Tips

- **Bookmark this page** - Use it as your navigation hub
- **Start simple** - Follow the beginner path if unsure
- **Read in order** - Documents build on each other
- **Use search** - Ctrl+F to find specific topics
- **Check troubleshooting** - Most issues are covered

## 🎯 Your Next Step

Not sure where to start? Answer these questions:

1. **Have you used Azure before?**
   - No → Start with [WHERE-DOES-IT-RUN.md](./WHERE-DOES-IT-RUN.md)
   - Yes → Go to [QUICK-START.md](./QUICK-START.md)

2. **Do you have an Azure subscription?**
   - No → Get one at [azure.microsoft.com/free](https://azure.microsoft.com/free)
   - Yes → Continue to setup

3. **Is this for learning or production?**
   - Learning → Follow beginner path above
   - Production → Review [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) first

---

**Still need help?** Check the "Common Questions" section in [SETUP-EXPLAINED.md](./SETUP-EXPLAINED.md)
