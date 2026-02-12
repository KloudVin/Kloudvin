# KloudVin Deployment Checklist

Use this checklist to ensure a smooth deployment to production.

## Pre-Deployment

### 1. Code Review
- [ ] All code changes tested locally
- [ ] No console.log statements in production code
- [ ] Error handling implemented
- [ ] Security best practices followed

### 2. Database Setup
- [ ] Azure SQL Database created
- [ ] Schema applied (schema.sql executed)
- [ ] Default admin user created
- [ ] Firewall rules configured
- [ ] Connection string tested

### 3. Environment Configuration
- [ ] `.env` file configured locally
- [ ] Connection string format verified
- [ ] No sensitive data in source control
- [ ] `.gitignore` includes `.env`

### 4. Local Testing
- [ ] App starts without errors: `npm start`
- [ ] Database connection successful
- [ ] Login functionality works
- [ ] Article creation works
- [ ] Articles persist after refresh
- [ ] Session management works
- [ ] Logout functionality works

## Azure Resources Setup

### 1. Resource Group
- [ ] Resource group created
- [ ] Appropriate region selected
- [ ] Tags applied (optional)

```bash
az group create --name kloudvin-rg --location eastus
```

### 2. Azure SQL Database
- [ ] SQL Server created
- [ ] Database created
- [ ] Admin credentials saved securely
- [ ] Firewall rules configured
- [ ] Azure services allowed
- [ ] Your IP address allowed (for management)

```bash
# Verify database is accessible
az sql db show --resource-group kloudvin-rg --server YOUR-SERVER --name kloudvin
```

### 3. Azure Static Web App
- [ ] Static Web App created
- [ ] GitHub repository connected (or deployment method chosen)
- [ ] Build configuration set
- [ ] Custom domain configured (optional)

```bash
az staticwebapp create \
  --name kloudvin \
  --resource-group kloudvin-rg \
  --source https://github.com/YOUR_USERNAME/kloudvin \
  --location eastus \
  --branch main
```

## Configuration

### 1. Application Settings
- [ ] Navigate to Static Web App → Configuration
- [ ] Add `DATABASE_CONNECTION_STRING`
- [ ] Value is correct connection string
- [ ] Settings saved

### 2. Database Connection
- [ ] Navigate to Static Web App → Database connection
- [ ] Link existing Azure SQL Database
- [ ] Verify connection successful
- [ ] Data API location configured

### 3. Custom Domain (Optional)
- [ ] Custom domain added
- [ ] DNS records configured
- [ ] SSL certificate provisioned
- [ ] HTTPS enforced

## Security Hardening

### 1. Passwords
- [ ] Default admin password changed
- [ ] Strong password policy enforced
- [ ] Consider implementing password hashing

```sql
-- Change default password
UPDATE dbo.Users 
SET password_hash = 'NewSecurePassword123!' 
WHERE username = 'admin';
```

### 2. Database Security
- [ ] Firewall rules minimized (only necessary IPs)
- [ ] Azure AD authentication considered
- [ ] Audit logging enabled
- [ ] Backup policy configured

### 3. Application Security
- [ ] HTTPS enforced (automatic with SWA)
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Rate limiting considered

### 4. Secrets Management
- [ ] Connection strings not in source control
- [ ] Azure Key Vault considered for production
- [ ] Deployment tokens secured
- [ ] Admin credentials documented securely

## Deployment

### 1. GitHub Actions (Recommended)
- [ ] GitHub repository created
- [ ] Code pushed to repository
- [ ] GitHub Actions workflow configured
- [ ] Deployment token added to GitHub Secrets
- [ ] Workflow triggered successfully

```bash
# Add deployment token to GitHub Secrets
# Name: AZURE_STATIC_WEB_APPS_API_TOKEN
# Value: (from Azure Portal)
```

### 2. Manual Deployment
- [ ] SWA CLI installed
- [ ] Logged in to Azure: `swa login`
- [ ] Deployment command executed: `npm run deploy`
- [ ] Deployment successful

### 3. Verify Deployment
- [ ] Site accessible at Azure URL
- [ ] No console errors
- [ ] Database connection working
- [ ] Login functionality works
- [ ] Article creation works
- [ ] Articles persist after refresh

## Post-Deployment

### 1. Functional Testing
- [ ] Homepage loads correctly
- [ ] All navigation links work
- [ ] Blog page displays articles
- [ ] Article detail pages work
- [ ] About page loads
- [ ] Admin login works
- [ ] Article editor opens
- [ ] New articles can be created
- [ ] Articles save to database
- [ ] Session persists across pages
- [ ] Logout works correctly

### 2. Performance Testing
- [ ] Page load times acceptable
- [ ] Database queries performant
- [ ] No memory leaks
- [ ] Images optimized
- [ ] Caching configured

### 3. Browser Testing
- [ ] Chrome/Edge tested
- [ ] Firefox tested
- [ ] Safari tested (if applicable)
- [ ] Mobile browsers tested
- [ ] Responsive design verified

### 4. Monitoring Setup
- [ ] Application Insights configured (optional)
- [ ] Database monitoring enabled
- [ ] Alerts configured for errors
- [ ] Logging reviewed

## Documentation

### 1. Update Documentation
- [ ] README.md updated with production URL
- [ ] Admin credentials documented (securely)
- [ ] Deployment process documented
- [ ] Troubleshooting guide updated

### 2. Team Communication
- [ ] Team notified of deployment
- [ ] Admin credentials shared securely
- [ ] Known issues documented
- [ ] Support process defined

## Backup and Recovery

### 1. Database Backups
- [ ] Automated backups enabled
- [ ] Backup retention policy set
- [ ] Backup restoration tested
- [ ] Point-in-time restore available

```bash
# Enable automated backups
az sql db update \
  --resource-group kloudvin-rg \
  --server YOUR-SERVER \
  --name kloudvin \
  --backup-storage-redundancy Local
```

### 2. Code Backups
- [ ] Code in version control (Git)
- [ ] Production branch protected
- [ ] Tags created for releases
- [ ] Rollback procedure documented

## Maintenance

### 1. Regular Tasks
- [ ] Monitor database size
- [ ] Review application logs
- [ ] Check for security updates
- [ ] Update dependencies
- [ ] Review and rotate credentials

### 2. Scaling Considerations
- [ ] Database tier appropriate for load
- [ ] Static Web App tier sufficient
- [ ] CDN configured if needed
- [ ] Performance monitoring in place

## Rollback Plan

### 1. Preparation
- [ ] Previous version tagged in Git
- [ ] Database backup taken before deployment
- [ ] Rollback procedure documented
- [ ] Team aware of rollback process

### 2. Rollback Steps
```bash
# Revert to previous version
git revert HEAD
git push origin main

# Or redeploy previous version
git checkout v1.0.0
swa deploy --env production
```

### 3. Database Rollback
```bash
# Restore database to previous state
az sql db restore \
  --resource-group kloudvin-rg \
  --server YOUR-SERVER \
  --name kloudvin \
  --dest-name kloudvin-restored \
  --time "2026-02-12T10:00:00Z"
```

## Production URLs

Document your production URLs:

- **Website**: https://YOUR-SITE.azurestaticapps.net
- **Custom Domain**: https://kloudvin.com (if configured)
- **Azure Portal**: https://portal.azure.com
- **GitHub Repository**: https://github.com/YOUR_USERNAME/kloudvin

## Support Contacts

Document who to contact for issues:

- **Azure Support**: [Azure Support Portal](https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade)
- **Database Admin**: [Contact Info]
- **Development Team**: [Contact Info]

## Success Criteria

Deployment is successful when:

- [ ] All checklist items completed
- [ ] Site accessible and functional
- [ ] No critical errors in logs
- [ ] Database connection stable
- [ ] Performance acceptable
- [ ] Security measures in place
- [ ] Team notified and trained
- [ ] Documentation updated

## Post-Deployment Monitoring (First 24 Hours)

- [ ] Hour 1: Check for immediate errors
- [ ] Hour 4: Review application logs
- [ ] Hour 8: Check database performance
- [ ] Hour 24: Full functional test
- [ ] Week 1: Monitor user feedback
- [ ] Week 1: Review analytics

## Notes

Use this section for deployment-specific notes:

```
Deployment Date: _______________
Deployed By: _______________
Version: _______________
Issues Encountered: _______________
Resolution: _______________
```

---

**Remember**: Always test in a staging environment before deploying to production!
