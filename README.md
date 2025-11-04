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
- **GitHub**: https://github.com/username/creatorflow-studio (configure in deployment)
- **API Endpoint**: https://creatorflow-studio.pages.dev/api

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
- `GET /api/auth/me` - Get current user

### Integration Endpoints
- `GET /api/integrations` - List user integrations
- `POST /api/integrations` - Create new integration
- `DELETE /api/integrations/:id` - Remove integration

### Workflow Endpoints
- `GET /api/workflows` - List workflows
- `POST /api/workflows` - Create workflow
- `POST /api/workflows/:id/run` - Execute workflow

### Admin Endpoints (Admin Only)
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id` - Update user details

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

### ✅ Completed Features
- User authentication system with JWT
- Role-based access control (User/Admin/Super Admin)
- Dark/Light theme toggle with persistence
- Integration management system
- Workflow creation and execution
- Admin dashboard with user management
- Analytics and metrics tracking
- Responsive design for all screen sizes
- Database schema with full relationships
- API endpoints for all operations

### 🚧 Features In Progress
- Real-time workflow execution monitoring
- Advanced workflow builder UI
- Integration testing interface
- Email notifications
- Webhook support

### 📋 Planned Features
- Stripe payment integration
- Advanced analytics charts
- Workflow templates library
- Team collaboration features
- API rate limiting
- Export/Import workflows
- Mobile app (React Native)
- Multi-language support

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

## Last Updated
November 4, 2025