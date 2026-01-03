# Bid Request Form Redesign V2 - Architecture Specification

## Executive Summary
Redesign the bid request form from a single-column, tab-based layout to a modern split-column professional dashboard with persistent vehicle context and enhanced visual hierarchy.

## Current Architecture Analysis

### Existing Components (Keep Logic Intact)
- **CreateBidRequest.tsx** - Main page container
- **MultiStepForm.tsx** - Form orchestration and state management
- **BasicVehicleInfo.tsx** - Vehicle details (VIN, year, make, model, trim, mileage, specs)
- **FormProgress.tsx** - Step indicator component
- **FormTabs.tsx** - Tab navigation component
- **ColorsAndAccessories.tsx** - Appearance step
- **VehicleCondition.tsx** - Condition assessment step
- **BookValues.tsx** - Pricing information step
- **BuyersSection.tsx** - Buyer selection step
- **StepNavigation.tsx** - Next/Back buttons

### Current Flow
1. User enters vehicle info (BasicVehicleInfo always visible)
2. FormProgress shows completion status
3. FormTabs for navigation between steps
4. Tab content changes based on current step
5. StepNavigation for progression

## New Design Schema

### 1. Global Layout Architecture

#### Container Structure
```typescript
// CreateBidRequest.tsx - New Layout
<div className="min-h-screen bg-slate-50/30 flex flex-col">
  <DashboardNavigation />

  <div className="pt-20 px-6 lg:px-12 pb-20 sm:pb-8 flex-grow">
    {/* CHANGE: Wider container for split layout */}
    <div className="max-w-[1400px] mx-auto"> {/* Changed from max-w-[1920px] */}

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">
          Create Bid Request
        </h1>
        <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mt-0.5">
          Vehicle Submission Workflow
        </p>
      </div>

      {/* NEW: Full-width Progress Indicator */}
      <div className="mb-6">
        <FormProgress currentStep={currentStep} progressMap={progressMap} />
      </div>

      {/* NEW: Split-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: Sticky Vehicle Context */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <VehicleSummaryCard
              formData={formData}
              uploadedImageUrls={uploadedImageUrls}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Main Form Content */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
            <MultiStepForm {...props} />
          </div>
        </div>

      </div>
    </div>
  </div>
  <Footer />
</div>
```

### 2. Component Redesigns

#### A. FormProgress.tsx (Step Indicator)
**Current**: Progress bar inside form
**New**: Full-width breadcrumb-style stepper above split columns

```typescript
// Visual Schema
<div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
  <div className="flex items-center justify-between">
    {steps.map((step, index) => (
      <div key={step.id} className="flex items-center flex-1">
        {/* Step Circle */}
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
          isComplete ? "bg-brand border-brand text-white" :
          isActive ? "border-brand text-brand bg-brand/10" :
          "border-slate-300 text-slate-400 bg-white"
        )}>
          {isComplete ? <Check className="h-5 w-5" /> : index + 1}
        </div>

        {/* Step Label */}
        <div className="ml-3 flex-1">
          <p className={cn(
            "text-[11px] font-bold uppercase tracking-widest",
            isActive ? "text-brand" : "text-slate-600"
          )}>
            {step.label}
          </p>
          <p className="text-[10px] text-slate-500">
            {step.description}
          </p>
        </div>

        {/* Connector Line */}
        {index < steps.length - 1 && (
          <div className={cn(
            "h-0.5 flex-1 mx-4",
            isComplete ? "bg-brand" : "bg-slate-200"
          )} />
        )}
      </div>
    ))}
  </div>
</div>

// Steps Configuration
const steps = [
  { id: 'basic-info', label: 'Vehicle', description: 'Basic details' },
  { id: 'appearance', label: 'Appearance', description: 'Colors & images' },
  { id: 'condition', label: 'Condition', description: 'Assessment' },
  { id: 'book-values', label: 'Valuation', description: 'Pricing' },
  { id: 'buyers', label: 'Buyers', description: 'Selection' }
];
```

#### B. VehicleSummaryCard (New Component - Replaces Left-Side Context)
**Purpose**: Sticky summary of vehicle identity that stays visible during form completion

```typescript
// src/components/bid-request/VehicleSummaryCard.tsx
interface VehicleSummaryCardProps {
  formData: BidRequestFormData;
  uploadedImageUrls: string[];
}

export const VehicleSummaryCard = ({ formData, uploadedImageUrls }: VehicleSummaryCardProps) => {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
          Vehicle Summary
        </h3>
      </div>

      {/* Primary Image */}
      {uploadedImageUrls[0] && (
        <div className="aspect-video w-full bg-slate-100">
          <img
            src={uploadedImageUrls[0]}
            alt="Vehicle primary"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Vehicle Identity - Vertical Stack */}
      <div className="p-6 space-y-4">
        {/* VIN */}
        {formData.vin && (
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
              VIN
            </label>
            <code className="text-[13px] font-mono text-slate-900 bg-slate-50 px-3 py-2 rounded border border-slate-200 block">
              {formData.vin}
            </code>
          </div>
        )}

        {/* Year Make Model */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
            Vehicle
          </label>
          <p className="text-[15px] font-semibold text-slate-900">
            {formData.year} {formData.make} {formData.model}
          </p>
          {formData.displayTrim && (
            <p className="text-[13px] text-slate-600 mt-1">
              {formData.displayTrim}
            </p>
          )}
        </div>

        {/* Mileage */}
        {formData.mileage && (
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
              Mileage
            </label>
            <p className="text-[13px] text-slate-900">
              {parseInt(formData.mileage).toLocaleString()} miles
            </p>
          </div>
        )}

        {/* Drivetrain & Transmission */}
        {(formData.drivetrain || formData.transmission) && (
          <div className="grid grid-cols-2 gap-3">
            {formData.drivetrain && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Drive
                </label>
                <p className="text-[13px] text-slate-900">
                  {formData.drivetrain}
                </p>
              </div>
            )}
            {formData.transmission && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Trans
                </label>
                <p className="text-[13px] text-slate-900">
                  {formData.transmission}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Engine */}
        {formData.engineCylinders && (
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
              Engine
            </label>
            <p className="text-[13px] text-slate-900">
              {formData.engineCylinders}
            </p>
          </div>
        )}

        {/* Colors */}
        {(formData.exteriorColor || formData.interiorColor) && (
          <div className="pt-3 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-3">
              {formData.exteriorColor && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                    Exterior
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300"
                         style={{ backgroundColor: formData.exteriorColor.toLowerCase() }} />
                    <span className="text-[13px] text-slate-900">
                      {formData.exteriorColor}
                    </span>
                  </div>
                </div>
              )}
              {formData.interiorColor && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                    Interior
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300"
                         style={{ backgroundColor: formData.interiorColor.toLowerCase() }} />
                    <span className="text-[13px] text-slate-900">
                      {formData.interiorColor}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Image Gallery Thumbnails */}
      {uploadedImageUrls.length > 1 && (
        <div className="px-6 pb-6">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            Images ({uploadedImageUrls.length})
          </label>
          <div className="grid grid-cols-4 gap-2">
            {uploadedImageUrls.slice(0, 4).map((url, index) => (
              <div key={index} className="aspect-square rounded border border-slate-200 overflow-hidden bg-slate-50">
                <img src={url} alt={`Vehicle ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

#### C. MultiStepForm.tsx Refactor
**Current**: Contains BasicVehicleInfo, FormProgress, FormTabs
**New**: Contains only tabs and step content (vehicle summary moved to left column)

```typescript
// Remove BasicVehicleInfo from here (moved to VehicleSummaryCard)
// Remove FormProgress from here (moved to full-width above grid)

const MultiStepForm = ({ ... }: MultiStepFormProps) => {
  return (
    <Tabs value={currentStep} className="w-full" onValueChange={...}>
      {/* Tabs Header */}
      <div className="border-b border-slate-100 px-6">
        <FormTabs />
      </div>

      {/* Tab Content Area */}
      <div className="p-6">
        <TabsContent value="appearance">
          <ColorsAndAccessories {...props} />
          <StepNavigation
            showBack={false}
            onNext={handleNext}
          />
        </TabsContent>

        <TabsContent value="condition">
          <VehicleCondition {...props} />
          <StepNavigation
            onBack={handleBack}
            onNext={handleNext}
          />
        </TabsContent>

        <TabsContent value="book-values">
          <BookValues {...props} />
          <StepNavigation
            onBack={handleBack}
            onNext={handleNext}
          />
        </TabsContent>

        <TabsContent value="buyers">
          <BuyersSection {...props} />
          <StepNavigation
            onBack={handleBack}
            onNext={handleNext}
            nextLabel="Submit Request"
            isSubmitting={isSubmitting}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};
```

#### D. FormTabs.tsx Update
**Purpose**: Clean horizontal tab navigation

```typescript
<TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0">
  <TabsTrigger
    value="appearance"
    className={cn(
      "text-[11px] font-bold uppercase tracking-widest py-3 rounded-none border-b-2 border-transparent",
      "data-[state=active]:border-brand data-[state=active]:text-brand data-[state=active]:bg-transparent",
      "text-slate-600 hover:text-slate-900"
    )}
  >
    Appearance
  </TabsTrigger>
  <TabsTrigger value="condition">Condition</TabsTrigger>
  <TabsTrigger value="book-values">Valuation</TabsTrigger>
  <TabsTrigger value="buyers">Buyers</TabsTrigger>
</TabsList>
```

### 3. Responsive Behavior

#### Breakpoint Strategy
```typescript
// Mobile (< 1024px): Single column, stack all components
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
  // On mobile: Both columns stack vertically
  // Vehicle summary appears first, then form

// Desktop (>= 1024px): Split layout with sticky sidebar
  <div className="lg:col-span-4">
    <div className="lg:sticky lg:top-24"> // Sticky only on large screens
      <VehicleSummaryCard />
    </div>
  </div>
</div>
```

#### Mobile Optimizations
1. FormProgress: Stack steps vertically on mobile
2. VehicleSummaryCard: Collapsible on mobile with "View Vehicle Summary" toggle
3. FormTabs: Horizontal scroll on mobile
4. StepNavigation: Full-width buttons on mobile

### 4. Visual Design Tokens

#### Colors (Maintain Enterprise Schema)
```typescript
// Backgrounds
background: 'bg-slate-50/30' // Page background
card: 'bg-white' // All cards and containers
cardHeader: 'bg-slate-50' // Card headers (vehicle summary, section headers)

// Borders
border: 'border-slate-100' // Card borders
borderInput: 'border-slate-200' // Input borders
borderActive: 'border-brand' // Active/focused borders

// Text
primary: 'text-slate-900' // Primary text
secondary: 'text-slate-600' // Secondary text
muted: 'text-slate-500' // Muted text
label: 'text-slate-600' // Label text (11px uppercase)

// Brand
brand: '#325AE7' // Primary brand color
brandHover: 'bg-brand/90' // Brand hover state
brandFocus: 'focus:border-brand focus:ring-brand/20'
```

#### Typography
```typescript
// Headers
pageTitle: 'text-[22px] font-bold text-slate-900 tracking-tight'
pageSubtitle: 'text-[11px] font-mono uppercase tracking-wider text-slate-500'
sectionLabel: 'text-[11px] font-bold uppercase tracking-widest text-slate-600'

// Content
cardTitle: 'text-[15px] font-semibold text-slate-900'
bodyText: 'text-[13px] text-slate-900'
smallText: 'text-[11px] text-slate-500'
codeText: 'text-[13px] font-mono'
```

#### Spacing
```typescript
container: 'max-w-[1400px]' // Main container
containerPadding: 'px-6 lg:px-12'
cardPadding: 'p-6'
sectionGap: 'gap-6'
fieldGap: 'gap-4'
```

### 5. State Management (No Changes)
- Keep all existing hooks (useCreateBidRequest, useFormNavigation)
- Maintain all form validation logic
- Preserve all VIN decoding functionality
- Keep all image upload handling
- Maintain buyer selection logic

### 6. Implementation Phases

#### Phase 1: Layout Shell
1. Update CreateBidRequest.tsx with new grid layout
2. Create VehicleSummaryCard component
3. Move FormProgress to full-width position
4. Test responsive behavior

#### Phase 2: Component Refactoring
1. Refactor MultiStepForm to remove BasicVehicleInfo
2. Update FormProgress to breadcrumb style
3. Update FormTabs styling
4. Test navigation flow

#### Phase 3: Visual Polish
1. Update all enterprise color tokens
2. Refine sticky positioning
3. Add smooth transitions
4. Test cross-browser compatibility

#### Phase 4: Mobile Optimization
1. Implement mobile-specific layouts
2. Add collapsible vehicle summary
3. Optimize touch targets
4. Test on various devices

### 7. File Structure

```
src/
├── pages/
│   └── CreateBidRequest.tsx (MAJOR REFACTOR - new layout)
├── components/
│   └── bid-request/
│       ├── MultiStepForm.tsx (REFACTOR - remove BasicVehicleInfo)
│       ├── VehicleSummaryCard.tsx (NEW - left column sticky card)
│       ├── FormProgress.tsx (REFACTOR - breadcrumb style)
│       ├── FormTabs.tsx (UPDATE - styling only)
│       ├── BasicVehicleInfo.tsx (DEPRECATED - logic moved to VehicleSummaryCard)
│       ├── ColorsAndAccessories.tsx (NO CHANGE)
│       ├── VehicleCondition.tsx (NO CHANGE)
│       ├── BookValues.tsx (NO CHANGE)
│       ├── BuyersSection.tsx (NO CHANGE)
│       └── StepNavigation.tsx (MINOR UPDATE - styling)
```

### 8. Success Metrics

#### User Experience
- Vehicle context always visible (no scrolling to reference)
- Clear progress indication at all times
- Professional, modern aesthetic
- Smooth navigation between steps
- Fast perceived performance

#### Technical
- No regression in form validation
- All existing functionality preserved
- Responsive across all breakpoints
- Accessible (WCAG 2.1 AA)
- Performance: < 100ms interaction response

### 9. Migration Strategy

1. **Feature Flag**: Implement behind `ENABLE_V2_FORM_LAYOUT` flag
2. **Parallel Development**: Keep V1 fully functional during development
3. **A/B Testing**: Roll out to 10% of users initially
4. **Gradual Rollout**: Increase to 50%, then 100% over 2 weeks
5. **Rollback Plan**: One-click toggle back to V1 if issues arise

## Conclusion

This redesign maintains all existing business logic and functionality while dramatically improving the user experience through better information architecture and visual hierarchy. The split-column layout with sticky vehicle context addresses the #1 user pain point: losing track of vehicle details while completing the long form.

The implementation is fully aligned with our enterprise design system and can be rolled out incrementally with zero risk to existing functionality.
