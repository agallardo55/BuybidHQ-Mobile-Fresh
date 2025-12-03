# Appraisal Components Integration Specification

**Version:** 1.0  
**Date:** December 1, 2025  
**Status:** Ready for Implementation  

---

## Executive Summary

This specification outlines the changes required to fully integrate appraisal components from the bid request form into the database and display them on the bid response page. Currently, several form fields are captured but not persisted or displayed to buyers.

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Scope of Changes](#2-scope-of-changes)
3. [Database Schema Changes](#3-database-schema-changes)
4. [Frontend Changes - Bid Request Form](#4-frontend-changes---bid-request-form)
5. [Frontend Changes - Bid Response Page](#5-frontend-changes---bid-response-page)
6. [RPC Function Updates](#6-rpc-function-updates)
7. [Implementation Phases](#7-implementation-phases)
8. [Files Affected](#8-files-affected)
9. [Testing Checklist](#9-testing-checklist)
10. [Rollback Plan](#10-rollback-plan)

---

## 1. Problem Statement

### Current State

The bid request form captures several appraisal-related fields that are **not being saved to the database** or **not displayed on the buyer-facing bid response page**:

| Field | Form Captures | Database Stores | Buyer Sees |
|-------|--------------|-----------------|------------|
| Vehicle History Status | ✅ Yes | ❌ No | ❌ No |
| History Report Service (AutoCheck/CarFax) | ✅ Yes (local state) | ❌ No | ❌ No |
| Book Values Condition | ✅ Yes | ❌ No | ⚠️ Shows "Not specified" |
| Brakes (4 quadrants) | ✅ Yes | ✅ Yes (as string) | ❌ Shows old format |
| Tires (4 quadrants) | ✅ Yes | ✅ Yes (as string) | ❌ Shows old format |

### Desired State

All captured appraisal data flows through:
1. **Form** → captures data correctly ✅
2. **Database** → stores data properly
3. **Bid Response Page** → displays data to buyers with proper formatting

---

## 2. Scope of Changes

### In Scope

- Add `history` column to `reconditioning` table
- Add `history_service` and `history_status` columns to `vehicle_history` table
- Add `condition` column to `bookValues` table
- Lift `selectedHistoryService` from local state to form state
- Update submission logic to save new fields
- Update `get_public_bid_request_details` RPC to return new fields
- Add History/Report rows to Vehicle Condition card on bid response page
- Create new `BrakesAndTiresDisplay` component with 2x2 grid layout
- Fix Book Values condition display

### Out of Scope

- AutoCheck/CarFax API integrations
- Editing existing bid requests
- Changes to Marketplace view

---

## 3. Database Schema Changes

### 3.1 Add `history` Column to `reconditioning` Table

```sql
-- Migration: YYYYMMDDHHMMSS_add_history_to_reconditioning.sql

-- Add history column to reconditioning table
ALTER TABLE public.reconditioning
ADD COLUMN IF NOT EXISTS history TEXT DEFAULT 'unknown';

-- Add constraint for valid values
ALTER TABLE public.reconditioning
ADD CONSTRAINT reconditioning_history_check 
CHECK (history IN (
  'noAccidents', 
  'minorAccident', 
  'odomError', 
  'majorAccident', 
  'brandedIssue', 
  'unknown'
));

COMMENT ON COLUMN public.reconditioning.history IS 
'Vehicle accident/title history status from seller appraisal';
```

### 3.2 Update `vehicle_history` Table

```sql
-- Migration: YYYYMMDDHHMMSS_add_history_service_to_vehicle_history.sql

-- Add history_service column
ALTER TABLE public.vehicle_history
ADD COLUMN IF NOT EXISTS history_service TEXT;

-- Add constraint for valid values
ALTER TABLE public.vehicle_history
ADD CONSTRAINT vehicle_history_service_check 
CHECK (history_service IS NULL OR history_service IN ('AutoCheck', 'CarFax'));

COMMENT ON COLUMN public.vehicle_history.history_service IS 
'Selected vehicle history report provider (AutoCheck or CarFax)';
```

### 3.3 Add `condition` Column to `bookValues` Table

```sql
-- Migration: YYYYMMDDHHMMSS_add_condition_to_bookvalues.sql

-- Add condition column to bookValues table
ALTER TABLE public."bookValues"
ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'good';

-- Add constraint for valid values
ALTER TABLE public."bookValues"
ADD CONSTRAINT book_values_condition_check 
CHECK (condition IN ('excellent', 'veryGood', 'good', 'fair'));

COMMENT ON COLUMN public."bookValues".condition IS 
'Vehicle condition used for book value lookup: excellent, veryGood, good, fair';
```

### 3.4 RLS Policies

```sql
-- Ensure authenticated users can insert/update vehicle_history
CREATE POLICY "Users can insert vehicle history for their vehicles"
ON public.vehicle_history
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM vehicles v
    JOIN bid_requests br ON br.vehicle_id = v.id
    WHERE v.id = vehicle_history.vehicle_id
    AND br.user_id = auth.uid()
  )
);
```

---

## 4. Frontend Changes - Bid Request Form

### 4.1 Type Updates

**File:** `src/components/bid-request/types.ts`

```typescript
export interface BidRequestFormData {
  // ... existing fields ...
  history: string;           // Already exists
  historyService: string;    // NEW: 'AutoCheck' | 'CarFax' | ''
  bookValuesCondition: string; // Already exists, now will be persisted
}
```

### 4.2 Form State Updates

**File:** `src/components/bid-request/hooks/useFormState.ts`

Add `historyService` to initial form data:

```typescript
const initialFormData: BidRequestFormData = {
  // ... existing fields ...
  history: '',
  historyService: '',  // NEW
  bookValuesCondition: 'good',
};
```

### 4.3 VehicleCondition Component Updates

**File:** `src/components/bid-request/VehicleCondition.tsx`

**Current:** `selectedHistoryService` is local state (line 62)
```typescript
const [selectedHistoryService, setSelectedHistoryService] = useState<string | null>(null);
```

**After:** Remove local state, use form data via props

```typescript
// Props interface update
interface VehicleConditionProps {
  formData: {
    // ... existing fields ...
    history?: string;
    historyService?: string;  // NEW
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (value: string, name: string) => void;
}

// Use formData.historyService instead of local state
const handleIntegrationClick = (service: string) => {
  const newValue = formData.historyService === service ? '' : service;
  onSelectChange(newValue, 'historyService');
};
```

### 4.4 Submission Logic Updates

**File:** `src/components/bid-request/hooks/useBidRequestSubmission.ts`

```typescript
// Update reconData to include history
const reconData = {
  windshield: formData.windshield || 'notSpecified',
  engine_light: formData.engineLights || 'notSpecified',
  brakes: formData.brakes || 'notSpecified',
  tires: formData.tire || 'notSpecified',
  maintenance: formData.maintenance || 'notSpecified',
  recon_estimate: extractNumericValue(formData.reconEstimate),
  recon_details: formData.reconDetails || 'No additional details',
  history: formData.history || 'unknown'  // NEW
};

// After bid request creation, save vehicle history if service selected
if (formData.historyService) {
  const { error: historyError } = await supabase
    .from('vehicle_history')
    .insert({
      vehicle_id: bidRequest.vehicle_id,
      history_service: formData.historyService
    });
    
  if (historyError) {
    console.error(`[${requestId}] Error saving vehicle history:`, historyError);
    // Don't throw - this is optional data
  }
}

// Update book values insert to include condition
const { error: bookValuesError } = await supabase
  .from('bookValues')
  .insert({
    vehicle_id: bidRequest.vehicle_id,
    condition: formData.bookValuesCondition || 'good',  // NEW
    mmr_wholesale: formData.mmrWholesale ? parseFloat(extractNumericValue(formData.mmrWholesale)) : null,
    // ... rest of fields
  });
```

---

## 5. Frontend Changes - Bid Response Page

### 5.1 Update QuickBidDetails Interface

**File:** `src/components/PublicBidResponse.tsx`

```typescript
interface QuickBidDetails {
  // ... existing fields ...
  history?: string;           // NEW
  history_service?: string;   // NEW
  book_values_condition?: string;  // NEW
}
```

### 5.2 Update VehicleDetails Type

**File:** `src/components/bid-response/types.ts`

```typescript
export interface VehicleDetails extends Vehicle {
  // ... existing fields ...
  history?: string;
  historyService?: string;
  bookValuesCondition?: string;
}
```

### 5.3 Add History Display to VehicleDetailsSection

**File:** `src/components/bid-response/VehicleDetailsSection.tsx`

Add new utility function and rows:

```typescript
// Add to imports
import { getHistoryDisplay } from './utils/historyFormatting';

// Add after existing condition rows (after Maintenance, before Recon Est.)
{vehicle.history && vehicle.history !== 'unknown' && (
  <>
    <Separator />
    <div className="grid grid-cols-5 gap-1.5 py-2">
      <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">History :</p>
      <p className="col-span-3 text-base lg:text-base text-lg font-normal">
        {getHistoryDisplay(vehicle.history)}
      </p>
    </div>
  </>
)}
{vehicle.historyService && (
  <>
    <Separator />
    <div className="grid grid-cols-5 gap-1.5 py-2">
      <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">Report :</p>
      <p className="col-span-3 text-base lg:text-base text-lg font-normal">
        {vehicle.historyService}
      </p>
    </div>
  </>
)}
```

**Remove:** The Brakes and Tires rows from Vehicle Condition card (lines 212-218, 220-226)

### 5.4 Create History Formatting Utility

**File:** `src/components/bid-response/utils/historyFormatting.ts` (NEW)

```typescript
const historyDisplayMap: Record<string, string> = {
  noAccidents: 'No Accidents',
  minorAccident: 'Minor Accident',
  odomError: 'Odometer Discrepancy',
  majorAccident: 'Major Accident',
  brandedIssue: 'Branded Title',
  unknown: 'Unknown'
};

export const getHistoryDisplay = (value: string | undefined): string => {
  if (!value) return 'Not Specified';
  return historyDisplayMap[value] || value;
};
```

### 5.5 Create BrakesAndTiresDisplay Component

**File:** `src/components/bid-response/BrakesAndTiresDisplay.tsx` (NEW)

```typescript
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getRangeFromMeasurement } from "@/components/bid-request/utils/measurementUtils";

interface QuadrantData {
  frontLeft: number | null;
  frontRight: number | null;
  rearLeft: number | null;
  rearRight: number | null;
}

interface BrakesAndTiresDisplayProps {
  brakes: string;
  tires: string;
}

// Parse quadrant string format: "frontLeft:8,frontRight:8,rearLeft:6,rearRight:6"
const parseQuadrantString = (value: string): QuadrantData => {
  const defaultData: QuadrantData = { 
    frontLeft: null, 
    frontRight: null, 
    rearLeft: null, 
    rearRight: null 
  };
  
  if (!value || value === 'notSpecified') return defaultData;
  
  value.split(',').forEach(part => {
    const [position, val] = part.split(':');
    if (position && val && position in defaultData) {
      (defaultData as any)[position] = parseFloat(val);
    }
  });
  
  return defaultData;
};

// Color chip component
const StatusChip = ({ value, type }: { value: number | null; type: 'brake' | 'tire' }) => {
  const range = getRangeFromMeasurement(value, type);
  
  if (!range) {
    return (
      <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-400 text-sm font-medium">
        N/A
      </span>
    );
  }

  const colorClasses: Record<string, string> = {
    green: "bg-green-100 text-green-700 border-green-300",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-300",
    orange: "bg-orange-100 text-orange-700 border-orange-300",
    red: "bg-red-100 text-red-700 border-red-300",
  };

  const unit = type === 'brake' ? 'mm' : '/32"';
  
  return (
    <span className={cn(
      "px-4 py-2 rounded-full border text-sm font-medium",
      colorClasses[range.color || 'green']
    )}>
      {range.displayText}{unit}
    </span>
  );
};

// 2x2 Grid component for a measurement type
const MeasurementGrid = ({ 
  title, 
  data, 
  type 
}: { 
  title: string; 
  data: QuadrantData; 
  type: 'brake' | 'tire';
}) => (
  <div className="space-y-2">
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Top row: Front Left | Front Right */}
      <div className="grid grid-cols-2 divide-x divide-gray-200">
        <div className="p-4 flex flex-col items-center justify-center gap-2 bg-gray-50">
          <StatusChip value={data.frontLeft} type={type} />
          <span className="text-xs text-gray-500">Front Left</span>
        </div>
        <div className="p-4 flex flex-col items-center justify-center gap-2 bg-gray-50">
          <StatusChip value={data.frontRight} type={type} />
          <span className="text-xs text-gray-500">Front Right</span>
        </div>
      </div>
      {/* Horizontal divider */}
      <div className="border-t border-gray-200" />
      {/* Bottom row: Rear Left | Rear Right */}
      <div className="grid grid-cols-2 divide-x divide-gray-200">
        <div className="p-4 flex flex-col items-center justify-center gap-2 bg-gray-50">
          <StatusChip value={data.rearLeft} type={type} />
          <span className="text-xs text-gray-500">Rear Left</span>
        </div>
        <div className="p-4 flex flex-col items-center justify-center gap-2 bg-gray-50">
          <StatusChip value={data.rearRight} type={type} />
          <span className="text-xs text-gray-500">Rear Right</span>
        </div>
      </div>
    </div>
  </div>
);

// Main component
const BrakesAndTiresDisplay = ({ brakes, tires }: BrakesAndTiresDisplayProps) => {
  const brakesData = parseQuadrantString(brakes);
  const tiresData = parseQuadrantString(tires);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">Brakes & Tires</CardTitle>
      </CardHeader>
      <Separator className="mb-6" />
      <CardContent className="space-y-6">
        <MeasurementGrid title="Brakes" data={brakesData} type="brake" />
        <MeasurementGrid title="Tires" data={tiresData} type="tire" />
      </CardContent>
    </Card>
  );
};

export default BrakesAndTiresDisplay;
```

### 5.6 Update VehicleDetailsSection to Use New Component

**File:** `src/components/bid-response/VehicleDetailsSection.tsx`

```typescript
// Add import
import BrakesAndTiresDisplay from './BrakesAndTiresDisplay';

// In the return statement, after Vehicle Condition card and before BookValuesCard:
<BrakesAndTiresDisplay 
  brakes={vehicle.brakes} 
  tires={vehicle.tire} 
/>
```

### 5.7 Card Order on Bid Response Page

**Before:**
1. New Bid Request (sender info)
2. Vehicle images
3. Vehicle details (year, make, model, etc.)
4. Colors & Accessories
5. Vehicle Condition (windshield, engine lights, **brakes**, **tires**, maintenance, recon)
6. Book Values

**After:**
1. New Bid Request (sender info)
2. Vehicle images
3. Vehicle details (year, make, model, etc.)
4. Colors & Accessories
5. Vehicle Condition (history, report, windshield, engine lights, maintenance, recon)
6. **Brakes & Tires** (NEW - 2x2 grid with chips)
7. Book Values

---

## 6. RPC Function Updates

### 6.1 Update `get_public_bid_request_details`

**File:** New migration

```sql
-- Migration: YYYYMMDDHHMMSS_update_get_public_bid_request_details.sql

DROP FUNCTION IF EXISTS public.get_public_bid_request_details(text);

CREATE OR REPLACE FUNCTION public.get_public_bid_request_details(p_token text)
RETURNS TABLE(
  request_id uuid, 
  created_at timestamp with time zone, 
  status text, 
  vehicle_year text, 
  vehicle_make text, 
  vehicle_model text, 
  vehicle_trim text, 
  vehicle_vin text, 
  vehicle_mileage text, 
  vehicle_engine text, 
  vehicle_transmission text, 
  vehicle_drivetrain text, 
  vehicle_exterior_color text, 
  vehicle_interior_color text, 
  vehicle_accessories text, 
  buyer_name text, 
  buyer_dealership text, 
  buyer_mobile text, 
  is_used boolean, 
  submitted_offer_amount numeric, 
  submitted_at timestamp with time zone, 
  vehicle_images json, 
  kbb_wholesale numeric, 
  kbb_retail numeric, 
  jd_power_wholesale numeric, 
  jd_power_retail numeric, 
  mmr_wholesale numeric, 
  mmr_retail numeric, 
  auction_wholesale numeric, 
  auction_retail numeric,
  windshield text,
  engine_lights text,
  brakes text,
  tire text,
  maintenance text,
  recon_estimate text,
  recon_details text,
  -- NEW FIELDS
  history text,
  history_service text,
  book_values_condition text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_token_valid boolean := false;
  v_bid_request_id uuid;
  v_buyer_id uuid;
BEGIN
  -- Validate token and get bid_request_id
  SELECT 
    bst.bid_request_id,
    bst.buyer_id,
    true
  INTO v_bid_request_id, v_buyer_id, v_token_valid
  FROM bid_submission_tokens bst
  WHERE bst.token = p_token;
  
  IF NOT v_token_valid THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    br.id as request_id,
    br.created_at,
    br.status::text,
    v.year as vehicle_year,
    v.make as vehicle_make,
    v.model as vehicle_model,
    v.trim as vehicle_trim,
    v.vin as vehicle_vin,
    v.mileage as vehicle_mileage,
    v.engine as vehicle_engine,
    v.transmission as vehicle_transmission,
    v.drivetrain as vehicle_drivetrain,
    v.exterior as vehicle_exterior_color,
    v.interior as vehicle_interior_color,
    v.options as vehicle_accessories,
    b.buyer_name::text,
    COALESCE(b.dealer_name, 'Independent')::text as buyer_dealership,
    b.buyer_mobile::text,
    bst.is_used,
    bres.offer_amount as submitted_offer_amount,
    bres.created_at as submitted_at,
    COALESCE(
      (SELECT json_agg(i.image_url ORDER BY i.sequence_order) 
       FROM images i 
       WHERE i.bid_request_id = br.id), 
      '[]'::json
    ) as vehicle_images,
    bv.kbb_wholesale,
    bv.kbb_retail,
    bv.jd_power_wholesale,
    bv.jd_power_retail,
    bv.mmr_wholesale,
    bv.mmr_retail,
    bv.auction_wholesale,
    bv.auction_retail,
    r.windshield,
    r.engine_light as engine_lights,
    r.brakes,
    r.tires as tire,
    r.maintenance,
    r.recon_estimate,
    r.recon_details,
    -- NEW FIELDS
    r.history,
    vh.history_service,
    bv.condition as book_values_condition
  FROM bid_requests br
  JOIN vehicles v ON br.vehicle_id = v.id
  JOIN bid_submission_tokens bst ON bst.bid_request_id = br.id AND bst.token = p_token
  JOIN buyers b ON bst.buyer_id = b.id
  LEFT JOIN reconditioning r ON br.recon = r.id
  LEFT JOIN "bookValues" bv ON bv.vehicle_id = v.id
  LEFT JOIN vehicle_history vh ON vh.vehicle_id = v.id
  LEFT JOIN bid_responses bres ON bres.bid_request_id = br.id AND bres.buyer_id = bst.buyer_id
  WHERE br.id = v_bid_request_id;
END;
$function$;
```

---

## 7. Implementation Phases

### Phase 1: Database Migrations (Day 1)

1. Create migration for `reconditioning.history` column
2. Create migration for `vehicle_history.history_service` column
3. Create migration for `bookValues.condition` column
4. Test migrations locally with `supabase db reset`
5. Apply migrations to staging

### Phase 2: Form State & Submission (Day 1-2)

1. Update `types.ts` with `historyService` field
2. Update `useFormState.ts` with new field initialization
3. Update `VehicleCondition.tsx` to use form state instead of local state
4. Update `useBidRequestSubmission.ts` to save new fields

### Phase 3: Bid Response Display (Day 2-3)

1. Create `historyFormatting.ts` utility
2. Create `BrakesAndTiresDisplay.tsx` component
3. Update `VehicleDetailsSection.tsx`:
   - Add History/Report rows
   - Remove old Brakes/Tires rows
   - Add BrakesAndTiresDisplay component
4. Update `PublicBidResponse.tsx` to parse new RPC fields

### Phase 4: RPC Updates (Day 3)

1. Create migration to update `get_public_bid_request_details` function
2. Update Supabase types with `supabase gen types`
3. Test end-to-end flow

### Phase 5: Testing & QA (Day 4)

1. Create test bid request with all appraisal fields
2. Verify database storage
3. Verify bid response page display
4. Test mobile responsiveness
5. Test edge cases (missing data, null values)

---

## 8. Files Affected

### New Files

| File | Description |
|------|-------------|
| `supabase/migrations/YYYYMMDD_add_history_to_reconditioning.sql` | Database migration |
| `supabase/migrations/YYYYMMDD_add_history_service_to_vehicle_history.sql` | Database migration |
| `supabase/migrations/YYYYMMDD_add_condition_to_bookvalues.sql` | Database migration |
| `supabase/migrations/YYYYMMDD_update_get_public_bid_request_details.sql` | RPC update |
| `src/components/bid-response/BrakesAndTiresDisplay.tsx` | New display component |
| `src/components/bid-response/utils/historyFormatting.ts` | New utility |

### Modified Files

| File | Changes |
|------|---------|
| `src/components/bid-request/types.ts` | Add `historyService` field |
| `src/components/bid-request/hooks/useFormState.ts` | Initialize `historyService` |
| `src/components/bid-request/VehicleCondition.tsx` | Use form state for history service |
| `src/components/bid-request/hooks/useBidRequestSubmission.ts` | Save history, history_service, condition |
| `src/components/PublicBidResponse.tsx` | Parse new RPC fields |
| `src/components/bid-response/types.ts` | Add new fields to VehicleDetails |
| `src/components/bid-response/VehicleDetailsSection.tsx` | Add history rows, integrate BrakesAndTiresDisplay |
| `src/integrations/supabase/types.ts` | Regenerate after migrations |

---

## 9. Testing Checklist

### Database

- [ ] Migration runs cleanly on fresh database
- [ ] Migration runs on database with existing data
- [ ] Existing bid requests still work (backward compatibility)
- [ ] RLS policies work correctly

### Form Submission

- [ ] History status saves to `reconditioning.history`
- [ ] History service saves to `vehicle_history.history_service`
- [ ] Book values condition saves to `bookValues.condition`
- [ ] Brakes quadrant data saves correctly
- [ ] Tires quadrant data saves correctly

### Bid Response Display

- [ ] History row displays correct status
- [ ] Report row displays selected service (or hidden if none)
- [ ] Brakes grid shows 4 quadrants with color chips
- [ ] Tires grid shows 4 quadrants with color chips
- [ ] Book Values condition displays correctly
- [ ] N/A shown for missing quadrant values
- [ ] Mobile layout is responsive

### Edge Cases

- [ ] Missing history data shows nothing (not "Unknown")
- [ ] Missing brakes/tires data shows N/A chips
- [ ] No history service selected = row hidden
- [ ] Old bid requests (without new fields) still display

---

## 10. Rollback Plan

### If Issues in Staging

1. Revert frontend changes via git
2. Keep database columns (they're nullable with defaults)
3. RPC will return NULL for new fields, frontend handles gracefully

### If Issues in Production

1. Revert frontend deployment to previous version
2. Database columns remain (no data loss)
3. New columns are nullable, no breaking changes

### Database Rollback (Emergency Only)

```sql
-- Only if absolutely necessary
ALTER TABLE public.reconditioning DROP COLUMN IF EXISTS history;
ALTER TABLE public.vehicle_history DROP COLUMN IF EXISTS history_service;
ALTER TABLE public."bookValues" DROP COLUMN IF EXISTS condition;
```

---

## Appendix: Visual Reference

### Bid Response Page - After Implementation

```
┌─ New Bid Request ──────────────────────────┐
│ From:        Adam Gallardo                 │
│ Dealership:  Independent                   │
│ Mobile #:    (425) 577-4907                │
└────────────────────────────────────────────┘

┌─ [Vehicle Image Carousel] ─────────────────┐
│                                            │
└────────────────────────────────────────────┘

┌─ 2022 BMW X3 xDrive30i ────────────────────┐
│ VIN:         5UX53DP0XN9N04910             │
│ Mileage:     23,000                        │
│ Engine:      2.0L 4cyl Turbo               │
│ Transmission: 8-Speed Automatic            │
│ Drivetrain:  AWD/All-Wheel Drive           │
└────────────────────────────────────────────┘

┌─ Colors & Accessories ─────────────────────┐
│ Exterior:    Gray                          │
│ Interior:    Black                         │
│ Accessories: M Sport Package, etc.         │
└────────────────────────────────────────────┘

┌─ Vehicle Condition ────────────────────────┐
│ History:     No Accidents            ← NEW │
│ Report:      AutoCheck               ← NEW │
│ Windshield:  Clear                         │
│ Engine Lights: None                        │
│ Maintenance: Up to date                    │
│ Recon Est.:  $0                            │
│ Recon Details: SUBJECT TO FINAL...         │
└────────────────────────────────────────────┘

┌─ Brakes & Tires ───────────────────── NEW ─┐
│                                            │
│ Brakes                                     │
│ ┌──────────────┬───────────────┐           │
│ │  [≥8mm] 🟢   │   [≥8mm] 🟢   │           │
│ │  Front Left  │  Front Right  │           │
│ ├──────────────┼───────────────┤           │
│ │  [≥8mm] 🟢   │   [≥8mm] 🟢   │           │
│ │  Rear Left   │  Rear Right   │           │
│ └──────────────┴───────────────┘           │
│                                            │
│ Tires                                      │
│ ┌──────────────┬───────────────┐           │
│ │  [8-10] 🟢   │   [8-10] 🟢   │           │
│ │  Front Left  │  Front Right  │           │
│ ├──────────────┼───────────────┤           │
│ │  [8-10] 🟢   │   [8-10] 🟢   │           │
│ │  Rear Left   │  Rear Right   │           │
│ └──────────────┴───────────────┘           │
└────────────────────────────────────────────┘

┌─ Book Values ──────────────────────────────┐
│ Condition:   Very Good             ← FIXED │
│ ┌─────────┬────────────┬──────────┐        │
│ │ Books   │ Wholesale  │ Retail   │        │
│ ├─────────┼────────────┼──────────┤        │
│ │ MMR     │ $32,700    │ $36,300  │        │
│ │ KBB     │ $0         │ $0       │        │
│ │ JD Power│ $0         │ $0       │        │
│ │ Auction │ $0         │ $0       │        │
│ └─────────┴────────────┴──────────┘        │
└────────────────────────────────────────────┘

┌─ Submit Your Bid ──────────────────────────┐
│ Your Offer *                               │
│ ┌────────────────────────────────────────┐ │
│ │ $ Enter amount                         │ │
│ └────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │
│ │            Submit Bid                  │ │
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

---

*End of Specification*
