# BuybidHQ System Architecture & Application Logic

## Overview

BuybidHQ is a vehicle bidding platform built on Supabase (PostgreSQL) with a React frontend. The system enables sellers to create bid requests for vehicles and buyers to submit offers through secure tokenized links sent via SMS.

---

## 1. Core Entities & Database Schema

### 1.1 Vehicles Table

**Table**: `vehicles`

**Primary Key**: `id` (UUID)

**Key Fields**:
- `year` (TEXT) - Vehicle year
- `make` (TEXT) - Vehicle manufacturer
- `model` (TEXT) - Vehicle model
- `trim` (TEXT) - Vehicle trim level
- `vin` (TEXT, optional) - 17-character VIN
- `mileage` (TEXT) - Vehicle mileage
- `engine` (TEXT) - Engine specifications
- `transmission` (TEXT) - Transmission type
- `drivetrain` (TEXT) - Drivetrain configuration
- `exterior` (TEXT) - Exterior color
- `interior` (TEXT) - Interior color
- `options` (TEXT) - Accessories and options
- `created_at` (TIMESTAMPTZ) - Record creation timestamp

**Relationships**:
- One-to-one with `reconditioning` (via `vehicle_id`)
- One-to-one with `vehicle_history` (via `vehicle_id`)
- One-to-many with `bid_requests` (via `vehicle_id`)

**Note**: Vehicles do not have a `status` or `current_offer_id` field. Status is managed at the `bid_requests` level.

---

### 1.2 Bid Requests Table

**Table**: `bid_requests`

**Primary Key**: `id` (UUID)

**Key Fields**:
- `user_id` (UUID, FK → `buybidhq_users.id`) - Seller who created the request
- `vehicle_id` (UUID, FK → `vehicles.id`) - Associated vehicle
- `recon` (UUID, FK → `reconditioning.id`) - Condition report reference
- `account_id` (UUID, FK → `accounts.id`) - Account ownership
- `status` (ENUM) - Request status: `'Pending'` | `'Active'` | `'Completed'` | `'Cancelled'` | `'Approved'`
- `created_at` (TIMESTAMPTZ) - Request creation timestamp

**Status Flow**:
- `Pending`: Newly created, not yet sent to buyers
- `Active`: Sent to buyers, accepting offers
- `Approved`: An offer has been accepted
- `Completed`: Transaction finalized
- `Cancelled`: Request cancelled by seller

**Relationships**:
- Many-to-one with `vehicles`
- Many-to-one with `reconditioning` (via `recon`)
- One-to-many with `bid_responses` (via `bid_request_id`)
- One-to-many with `images` (via `bid_request_id`)
- One-to-many with `bid_submission_tokens` (via `bid_request_id`)

**Note**: There is no `expires_at` field on `bid_requests`. Token expiration is managed separately in `bid_submission_tokens`.

---

### 1.3 Bid Responses (Offers) Table

**Table**: `bid_responses`

**Primary Key**: `id` (UUID)

**Key Fields**:
- `bid_request_id` (UUID, FK → `bid_requests.id`) - Associated bid request
- `buyer_id` (UUID, FK → `buyers.id`) - Buyer who submitted the offer
- `offer_amount` (NUMERIC) - Offer amount in dollars
- `status` (ENUM) - Response status: `'pending'` | `'accepted'` | `'declined'`
- `notes` (TEXT, optional) - Additional notes from buyer
- `created_at` (TIMESTAMPTZ) - Offer submission timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Status Values**:
- `pending`: Offer submitted, awaiting seller review
- `accepted`: Seller accepted this offer
- `declined`: Seller declined this offer

**Relationships**:
- Many-to-one with `bid_requests`
- Many-to-one with `buyers`

**Business Rules**:
- Multiple buyers can submit offers for the same bid request
- Only one offer per buyer per bid request (enforced by token validation)
- When an offer is accepted, all other offers for that bid request are automatically declined

---

### 1.4 Users (Buyers) Table

**Table**: `buyers`

**Primary Key**: `id` (UUID)

**Key Fields**:
- `user_id` (UUID, FK → `buybidhq_users.id`, optional) - Linked user account
- `account_id` (UUID, FK → `accounts.id`) - Account ownership
- `owner_user_id` (UUID, FK → `buybidhq_users.id`) - User who created this buyer record
- `buyer_name` (TEXT) - Buyer's full name
- `dealer_name` (TEXT, optional) - Dealership name
- `email` (TEXT) - Email address
- `buyer_mobile` (TEXT) - Mobile phone number
- `buyer_phone` (TEXT, optional) - Alternative phone number
- `address`, `city`, `state`, `zip_code` (TEXT) - Address fields
- `phone_validation_status` (ENUM) - `'valid'` | `'invalid'` | `'pending'`
- `standardized_phone` (TEXT) - Normalized phone format
- `phone_carrier` (TEXT) - Detected carrier
- `accepted_bids`, `pending_bids`, `declined_bids` (INTEGER) - Statistics
- `created_at`, `updated_at`, `last_validated_at` (TIMESTAMPTZ) - Timestamps

**Relationships**:
- Many-to-one with `buybidhq_users` (via `user_id` or `owner_user_id`)
- One-to-many with `bid_responses` (via `buyer_id`)

---

### 1.5 Condition Reports (Reconditioning) Table

**Table**: `reconditioning`

**Primary Key**: `id` (UUID)

**Key Fields**:
- `vehicle_id` (UUID, FK → `vehicles.id`) - Associated vehicle
- `windshield` (TEXT) - Windshield condition (e.g., 'clear', 'cracked', 'chipped')
- `engine_light` (TEXT) - Engine light status (e.g., 'none', 'on', 'flashing')
- `brakes` (TEXT) - Brake condition (e.g., 'acceptable', 'needs_replacement')
- `tires` (TEXT) - Tire condition (e.g., 'acceptable', 'needs_replacement')
- `maintenance` (TEXT) - Maintenance status (e.g., 'upToDate', 'overdue')
- `recon_estimate` (TEXT) - Estimated reconditioning cost (stored as text, displayed as currency)
- `recon_details` (TEXT) - Detailed reconditioning notes
- `history` (TEXT, optional) - Vehicle history report (e.g., 'clean', 'accident', 'salvage')
- `created_at` (TIMESTAMPTZ) - Record creation timestamp

**Relationships**:
- One-to-one with `vehicles` (via `vehicle_id`)
- Referenced by `bid_requests` (via `recon` field)

**Display Format**:
- Condition fields use categorical values that are formatted for display (e.g., "Clear" for 'clear', "Needs Replacement" for 'needs_replacement')
- `recon_estimate` is displayed as currency: `$${parseFloat(value).toLocaleString()}`
- `recon_details` is displayed as formatted text with line breaks

---

### 1.6 Additional Supporting Tables

#### Images Table
- **Table**: `images`
- **Key Fields**: `id`, `bid_request_id`, `image_url`, `sequence_order`, `created_at`
- **Purpose**: Stores vehicle images associated with bid requests
- **Storage**: Image URLs reference Supabase Storage or external CDN

#### Bid Submission Tokens Table
- **Table**: `bid_submission_tokens`
- **Key Fields**: 
  - `id` (UUID)
  - `bid_request_id` (UUID, FK)
  - `buyer_id` (UUID, FK)
  - `token` (TEXT) - Secure random hex token (64 characters)
  - `is_used` (BOOLEAN) - Whether token has been used
  - `expires_at` (TIMESTAMPTZ) - Token expiration (7 days from creation)
  - `used_at` (TIMESTAMPTZ, optional) - When token was used
- **Purpose**: Secure tokenized links for buyer bid submission
- **Unique Constraint**: `(bid_request_id, buyer_id)` - one token per buyer per request

#### Vehicle History Table
- **Table**: `vehicle_history`
- **Key Fields**: `vehicle_id`, `history_service` (TEXT), `autocheck_report`, `carfax_report`
- **Purpose**: Stores vehicle history reports and service provider

#### Book Values Table
- **Table**: `bookValues`
- **Key Fields**: `vehicle_id`, `kbb_wholesale`, `kbb_retail`, `jd_power_wholesale`, `jd_power_retail`, `mmr_wholesale`, `mmr_retail`, `auction_wholesale`, `auction_retail`, `condition`
- **Purpose**: Stores market valuation data from various sources

---

## 2. Offer Submission Logic

### 2.1 Frontend Submission Flow

**Entry Point**: Buyer clicks SMS link with format: `https://app.buybidhq.com/bid-response/{bid_request_id}?token={token}`

**Step 1: Token Validation & Data Retrieval**
- Frontend extracts `token` from URL query parameters
- Calls `get_public_bid_request_details(p_token)` RPC function
- Function validates token:
  - Checks `bid_submission_tokens` table for matching token
  - Verifies `is_used = false`
  - Verifies `expires_at > now()` (Note: Current implementation removed expiration check in some functions, but tokens still have `expires_at` field)
  - Returns vehicle details, condition report, images, book values, and existing bid (if any)

**Step 2: Display Bid Request Details**
- Vehicle information (year, make, model, trim, VIN, mileage, engine, transmission, drivetrain)
- Condition report (windshield, engine lights, brakes, tires, maintenance, recon estimate, recon details)
- Vehicle images (ordered by `sequence_order`)
- Book values (KBB, JD Power, MMR, Auction wholesale/retail)
- Vehicle history (history service, history status)
- If buyer already submitted a bid, shows existing offer amount and disables form

**Step 3: Form Validation**
- **Client-side validation**:
  - Offer amount is required
  - Offer amount must be a valid number
  - Offer amount must be > 0
  - Offer amount cannot exceed $999,999,999
  - Prevents submission if existing bid exists

**Step 4: Submit Offer**
- Frontend calls Edge Function: `submit-public-bid`
- Payload: `{ token: string, offerAmount: number }`

---

### 2.2 Backend Submission Process

**Edge Function**: `supabase/functions/submit-public-bid/index.ts`

**Step 1: Input Validation**
```typescript
- Validates token is provided
- Validates offerAmount is a number > 0
```

**Step 2: Token Validation**
- Calls `validate_bid_submission_token(p_token)` RPC function
- Function checks:
  - Token exists in `bid_submission_tokens`
  - `is_used = false`
  - `expires_at > now()`
  - Returns: `{ is_valid, bid_request_id, buyer_id, existing_bid_amount, has_existing_bid }`

**Step 3: Duplicate Bid Check**
- If `has_existing_bid = true`, returns error: "You have already submitted a bid of ${existing_bid_amount}"
- Prevents multiple submissions from same buyer

**Step 4: Database Insert**
- Inserts new record into `bid_responses`:
  ```sql
  INSERT INTO bid_responses (bid_request_id, buyer_id, offer_amount, status)
  VALUES (bid_request_id, buyer_id, offerAmount, 'pending')
  ```

**Step 5: Mark Token as Used**
- Updates `bid_submission_tokens`:
  ```sql
  UPDATE bid_submission_tokens
  SET is_used = true, used_at = NOW()
  WHERE token = p_token
  ```

**Step 6: Send Notifications**
- **Seller Notification**: SMS sent to bid request creator via `send-twilio-sms` function
  - Type: `bid_response`
  - Includes: vehicle details (year, make, model), buyer name, offer amount
- **Buyer Confirmation**: SMS sent to buyer
  - Type: `buyer_confirmation`
  - Includes: seller first name

**Step 7: Response**
- Returns: `{ success: true, bidResponseId: uuid }`

---

### 2.3 Validation Rules

**Business Validations**:
1. **Token Validity**: Token must exist, not be used, and not expired
2. **Duplicate Prevention**: One offer per buyer per bid request
3. **Amount Validation**: Offer must be > 0 and < $999,999,999
4. **Bid Request Status**: No explicit check for bid request status (can submit to any active request)

**Note**: There is no minimum bid amount validation or comparison with existing offers. Any positive amount is accepted.

---

## 3. Offer Expiration & Resolution Logic

### 3.1 Token Expiration

**Token Lifecycle**:
- **Creation**: When bid request is sent to buyers, tokens are generated with `expires_at = NOW() + 7 days`
- **Expiration Check**: Currently, the `get_public_bid_request_details` function does NOT check expiration (removed in migration `20250927145139`). However, `validate_bid_submission_token` still checks expiration.
- **Expiration Behavior**: 
  - Expired tokens cannot be used to submit new bids
  - Expired tokens may still allow viewing bid request details (depending on function used)

**Token Management**:
- Tokens are unique per `(bid_request_id, buyer_id)` combination
- If a new token is generated for the same buyer/request, it replaces the old token
- Once `is_used = true`, token cannot be reused

---

### 3.2 Bid Request Status Management

**Status Transitions**:

1. **Pending → Active**
   - When bid request is sent to buyers (tokens generated and SMS sent)

2. **Active → Approved**
   - When seller accepts an offer (via `useBidResponseMutation`)
   - Logic:
     ```typescript
     // Update accepted offer
     UPDATE bid_responses SET status = 'accepted' WHERE id = responseId
     
     // Decline all other offers for same bid request
     UPDATE bid_responses 
     SET status = 'declined' 
     WHERE bid_request_id = currentResponse.bid_request_id 
     AND id != responseId
     AND status != 'declined'
     
     // Update bid request status
     UPDATE bid_requests SET status = 'Approved' WHERE id = bid_request_id
     ```

3. **Approved → Completed**
   - Manual transition (seller marks transaction complete)

4. **Any Status → Cancelled**
   - Seller cancels the bid request

---

### 3.3 Winning Offer Determination

**Current Implementation**:
- **No automatic expiration-based resolution**: There is no cron job or scheduled task that automatically resolves offers when a time period expires
- **Manual Selection**: Seller manually reviews and accepts the best offer
- **First-Come-First-Served**: Not implemented - seller can accept any offer regardless of submission time

**When Offer is Accepted**:
1. Selected offer status → `'accepted'`
2. All other offers for same bid request → `'declined'`
3. Bid request status → `'Approved'`
4. No automatic notifications to declined buyers (current implementation)

---

### 3.4 Status Change Logic

**Bid Response Status Changes**:

| Action | Current Status | New Status | Notes |
|--------|---------------|------------|-------|
| Buyer submits offer | N/A | `pending` | Initial state |
| Seller accepts offer | `pending` | `accepted` | Triggers decline of all other offers |
| Seller declines offer | `pending` | `declined` | Manual action |
| Auto-decline (other offer accepted) | `pending` | `declined` | Automatic when another offer is accepted |

**Bid Request Status Changes**:

| Action | Current Status | New Status | Notes |
|--------|---------------|------------|-------|
| Create bid request | N/A | `Pending` | Initial state |
| Send to buyers | `Pending` | `Active` | When tokens generated and SMS sent |
| Accept offer | `Active` | `Approved` | When seller accepts an offer |
| Complete transaction | `Approved` | `Completed` | Manual finalization |
| Cancel request | Any | `Cancelled` | Seller cancellation |

---

## 4. Condition Report Integration

### 4.1 Data Structure

**Primary Table**: `reconditioning`

**Linkage**:
- `reconditioning.vehicle_id` → `vehicles.id` (one-to-one)
- `bid_requests.recon` → `reconditioning.id` (many-to-one)

**Data Points Displayed to Buyers**:

1. **Categorical Status Fields**:
   - `windshield`: 'clear' | 'cracked' | 'chipped' | 'needs_replacement'
   - `engine_light`: 'none' | 'on' | 'flashing'
   - `brakes`: 'acceptable' | 'needs_replacement' | 'needs_service'
   - `tires`: 'acceptable' | 'needs_replacement' | 'needs_rotation'
   - `maintenance`: 'upToDate' | 'overdue' | 'needs_service'

2. **Textual Fields**:
   - `recon_estimate`: Stored as TEXT, displayed as currency (e.g., "$1,500")
   - `recon_details`: Free-form text with line breaks, displayed in scrollable area

3. **History Fields** (from `vehicle_history`):
   - `history`: 'clean' | 'accident' | 'salvage' | 'flood' | etc.
   - `history_service`: Service provider name (e.g., "Carfax", "AutoCheck")

4. **Book Values Condition** (from `bookValues`):
   - `condition`: Condition rating used for valuation (e.g., "Excellent", "Good", "Fair")

---

### 4.2 Display Format

**Frontend Component**: `VehicleDetailsSection` / `VehicleCondition`

**Layout**:
- Grid display (2 columns on desktop, 1 on mobile)
- Each condition field shows:
  - Label (e.g., "Windshield")
  - Formatted value (e.g., "Clear" for 'clear', "Needs Replacement" for 'needs_replacement')
- `recon_estimate` displayed as: `$${parseFloat(value).toLocaleString()}`
- `recon_details` displayed in scrollable text area with preserved line breaks

**Formatting Function**: `getConditionDisplay(value, type)`
- Maps internal values to user-friendly display text
- Handles different condition types (windshield, engineLights, brakesTires, maintenance)

---

### 4.3 Image Association

**Storage**:
- Images stored in `images` table
- `image_url` field contains full URL (Supabase Storage or external CDN)
- `sequence_order` determines display order
- Images linked to `bid_request_id` (not directly to vehicle or condition report)

**Display**:
- Images retrieved via `get_public_bid_request_details` function
- Returned as JSON array: `[{ image_url, sequence_order }, ...]`
- Displayed in carousel/slider on bid response page
- Ordered by `sequence_order`, then `created_at`

---

## 5. User Interaction Flow (Backend Perspective)

### 5.1 SMS Link Click Flow

**Step 1: User Clicks SMS Link**
- URL format: `https://app.buybidhq.com/bid-response/{bid_request_id}?token={secure_token}`
- Token is 64-character hex string generated by `generate_bid_submission_token()` function

**Step 2: Frontend Token Extraction**
- React Router extracts `token` from `useSearchParams()`
- Extracts `bid_request_id` from URL path params

**Step 3: Token Validation & Data Retrieval**
- Frontend calls: `publicSupabase.rpc('get_public_bid_request_details', { p_token: token })`
- **Backend Function**: `get_public_bid_request_details(p_token text)`
  - Validates token exists in `bid_submission_tokens`
  - Checks `is_used = false` (Note: expiration check was removed in some migrations)
  - Verifies bid request exists
  - Returns comprehensive data:
    - Vehicle details (year, make, model, trim, VIN, mileage, engine, transmission, drivetrain, exterior, interior, options)
    - Condition report (windshield, engine_light, brakes, tires, maintenance, recon_estimate, recon_details)
    - Vehicle history (history, history_service)
    - Book values (KBB, JD Power, MMR, Auction wholesale/retail, condition)
    - Images (as JSON array)
    - Buyer information (name, dealership, mobile)
    - Existing bid (if any): `submitted_offer_amount`, `submitted_at`

**Step 4: Display Bid Request Page**
- Frontend renders `PublicBidResponse` component
- Shows vehicle details, condition report, images, book values
- If existing bid exists, shows submitted amount and disables form
- If no existing bid, shows offer submission form

---

### 5.2 Real-Time Updates

**Current Implementation**: **No real-time updates**

**Static Data**:
- Bid request details are fetched once on page load
- No WebSocket or polling for updates
- No live countdown timers
- No real-time offer count or highest offer display

**Refresh Behavior**:
- User must manually refresh page to see updates
- Token validation prevents viewing if token is used or expired

**Future Considerations**:
- Could implement Supabase Realtime subscriptions for:
  - New offers on same bid request
  - Status changes (accepted/declined)
  - Bid request status updates

---

### 5.3 Token Generation Flow

**Trigger**: When seller sends bid request to buyers

**Process**:
1. Seller selects buyers and submits bid request
2. For each selected buyer:
   - Frontend calls: `supabase.rpc('generate_bid_submission_token', { p_bid_request_id, p_buyer_id })`
3. **Backend Function**: `generate_bid_submission_token(p_bid_request_id uuid, p_buyer_id uuid)`
   - Generates 64-character hex token: `encode(gen_random_bytes(32), 'hex')`
   - Inserts or updates `bid_submission_tokens`:
     ```sql
     INSERT INTO bid_submission_tokens (bid_request_id, buyer_id, token, expires_at)
     VALUES (p_bid_request_id, p_buyer_id, v_token, NOW() + INTERVAL '7 days')
     ON CONFLICT (bid_request_id, buyer_id)
     DO UPDATE SET 
       token = v_token,
       is_used = false,
       expires_at = NOW() + INTERVAL '7 days',
       used_at = NULL
     ```
   - Returns token string
4. Frontend constructs URL: `${baseUrl}/bid-response/${bid_request_id}?token=${token}`
5. URL is sent to buyer via SMS using `send-twilio-sms` Edge Function

---

## 6. Database Functions & RPCs

### 6.1 Key Functions

**`validate_bid_submission_token(p_token text)`**
- Returns: `{ is_valid, bid_request_id, buyer_id, existing_bid_amount, has_existing_bid }`
- Validates token, checks expiration, returns existing bid if present

**`get_public_bid_request_details(p_token text)`**
- Returns comprehensive bid request data for public viewing
- Includes vehicle, condition, history, book values, images
- Security: Only returns data if token is valid and not used

**`generate_bid_submission_token(p_bid_request_id uuid, p_buyer_id uuid)`**
- Generates secure token for buyer bid submission
- Creates or updates token record with 7-day expiration

**`get_bid_notification_details(p_bid_response_id uuid)`**
- Returns seller notification data (phone, vehicle details, buyer name, offer amount)

**`get_buyer_confirmation_details(p_bid_response_id uuid)`**
- Returns buyer confirmation data (buyer phone, seller first name)

---

## 7. Security & Access Control

### 7.1 Row Level Security (RLS)

**Bid Submission Tokens**:
- Public cannot directly query `bid_submission_tokens` table
- Access only through RPC functions with `SECURITY DEFINER`
- Functions validate tokens server-side

**Bid Requests**:
- Users can only view bid requests they created or have access to
- Public access only through tokenized RPC functions

**Bid Responses**:
- Buyers can only see their own responses
- Sellers can see all responses for their bid requests

---

### 7.2 Token Security

**Token Characteristics**:
- 64-character hex string (256 bits of entropy)
- Generated using `gen_random_bytes(32)` (cryptographically secure)
- One-time use (marked as `is_used = true` after submission)
- 7-day expiration (though some functions don't enforce it)

**Validation**:
- Token must exist in database
- Token must not be used (`is_used = false`)
- Token must not be expired (`expires_at > now()`) - enforced in `validate_bid_submission_token`

---

## 8. Data Flow Summary

### 8.1 Bid Request Creation → Buyer Submission

```
1. Seller creates bid request
   ↓
2. Seller selects buyers
   ↓
3. System generates tokens (one per buyer)
   ↓
4. SMS sent with tokenized URLs
   ↓
5. Buyer clicks link
   ↓
6. Frontend validates token via RPC
   ↓
7. Display bid request details
   ↓
8. Buyer submits offer
   ↓
9. Edge function validates token & inserts bid_response
   ↓
10. Token marked as used
   ↓
11. Notifications sent (seller & buyer)
```

### 8.2 Offer Acceptance Flow

```
1. Seller reviews offers
   ↓
2. Seller accepts one offer
   ↓
3. System updates accepted offer status → 'accepted'
   ↓
4. System declines all other offers → 'declined'
   ↓
5. System updates bid_request status → 'Approved'
   ↓
6. (Optional) Notifications to declined buyers
```

---

## 9. Key Design Decisions

### 9.1 No Automatic Expiration Resolution
- **Decision**: No cron jobs or scheduled tasks to auto-resolve offers
- **Rationale**: Seller maintains control over offer selection
- **Trade-off**: Requires manual seller action

### 9.2 Token-Based Public Access
- **Decision**: Use secure tokens instead of user authentication for buyer access
- **Rationale**: Buyers may not have accounts; SMS links provide frictionless access
- **Trade-off**: Token management complexity, expiration handling

### 9.3 One Offer Per Buyer
- **Decision**: Enforce single offer per buyer per bid request
- **Rationale**: Prevents bid manipulation, simplifies seller review
- **Implementation**: Token validation checks for existing bids

### 9.4 Manual Offer Selection
- **Decision**: Seller manually selects winning offer (not highest-bid-wins)
- **Rationale**: Seller may consider factors beyond price (buyer reputation, terms, etc.)
- **Trade-off**: No automatic resolution, requires seller engagement

---

## 10. Future Enhancements

### Potential Improvements

1. **Automatic Expiration Resolution**
   - Scheduled job to auto-accept highest offer after expiration
   - Configurable expiration per bid request

2. **Real-Time Updates**
   - WebSocket subscriptions for live offer counts
   - Real-time status updates

3. **Bid Increments**
   - Minimum bid amount validation
   - Automatic outbid notifications

4. **Enhanced Notifications**
   - Email notifications in addition to SMS
   - Push notifications for mobile app

5. **Bid History**
   - Track bid revisions (if allowed)
   - Audit log of all status changes

---

## Appendix: Database Schema Diagram

```
accounts (1) ─── (n) buybidhq_users
    │
    └── (n) buyers
    │
    └── (n) bid_requests ─── (1) vehicles
                        │
                        ├── (1) reconditioning  
                        │
                        ├── (1) vehicle_history
                        │
                        ├── (n) images
                        │
                        ├── (n) bid_responses ─── (1) buyers
                        │
                        └── (n) bid_submission_tokens ─── (1) buyers

vehicles (1) ─── (0..1) bookValues
```

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Maintained By**: BuybidHQ Development Team
