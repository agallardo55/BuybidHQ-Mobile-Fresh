# BuyBidHQ Data Model Documentation

This document outlines the core data models and database schema for the BuyBidHQ application.

## Overview

BuyBidHQ uses Supabase as its backend with PostgreSQL database. The data model is designed around vehicle bid requests, user management, and dealership operations.

## Core Entities

### Authentication & Users

#### `auth.users` (Supabase managed)
The base authentication table managed by Supabase Auth.

#### `buybidhq_users`
Extended user profile information:
- **Primary Key**: `id` (UUID, references auth.users.id)
- **Core Fields**: email, full_name, mobile_number, role, app_role, status
- **Address Fields**: address, city, state, zip_code
- **Phone Fields**: phone_validated, phone_carrier, phone_type, sms_consent
- **Relations**: dealership_id, account_id
- **Metadata**: created_at, updated_at, deleted_at, is_active

**Roles** (Legacy System):
- `basic`: Free tier users
- `individual`: Single-user dealers
- `dealer`: Dealership employees
- `associate`: Associate employees under dealer control
- `admin`: Dealership administrators
- `super_admin`: System administrators

**App Roles** (New System):
- `member`: Basic account members
- `manager`: Team managers (group plans only)
- `account_admin`: Account administrators
- `super_admin`: System administrators

### Account Management

#### `accounts`
Multi-tenant account structure:
- **Primary Key**: `id` (UUID)
- **Core Fields**: name, plan, seat_limit, feature_group_enabled
- **Billing**: stripe_customer_id, stripe_subscription_id, billing_status
- **Metadata**: created_at, updated_at

**Plan Types**:
- `free`: 10 bid requests/month, basic features
- `connect`: Unlimited bid requests, priority support
- `group`: Multi-user management, role-based permissions

#### `dealerships`
Dealership information:
- **Primary Key**: `id` (UUID)
- **Core Fields**: dealer_name, dealer_type, primary_user_id
- **Contact**: business_phone, business_email, website
- **Address**: address, city, state, zip_code
- **Legal**: license_number, dealer_id
- **Metadata**: is_active, created_at, last_updated_at, last_updated_by

**Dealer Types**:
- `individual`: Single-user operations
- `multi_user`: Multi-user dealerships

### Vehicle & Bid Management

#### `vehicles`
Vehicle information for bid requests:
- **Primary Key**: `id` (UUID)
- **Basic Info**: year, make, model, trim, vin, mileage
- **Technical**: engine, transmission, drivetrain
- **Appearance**: exterior, interior, options
- **Metadata**: created_at

#### `reconditioning`
Vehicle condition and reconditioning details:
- **Primary Key**: `id` (UUID)
- **Foreign Key**: vehicle_id
- **Condition Fields**: windshield, engine_light, brakes, tires, maintenance
- **Estimates**: recon_estimate, recon_details
- **Metadata**: created_at

#### `bid_requests`
Central bid request entity:
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: user_id, vehicle_id, recon, account_id
- **Status**: 'Pending' | 'Active' | 'Completed' | 'Cancelled'
- **Relations**: contacts, images_id
- **Metadata**: created_at

#### `bid_responses`
Responses to bid requests:
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: bid_request_id, buyer_id
- **Core Fields**: offer_amount, status, notes
- **Metadata**: created_at, updated_at

**Response Status**:
- `pending`: Awaiting review
- `accepted`: Offer accepted
- `declined`: Offer declined

### Buyer Management

#### `buyers`
Buyer/dealer contact information:
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: user_id, account_id, owner_user_id
- **Contact**: email, buyer_name, dealer_name, buyer_mobile, buyer_phone
- **Address**: address, city, state, zip_code
- **Phone Validation**: phone_validation_status, standardized_phone, phone_carrier
- **Statistics**: accepted_bids, pending_bids, declined_bids
- **Metadata**: created_at, updated_at, last_validated_at

### Media & Assets

#### `images`
Vehicle images for bid requests:
- **Primary Key**: `id` (UUID)
- **Foreign Key**: bid_request_id
- **Core Fields**: image_url, sequence_order
- **Metadata**: created_at

### Notifications & Communication

#### `notifications`
User notifications:
- **Primary Key**: `id` (UUID)
- **Foreign Key**: user_id
- **Core Fields**: type, content (JSONB), reference_id
- **Status**: read_at, cleared_at
- **Metadata**: created_at

**Notification Types**:
- `bid_response`: New bid received
- `bid_accepted`: Bid was accepted
- `bid_declined`: Bid was declined
- `system`: System notifications

### Security & Authentication

#### `mfa_settings`
Multi-factor authentication settings:
- **Primary Key**: `id` (UUID)
- **Foreign Key**: user_id
- **Core Fields**: method, status, trusted_devices (JSONB)
- **Metadata**: created_at, updated_at, last_verified

**MFA Methods**: `email` | `sms` | `totp`
**MFA Status**: `disabled` | `pending` | `enabled`

#### `mfa_verifications`
Temporary MFA verification codes:
- **Primary Key**: `id` (UUID)
- **Foreign Key**: user_id
- **Core Fields**: method, verification_code, expires_at, attempts
- **Status**: verified_at
- **Metadata**: created_at

### Billing & Usage

#### `subscriptions`
User subscription information:
- **Primary Key**: `id` (UUID)
- **Foreign Key**: user_id
- **Stripe**: stripe_customer_id, stripe_subscription_id
- **Billing**: current_period_end, trial_ends_at, billing_cycle_anchor
- **Status**: status, plan_type, is_trial
- **Metadata**: created_at, updated_at

#### `bid_usage`
Bid request usage tracking:
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: user_id, subscription_id, bid_request_id
- **Billing**: amount, billing_status, billed_at, stripe_invoice_item_id
- **Metadata**: created_at

### Access Control & Caching

#### `user_role_cache`
Cached user role information for performance:
- **Primary Key**: user_id (UUID)
- **Core Fields**: is_admin
- **Metadata**: cached_at

#### `bid_request_access`
Bid request access control:
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: user_id, bid_request_id
- **Core Fields**: access_level
- **Metadata**: created_at

#### `buyers_access_cache`
Buyer access control cache:
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: user_id, buyer_id
- **Core Fields**: access_level
- **Metadata**: last_updated

## Row Level Security (RLS)

All tables implement Row Level Security policies to ensure data isolation and security:

### Account-based Access
- Users can only access data within their account
- Account admins have broader access within their account
- Super admins have system-wide access

### Role-based Access
- Different roles have different permissions
- Permissions are enforced at the database level
- Feature flags can disable role checks in development

### Resource Ownership
- Users can manage their own resources
- Managers can manage resources they own (group plans)
- Account admins can manage all account resources

## Database Functions

Key database functions for business logic:

- `current_user_role()`: Get current user's role
- `current_user_account_id()`: Get current user's account
- `can_access_bid_request()`: Check bid request access
- `can_create_bid_request()`: Check bid request limits
- `is_admin()`: Check admin status
- `standardize_phone_number()`: Normalize phone formats

## Indexes and Performance

Critical indexes for performance:
- User lookups: email, role, account_id
- Bid requests: user_id, account_id, status, created_at
- Buyers: user_id, account_id, owner_user_id
- Phone validation: mobile_number, standardized_phone

## Data Relationships

```
accounts (1) ─── (n) buybidhq_users
    │
    └── (n) buyers
    │
    └── (n) bid_requests ─── (1) vehicles
                        │
                        ├── (1) reconditioning  
                        │
                        ├── (n) images
                        │
                        └── (n) bid_responses ─── (1) buyers

buybidhq_users (1) ─── (n) dealerships
               │
               ├── (n) mfa_settings
               │
               ├── (n) subscriptions
               │
               └── (n) notifications
```

## Future Enhancements

### Planned Schema Changes
1. **Enhanced MFA**: Add TOTP support, backup codes
2. **Audit Logging**: Track all data changes
3. **File Attachments**: Support documents and reports
4. **Analytics**: Usage and performance metrics
5. **Multi-language**: Support for internationalization

### Migration Strategy
- Use Supabase migrations for schema changes
- Maintain backward compatibility
- Implement gradual rollout for major changes
- Test migrations thoroughly in staging

## Best Practices

### Type Safety
- Use TypeScript interfaces that match database schema
- Generate types from Supabase schema
- Validate data at boundaries

### Performance
- Use appropriate indexes
- Implement pagination for large datasets
- Cache frequently accessed reference data
- Monitor query performance

### Security
- Always use RLS policies
- Validate input at multiple layers
- Use security definer functions carefully
- Regular security audits

### Data Integrity
- Use foreign key constraints
- Implement proper validation
- Handle soft deletes appropriately
- Maintain referential integrity