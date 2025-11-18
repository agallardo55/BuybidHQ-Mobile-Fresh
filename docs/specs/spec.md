# BuybidHQ Functional Specification

## 1. Project Vision & Overview

### Business Summary
**BuybidHQ** is a Vite + React platform that helps automotive teams streamline vehicle buy-bid workflows, connect buyers and sellers, and surface competitive offers in one place.

### Primary Objective
Manage and optimize the end-to-end bid lifecycle—from capturing leads on the marketing site to coordinating bid requests, responses, and analytics inside the authenticated dashboard.

### Target Audience
- Dealership owners and managers
- Buyer network coordinators  
- Internal operations teams
- Wholesale and retail vehicle purchasing teams

### Success Metrics
- Growth in waitlist sign-ups captured in Supabase
- Faster response/acceptance cycles on bid requests
- Increased engagement with buyer/dealership management features
- Completed CRUD actions and sorted views usage

---

## 2. User Experience & Workflows

### Core User Stories

#### Dealer Creates Bid Request
**As a dealer**, I want to create bid requests efficiently so I can get competitive offers quickly.
- **Acceptance Criteria:**
  - Can input or scan VIN to auto-populate vehicle details
  - Upload up to 20 vehicle images with compression
  - Select multiple buyers from my network
  - Add condition notes and reconditioning details
  - Send via SMS and/or Email with tracking
- **Error Scenarios:**
  - Invalid VIN shows clear error message
  - Failed SMS/Email delivery shows retry option
  - Image upload failures show progress and allow retry

#### Buyer Responds to Bid
**As a buyer**, I want to submit competitive bids quickly via mobile-friendly interface.
- **Acceptance Criteria:**
  - Token-validated access (no login required)
  - View all vehicle details and images
  - Submit bid with optional notes
  - Receive confirmation of submission
- **Error Scenarios:**
  - Expired tokens show clear message
  - Duplicate submissions are prevented
  - Network failures allow retry

#### Multi-User Dealership Management
**As a dealership admin**, I want to manage my team's access and permissions.
- **Acceptance Criteria:**
  - Create associate and dealer user accounts
  - Assign role-based permissions
  - View team activity and bid history
  - Manage dealership buyer network

### Key User Flows
1. **Marketing → Waitlist → Sign Up → Dashboard**
2. **VIN Entry → Vehicle Details → Buyer Selection → Send Bids**
3. **SMS/Email → Bid Response → Confirmation**
4. **Buyer Management → CRUD Operations → Network Building**

---

## 3. Feature Specifications

### VIN Scanning & Decoding
- **Status:** ✅ Implemented
- **Implementation:**
  - Manual VIN entry with real-time validation
  - Barcode scanning via @zxing/library
  - NHTSA + Car API integration for vehicle details
  - Auto-population of make, model, year, trim, engine
- **Acceptance Criteria:**
  - 17-character VIN validation
  - Error handling for invalid/unknown VINs
  - Fallback to manual entry when API fails
  - Trim selection when multiple options available

### Multi-Factor Authentication
- **Status:** 🚧 In Development (TODO)
- **Requirements:**
  - 6-digit PIN via SMS/Email
  - 5-minute expiration with visual countdown
  - 3 attempt limit with 15-minute cooldown
  - Trusted device memory (30 days)
  - Admin enforcement per dealership
- **Implementation Notes:**
  - Use Supabase Edge Functions for SMS/Email delivery
  - Store MFA preferences in user profiles
  - Integrate with existing auth flow

### Bid Request Lifecycle
- **Status:** ✅ Implemented
- **States:** Draft → Sent → Responded → Accepted/Declined → Closed
- **Features:**
  - Multi-step form with progress tracking
  - Image upload with browser-image-compression
  - Buyer selection with search/filter
  - SMS/Email delivery via Twilio/Resend
  - Response tracking and status updates

### Role-Based Access Control
- **Status:** ✅ Implemented via RLS
- **Permission Matrix:**

| Feature | Basic | Individual | Associate | Dealer | Admin | Super Admin |
|---------|-------|------------|-----------|--------|--------|-------------|
| Create Bid Request | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Own Bids | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Team Bids | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Manage Own Buyers | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage All Buyers | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| User Management | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Dealership Settings | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| System Administration | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 4. Pages & Content Architecture

### Public Pages
- **Home/Marketing:** Hero, how-it-works, features, pricing, contact, app download
- **Authentication:** Sign In, Sign Up (3-step wizard), Password Reset, MFA Challenge
- **Bid Response:** Token-validated public bid submission forms

### Authenticated Dashboard
- **Dashboard:** Search, sort, paginate bid requests with status tracking
- **Create Bid Request:** Multi-step form (VIN → Details → Buyers → Send)
- **Buyers:** CRUD operations with search/filter/pagination
- **Dealerships:** Management interface for admins
- **Users:** Team management for dealership admins
- **Account:** Profile, subscription, security settings

### Error Handling
- **404 Not Found:** Branded error page with navigation
- **Token Errors:** Clear messaging for expired/invalid bid tokens
- **Network Errors:** Retry mechanisms with user feedback

---

## 5. API Contracts & Integration Requirements

### Supabase Edge Functions

#### Bid Management
```typescript
// POST /submit-bid-request
interface BidRequestPayload {
  vehicleDetails: VehicleDetails;
  buyerIds: string[];
  images: string[];
  notes?: string;
  communicationMethod: 'sms' | 'email' | 'both';
}

// GET /bid-responses/{id}
interface BidResponse {
  id: string;
  bidRequestId: string;
  buyerId: string;
  amount: number;
  notes?: string;
  submittedAt: string;
}
```

#### Communication Services
```typescript
// POST /send-twilio-sms
interface SMSPayload {
  to: string;
  message: string;
  bidRequestId: string;
}

// POST /send-bid-email  
interface EmailPayload {
  to: string;
  subject: string;
  bidRequestId: string;
  vehicleDetails: VehicleDetails;
}
```

#### Authentication & Security
```typescript
// POST /verify-mfa-challenge
interface MFAChallenge {
  userId: string;
  code: string;
  method: 'sms' | 'email';
}
```

### Third-Party Integrations

#### Twilio SMS
- **Requirements:**
  - Phone number validation and formatting
  - Delivery status webhooks
  - Rate limiting (1 req/sec per number)
  - Carrier detection for optimization

#### Resend Email
- **Requirements:**
  - Template management for bid notifications
  - Delivery and bounce tracking
  - Unsubscribe handling
  - DKIM authentication

#### Stripe Billing
- **Requirements:**
  - Subscription lifecycle management
  - Usage-based billing for SMS/Email
  - Plan upgrade/downgrade workflows
  - Payment failure handling

---

## 6. Design System & UI/UX Standards

### Brand Guidelines
- **Primary Color:** Cobalt/Indigo (#325AE7 / hsl(225, 73%, 57%))
- **Style:** Modern, high-contrast SaaS aesthetic
- **Typography:** Inter-style sans-serif via Tailwind system fonts
- **Visual Treatment:** Bold hero imagery, gradients in cobalt spectrum

### Component Specifications
- **Design Tokens:** Use semantic tokens from index.css (--primary, --secondary, etc.)
- **Color Usage:** All colors must be HSL format, no direct color values
- **Responsive:** Mobile-first design with consistent breakpoints
- **Accessibility:** WCAG 2.1 AA compliance mandatory

### UI Patterns
- **Forms:** Multi-step with progress indicators and validation
- **Tables:** Search, sort, filter with pagination controls
- **Modals:** Consistent dialog patterns for CRUD operations
- **Navigation:** Responsive with mobile drawer/desktop sidebar
- **Loading States:** Skeleton screens and progress indicators

---

## 7. Technical Architecture & Stack

### Core Technologies
```json
{
  "frontend": ["Vite", "React 18", "TypeScript", "Tailwind CSS"],
  "ui": ["shadcn/ui", "Radix UI primitives"],
  "backend": ["Supabase", "PostgreSQL", "Row Level Security"],
  "state": ["TanStack Query", "React Hook Form"],
  "routing": ["React Router v6"],
  "testing": ["Vitest", "@testing-library/react"],
  "deployment": ["Lovable", "Netlify/Vercel (secondary)"]
}
```

### Database Design Principles
- **RLS Enforcement:** All tables have Row Level Security enabled
- **Audit Trails:** Track created_at, updated_at, and user actions
- **Soft Deletes:** Use deleted_at instead of hard deletes
- **Relationship Integrity:** Foreign key constraints with proper cascading

### Development Guardrails
- **Do NOT:** Replace React/Vite/Tailwind/shadcn stack
- **Do NOT:** Bypass Supabase for data/auth operations
- **Do NOT:** Use heavy dependencies that bloat bundle size
- **Do NOT:** Use direct color values (always use design tokens)
- **Do NOT:** Implement custom auth (use Supabase Auth)

---

## 8. Quality Standards & Acceptance Criteria

### Performance Benchmarks
- **Core Web Vitals:**
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1
- **Bundle Size:** Main chunk < 500KB gzipped
- **API Response:** < 1s for standard queries

### Testing Requirements
- **Unit Tests:** >80% coverage for hooks and utilities
- **Integration Tests:** Critical user flows (signup, bid creation, submission)
- **E2E Tests:** Smoke tests for core functionality
- **Accessibility Tests:** Automated a11y checks in CI/CD

### Security Standards
- **Input Validation:** Client-side and server-side validation
- **SQL Injection:** Parameterized queries and RLS policies
- **XSS Prevention:** Content Security Policy headers
- **Rate Limiting:** API endpoints and form submissions
- **Audit Logging:** Track sensitive operations (user creation, permissions)

### Browser Support
- **Modern Browsers:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile:** iOS Safari 14+, Chrome Mobile 90+
- **Fallbacks:** Graceful degradation for older browsers

---

## 9. Implementation Roadmap

### Phase 1: MVP (Current Status)
- ✅ Marketing site with waitlist
- ✅ Authentication and user management
- ✅ Basic bid request creation
- ✅ Buyer/dealership management
- ✅ SMS/Email bid delivery

### Phase 2: Enhanced Features (TODO)
- 🚧 Multi-Factor Authentication
- 🚧 Advanced analytics dashboard
- 🚧 Mobile app (React/Capacitor)
- 🚧 Bulk operations for buyers
- 🚧 Advanced search and filtering

### Phase 3: Scale & Optimize
- 📋 Real-time notifications
- 📋 Advanced reporting
- 📋 API for third-party integrations
- 📋 White-label solutions

### Feature Flags Strategy
```typescript
// src/config/features.ts
export const features = {
  mfaEnabled: false,
  advancedAnalytics: false,
  bulkOperations: false,
  realtimeNotifications: false
}
```

---

## 10. Compliance & Business Rules

### Data Privacy & GDPR
- **User Consent:** Cookie consent and privacy policy acceptance
- **Data Retention:** Automatic cleanup of expired bid tokens
- **Right to Delete:** Soft delete user accounts with data anonymization
- **Data Export:** User data export functionality

### Business Logic Rules
- **Bid Expiration:** Default 7-day expiration, configurable per request
- **User Limits:** Free tier limits (5 active bids, 10 buyers)
- **Image Limits:** Max 20 images per bid request, 10MB total
- **Communication Limits:** Rate limiting to prevent spam

### Error Handling Standards
- **User-Facing Errors:** Clear, actionable error messages
- **System Errors:** Logged to Supabase with context
- **Fallback Behavior:** Graceful degradation when services fail
- **Retry Logic:** Exponential backoff for failed API calls

---

## 11. Integration Specifications

### VIN Decoding APIs
- **Primary:** NHTSA vPIC API (free, rate-limited)
- **Secondary:** Car API (paid, comprehensive)
- **Fallback:** Manual entry with validation
- **Caching:** Store successful lookups to reduce API calls

### Communication Delivery
- **SMS Priority:** Twilio for US/CA, Knock for international
- **Email Priority:** Resend for transactional, SendGrid for marketing
- **Delivery Tracking:** Webhook handling for status updates
- **Retry Logic:** 3 attempts with exponential backoff

### Payment Processing
- **Provider:** Stripe for subscription management
- **Webhooks:** Handle subscription lifecycle events
- **Usage Tracking:** SMS/Email usage for billing
- **Security:** PCI compliance via Stripe Elements

---

This specification serves as the single source of truth for BuybidHQ development, bridging business requirements with technical implementation. It should be referenced for all feature development, updated as requirements evolve, and used as the foundation for acceptance criteria and quality gates.