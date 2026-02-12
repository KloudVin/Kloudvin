# KloudVin - Cloud & DevOps Blog Platform

A modern, neon-themed technical blog platform built with vanilla JavaScript and Azure Static Web Apps, featuring persistent data storage with Azure SQL Database.

## Features

- 🎨 Modern neon-themed UI with ambient effects
- 📝 Rich markdown editor with file upload support
- 🔐 Admin authentication system
- 💾 Persistent data storage with Azure SQL Database
- 🚀 Deployed on Azure Static Web Apps
- 📱 Fully responsive design
- ⚡ Fast and lightweight (no framework dependencies)

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Azure Static Web Apps Database Connections (Data API Builder)
- **Database**: Azure SQL Database
- **Deployment**: Azure Static Web Apps
- **CI/CD**: Azure Pipelines / GitHub Actions

## Project Structure

```
kloudvin/
├── css/
│   └── style.css              # Main stylesheet
├── js/
│   ├── app.js                 # Core application logic
│   ├── components.js          # Reusable UI components
│   └── db.js                  # Database API wrapper
├── pages/
│   ├── about.html             # About page
│   ├── article.html           # Article detail page
│   └── blog.html              # Blog listing page
├── swa-db-connections/
│   ├── staticwebapp.database.config.json  # Data API configuration
│   └── schema.sql             # Database schema
├── index.html                 # Homepage
├── staticwebapp.config.json   # SWA configuration
├── azure-pipelines.yml        # CI/CD pipeline
├── .env.example               # Environment variables template
├── DATABASE-SETUP.md          # Database setup guide
└── README.md                  # This file
```

## Getting Started

### 📚 Documentation Hub

**New to this project?** Start here: [DOCUMENTATION-INDEX.md](./DOCUMENTATION-INDEX.md) - Find the right guide for your needs

### Quick Links by Experience Level

**🆕 Beginner (New to Azure/Cloud)**
1. [WHERE-DOES-IT-RUN.md](./WHERE-DOES-IT-RUN.md) - Understand the architecture
2. [SETUP-EXPLAINED.md](./SETUP-EXPLAINED.md) - Detailed workflow
3. [QUICK-START.md](./QUICK-START.md) - Step-by-step setup

**⚡ Intermediate (Know Azure basics)**
1. [QUICK-START.md](./QUICK-START.md) - Fast setup
2. [DATABASE-SETUP.md](./DATABASE-SETUP.md) - Database details
3. [SWA-CLI-GUIDE.md](./SWA-CLI-GUIDE.md) - CLI reference

**🚀 Advanced (Experienced developer)**
1. [MIGRATION-SUMMARY.md](./MIGRATION-SUMMARY.md) - What changed
2. Review code in `js/db.js` and `js/app.js`
3. Run `npm start` and deploy

### Prerequisites

- Node.js 16+ (for SWA CLI)
- Azure subscription
- Azure CLI
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/kloudvin.git
   cd kloudvin
   ```

2. **Install SWA CLI**
   ```bash
   npm install -g @azure/static-web-apps-cli
   ```

3. **Set up Azure SQL Database**
   
   Follow the detailed guide in [DATABASE-SETUP.md](./DATABASE-SETUP.md)

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Azure SQL connection string
   ```

5. **Start the development server**
   ```bash
   swa start . --data-api-location swa-db-connections
   ```

6. **Open your browser**
   ```
   http://localhost:4280
   ```

### Default Admin Credentials

- **Username**: `admin`
- **Password**: `kloudvin@2026`

⚠️ **Important**: Change these credentials in production!

## Database Setup

The application uses Azure SQL Database for persistent storage. See [DATABASE-SETUP.md](./DATABASE-SETUP.md) for detailed setup instructions.

### Quick Setup

1. Create Azure SQL Database
2. Run the schema from `swa-db-connections/schema.sql`
3. Configure connection string in `.env`
4. Start the app with SWA CLI

### Database Schema

**Users Table**
- `id` (INT, Primary Key)
- `username` (NVARCHAR(50), Unique)
- `email` (NVARCHAR(100), Unique)
- `password_hash` (NVARCHAR(255))
- `created_at` (DATETIME2)
- `last_login` (DATETIME2)
- `is_admin` (BIT)

**Articles Table**
- `id` (NVARCHAR(255), Primary Key)
- `title` (NVARCHAR(500))
- `description` (NVARCHAR(1000))
- `content` (NVARCHAR(MAX))
- `category` (NVARCHAR(50))
- `read_time` (NVARCHAR(20))
- `tags` (NVARCHAR(500))
- `date_published` (NVARCHAR(50))
- `created_at` (DATETIME2)
- `updated_at` (DATETIME2)
- `author_id` (INT, Foreign Key)

## Deployment

### Deploy to Azure Static Web Apps

1. **Create a Static Web App**
   ```bash
   az staticwebapp create \
     --name kloudvin \
     --resource-group YOUR_RESOURCE_GROUP \
     --source https://github.com/YOUR_USERNAME/kloudvin \
     --location eastus \
     --branch main \
     --app-location "/" \
     --output-location "."
   ```

2. **Configure Database Connection**
   - Add `DATABASE_CONNECTION_STRING` to Application Settings
   - Link Azure SQL Database in the portal

3. **Deploy**
   ```bash
   git push origin main
   ```

### CI/CD Pipeline

The project includes an Azure Pipelines configuration (`azure-pipelines.yml`). Configure it with:
- Azure subscription
- Static Web App deployment token
- Database connection string (as secret variable)

## API Endpoints

The Data API Builder exposes REST endpoints:

- `GET /.data-api/rest/User` - List users
- `GET /.data-api/rest/User?$filter=username eq 'admin'` - Get user by username
- `POST /.data-api/rest/User` - Create user
- `PATCH /.data-api/rest/User/id/{id}` - Update user
- `GET /.data-api/rest/Article` - List articles
- `GET /.data-api/rest/Article/id/{id}` - Get article by ID
- `POST /.data-api/rest/Article` - Create article
- `PATCH /.data-api/rest/Article/id/{id}` - Update article
- `DELETE /.data-api/rest/Article/id/{id}` - Delete article

## Features in Detail

### Admin System
- Secure login with database authentication
- Session management with sessionStorage
- Admin-only article creation and management

### Article Editor
- **Write Mode**: Rich markdown editor with toolbar
- **Upload Mode**: Support for .md, .txt, .html, .docx files
- Auto-extraction of title and description
- Tag management
- Live preview

### Article Management
- Category-based organization
- Tag filtering
- Search functionality (coming soon)
- Reading time estimation

## Security Considerations

⚠️ **Current Implementation**: Passwords are stored in plain text for development purposes.

### For Production:

1. **Implement Password Hashing**
   ```javascript
   // Use bcrypt or similar
   const bcrypt = require('bcryptjs');
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

2. **Use Azure Key Vault** for connection strings

3. **Enable Azure AD Authentication** for database access

4. **Implement HTTPS** (automatic with Azure Static Web Apps)

5. **Add CSRF Protection** for state-changing operations

6. **Rate Limiting** on authentication endpoints

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Lazy loading for images
- Intersection Observer for scroll animations
- Minimal JavaScript bundle (no frameworks)
- CSS Grid and Flexbox for layouts
- Optimized for Core Web Vitals

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [ ] User registration functionality
- [ ] Password reset flow
- [ ] Article editing and deletion
- [ ] Comment system
- [ ] Search functionality
- [ ] RSS feed
- [ ] Dark/light theme toggle
- [ ] Analytics dashboard
- [ ] Email notifications
- [ ] Social sharing

## License

This project is licensed under the MIT License.

## Author

**Vinod H**
- Cloud / DevOps Platform Architect
- 22+ years in IT
- Specializing in Azure, Kubernetes, and Infrastructure as Code

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check [DATABASE-SETUP.md](./DATABASE-SETUP.md) for setup help
- Review Azure Static Web Apps documentation

## Acknowledgments

- Font Awesome for icons
- Google Fonts (Sora, DM Sans, Fira Code)
- Azure Static Web Apps team
- Data API Builder project
