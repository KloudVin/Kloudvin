# KloudVin - Cloud & DevOps Blog Platform

A modern, feature-rich blog platform for technical articles on Cloud Architecture, DevOps, Kubernetes, and IT infrastructure.

---

## Features

### Content Management
- ✅ Markdown-based article editor with live preview
- ✅ DOCX to Markdown conversion with automatic image extraction
- ✅ Image upload to Azure Blob Storage
- ✅ Category management system
- ✅ Article CRUD operations (Create, Read, Update, Delete)
- ✅ Rich text formatting with syntax highlighting

### User Management
- ✅ Two-tier role system (Administrator & Editor)
- ✅ Secure authentication
- ✅ Email-based password reset with OTP
- ✅ User profile management

### Technical Stack
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Azure Static Web Apps with Data API Builder
- **Database:** Azure SQL Database
- **Storage:** Azure Blob Storage
- **Functions:** Azure Functions (Node.js)
- **Email:** EmailJS

---

## Project Structure

```
kloudvin/
├── index.html                          # Homepage
├── pages/
│   ├── blog.html                       # Blog listing page
│   ├── article.html                    # Article detail page
│   └── about.html                      # About page
├── css/
│   └── style.css                       # Main stylesheet
├── js/
│   ├── app.js                          # Main application logic
│   ├── components.js                   # Reusable UI components
│   ├── db.js                           # Database operations
│   ├── migrate.js                      # Database migrations
│   └── user-management-new.js          # User management
├── swa-db-connections/
│   ├── staticwebapp.database.config.json  # Data API configuration
│   ├── schema.sql                      # Database schema
│   └── migration-*.sql                 # Migration scripts
├── staticwebapp.config.json            # Static Web App configuration
├── package.json                        # Node.js dependencies
├── ARTICLE-CREATION-GUIDE.md           # User guide for creating articles
├── DEPLOYMENT-GUIDE.md                 # Deployment instructions
├── DATABASE-SETUP.md                   # Database setup guide
└── DEPLOYMENT-CHECKLIST.md             # Pre-deployment checklist
```

---

## Quick Start

### For Users (Creating Articles)

1. **Login:**
   - Click login button
   - Enter credentials
   - Access granted based on role

2. **Create Article:**
   - Click "New Article" button
   - Choose Write mode (Markdown) or Upload mode (DOCX)
   - Fill in title, description, category
   - Write/upload content
   - Add images if needed
   - Preview and publish

3. **Need Help?**
   - Click "Help" button in article editor
   - Read [ARTICLE-CREATION-GUIDE.md](ARTICLE-CREATION-GUIDE.md)

### For Administrators

1. **Manage Users:**
   - Click "Users" button
   - Add/edit/delete users
   - Assign roles (Administrator/Editor)

2. **Site Settings:**
   - Click gear icon (⚙️)
   - Configure EmailJS
   - Manage categories
   - View/edit/delete articles

3. **Configure Services:**
   - EmailJS: For password reset emails
   - Azure Storage: For image uploads
   - Azure Functions: For DOCX conversion

---

## Documentation

### User Guides
- **[Article Creation Guide](ARTICLE-CREATION-GUIDE.md)** - Complete guide for creating and publishing articles
  - Write mode (Markdown)
  - Upload mode (DOCX)
  - Image management
  - Markdown formatting reference

### Technical Documentation
- **[Deployment Guide](DEPLOYMENT-GUIDE.md)** - Complete Azure deployment instructions
  - Pre-deployment checklist
  - Step-by-step deployment
  - Configuration guide
  - Troubleshooting

- **[Database Setup](DATABASE-SETUP.md)** - Database schema and setup
  - Table structures
  - Relationships
  - Migration scripts

- **[Deployment Checklist](DEPLOYMENT-CHECKLIST.md)** - Pre-deployment verification
  - Required resources
  - Configuration items
  - Testing checklist

---

## Azure Resources

### Required Services

1. **Azure Static Web App**
   - Hosts the website
   - Provides Data API Builder for REST endpoints
   - Free tier available

2. **Azure SQL Database**
   - Server: `kloudvin-server.database.windows.net`
   - Database: `kloudvin`
   - Tables: Users, Articles

3. **Azure Storage Account**
   - Account: `kloudvin`
   - Container: `images` (public blob access)
   - Stores uploaded images

4. **Azure Function App**
   - Name: `kloudvin-functions-geftgkb3dehxhag7`
   - Functions:
     - `uploadImage` - Upload images to blob storage
     - `convertDocx` - Convert DOCX to Markdown

### External Services

1. **EmailJS**
   - Service for sending emails
   - Used for password reset OTP
   - Free tier: 200 emails/month

---

## Configuration

### EmailJS Setup

1. Create account at [emailjs.com](https://www.emailjs.com/)
2. Create email service
3. Create two templates:
   - Password Reset OTP
   - Welcome & Notifications
4. Configure in Site Settings → EmailJS tab

### Database Connection

Connection string format:
```
Server=tcp:kloudvin-server.database.windows.net,1433;
Initial Catalog=kloudvin;
Persist Security Info=False;
User ID=your-username;
Password=your-password;
MultipleActiveResultSets=False;
Encrypt=True;
TrustServerCertificate=False;
Connection Timeout=30;
```

### Storage Account

- Connection string in Azure Portal → Storage Account → Access keys
- Configure CORS for your domain
- Set container access level to "Blob (anonymous read access for blobs only)"

---

## Development

### Local Development

1. **Install Dependencies:**
   ```bash
   cd kloudvin
   npm install
   ```

2. **Configure Environment:**
   - Copy `.env.example` to `.env`
   - Fill in connection strings and API keys

3. **Run Locally:**
   ```bash
   # Using Azure Static Web Apps CLI
   npm install -g @azure/static-web-apps-cli
   swa start
   ```

4. **Access:**
   - Open http://localhost:4280

### Testing

1. **Test Database Connection:**
   - Check Data API endpoints: `/data-api/rest/User`, `/data-api/rest/Article`

2. **Test Image Upload:**
   - Login as admin/editor
   - Create new article
   - Upload image
   - Verify image appears in Azure Blob Storage

3. **Test DOCX Conversion:**
   - Upload a .docx file
   - Verify conversion to Markdown
   - Check images are extracted

---

## Deployment

### Prerequisites

- Azure subscription
- GitHub account (for CI/CD)
- Azure CLI (optional)

### Deployment Steps

1. **Read the Deployment Guide:**
   - See [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) for complete instructions

2. **Prepare Code:**
   - Update configuration files
   - Remove sensitive data
   - Test locally

3. **Deploy to Azure:**
   - Create Static Web App
   - Configure database connection
   - Deploy Azure Functions
   - Configure custom domain (optional)

4. **Post-Deployment:**
   - Create admin user
   - Configure EmailJS
   - Test all functionality
   - Set up monitoring

---

## Security

### Best Practices

1. **Authentication:**
   - Strong passwords required
   - Password reset via email OTP
   - Session management

2. **Database:**
   - Firewall rules configured
   - Encrypted connections
   - Regular backups

3. **Storage:**
   - Public read access for images only
   - SAS tokens for sensitive operations
   - Soft delete enabled

4. **Application:**
   - HTTPS only
   - Content Security Policy configured
   - Input validation
   - XSS protection

---

## Maintenance

### Regular Tasks

**Weekly:**
- Check error logs
- Monitor performance
- Review security alerts

**Monthly:**
- Database optimization
- Clean up old images
- Update dependencies
- Review backups

**Quarterly:**
- Security audit
- Performance optimization
- Cost review
- Documentation updates

---

## Troubleshooting

### Common Issues

**Database Connection Errors:**
- Check firewall rules
- Verify connection string
- Ensure database is online

**Image Upload Failures:**
- Check Function App status
- Verify CORS settings
- Check storage connection string

**DOCX Conversion Issues:**
- Verify file size < 10MB
- Ensure .docx format
- Check Function App logs

**Login Problems:**
- Verify user exists
- Check password
- Clear browser cache

### Getting Help

- Check documentation in this repository
- Review Azure Portal logs
- Check browser console (F12)
- Contact administrator

---

## Contributing

### Code Style

- Use consistent indentation (2 spaces)
- Comment complex logic
- Follow existing patterns
- Test before committing

### Git Workflow

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Commit with clear message
5. Push to GitHub
6. GitHub Actions deploys automatically

---

## License

Copyright © 2026 KloudVin. All rights reserved.

---

## Support

**Documentation:**
- [Article Creation Guide](ARTICLE-CREATION-GUIDE.md)
- [Deployment Guide](DEPLOYMENT-GUIDE.md)
- [Database Setup](DATABASE-SETUP.md)

**Contact:**
- Email: admin@kloudvin.com
- Website: https://kloudvin.com

---

**Last Updated:** February 2026  
**Version:** 1.0
