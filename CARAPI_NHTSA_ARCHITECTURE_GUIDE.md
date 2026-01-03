# CarAPI & NHTSA API Integration Architecture Guide

## Overview
This document explains how our web app integrates with CarAPI (paid) and NHTSA (free fallback) for VIN decoding and vehicle data. Use this as a reference when building similar integrations for React Native mobile app and Chrome extension.

---

## Architecture Pattern: Edge Functions + Client Service Layer

### Why This Architecture?
- **Security**: API credentials never exposed to client
- **Authentication**: JWT tokens managed server-side
- **Caching**: Server-side token caching (15-minute expiry)
- **Fallback Logic**: CarAPI → NHTSA fallback handled transparently
- **Data Transformation**: Complex processing done server-side

### Components

```
┌─────────────────┐
│   React Web     │ ← Your starting point
│   Application   │
└────────┬────────┘
         │
         │ calls
         ↓
┌─────────────────┐
│  VinService     │ ← Client-side service layer
│  (TypeScript)   │    (src/services/vinService.ts)
└────────┬────────┘
         │
         │ Supabase.functions.invoke()
         ↓
┌─────────────────┐
│ Supabase Edge   │ ← Server-side edge function
│ Function        │    (supabase/functions/decode-vin/)
│ (Deno Runtime)  │
└────────┬────────┘
         │
         │ fetch()
         ↓
┌─────────────────┬─────────────────┐
│   CarAPI.app    │  NHTSA VPIC API │
│   (Paid/JWT)    │  (Free/Public)  │
└─────────────────┴─────────────────┘
```

---

## Part 1: CarAPI Integration (Paid Service)

### Authentication Flow

#### Step 1: JWT Token Generation
```typescript
// Server-side (Supabase Edge Function)
async function generateJWTToken(): Promise<string | null> {
  const apiToken = Deno.env.get('VIN_API_TOKEN');
  const apiSecret = Deno.env.get('VIN_API_SECRET');

  const response = await fetch('https://carapi.app/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_token: apiToken,
      api_secret: apiSecret
    })
  });

  return await response.text(); // Returns plain JWT string
}
```

#### Step 2: Token Caching (15-minute expiry)
```typescript
let cachedJWT: { token: string; expiresAt: number } | null = null;

export async function getValidJWTToken(): Promise<string | null> {
  // Check cache first
  if (cachedJWT && Date.now() < cachedJWT.expiresAt) {
    return cachedJWT.token;
  }

  // Generate new token
  const token = await generateJWTToken();
  if (token) {
    cachedJWT = {
      token,
      expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes
    };
  }
  return token;
}
```

### CarAPI Endpoints Used

#### 1. VIN Decode
```typescript
GET https://carapi.app/api/vin/{vin}
Headers:
  Authorization: Bearer {jwt_token}
  Accept: application/json

Response:
{
  year: "2023",
  make: "Audi",
  model: "A4",
  specs: {
    engine_number_of_cylinders: "4",
    displacement_l: "2.0",
    transmission_speeds: "7",
    transmission_style: "Automatic",
    drive_type: "AWD",
    body_class: "Sedan",
    electrification_level: "BEV" | "PHEV" | "HEV" | null,
    fuel_type_primary: "Gasoline" | "Electric" | "Diesel",
    turbo: true
  },
  trims: [...] // Usually returns limited trims
}
```

#### 2. Get Makes by Year
```typescript
GET https://carapi.app/api/makes?year={year}
Headers:
  Authorization: Bearer {jwt_token}
  Accept: application/json

Response:
{
  data: [
    { name: "Audi", make_id: 123 },
    { name: "BMW", make_id: 124 }
  ]
}
```

#### 3. Get Models by Year & Make
```typescript
GET https://carapi.app/api/models?year={year}&make={make}
Headers:
  Authorization: Bearer {jwt_token}
  Accept: application/json

Response:
{
  data: [
    {
      name: "A4",
      model: "A4",
      make_model_id: 5678
    }
  ]
}
```

#### 4. Get All Trims by Year/Make/Model (RECOMMENDED)
```typescript
GET https://carapi.app/api/trims?year={year}&make={make}&model={model}
Headers:
  Authorization: Bearer {jwt_token}
  Accept: application/json

Response:
{
  data: [
    {
      id: 12345,
      name: "Premium Plus",
      description: "Premium Plus (2.0L 4cyl Turbo 7A)",
      year: 2023,
      make_model_id: 5678,
      body_class: "Sedan",
      specs: {
        engine: "2.0L 4cyl Turbo",
        transmission: "7-Speed Automatic",
        drivetrain: "AWD"
      }
    }
  ]
}
```

### Data Normalization Patterns

#### Case Normalization
```typescript
// CarAPI expects title case for most brands
function normalizeToTitleCase(value: string): string {
  return value
    .split(' ')
    .map(word => {
      if (word.includes('-')) {
        return word.split('-')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
          .join('-');
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

// Examples:
// "PORSCHE" → "Porsche"
// "MERCEDES-BENZ" → "Mercedes-Benz"
// "BMW" → "Bmw" (CarAPI accepts both)
```

#### Electric Vehicle Detection
```typescript
// Only BEVs (pure electric) should show "Electric Motor"
// PHEVs/Hybrids have traditional engines
const electrificationLevel = specs?.electrification_level?.toLowerCase() || '';
const fuelTypePrimary = specs?.fuel_type_primary?.toLowerCase() || '';

const isMildHybrid = electrificationLevel.includes('mild');
const isRegularHybrid = electrificationLevel === 'hev';
const isPHEV = electrificationLevel.includes('phev');

const isElectric = !isMildHybrid && !isRegularHybrid && !isPHEV && (
  electrificationLevel.includes('bev') ||
  (fuelTypePrimary === 'electric' && specs?.engine_number_of_cylinders === null)
);
```

#### Powersports Filtering (CRITICAL)
```typescript
// Filter out motorcycles, ATVs, UTVs, RVs, buses
function isNotPowersports(vehicleType?: string, bodyClass?: string): boolean {
  if (!vehicleType && !bodyClass) return false; // Fail closed

  const allowedVehicleTypes = [
    'passenger car',
    'multipurpose passenger vehicle',
    'truck'
  ];

  const allowedBodyClasses = [
    'sedan', 'coupe', 'convertible', 'hatchback', 'wagon',
    'suv', 'sport utility', 'crossover', 'minivan', 'van',
    'pickup', 'truck'
  ];

  const rejectedTypes = [
    'motorcycle', 'bus', 'motorhome', 'rv', 'trailer',
    'incomplete vehicle', 'atv', 'utv', 'off-road'
  ];

  // Check rejections
  for (const rejected of rejectedTypes) {
    if (vehicleType?.toLowerCase().includes(rejected) ||
        bodyClass?.toLowerCase().includes(rejected)) {
      return false;
    }
  }

  // Must match whitelist
  const typeMatched = allowedVehicleTypes.some(t =>
    vehicleType?.toLowerCase().includes(t));
  const bodyMatched = allowedBodyClasses.some(b =>
    bodyClass?.toLowerCase().includes(b));

  return typeMatched || bodyMatched;
}
```

---

## Part 2: NHTSA API Integration (Free Fallback)

### Authentication
**No authentication required** - Public API

### Endpoint
```typescript
GET https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/{vin}?format=json

Response:
{
  Count: 136,
  Message: "Results returned successfully",
  SearchCriteria: "VIN:5UXFE83578L342684",
  Results: [
    { Variable: "Make", Value: "BMW", VariableId: 26 },
    { Variable: "Model", Value: "X5", VariableId: 28 },
    { Variable: "Model Year", Value: "2008", VariableId: 29 },
    { Variable: "Trim", Value: "xDrive35i", VariableId: 109 },
    { Variable: "Engine Number of Cylinders", Value: "6", VariableId: 9 },
    { Variable: "Transmission Style", Value: "Automatic", VariableId: 37 },
    { Variable: "Drive Type", Value: "AWD", VariableId: 8 }
  ]
}
```

### Data Transformation
```typescript
async function fetchNHTSAData(vin: string): Promise<VehicleData | null> {
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;
  const data = await fetch(url).then(r => r.json());

  const vehicleData: VehicleData = {
    year: "", make: "", model: "", trim: "",
    engineCylinders: "", transmission: "", drivetrain: ""
  };

  for (const result of data.Results) {
    const { Variable, Value } = result;
    if (!Value || Value === "null") continue;

    switch (Variable) {
      case "Model Year":
        vehicleData.year = Value;
        break;
      case "Make":
        vehicleData.make = Value;
        break;
      case "Model":
        vehicleData.model = Value;
        break;
      case "Trim":
        vehicleData.trim = Value;
        break;
      case "Engine Number of Cylinders":
        vehicleData.engineCylinders = `${Value} Cylinder`;
        break;
      case "Transmission Style":
        vehicleData.transmission = Value;
        break;
      case "Drive Type":
        vehicleData.drivetrain = Value;
        break;
    }
  }

  return vehicleData;
}
```

### Limitations
- **No trim options** - Returns only basic trim name
- **Less detailed specs** - No comprehensive engine/transmission data
- **No body style** - Must extract from other fields or use defaults
- **Rate limits** - Undefined but generally permissive

---

## Part 3: Client-Side Service Layer

### React Web Implementation
```typescript
// src/services/vinService.ts
class VinService {
  async decodeVin(vin: string): Promise<VinDecodeResult> {
    if (!vin || vin.length !== 17) {
      return {
        success: false,
        error: "Please enter a valid 17-character VIN"
      };
    }

    try {
      // Call Supabase Edge Function
      const { data: response, error } = await supabase.functions.invoke('decode-vin', {
        body: { vin }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Check for powersports rejection
      if (response.error && response.vehicleType) {
        return { success: false, error: response.error };
      }

      // Transform to app format
      const vehicleData: VehicleData = {
        year: response.year,
        make: response.make,
        model: response.model,
        trim: response.trim,
        displayTrim: response.trim,
        engineCylinders: response.engineCylinders,
        transmission: response.transmission,
        drivetrain: response.drivetrain,
        bodyStyle: response.bodyStyle || response.specs?.body_class,
        availableTrims: response.availableTrims || []
      };

      return { success: true, data: vehicleData };
    } catch (error) {
      return {
        success: false,
        error: "Failed to decode VIN. Please try again."
      };
    }
  }

  async fetchTrims(year: string, make: string, model: string): Promise<TrimOption[]> {
    const { data, error } = await supabase.functions.invoke('decode-vin', {
      body: {
        trims_lookup: true,
        year: parseInt(year),
        make,
        model
      }
    });

    if (error || !data?.trims) {
      return [];
    }

    return data.trims;
  }
}

export const vinService = new VinService();
```

---

## Part 4: Adapting for React Native Mobile App

### Key Differences
1. **No Supabase Edge Functions** - Need alternative backend
2. **Environment handling** - Different from web
3. **Storage** - AsyncStorage vs localStorage
4. **Network** - React Native's fetch has quirks

### Recommended Architecture for Mobile

#### Option A: Keep Edge Functions (Recommended)
```typescript
// React Native client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

// Same API as web
async function decodeVin(vin: string) {
  const { data, error } = await supabase.functions.invoke('decode-vin', {
    body: { vin }
  });
  return data;
}
```

**Pros**: Same backend logic, no duplication
**Cons**: Requires internet, Supabase dependency

#### Option B: Direct API Calls (For Offline Capability)
```typescript
// Store JWT token in AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

class MobileVinService {
  private jwtToken: string | null = null;
  private tokenExpiry: number = 0;

  async getJWTToken(): Promise<string | null> {
    // Check cache
    if (this.jwtToken && Date.now() < this.tokenExpiry) {
      return this.jwtToken;
    }

    // Load from AsyncStorage
    const stored = await AsyncStorage.getItem('@jwt_token');
    if (stored) {
      const { token, expiry } = JSON.parse(stored);
      if (Date.now() < expiry) {
        this.jwtToken = token;
        this.tokenExpiry = expiry;
        return token;
      }
    }

    // Generate new token
    const response = await fetch('https://carapi.app/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_token: process.env.VIN_API_TOKEN,
        api_secret: process.env.VIN_API_SECRET
      })
    });

    const token = await response.text();
    const expiry = Date.now() + (15 * 60 * 1000);

    // Cache in memory and storage
    this.jwtToken = token;
    this.tokenExpiry = expiry;
    await AsyncStorage.setItem('@jwt_token', JSON.stringify({ token, expiry }));

    return token;
  }

  async decodeVin(vin: string): Promise<VehicleData> {
    // Try CarAPI first
    try {
      const token = await this.getJWTToken();
      const response = await fetch(`https://carapi.app/api/vin/${vin}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      return this.transformCarApiData(data);
    } catch (error) {
      // Fallback to NHTSA
      const response = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
      );
      const data = await response.json();
      return this.transformNHTSAData(data);
    }
  }
}
```

**Pros**: Works offline (NHTSA), no backend required
**Cons**: API credentials in app (security risk), more complex

### Security Recommendation for Mobile
**Use edge functions with credential encryption**:
```typescript
// Encrypt credentials in app
import * as Crypto from 'expo-crypto';

const encryptedToken = await Crypto.encryptAsync(
  Crypto.CryptoAlgorithm.AES_CBC,
  token,
  secretKey
);
```

---

## Part 5: Adapting for Chrome Extension

### Key Differences
1. **Background scripts** - Long-lived service worker
2. **Content scripts** - Isolated from page
3. **Message passing** - Background ↔ Content communication
4. **Storage** - chrome.storage API
5. **Permissions** - Manifest V3 restrictions

### Recommended Architecture for Extension

#### manifest.json
```json
{
  "manifest_version": 3,
  "name": "BuyBidHQ VIN Decoder",
  "version": "1.0.0",
  "permissions": [
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "https://carapi.app/*",
    "https://vpic.nhtsa.dot.gov/*",
    "https://*.supabase.co/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"]
  }]
}
```

#### Background Script (Service Worker)
```typescript
// background.ts
let jwtToken: string | null = null;
let tokenExpiry: number = 0;

async function getJWTToken(): Promise<string | null> {
  // Check memory cache
  if (jwtToken && Date.now() < tokenExpiry) {
    return jwtToken;
  }

  // Check chrome.storage
  const stored = await chrome.storage.local.get(['jwt_token', 'jwt_expiry']);
  if (stored.jwt_token && Date.now() < stored.jwt_expiry) {
    jwtToken = stored.jwt_token;
    tokenExpiry = stored.jwt_expiry;
    return jwtToken;
  }

  // Generate new token
  const response = await fetch('https://carapi.app/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_token: process.env.VIN_API_TOKEN,
      api_secret: process.env.VIN_API_SECRET
    })
  });

  jwtToken = await response.text();
  tokenExpiry = Date.now() + (15 * 60 * 1000);

  // Cache in chrome.storage
  await chrome.storage.local.set({
    jwt_token: jwtToken,
    jwt_expiry: tokenExpiry
  });

  return jwtToken;
}

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'decode_vin') {
    decodeVin(request.vin).then(sendResponse);
    return true; // Keep channel open for async response
  }
});

async function decodeVin(vin: string): Promise<any> {
  try {
    const token = await getJWTToken();
    const response = await fetch(`https://carapi.app/api/vin/${vin}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    return await response.json();
  } catch (error) {
    // Fallback to NHTSA
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
    );
    return await response.json();
  }
}
```

#### Content Script
```typescript
// content.ts
async function decodeVinFromPage(vin: string): Promise<any> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: 'decode_vin', vin },
      (response) => resolve(response)
    );
  });
}

// Example: Auto-detect VINs on page
const vinPattern = /\b[A-HJ-NPR-Z0-9]{17}\b/g;
const pageText = document.body.innerText;
const vins = pageText.match(vinPattern);

if (vins) {
  vins.forEach(async (vin) => {
    const data = await decodeVinFromPage(vin);
    console.log('Decoded:', data);
  });
}
```

---

## Part 6: TypeScript Type Definitions

```typescript
// Shared types across platforms
export interface VehicleData {
  year: string;
  make: string;
  model: string;
  trim: string;
  displayTrim: string;
  engineCylinders: string;
  transmission: string;
  drivetrain: string;
  bodyStyle?: string;
  availableTrims: TrimOption[];
}

export interface TrimOption {
  id?: string | number;
  name: string;
  description: string;
  specs: {
    engine: string;
    transmission: string;
    drivetrain: string;
    bodyStyle?: string;
  };
  year: number;
  source?: 'carapi' | 'nhtsa';
}

export interface CarApiResponse {
  year: string;
  make: string;
  model: string;
  specs?: {
    engine_number_of_cylinders?: string;
    displacement_l?: string;
    transmission_speeds?: string;
    transmission_style?: string;
    drive_type?: string;
    body_class?: string;
    electrification_level?: string;
    fuel_type_primary?: string;
    turbo?: boolean;
  };
  trims?: CarApiTrim[];
}

export interface CarApiTrim {
  id?: number;
  name: string;
  description: string;
  year: number;
  make_model_id?: number;
  body_class?: string;
  specs?: {
    engine?: string;
    transmission?: string;
    drivetrain?: string;
  };
}

export interface NHTSAResponse {
  Count: number;
  Message: string;
  Results: Array<{
    Variable: string;
    Value: string;
    VariableId: number;
  }>;
}
```

---

## Part 7: Error Handling Patterns

### Network Errors
```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;

      // Don't retry 4xx errors (client errors)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.status}`);
      }

      // Retry 5xx errors (server errors)
      if (i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
        continue;
      }
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
      }
    }
  }

  throw lastError!;
}
```

### Graceful Degradation
```typescript
async function decodeVinWithFallback(vin: string): Promise<VehicleData> {
  try {
    // Try CarAPI (full data)
    return await fetchCarApiData(vin);
  } catch (carApiError) {
    console.warn('CarAPI failed, trying NHTSA:', carApiError);

    try {
      // Fallback to NHTSA (basic data)
      return await fetchNHTSAData(vin);
    } catch (nhtsaError) {
      console.error('Both APIs failed:', nhtsaError);

      // Return partial data for manual entry
      return {
        success: false,
        fallbackToManual: true,
        partialData: extractPartialVinData(vin)
      };
    }
  }
}
```

---

## Part 8: Environment Configuration

### Web (Vite)
```typescript
// .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

// Edge Function (Supabase)
VIN_API_TOKEN=your-carapi-token
VIN_API_SECRET=your-carapi-secret
```

### React Native (Expo)
```typescript
// .env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

// Or for direct API access (NOT RECOMMENDED - security risk)
EXPO_PUBLIC_CARAPI_TOKEN=your-token
EXPO_PUBLIC_CARAPI_SECRET=your-secret
```

### Chrome Extension
```typescript
// Use background script with hardcoded credentials (obfuscated)
// OR use remote config endpoint
const config = await fetch('https://your-backend.com/api/config', {
  headers: { 'X-Extension-ID': chrome.runtime.id }
}).then(r => r.json());
```

---

## Summary: Platform Comparison

| Feature | Web App | React Native | Chrome Extension |
|---------|---------|--------------|------------------|
| **Backend** | Supabase Edge Functions | Edge Functions OR Direct API | Background Service Worker |
| **Auth Storage** | Server-side cache | AsyncStorage | chrome.storage.local |
| **Security** | ✅ Best (credentials hidden) | ⚠️ Medium (if direct API) | ⚠️ Medium (credentials in extension) |
| **Offline** | ❌ Requires connection | ✅ Can cache NHTSA | ✅ Can cache |
| **Complexity** | Low | Medium | Medium-High |
| **Recommended** | ✅ Use Edge Functions | ✅ Use Edge Functions | ⚠️ Use Background Worker |

---

## Next Steps for Implementation

### For React Native Mobile App:
1. Install `@supabase/supabase-js` for React Native
2. Reuse existing edge function endpoints
3. Add AsyncStorage for offline caching
4. Implement retry logic for poor network conditions
5. Add VIN scanner using `react-native-camera`

### For Chrome Extension:
1. Create background service worker
2. Implement JWT caching in chrome.storage
3. Add content script for VIN auto-detection
4. Create popup UI for manual VIN entry
5. Add context menu "Decode VIN" option

---

**Generated**: 2026-01-01
**Web App Reference**: /Users/ag-macbook-air/Documents/Source Control/buybidhq-1
