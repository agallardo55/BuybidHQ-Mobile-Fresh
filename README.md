# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/9b7ce134-27b4-41b2-948d-4938fa315713

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/9b7ce134-27b4-41b2-948d-4938fa315713) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

# BuyBidHQ - Vehicle Bid Request Platform

BuyBidHQ is a comprehensive bid request application for auto dealers that enables them to send, manage, and track buy bids on used vehicles.

## Features

- **VIN Scanning & Decoding**: Manual entry or barcode scanning with API-based vehicle detail retrieval
- **Vehicle Listing & Condition Tracking**: Complete vehicle information and condition documentation
- **Bid Requests & Communication**: SMS and email-based bid request distribution via Twilio and Resend
- **Multi-User Role Management**: Role-based access control for different user types
- **Real-time Notifications**: Live updates on bid responses and status changes

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with semantic design tokens
- **UI Components**: shadcn/ui component library
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth with enhanced MFA support
- **Communication**: Twilio (SMS) + Resend (Email)
- **State Management**: TanStack Query for server state
- **Testing**: Vitest + Testing Library
- **Mobile**: React/Capacitor for mobile apps

## Architecture

### Frontend Architecture
- **Component-driven**: Modular, reusable React components
- **Type Safety**: Full TypeScript implementation with strict typing
- **Design System**: Semantic tokens and consistent styling
- **State Management**: Server state via TanStack Query, local state via React hooks
- **Route Protection**: Role-based access control with feature flags

### Backend Architecture  
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth with custom user profiles
- **Business Logic**: Supabase Edge Functions (Deno runtime)
- **File Storage**: Supabase Storage with access policies
- **Real-time**: Supabase Realtime for live updates

### Data Model
- **Multi-tenant**: Account-based data isolation
- **Role-based**: Flexible permission system
- **Audit Trail**: Comprehensive logging and tracking
- **Performance**: Optimized queries and caching

## User Roles

### Legacy System
- **Basic**: Free trial users (10 bids/month)
- **Individual**: Single-user dealers (unlimited bids)
- **Associate**: Employee accounts under dealer control
- **Dealer**: Dealership employees with management rights
- **Admin**: Dealership administrators
- **Super Admin**: System administrators

### New System (Account-based)
- **Member**: Basic account members
- **Manager**: Team managers (group plans only)
- **Account Admin**: Account administrators with billing access
- **Super Admin**: System administrators

## Development

### Prerequisites
- Node.js 18+ with npm
- Git for version control

### Setup
```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Run linting
npm run lint

# Build for production
npm run build
```

### Development Standards
- **TypeScript**: Strict mode enabled, no implicit any
- **ESLint**: Consistent code style and error catching
- **Prettier**: Automated code formatting
- **Testing**: Comprehensive test coverage with Vitest
- **Commits**: Conventional commit messages

### Key Directories
```
src/
├── components/          # Reusable UI components
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── contexts/           # React contexts (Auth, etc.)
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and helpers
├── __tests__/          # Test files
└── integrations/       # External service integrations

supabase/
├── functions/          # Edge Functions
└── migrations/         # Database migrations (read-only)
```

### Design System
- **Semantic Tokens**: Consistent color, spacing, and typography scales
- **Component Variants**: Flexible, reusable component patterns
- **Accessibility**: WCAG 2.1 AA compliance
- **Responsive**: Mobile-first design approach
- **Dark Mode**: Full dark mode support

### Testing Strategy
- **Unit Tests**: Component and hook testing
- **Integration Tests**: Multi-component interactions  
- **E2E Tests**: Critical user journeys
- **Performance Tests**: Bundle size and runtime performance

## Documentation

- [Data Model Documentation](docs/data-model.md) - Database schema and relationships
- [API Documentation](docs/api.md) - Edge Function APIs
- [Component Library](docs/components.md) - UI component documentation
- [Deployment Guide](docs/deployment.md) - Production deployment instructions

## Security

- **Row Level Security**: Database-level access control
- **Input Validation**: Client and server-side validation
- **HTTPS Only**: Secure communication channels
- **Rate Limiting**: API abuse prevention
- **Audit Logging**: Comprehensive security event tracking

## Performance

- **Code Splitting**: Lazy-loaded routes and components
- **Image Optimization**: Responsive images with proper sizing
- **Caching**: Strategic caching of API responses
- **Bundle Analysis**: Regular bundle size monitoring
- **Core Web Vitals**: Performance metrics tracking

## How can I deploy this project?

### Production Deployment (Netlify)

This application is hosted on **Netlify** for production deployment.

#### Deployment Configuration
- **Platform:** Netlify
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Node Version:** 18+
- **Auto-deploy:** Enabled (deploys from main branch)

#### Manual Deployment Steps
1. **Via Netlify Dashboard:**
   - Go to [netlify.com](https://netlify.com) and sign up/login
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub account
   - Select your `buybidhq-1` repository
   - Configure build settings (build command: `npm run build`, publish directory: `dist`)
   - Click "Deploy site"

2. **Via Netlify CLI:**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Deploy
   npm run build
   netlify deploy --prod --dir=dist
   ```

#### Environment Variables
All required environment variables are configured in the Netlify dashboard under Site settings → Environment variables.

#### Git Workflow for Deployments
This project follows a staging-first deployment workflow:

1. **Development & Testing:**
   ```bash
   # Make changes locally
   git add .
   git commit -m "your commit message"
   
   # Push to staging for review and testing
   git checkout staging
   git merge main
   git push origin staging
   ```

2. **Staging Deployment:**
   - Deploy staging branch to Netlify for testing
   - Verify all functionality works correctly
   - Test the deployed staging environment

3. **Production Deployment:**
   ```bash
   # After staging is tested and approved
   git checkout main
   git push origin main
   ```
   - Main branch auto-deploys to production
   - Always test staging before pushing to main

#### Alternative: Lovable Deployment
Simply open [Lovable](https://lovable.dev/projects/9b7ce134-27b4-41b2-948d-4938fa315713) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
