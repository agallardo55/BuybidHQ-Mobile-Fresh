# BuybidHQ Condition Section - Variables & Color Schema

## Overview

The condition section uses a consistent color system based on severity/quality levels:
- **Green** = Best/No issues
- **Yellow** = Minor concerns
- **Orange** = Moderate issues
- **Red** = Severe/Replacement needed
- **Gray** = Unknown/Unselected

---

## 1. Book Values Condition

| Value | Display Label |
|-------|---------------|
| `excellent` | Excellent |
| `veryGood` | Very Good |
| `good` | Good |
| `fair` | Fair |

*Note: Uses dropdown selector, no color coding.*

---

## 2. Windshield Condition

| Value | Display Label | Color Schema |
|-------|---------------|--------------|
| `clear` | Clear | `bg-green-50 border-green-400 text-green-700` |
| `chips` | Stars | `bg-yellow-50 border-yellow-400 text-yellow-700` |
| `smallCracks` | Cracks | `bg-orange-50 border-orange-400 text-orange-700` |
| `largeCracks` | Replace | `bg-red-50 border-red-400 text-red-700` |

---

## 3. Engine/Warning Lights (Multi-select)

| Value | Display Label | Color Schema |
|-------|---------------|--------------|
| `none` | None | `bg-green-50 border-green-400 text-green-700` |
| `engine` | Engine | `bg-yellow-50 border-yellow-400 text-yellow-700` |
| `maintenance` | Transmission | `bg-yellow-50 border-yellow-400 text-yellow-700` |
| `drivetrain` | Drivetrain | `bg-yellow-50 border-yellow-400 text-yellow-700` |
| `airbag` | Airbags | `bg-yellow-50 border-yellow-400 text-yellow-700` |
| `multiple` | Others | `bg-red-50 border-red-400 text-red-700` |

---

## 4. Maintenance Condition

| Value | Display Label | Color Schema |
|-------|---------------|--------------|
| `upToDate` | Up to date | `bg-green-50 border-green-400 text-green-700` |
| `basicService` | Basic | `bg-yellow-50 border-yellow-400 text-yellow-700` |
| `minorService` | Minor | `bg-orange-50 border-orange-400 text-orange-700` |
| `majorService` | Major | `bg-red-50 border-red-400 text-red-700` |

---

## 5. Brakes Condition

| Value | Display Label | Color Schema |
|-------|---------------|--------------|
| `acceptable` | Acceptable | `bg-green-50 border-green-400 text-green-700` |
| `replaceFront` | Replace front | `bg-yellow-50 border-yellow-400 text-yellow-700` |
| `replaceRear` | Replace rear | `bg-orange-50 border-orange-400 text-orange-700` |
| `replaceAll` | Replace all | `bg-red-50 border-red-400 text-red-700` |

**Quadrant Data Format:** `frontLeft:8,frontRight:8,rearLeft:8,rearRight:8` (values 1-10)

---

## 6. Tires Condition

| Value | Display Label | Color Schema |
|-------|---------------|--------------|
| `acceptable` | Acceptable | `bg-green-50 border-green-400 text-green-700` |
| `replaceFront` | Replace front | `bg-yellow-50 border-yellow-400 text-yellow-700` |
| `replaceRear` | Replace rear | `bg-orange-50 border-orange-400 text-orange-700` |
| `replaceAll` | Replace all | `bg-red-50 border-red-400 text-red-700` |

**Quadrant Data Format:** `frontLeft:9,frontRight:9,rearLeft:9,rearRight:9` (values 1-10)

---

## 7. Vehicle History Status

| Value | Display Label | Color Schema |
|-------|---------------|--------------|
| `noAccidents` | No Accidents | `bg-green-50 border-green-400 text-green-700` |
| `minorAccident` | Minor Accident | `bg-yellow-50 border-yellow-400 text-yellow-700` |
| `odomError` | Odom Error | `bg-yellow-50 border-yellow-400 text-yellow-700` |
| `majorAccident` | Major Accident | `bg-red-50 border-red-400 text-red-700` |
| `brandedIssue` | Branded Title | `bg-red-50 border-red-400 text-red-700` |
| `unknown` | Unknown | `bg-gray-50 border-gray-400 text-gray-700` |

---

## 8. History Source (Provider)

| Value | Display Label |
|-------|---------------|
| `Unknown` | Unknown |
| `AutoCheck` | AutoCheck |
| `CarFax` | CarFax |

*Note: Variable name is `historyService` in code, but UI label is "History Source" or "Report Provider"*

---

## Unselected State (All Cards)

```
bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50
```

---

## Tailwind Color Reference

| Level | Background | Border | Text | Hover |
|-------|------------|--------|------|-------|
| Green | `bg-green-50` | `border-green-400` | `text-green-700` | `hover:bg-green-100` |
| Yellow | `bg-yellow-50` | `border-yellow-400` | `text-yellow-700` | `hover:bg-yellow-100` |
| Orange | `bg-orange-50` | `border-orange-400` | `text-orange-700` | `hover:bg-orange-100` |
| Red | `bg-red-50` | `border-red-400` | `text-red-700` | `hover:bg-red-100` |
| Gray | `bg-gray-50` | `border-gray-400` | `text-gray-700` | `hover:bg-gray-100` |

---

## Related Files

- `src/components/bid-request/VehicleCondition.tsx` - Main condition UI component
- `src/components/bid-request/components/ChipSelector.tsx` - Reusable chip selector with colors
- `src/components/bid-request/components/BrakesAndTiresSection.tsx` - Brakes/tires quadrant UI
- `src/components/bid-request/utils/conditionFormatting.ts` - Display formatting logic
- `src/components/bid-request/constants/defaultValues.ts` - Default values
- `src/components/bid-request/types.ts` - TypeScript type definitions
