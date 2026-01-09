# VIN Decoder API Implementation for React Native Mobile App

## 1. CarAPI Details

### API Provider
- **Name:** CarAPI (https://carapi.app)
- **Type:** Paid service with JWT authentication
- **Fallback:** NHTSA VPIC API (free, public)

### Base URLs
- **CarAPI Base URL:** `https://carapi.app/api`
- **NHTSA Base URL:** `https://vpic.nhtsa.dot.gov/api/vehicles`

### Documentation
- **CarAPI Docs:** https://carapi.app/docs
- **NHTSA VPIC Docs:** https://vpic.nhtsa.dot.gov/api/

---

## 2. Authentication

### CarAPI Authentication (Recommended Method)

**Authentication Type:** JWT Bearer Token

**Credentials Storage:** Supabase Edge Function environment variables (server-side only)

**Environment Variables (Supabase Secrets):**
```bash
VIN_API_TOKEN=<your_carapi_token>
VIN_API_SECRET=<your_carapi_secret>
```

**JWT Token Generation:**
```typescript
// Server-side only (Supabase Edge Function)
const response = await fetch('https://carapi.app/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    api_token: process.env.VIN_API_TOKEN,
    api_secret: process.env.VIN_API_SECRET
  })
});

const jwtToken = await response.text(); // Plain JWT string
```

**Token Caching:**
- Tokens expire after 1 hour
- Cache for 55 minutes (5-minute safety margin)
- Stored in memory on edge function

### NHTSA Authentication
- **No authentication required** - Public API
- No API keys needed

---

## 3. VIN Decoding Endpoint

### Primary Endpoint (CarAPI via Supabase Edge Function)

**Your Current Implementation:**
```typescript
// React Native client calls Supabase Edge Function
const { data, error } = await supabase.functions.invoke('decode-vin', {
  body: { vin: 'YOUR_17_CHAR_VIN' }
});
```

**Supabase Configuration:**
- **Project URL:** `https://fdcfdbjputcitgxosnyk.supabase.co`
- **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkY2ZkYmpwdXRjaXRneG9zbnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4OTc2NjksImV4cCI6MjAzNDQ3MzY2OX0.x2lu4j7aZPc1zvMYS_ElsqVyzQg7WgerAD4LRPzFRZE`

**Edge Function Endpoint:**
- **Function Name:** `decode-vin`
- **Full URL:** `https://fdcfdbjputcitgxosnyk.supabase.co/functions/v1/decode-vin`

### Sample Request

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://fdcfdbjputcitgxosnyk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkY2ZkYmpwdXRjaXRneG9zbnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4OTc2NjksImV4cCI6MjAzNDQ3MzY2OX0.x2lu4j7aZPc1zvMYS_ElsqVyzQg7WgerAD4LRPzFRZE'
);

const { data, error } = await supabase.functions.invoke('decode-vin', {
  body: { vin: '1HGBH41JXMN123456' }
});
```

### Sample Success Response

```json
{
  "year": "2023",
  "make": "BMW",
  "model": "3 SERIES",
  "trim": "330i",
  "engineCylinders": "2.0L Turbo I4",
  "transmission": "8-Speed Automatic",
  "drivetrain": "RWD",
  "bodyStyle": "Sedan",
  "specs": {
    "engine_number_of_cylinders": "4",
    "displacement_l": "2.0",
    "transmission_speeds": "8",
    "transmission_style": "Automatic",
    "drive_type": "RWD",
    "body_class": "Sedan",
    "fuel_type_primary": "Gasoline",
    "electrification_level": null,
    "turbo": true
  },
  "availableTrims": [
    {
      "id": 12345,
      "name": "330i",
      "description": "330i 4dr Sedan (2.0L 4cyl Turbo)",
      "specs": {
        "engine": "2.0L Turbo I4",
        "transmission": "8-Speed Automatic",
        "drivetrain": "RWD",
        "bodyStyle": "Sedan"
      },
      "year": 2023,
      "source": "carapi"
    }
  ]
}
```

### Sample Error Response

```json
{
  "error": "Failed to decode VIN from available services"
}
```

### Powersports Rejection Response

```json
{
  "error": "This VIN appears to be for a motorcycle, ATV, UTV, RV, or other non-standard vehicle.",
  "vehicleType": "Motorcycle",
  "bodyClass": "Motorcycle"
}
```

---

## 4. Vehicle Filtering

### Data Extracted from API Response

**Essential Fields:**
- `year` - Model year (string)
- `make` - Manufacturer name (string)
- `model` - Vehicle model (string)
- `trim` - Trim level (string)
- `engineCylinders` - Engine spec (e.g., "2.0L Turbo I4")
- `transmission` - Transmission type (e.g., "8-Speed Automatic")
- `drivetrain` - Drive type (e.g., "RWD", "AWD", "FWD")
- `bodyStyle` - Body class (e.g., "Sedan", "SUV", "Truck")

**Optional Fields:**
- `specs.fuel_type_primary` - Fuel type
- `specs.electrification_level` - Electric vehicle type (BEV, PHEV, HEV)
- `specs.turbo` - Turbocharger indicator
- `availableTrims` - Array of trim options

### Powersports Filtering (CRITICAL)

**Purpose:** Exclude motorcycles, ATVs, UTVs, RVs, buses

```typescript
// Allowed vehicle types
const allowedVehicleTypes = [
  'passenger car',
  'multipurpose passenger vehicle',
  'truck'
];

// Allowed body classes
const allowedBodyClasses = [
  'sedan', 'coupe', 'convertible', 'hatchback', 'wagon',
  'suv', 'sport utility', 'crossover', 'minivan', 'van',
  'pickup', 'truck'
];

// Rejected types (automatically filtered)
const rejectedTypes = [
  'motorcycle', 'bus', 'motorhome', 'rv', 'trailer',
  'incomplete vehicle', 'atv', 'utv', 'off-road'
];
```

**Implementation:**
- Filtering handled server-side in Edge Function
- React Native client receives only valid vehicles
- Error message if powersports detected

### Electric Vehicle Detection

```typescript
const electrificationLevel = specs?.electrification_level?.toLowerCase() || '';
const fuelTypePrimary = specs?.fuel_type_primary?.toLowerCase() || '';

const isMildHybrid = electrificationLevel.includes('mild');
const isRegularHybrid = electrificationLevel === 'hev';
const isPHEV = electrificationLevel.includes('phev');

// Only BEVs show "Electric Motor"
const isElectric = !isMildHybrid && !isRegularHybrid && !isPHEV && (
  electrificationLevel.includes('bev') ||
  (fuelTypePrimary === 'electric' && specs?.engine_number_of_cylinders === null)
);
```

---

## 5. Manual VIN Input

### Where Users Enter VIN

**Current Web Implementation:**
- VIN input field in bid request creation form
- Located in `VinAndMileageSection.tsx` component
- 17-character validation
- Real-time VIN formatting (uppercase)

### VIN Validation

**Format Validation:**
```typescript
// VIN must be exactly 17 characters
const isValid = vin.length === 17;

// VIN can contain: A-Z (except I, O, Q) and 0-9
const vinPattern = /^[A-HJ-NPR-Z0-9]{17}$/;
```

**Validation Before API Call:**
```typescript
if (!vin || vin.length !== 17) {
  return {
    success: false,
    error: "Please enter a valid 17-character VIN"
  };
}
```

### Error Handling

**Invalid VIN:**
```typescript
toast.error("Something went wrong", {
  duration: 3000,
  description: "Please try again with a US Vin Number 1990 or Newer vehicle."
});
```

**Powersports Detected:**
```typescript
toast.error("Vehicle not supported", {
  description: "This VIN appears to be for a motorcycle, ATV, or RV. Only standard passenger vehicles are supported."
});
```

**Fallback to Manual:**
```typescript
toast.warning("Trim data unavailable. Please select manually.", {
  duration: 5000,
  description: "You can still enter vehicle details using the dropdowns below."
});
```

---

## 6. Existing Web Implementation

### Service Layer (`src/services/vinService.ts`)

```typescript
class VinService {
  /**
   * Main VIN decode method
   */
  async decodeVin(vin: string): Promise<VinDecodeResult> {
    if (!vin || vin.length !== 17) {
      return {
        success: false,
        error: "Please enter a valid 17-character VIN"
      };
    }

    try {
      const { data: response, error } = await supabase.functions.invoke('decode-vin', {
        body: { vin }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Check for powersports rejection
      if (response.error && response.vehicleType) {
        return {
          success: false,
          error: response.error
        };
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

  /**
   * Fetch trims by year/make/model for manual selection
   */
  async fetchTrimsByYearMakeModel(
    year: string,
    make: string,
    model: string
  ): Promise<TrimOption[]> {
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

### React Hook (`src/hooks/useVinDecoder.ts`)

```typescript
export function useVinDecoder() {
  const [state, setState] = useState({
    vehicleData: null,
    availableTrims: [],
    selectedTrim: null,
    isLoading: false,
    error: null
  });

  const decodeVin = async (vin: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await vinService.decodeVin(vin);

      if (result.success && result.data) {
        const vehicleData = result.data;
        const availableTrims = vehicleData.availableTrims || [];
        const selectedTrim = availableTrims.length === 1 ? availableTrims[0] : null;

        setState({
          vehicleData,
          availableTrims,
          selectedTrim,
          isLoading: false,
          error: null
        });

        toast.success("Vehicle information retrieved successfully");
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || "Failed to decode VIN"
        }));

        toast.error("Something went wrong");
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "An unexpected error occurred"
      }));

      toast.error("Something went wrong");
    }
  };

  return {
    vehicleData: state.vehicleData,
    availableTrims: state.availableTrims,
    selectedTrim: state.selectedTrim,
    isLoading: state.isLoading,
    error: state.error,
    decodeVin,
    setSelectedTrim,
    clearData
  };
}
```

---

## 7. React Native Implementation Guide

### Recommended Architecture

**Use Supabase Edge Functions (same as web)** - This ensures:
- ✅ API credentials stay server-side (secure)
- ✅ Same backend logic as web app
- ✅ No code duplication
- ✅ Automatic fallback to NHTSA
- ✅ Powersports filtering already implemented

### Installation

```bash
npm install @supabase/supabase-js
# or
yarn add @supabase/supabase-js
```

### Setup Supabase Client

```typescript
// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fdcfdbjputcitgxosnyk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkY2ZkYmpwdXRjaXRneG9zbnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4OTc2NjksImV4cCI6MjAzNDQ3MzY2OX0.x2lu4j7aZPc1zvMYS_ElsqVyzQg7WgerAD4LRPzFRZE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### VIN Service for React Native

```typescript
// src/services/vinService.ts
import { supabase } from './supabase';

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

export interface VinDecodeResult {
  success: boolean;
  data?: VehicleData;
  error?: string;
  fallbackToManual?: boolean;
}

class VinService {
  async decodeVin(vin: string): Promise<VinDecodeResult> {
    if (!vin || vin.length !== 17) {
      return {
        success: false,
        error: "Please enter a valid 17-character VIN"
      };
    }

    try {
      const { data: response, error } = await supabase.functions.invoke('decode-vin', {
        body: { vin }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (response.error && response.vehicleType) {
        return { success: false, error: response.error };
      }

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

### React Native Hook

```typescript
// src/hooks/useVinDecoder.ts
import { useState } from 'react';
import { vinService, VehicleData, TrimOption } from '../services/vinService';
import { Alert } from 'react-native';

export function useVinDecoder() {
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [availableTrims, setAvailableTrims] = useState<TrimOption[]>([]);
  const [selectedTrim, setSelectedTrim] = useState<TrimOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const decodeVin = async (vin: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await vinService.decodeVin(vin);

      if (result.success && result.data) {
        const vehicleData = result.data;
        const availableTrims = vehicleData.availableTrims || [];
        const selectedTrim = availableTrims.length === 1 ? availableTrims[0] : null;

        setVehicleData(vehicleData);
        setAvailableTrims(availableTrims);
        setSelectedTrim(selectedTrim);
        setIsLoading(false);

        Alert.alert('Success', 'Vehicle information retrieved successfully');
      } else {
        setIsLoading(false);
        setError(result.error || 'Failed to decode VIN');

        Alert.alert('Error', 'Please try again with a US VIN Number 1990 or newer');
      }
    } catch (error) {
      setIsLoading(false);
      setError('An unexpected error occurred');

      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const clearData = () => {
    setVehicleData(null);
    setAvailableTrims([]);
    setSelectedTrim(null);
    setError(null);
  };

  return {
    vehicleData,
    availableTrims,
    selectedTrim,
    isLoading,
    error,
    decodeVin,
    setSelectedTrim,
    clearData
  };
}
```

### Example React Native Component

```typescript
// src/components/VinScanner.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, ActivityIndicator, Text } from 'react-native';
import { useVinDecoder } from '../hooks/useVinDecoder';

export function VinScanner() {
  const [vin, setVin] = useState('');
  const { vehicleData, isLoading, error, decodeVin } = useVinDecoder();

  const handleDecode = () => {
    decodeVin(vin.toUpperCase());
  };

  return (
    <View>
      <TextInput
        value={vin}
        onChangeText={setVin}
        placeholder="Enter 17-character VIN"
        maxLength={17}
        autoCapitalize="characters"
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      <Button
        title="Decode VIN"
        onPress={handleDecode}
        disabled={isLoading || vin.length !== 17}
      />

      {isLoading && <ActivityIndicator size="large" />}

      {error && <Text style={{ color: 'red' }}>{error}</Text>}

      {vehicleData && (
        <View style={{ marginTop: 20 }}>
          <Text>Year: {vehicleData.year}</Text>
          <Text>Make: {vehicleData.make}</Text>
          <Text>Model: {vehicleData.model}</Text>
          <Text>Trim: {vehicleData.trim}</Text>
          <Text>Engine: {vehicleData.engineCylinders}</Text>
          <Text>Transmission: {vehicleData.transmission}</Text>
          <Text>Drivetrain: {vehicleData.drivetrain}</Text>
        </View>
      )}
    </View>
  );
}
```

---

## 8. Environment Variables

### For React Native (.env)

```bash
EXPO_PUBLIC_SUPABASE_URL=https://fdcfdbjputcitgxosnyk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkY2ZkYmpwdXRjaXRneG9zbnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4OTc2NjksImV4cCI6MjAzNDQ3MzY2OX0.x2lu4j7aZPc1zvMYS_ElsqVyzQg7WgerAD4LRPzFRZE
```

**Note:** The `VIN_API_TOKEN` and `VIN_API_SECRET` should **NOT** be in your React Native app. They stay server-side in Supabase Edge Functions for security.

---

## 9. Testing

### Test VINs

**Valid Test VINs:**
- `1HGBH41JXMN123456` - Honda Accord
- `5UXFE83578L342684` - BMW X5
- `WP0CD2Y18RSA84275` - Porsche Cayman

**Invalid VIN (for error handling):**
- `INVALID123456789` - Should return error

### Test Scenarios

1. **Valid VIN with full data**
   - Input: Valid 17-char VIN
   - Expected: Full vehicle data + trim options

2. **Valid VIN with limited data**
   - Input: Older vehicle VIN
   - Expected: Basic data, fallback to manual trim selection

3. **Invalid VIN**
   - Input: < 17 chars or invalid format
   - Expected: Validation error

4. **Powersports VIN**
   - Input: Motorcycle VIN
   - Expected: Rejection message

5. **Network error**
   - Input: Valid VIN, no internet
   - Expected: Error toast, retry option

---

## 10. Key Differences from Web

| Feature | Web App | React Native |
|---------|---------|--------------|
| **Supabase Client** | `@supabase/supabase-js` (web) | `@supabase/supabase-js` (same package) |
| **Toast Notifications** | Sonner | React Native Alert or Toast library |
| **VIN Input** | HTML Input | TextInput component |
| **Loading State** | CSS spinner | ActivityIndicator |
| **Storage** | localStorage | AsyncStorage (if needed for caching) |

---

## 11. Security Notes

**✅ Secure Implementation (Recommended):**
- API credentials stored in Supabase Edge Functions
- React Native app only calls Supabase Edge Function
- No API keys exposed in mobile app code

**❌ Insecure Implementation (NOT Recommended):**
- Direct CarAPI calls from React Native
- API credentials hardcoded or in .env
- High security risk if app is reverse-engineered

---

## 12. Performance Optimization

### Caching Strategy

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache VIN decode results
async function cacheVinResult(vin: string, data: VehicleData) {
  await AsyncStorage.setItem(`vin_${vin}`, JSON.stringify(data));
}

async function getCachedVinResult(vin: string): Promise<VehicleData | null> {
  const cached = await AsyncStorage.getItem(`vin_${vin}`);
  return cached ? JSON.parse(cached) : null;
}

// Use in decodeVin function
async decodeVin(vin: string) {
  // Check cache first
  const cached = await getCachedVinResult(vin);
  if (cached) {
    return { success: true, data: cached };
  }

  // Call API if not cached
  const result = await vinService.decodeVin(vin);
  if (result.success && result.data) {
    await cacheVinResult(vin, result.data);
  }

  return result;
}
```

---

## 13. Summary

**Recommended Approach for React Native:**

1. ✅ Install `@supabase/supabase-js`
2. ✅ Use same Supabase project (credentials provided above)
3. ✅ Reuse existing `decode-vin` Edge Function
4. ✅ Implement VIN service layer (copy from web, adjust for RN)
5. ✅ Create React Native hook similar to `useVinDecoder`
6. ✅ Use TextInput for VIN entry
7. ✅ Implement error handling with Alert
8. ✅ Optional: Add AsyncStorage caching for offline

**You do NOT need to:**
- ❌ Create new API integration
- ❌ Expose API credentials in mobile app
- ❌ Rebuild VIN decoding logic
- ❌ Handle CarAPI/NHTSA fallback manually

The Edge Function handles everything server-side! 🎉

---

**Generated:** January 2026
**Author:** Development Team
**Version:** 1.0
