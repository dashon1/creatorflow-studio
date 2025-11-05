# CreatorFlow Studio

## Project Overview
- **Name**: CreatorFlow Studio
- **Goal**: Transform n8n workflows into production-ready cross-platform applications with AI-powered automation
- **Features**: 
  - AI Video Generation (Sora 2, Runway, Pika)
  - Image Creation (DALL-E, Midjourney, Stable Diffusion)
  - AI Chatbots (WhatsApp, Web, SMS)
  - Voice Assistants
  - Podcast Generator
  - Web Automation
  - Complete Admin Dashboard
  - Dark/Light Theme Toggle
  - Multi-provider Integration System

## URLs
- **Production**: https://creatorflow-studio.pages.dev (deploy pending)
- **GitHub**: https://github.com/dashon1/creatorflow-studio
- **API Endpoint**: https://creatorflow-studio.pages.dev/api
- **Development**: http://localhost:3000

## Data Architecture

### Data Models
- **Users**: Authentication, roles (user/admin/super_admin), profile management
- **Integrations**: Multi-provider API connections (OpenAI, DALL-E, WhatsApp, etc.)
- **Workflows**: Customizable automation workflows with various types
- **Workflow Runs**: Execution history and analytics
- **Subscriptions**: Tiered pricing plans (Free, Starter, Pro, Enterprise)
- **Analytics**: Event tracking and usage metrics
- **API Keys**: Secure API access management

### Storage Services
- **Cloudflare D1**: Primary database for relational data
- **Cloudflare KV**: Session management and caching
- **Cloudflare R2**: File and asset storage

### Data Flow
1. Users authenticate via JWT tokens
2. Integrations connect to external AI services
3. Workflows orchestrate multiple integrations
4. Analytics track usage and performance
5. Admin dashboard provides complete oversight

## User Guide

### Getting Started
1. Register for an account at the homepage
2. Login with your credentials
3. Navigate to Integrations to connect AI services
4. Create workflows to automate tasks
5. Monitor performance in the Dashboard

### Features Guide

#### Dashboard
- View workflow statistics
- Monitor recent activity
- Track integration status
- Analyze usage metrics

#### Integrations
- Add new service connections
- Configure API credentials
- Manage provider settings
- Test connectivity

#### Workflows
- Create custom automation flows
- Configure workflow parameters
- Execute workflows manually
- Schedule automatic runs

#### Admin Panel (Admin Users Only)
- User management
- Role assignments
- System monitoring
- Global settings

### Theme Toggle
Click the sun/moon icon in the navigation bar to switch between light and dark modes.

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Integration Endpoints
- `GET /api/integrations` - List all user integrations
- `GET /api/integrations/:id` - Get single integration details
- `POST /api/integrations` - Create new integration
- `PUT /api/integrations/:id` - Update integration
- `DELETE /api/integrations/:id` - Remove integration

### Workflow Endpoints
- `GET /api/workflows` - List all workflows
- `GET /api/workflows/:id` - Get workflow details
- `POST /api/workflows` - Create new workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow
- `POST /api/workflows/:id/run` - Execute workflow
- `GET /api/workflows/:id/runs` - Get workflow run history
- `POST /api/workflows/:id/runs/:runId/cancel` - Cancel running workflow

### API Key Management
- `GET /api/keys` - List API keys
- `POST /api/keys` - Create API key (returns key only once!)
- `DELETE /api/keys/:id` - Delete API key

### Audit & Monitoring
- `GET /api/audit-logs` - View audit logs (admin: all users, user: own logs)
- `GET /api/analytics/dashboard` - Dashboard statistics
- `POST /api/analytics/track` - Track custom events

### Webhook Management
- `GET /api/webhooks` - List configured webhooks
- `POST /api/webhooks/:id/test` - Test webhook connectivity

### Admin Endpoints (Admin/Super Admin Only)
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id` - Update user role/status

## Deployment

### Platform
Cloudflare Pages with Workers

### Status
✅ Development Complete
❌ Production Deployment Pending

### Tech Stack
- **Backend**: Hono Framework + TypeScript
- **Frontend**: Vanilla JavaScript + TailwindCSS
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: JWT with jose library
- **Validation**: Zod schema validation

### Deployment Steps
1. Create Cloudflare D1 database: `npx wrangler d1 create creatorflow-db`
2. Update database ID in wrangler.jsonc
3. Apply migrations: `npm run db:migrate:prod`
4. Set up API keys: `npx wrangler pages secret put <KEY_NAME>`
5. Deploy: `npm run deploy:prod`

## Development

### Prerequisites
- Node.js 20+
- npm or pnpm
- Cloudflare account
- Wrangler CLI

### Local Setup
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Apply database migrations
npm run db:migrate:local

# Seed database with sample data
npm run db:seed

# Start development server
npm run dev:d1
```

### Available Scripts
- `npm run dev` - Start Vite dev server
- `npm run dev:sandbox` - Start with wrangler in sandbox
- `npm run dev:d1` - Start with D1 database support
- `npm run build` - Build for production
- `npm run deploy` - Deploy to Cloudflare Pages
- `npm run db:migrate:local` - Apply local migrations
- `npm run db:migrate:prod` - Apply production migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset and reseed database

## Features Status

### ✅ Completed Features (Enterprise-Ready)
- **Authentication & Security**
  - User authentication system with JWT (24-hour expiration)
  - Role-based access control (User/Admin/Super Admin)
  - API key management with scopes and expiration
  - Secure password hashing
  
- **Workflow Management**
  - Full CRUD operations (Create, Read, Update, Delete)
  - Workflow details viewer with run history
  - Real-time workflow execution
  - Workflow run cancellation/stop functionality
  - Status tracking (draft, active, paused, archived)
  - Workflow run logs and analytics
  
- **Integration System**
  - Full CRUD for integrations
  - Provider-specific configuration (OpenAI, DALL-E, WhatsApp, etc.)
  - Integration status monitoring (active, inactive, error)
  - Secure API key storage
  - Webhook support
  
- **Admin Panel**
  - User management (view, edit roles, change status)
  - System-wide analytics
  - Audit log viewer
  - API key oversight
  - Permission management
  
- **Enterprise Features**
  - API Key Management System
  - Audit logging for all actions
  - Webhook management and testing
  - Advanced analytics dashboard
  - Real-time status updates
  
- **UI/UX**
  - Dark/Light theme toggle with persistence
  - Responsive design for all screen sizes
  - Modal-based forms
  - Toast notifications
  - Smooth animations
  
- **Database & Architecture**
  - Complete schema with 9 tables
  - Full relationships and indexes
  - RESTful API design
  - Proper error handling

### 📋 Planned Future Enhancements
- Stripe payment integration for subscriptions
- Visual workflow builder (drag-and-drop nodes)
- Real-time collaboration features
- Advanced analytics with Chart.js visualizations
- Workflow templates marketplace
- API rate limiting system
- Export/Import workflows (JSON format)
- Email notification system
- Mobile app (React Native + Expo)
- Multi-language support (i18n)
- Two-factor authentication (2FA)
- Advanced search and filtering
- Workflow versioning and rollback
- Scheduled workflow execution (cron jobs)
- Team workspaces and collaboration
- Custom webhook triggers
- OAuth provider integrations
- Data export and backup tools

## Recommended Next Steps

1. **Configure Production Database**
   - Create Cloudflare D1 database
   - Update database ID in configuration
   - Apply production migrations

2. **Set Up Integrations**
   - Obtain API keys for AI services
   - Configure Cloudflare secrets
   - Test integration connectivity

3. **Deploy to Production**
   - Set up Cloudflare Pages project
   - Configure custom domain
   - Enable SSL/TLS

4. **Enhance Security**
   - Implement rate limiting
   - Add CSRF protection
   - Enable audit logging
   - Set up monitoring alerts

5. **Extend Functionality**
   - Add more AI service integrations
   - Create workflow templates
   - Implement team features
   - Add billing system

## Security Considerations

- All API tokens stored as Cloudflare secrets
- JWT tokens for authentication
- Password hashing with crypto API
- Role-based access control
- Input validation with Zod
- SQL injection prevention via prepared statements

## Support & Documentation

For additional help or questions:
- Review inline code documentation
- Check Cloudflare Workers documentation
- Consult Hono framework guides

## License

MIT

## 🚀 What's New in Enterprise Version

### Before (MVP) vs After (Enterprise)

| Feature | MVP Version | Enterprise Version |
|---------|-------------|-------------------|
| **Edit Buttons** | ❌ Not functional | ✅ Full edit modals with validation |
| **Delete Operations** | ⚠️ Partial | ✅ Full delete with confirmations |
| **Workflow Details** | ❌ No view | ✅ Detailed modal with run history |
| **Stop Workflows** | ❌ Cannot stop | ✅ Cancel running workflows |
| **Integration Management** | ⚠️ Basic | ✅ Full CRUD with status tracking |
| **API Keys** | ❌ None | ✅ Full API key management system |
| **Audit Logs** | ❌ None | ✅ Complete audit logging |
| **Admin Controls** | ⚠️ Basic user list | ✅ Advanced user management |
| **Dashboard Stats** | ⚠️ Static | ✅ Real-time analytics |
| **Webhooks** | ❌ None | ✅ Webhook management & testing |
| **Navigation** | ⚠️ 4 pages | ✅ 7+ pages with role-based access |
| **Error Handling** | ⚠️ Basic alerts | ✅ Comprehensive error handling |
| **Database** | ✅ Schema only | ✅ Full CRUD on all tables |
| **API Endpoints** | ⚠️ 10 endpoints | ✅ 25+ enterprise endpoints |
| **Security** | ✅ JWT auth | ✅ JWT + API keys + Audit logs |

## Last Updated
November 5, 2025 (Enterprise Transformation Complete)