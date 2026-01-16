# BuybidHQ - Mobile App & Chrome Extension Implementation Spec

## Platform Overview

| Aspect | React Native Mobile | Chrome Extension |
|--------|---------------------|------------------|
| Entry Point | FAB with 3 expandable actions | Popup or side panel |
| VIN Input | Barcode scanner, keyboard, filter | Keyboard input, paste from page |
| Storage | AsyncStorage + Supabase | chrome.storage + Supabase |
| Auth | Supabase Auth (persisted) | Supabase Auth (session) |

---

## FAB Button Design (Mobile Only)

```
┌─────────────────────────────────────────────────────────────┐
│  FAB Actions                                                │
├──────────┬─────────────┬──────────────┬────────────────────┤
│  Action  │    Icon     │    Label     │     Handler        │
├──────────┼─────────────┼──────────────┼────────────────────┤
│ barcode  │ barcode-scan│ Scan VIN     │ openCamera()       │
│ keyboard │ keyboard    │ Enter VIN    │ openVINModal()     │
│ filter   │ filter      │ Search       │ openYMMFilter()    │
└──────────┴─────────────┴──────────────┴────────────────────┘
```

---

## Color System

| Color | Meaning | Background | Border | Text |
|-------|---------|------------|--------|------|
| 🟢 Green | Best/No issues | `#F0FDF4` | `#4ADE80` | `#15803D` |
| 🟡 Yellow | Minor concerns | `#FEFCE8` | `#FACC15` | `#A16207` |
| 🟠 Orange | Moderate issues | `#FFF7ED` | `#FB923C` | `#C2410C` |
| 🔴 Red | Severe/Replace | `#FEF2F2` | `#F87171` | `#B91C1C` |
| ⚪ Gray | Unknown/Unselected | `#F9FAFB` | `#9CA3AF` | `#374151` |

---

## Form Steps

### Step 1: Vehicle Identity

| Field | Variable | Type | Required | Source |
|-------|----------|------|----------|--------|
| VIN | `vin` | string | ✅ | User input (FAB) |
| Year | `year` | string | ✅ | VIN decode / picker |
| Make | `make` | string | ✅ | VIN decode / picker |
| Model | `model` | string | ✅ | VIN decode / picker |
| Trim | `trim` | string | ✅ | VIN decode / picker |
| Mileage | `mileage` | string | ✅ | User input |

### Step 1B: Vehicle Specs (Filter Flow Only)

When using Year/Make/Model filter (no VIN decode), show additional specs step:

| Field | Variable | Show When | Options |
|-------|----------|-----------|---------|
| Transmission | `transmission` | Not auto-detected | `Automatic`, `Manual`, `CVT`, `DCT` |
| Engine | `engineCylinders` | Multiple options | Trim-specific or common options |
| Drivetrain | `drivetrain` | Multiple options | `FWD`, `RWD`, `AWD`, `4WD` |

**Logic:**
```typescript
const needsAdditionalSpecs = !formData.vin && (
  !formData.transmission ||
  !formData.engineCylinders ||
  !formData.drivetrain
);
```

---

### Step 2: Appearance

| Field | Variable | Options |
|-------|----------|---------|
| Exterior Color | `exteriorColor` | White, Black, Gray, Green, Red, Gold, Silver, Blue, Yellow |
| Interior Color | `interiorColor` | Black, Blue, Brown, Grey, Red, Tan, White |
| Accessories | `accessories` | Free text |
| Images | `uploadedImageUrls` | Camera / Gallery picker |

---

### Step 3: Condition

#### 3.1 History Source (No Color)

| Value | Label | UI |
|-------|-------|-----|
| `Unknown` | Unknown | Radio/Chip |
| `AutoCheck` | AutoCheck | Radio/Chip (with logo) |
| `CarFax` | CarFax | Radio/Chip (with logo) |

*Note: Variable name is `historyService`, UI label is "History Source"*

---

#### 3.2 Vehicle History Status

| Value | Label | Color |
|-------|-------|-------|
| `noAccidents` | No Accidents | 🟢 Green |
| `minorAccident` | Minor Accident | 🟡 Yellow |
| `odomError` | Odom Error | 🟡 Yellow |
| `majorAccident` | Major Accident | 🔴 Red |
| `brandedIssue` | Branded Title | 🔴 Red |
| `unknown` | Unknown | ⚪ Gray |

---

#### 3.3 Windshield Condition

| Value | Label | Color |
|-------|-------|-------|
| `clear` | Clear | 🟢 Green |
| `chips` | Stars | 🟡 Yellow |
| `smallCracks` | Cracks | 🟠 Orange |
| `largeCracks` | Replace | 🔴 Red |

---

#### 3.4 Warning Lights (Multi-Select)

| Value | Label | Color |
|-------|-------|-------|
| `none` | None | 🟢 Green |
| `engine` | Engine | 🟡 Yellow |
| `maintenance` | Transmission | 🟡 Yellow |
| `drivetrain` | Drivetrain | 🟡 Yellow |
| `airbag` | Airbags | 🟡 Yellow |
| `multiple` | Others | 🔴 Red |

**Logic:** If `none` selected, deselect all others. If any other selected, deselect `none`.

---

#### 3.5 Maintenance Condition

| Value | Label | Color |
|-------|-------|-------|
| `upToDate` | Up to date | 🟢 Green |
| `basicService` | Basic | 🟡 Yellow |
| `minorService` | Minor | 🟠 Orange |
| `majorService` | Major | 🔴 Red |

---

#### 3.6 Tires Condition (Quadrant)

**Layout:**
```
┌─────────────────┬─────────────────┐
│   FRONT LEFT    │   FRONT RIGHT   │
│   [Dropdown]    │   [Dropdown]    │
├─────────────────┼─────────────────┤
│   REAR LEFT     │   REAR RIGHT    │
│   [Dropdown]    │   [Dropdown]    │
└─────────────────┴─────────────────┘
```

**Per-Quadrant Values (Tread Depth):**

| Value | Label | Color |
|-------|-------|-------|
| 8-10 | 8-10/32" | 🟢 Green |
| 5-7 | 5-7/32" | 🟡 Yellow |
| 3-4 | 3-4/32" | 🟠 Orange |
| 1-2 | ≤2/32" | 🔴 Red |

**Storage Format:** `frontLeft:9,frontRight:9,rearLeft:9,rearRight:9`

**Auto-Calculate Summary:**

| Condition | Logic |
|-----------|-------|
| Acceptable | All ≥ 5 |
| Replace Front | Front L or R ≤ 4 |
| Replace Rear | Rear L or R ≤ 4 |
| Replace All | Multiple positions ≤ 4 |

---

#### 3.7 Brakes Condition (Quadrant)

**Per-Quadrant Values (Pad Thickness):**

| Value | Label | Color |
|-------|-------|-------|
| 8-10 | ≥8mm | 🟢 Green |
| 5-7 | 5-7mm | 🟡 Yellow |
| 3-4 | 3-4mm | 🟠 Orange |
| 1-2 | ≤2mm | 🔴 Red |

**Storage Format:** `frontLeft:8,frontRight:8,rearLeft:8,rearRight:8`

---

#### 3.8 Reconditioning

| Field | Variable | Type |
|-------|----------|------|
| Estimate | `reconEstimate` | Currency input ($) |
| Details | `reconDetails` | Free text |

---

### Step 4: Book Values

| Field | Variable |
|-------|----------|
| Condition | `bookValuesCondition` |
| MMR Wholesale | `mmrWholesale` |
| MMR Retail | `mmrRetail` |
| KBB Wholesale | `kbbWholesale` |
| KBB Retail | `kbbRetail` |
| JD Power Wholesale | `jdPowerWholesale` |
| JD Power Retail | `jdPowerRetail` |
| Auction Wholesale | `auctionWholesale` |
| Auction Retail | `auctionRetail` |

**Book Values Condition (Dropdown, No Color):**

| Value | Label |
|-------|-------|
| `excellent` | Excellent |
| `veryGood` | Very Good |
| `good` | Good |
| `fair` | Fair |

---

### Step 5: Buyer Selection

| Field | Variable | Type |
|-------|----------|------|
| Search | `searchTerm` | string |
| Selected | `selectedBuyers` | string[] (UUIDs) |

---

## State Interface

```typescript
interface BidRequestState {
  // Vehicle Identity
  vin: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  mileage: string;
  engineCylinders: string;
  transmission: string;
  drivetrain: string;
  bodyStyle: string;

  // Appearance
  exteriorColor: string;
  interiorColor: string;
  accessories: string;
  images: string[];

  // Condition
  historyService: 'Unknown' | 'AutoCheck' | 'CarFax';
  history: 'noAccidents' | 'minorAccident' | 'odomError' | 'majorAccident' | 'brandedIssue' | 'unknown';
  windshield: 'clear' | 'chips' | 'smallCracks' | 'largeCracks';
  engineLights: string[]; // Multi-select array
  maintenance: 'upToDate' | 'basicService' | 'minorService' | 'majorService';

  // Quadrants
  tiresQuadrant: { frontLeft: number; frontRight: number; rearLeft: number; rearRight: number };
  brakesQuadrant: { frontLeft: number; frontRight: number; rearLeft: number; rearRight: number };

  // Recon
  reconEstimate: string;
  reconDetails: string;

  // Book Values
  bookValuesCondition: 'excellent' | 'veryGood' | 'good' | 'fair';
  mmrWholesale: string;
  mmrRetail: string;
  kbbWholesale: string;
  kbbRetail: string;
  jdPowerWholesale: string;
  jdPowerRetail: string;
  auctionWholesale: string;
  auctionRetail: string;

  // Buyers
  selectedBuyers: string[];
}
```

---

## Color Helper Implementation

### React Native

```typescript
const colorMap = {
  green:  { bg: '#F0FDF4', border: '#4ADE80', text: '#15803D' },
  yellow: { bg: '#FEFCE8', border: '#FACC15', text: '#A16207' },
  orange: { bg: '#FFF7ED', border: '#FB923C', text: '#C2410C' },
  red:    { bg: '#FEF2F2', border: '#F87171', text: '#B91C1C' },
  gray:   { bg: '#F9FAFB', border: '#9CA3AF', text: '#374151' },
};

const getChipStyle = (color: keyof typeof colorMap, selected: boolean) => ({
  backgroundColor: selected ? colorMap[color].bg : '#FFFFFF',
  borderColor: selected ? colorMap[color].border : '#E5E7EB',
  borderWidth: 2,
});

const getChipTextStyle = (color: keyof typeof colorMap, selected: boolean) => ({
  color: selected ? colorMap[color].text : '#6B7280',
  fontWeight: selected ? '600' : '400',
});
```

### Chrome Extension

```typescript
const getButtonClasses = (color: string, selected: boolean) => {
  const colors = {
    green: selected ? 'bg-[#F0FDF4] border-[#4ADE80] text-[#15803D]' : '',
    yellow: selected ? 'bg-[#FEFCE8] border-[#FACC15] text-[#A16207]' : '',
    orange: selected ? 'bg-[#FFF7ED] border-[#FB923C] text-[#C2410C]' : '',
    red: selected ? 'bg-[#FEF2F2] border-[#F87171] text-[#B91C1C]' : '',
    gray: selected ? 'bg-[#F9FAFB] border-[#9CA3AF] text-[#374151]' : '',
  };

  return selected
    ? colors[color]
    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300';
};
```

---

## Platform-Specific Implementation

| Feature | React Native | Chrome Extension |
|---------|--------------|------------------|
| VIN Barcode | `expo-barcode-scanner` | N/A (keyboard only) |
| Image Picker | `expo-image-picker` | `<input type="file">` |
| Currency Input | Custom NumericInput | TextInput with formatter |
| Chip Selector | Custom Pressable components | Button group |
| Quadrant Layout | 2x2 Grid View | CSS Grid |
| Form Navigation | Stack Navigator / Tabs | Single page sections |
| Local Storage | AsyncStorage | chrome.storage.local |

---

## API Submission Payload

```typescript
interface CreateBidRequestPayload {
  vehicle_data: {
    year: string;
    make: string;
    model: string;
    trim: string;
    vin: string;
    mileage: string;
    engine: string;
    transmission: string;
    drivetrain: string;
    exterior: string;
    interior: string;
    options: string;
    body_style: string;
    history_report: string;
    history_service: string;
  };
  recon_data: {
    windshield: string;
    engine_light: string;
    brakes: string;
    tires: string;
    maintenance: string;
    recon_estimate: string;
    recon_details: string;
    history: string;
  };
  book_values: {
    condition: string;
    mmr_wholesale: number | null;
    mmr_retail: number | null;
    kbb_wholesale: number | null;
    kbb_retail: number | null;
    jd_power_wholesale: number | null;
    jd_power_retail: number | null;
    auction_wholesale: number | null;
    auction_retail: number | null;
  };
  image_urls: string[];
  buyer_ids: string[];
  creator_id: string;
  account_id: string;
}
```

---

## Defaults

| Field | Default Value |
|-------|---------------|
| `historyService` | `Unknown` |
| `history` | `noAccidents` |
| `windshield` | `clear` |
| `engineLights` | `none` |
| `maintenance` | `upToDate` |
| `brakes` | `frontLeft:8,frontRight:8,rearLeft:8,rearRight:8` |
| `tire` | `frontLeft:9,frontRight:9,rearLeft:9,rearRight:9` |
| `reconEstimate` | `0` |
| `bookValuesCondition` | `excellent` |
