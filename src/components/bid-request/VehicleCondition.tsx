
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState, useEffect, useCallback } from "react";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import { cn } from "@/lib/utils";
import autocheckImage from "@/assets/autocheck.png";
import carfaxImage from "@/assets/carfax_logo.svg";
import ChipSelector from "./components/ChipSelector";
import BrakesAndTiresSection from "./components/BrakesAndTiresSection";
import { DEFAULT_BRAKES, DEFAULT_TIRES } from "./constants/defaultValues";
import { ThumbsUp, Star, Zap, AlertTriangle, Cog, List, Car, Wrench, Check, Gauge, ScrollText, HelpCircle, Sparkles, FileText } from "lucide-react";

// Components for multiple wrench icons
const OneWrench = ({ className }: { className?: string }) => (
  <div className="flex items-center gap-0.5">
    <Wrench className={className || "h-4 w-4"} />
  </div>
);

const TwoWrenches = ({ className }: { className?: string }) => (
  <div className="flex items-center gap-0.5">
    <Wrench className={className || "h-4 w-4"} />
    <Wrench className={className || "h-4 w-4"} />
  </div>
);

const ThreeWrenches = ({ className }: { className?: string }) => (
  <div className="flex items-center gap-0.5">
    <Wrench className={className || "h-4 w-4"} />
    <Wrench className={className || "h-4 w-4"} />
    <Wrench className={className || "h-4 w-4"} />
  </div>
);

const TwoExclamations = ({ className }: { className?: string }) => (
  <div className="flex items-center gap-0.5">
    <AlertTriangle className={className || "h-4 w-4"} />
    <AlertTriangle className={className || "h-4 w-4"} />
  </div>
);

interface VehicleConditionProps {
  formData: {
    windshield: string;
    engineLights: string;
    brakes: string;
    tire: string;
    maintenance: string;
    reconEstimate: string;
    reconDetails: string;
    history?: string;
    historyService?: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (value: string, name: string) => void;
}

const VehicleCondition = ({ formData, onChange, onSelectChange }: VehicleConditionProps) => {
  const [displayValue, setDisplayValue] = useState('$0');
  const [currentService, setCurrentService] = useState<string>('');
  const { alert, showAlert, closeAlert } = useAlertDialog();

  // Use form state for history service selection (now persisted to database)
  const selectedHistoryService = formData.historyService || '';

  // Defaults are already set in useFormState.ts initialFormData
  // Just use formData values (with fallback for defensive programming)
  const brakesValue = formData.brakes || DEFAULT_BRAKES;
  const tiresValue = formData.tire || DEFAULT_TIRES;

  const handleIntegrationClick = (service: string) => {
    // Toggle selection - update form state instead of local state
    const newValue = selectedHistoryService === service ? '' : service;
    onSelectChange(newValue, 'historyService');
  };

  const formatDollarAmount = (value: string | undefined | null) => {
    console.log('formatDollarAmount called with:', { value, type: typeof value });
    
    // Handle undefined, null, or empty cases
    if (value === undefined || value === null || value === '') {
      console.log('formatDollarAmount returning $0 for empty/null/undefined');
      return '$0';
    }
    
    const numericValue = String(value).replace(/\D/g, '');
    console.log('formatDollarAmount numeric extraction:', { original: value, numeric: numericValue });
    
    if (!numericValue || numericValue === '0') {
      console.log('formatDollarAmount returning $0 for zero/empty numeric');
      return '$0';
    }
    
    const parsedValue = Number(numericValue);
    console.log('formatDollarAmount parsed number:', { numeric: numericValue, parsed: parsedValue, isNaN: isNaN(parsedValue) });
    
    if (isNaN(parsedValue)) {
      console.log('formatDollarAmount returning $0 for NaN');
      return '$0';
    }
    
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(parsedValue);
    
    console.log('formatDollarAmount final result:', formatted);
    return formatted;
  };

  // Update display value whenever formData.reconEstimate changes
  useEffect(() => {
    console.log('useEffect triggered with formData.reconEstimate:', { 
      value: formData.reconEstimate, 
      type: typeof formData.reconEstimate 
    });
    const formatted = formatDollarAmount(formData.reconEstimate);
    console.log('useEffect setting displayValue to:', formatted);
    setDisplayValue(formatted);
  }, [formData.reconEstimate]);

  const handleReconEstimateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Extract numeric value
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    
    // Create a proper synthetic event that matches the expected format
    const syntheticEvent = {
      target: {
        name: 'reconEstimate',
        value: rawValue,
        type: 'text',
        id: 'reconEstimate'
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    // Update form state with raw numeric value
    onChange(syntheticEvent);
    
    // Log the state update
    console.log('Recon estimate change:', {
      rawValue,
      formattedValue: formatDollarAmount(rawValue),
      currentFormData: formData.reconEstimate
    });
  };

  // Handle chip selection changes - convert array to comma-separated string
  const handleChipChange = useCallback((selectedValues: string[], fieldName: string) => {
    // Convert array to comma-separated string for formData storage
    const valueString = selectedValues.length > 0 ? selectedValues.join(',') : '';
    onSelectChange(valueString, fieldName);
  }, [onSelectChange]);

  // Handle Warning Lights multi-select toggle
  const handleWarningLightsToggle = useCallback((value: string) => {
    // Parse current selection (could be single value or comma-separated string)
    const currentValue = formData.engineLights || '';
    const currentSelections = currentValue 
      ? currentValue.split(',').map(v => v.trim()).filter(Boolean)
      : [];
    
    // Toggle selection
    let newSelections: string[];
    if (currentSelections.includes(value)) {
      // Remove if already selected
      newSelections = currentSelections.filter(v => v !== value);
    } else {
      // Add if not selected
      newSelections = [...currentSelections, value];
    }
    
    // Convert back to comma-separated string
    const valueString = newSelections.length > 0 ? newSelections.join(',') : '';
    onSelectChange(valueString, 'engineLights');
  }, [formData.engineLights, onSelectChange]);

  // Parse quadrant data from string format (for backward compatibility)
  const parseQuadrantData = (value: string): { frontLeft: number | null; frontRight: number | null; rearLeft: number | null; rearRight: number | null } => {
    // Default to all null
    const defaultData = { frontLeft: null, frontRight: null, rearLeft: null, rearRight: null };
    
    if (!value || value === '') {
      return defaultData;
    }

    // Parse format: "frontLeft:8.5,frontRight:6.2,rearLeft:4.0,rearRight:3.5"
    const parts = value.split(',');
    const data = { ...defaultData };

    parts.forEach(part => {
      const [position, measurementStr] = part.split(':');
      if (position && measurementStr) {
        const measurement = parseFloat(measurementStr);
        if (!isNaN(measurement) && position in data) {
          (data as any)[position] = measurement;
        }
      }
    });

    return data;
  };

  // Convert quadrant data to string format for formData storage
  const quadrantDataToString = (data: { frontLeft: number | null; frontRight: number | null; rearLeft: number | null; rearRight: number | null }): string => {
    const parts: string[] = [];
    if (data.frontLeft !== null) parts.push(`frontLeft:${data.frontLeft}`);
    if (data.frontRight !== null) parts.push(`frontRight:${data.frontRight}`);
    if (data.rearLeft !== null) parts.push(`rearLeft:${data.rearLeft}`);
    if (data.rearRight !== null) parts.push(`rearRight:${data.rearRight}`);
    return parts.join(',');
  };

  // Handle quadrant measurement change
  const handleQuadrantMeasurementChange = (fieldName: "brakes" | "tire", position: "frontLeft" | "frontRight" | "rearLeft" | "rearRight", value: number | null) => {
    const currentData = parseQuadrantData(formData[fieldName]);
    const newData = { ...currentData, [position]: value };
    const valueString = quadrantDataToString(newData);
    onSelectChange(valueString, fieldName);
  };

  // Define options for each condition field
  const windshieldOptions = [
    { 
      value: 'clear', 
      label: 'Clear', 
      icon: ThumbsUp,
      colorScheme: {
        selected: "bg-green-50 border-green-400 text-green-700 hover:bg-green-100",
        unselected: "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
      }
    },
    { 
      value: 'chips', 
      label: 'Stars', 
      icon: Sparkles,
      colorScheme: {
        selected: "bg-yellow-50 border-yellow-400 text-yellow-700 hover:bg-yellow-100",
        unselected: "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
      }
    },
    { 
      value: 'smallCracks', 
      label: 'Cracks', 
      icon: Zap,
      colorScheme: {
        selected: "bg-orange-50 border-orange-400 text-orange-700 hover:bg-orange-100",
        unselected: "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
      }
    },
    { 
      value: 'largeCracks', 
      label: 'Replace', 
      icon: AlertTriangle,
      colorScheme: {
        selected: "bg-red-50 border-red-400 text-red-700 hover:bg-red-100",
        unselected: "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
      }
    },
  ];

  const engineLightsOptions = [
    { 
      value: 'none', 
      label: 'None', 
      icon: ThumbsUp,
      colorScheme: {
        selected: "bg-green-50 border-green-400 text-green-700 hover:bg-green-100",
        unselected: "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
      }
    },
    { 
      value: 'engine', 
      label: 'Engine', 
      icon: AlertTriangle,
      colorScheme: {
        selected: "bg-yellow-50 border-yellow-400 text-yellow-700 hover:bg-yellow-100",
        unselected: "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
      }
    },
    { 
      value: 'maintenance', 
      label: 'Transmission', 
      icon: Cog,
      colorScheme: {
        selected: "bg-yellow-50 border-yellow-400 text-yellow-700 hover:bg-yellow-100",
        unselected: "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
      }
    },
    { 
      value: 'drivetrain', 
      label: 'Drivetrain', 
      icon: Wrench,
      colorScheme: {
        selected: "bg-yellow-50 border-yellow-400 text-yellow-700 hover:bg-yellow-100",
        unselected: "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
      }
    },
    { 
      value: 'airbag', 
      label: 'Airbags', 
      icon: AlertTriangle,
      colorScheme: {
        selected: "bg-yellow-50 border-yellow-400 text-yellow-700 hover:bg-yellow-100",
        unselected: "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
      }
    },
    { 
      value: 'multiple', 
      label: 'Others', 
      icon: List,
      colorScheme: {
        selected: "bg-red-50 border-red-400 text-red-700 hover:bg-red-100",
        unselected: "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
      }
    },
  ];

  const brakesOptions = [
    { value: 'acceptable', label: 'Acceptable' },
    { value: 'replaceFront', label: 'Replace front' },
    { value: 'replaceRear', label: 'Replace rear' },
    { value: 'replaceAll', label: 'Replace all' },
  ];

  const tireOptions = [
    { value: 'acceptable', label: 'Acceptable' },
    { value: 'replaceFront', label: 'Replace front' },
    { value: 'replaceRear', label: 'Replace rear' },
    { value: 'replaceAll', label: 'Replace all' },
  ];

  const maintenanceOptions = [
    { 
      value: 'upToDate', 
      label: 'Up to date', 
      icon: ThumbsUp,
      colorScheme: {
        selected: "bg-green-50 border-green-400 text-green-700 hover:bg-green-100",
        unselected: "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
      }
    },
    { 
      value: 'basicService', 
      label: 'Basic', 
      icon: OneWrench,
      colorScheme: {
        selected: "bg-yellow-50 border-yellow-400 text-yellow-700 hover:bg-yellow-100",
        unselected: "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
      }
    },
    { 
      value: 'minorService', 
      label: 'Minor', 
      icon: TwoWrenches,
      colorScheme: {
        selected: "bg-orange-50 border-orange-400 text-orange-700 hover:bg-orange-100",
        unselected: "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
      }
    },
    { 
      value: 'majorService', 
      label: 'Major', 
      icon: ThreeWrenches,
      colorScheme: {
        selected: "bg-red-50 border-red-400 text-red-700 hover:bg-red-100",
        unselected: "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
      }
    },
  ];

  const historyOptions = [
    { 
      value: 'noAccidents', 
      label: 'No Accidents', 
      icon: ThumbsUp,
      severity: 'green' as const
    },
    { 
      value: 'minorAccident', 
      label: 'Minor Accident', 
      icon: AlertTriangle,
      severity: 'yellow' as const
    },
    { 
      value: 'odomError', 
      label: 'Odom Error', 
      icon: Gauge,
      severity: 'yellow' as const
    },
    { 
      value: 'majorAccident', 
      label: 'Major Accident', 
      icon: AlertTriangle,
      severity: 'red' as const
    },
    { 
      value: 'brandedIssue', 
      label: 'Branded Title', 
      icon: FileText,
      severity: 'red' as const
    },
    { 
      value: 'unknown', 
      label: 'Unknown', 
      icon: HelpCircle,
      severity: 'gray' as const
    },
  ];

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
      {/* Vehicle History Report Integrations */}
      <div className="bg-white rounded-lg p-3 sm:p-4 md:p-5 lg:p-6 border border-gray-200 mb-4 sm:mb-5 md:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* AutoCheck Column */}
          <button
            type="button"
            onClick={() => handleIntegrationClick("AutoCheck")}
            className={`
              flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 transition-all cursor-pointer w-full
              ${selectedHistoryService === "AutoCheck"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300 bg-white hover:border-blue-600"
              }
            `}
          >
            {/* Radio Button */}
            <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
              {selectedHistoryService === "AutoCheck" ? (
                <div className="relative w-5 h-5">
                  <div className="absolute inset-0 border-2 border-blue-600 bg-white rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full" />
                  </div>
                </div>
              ) : (
                <div className="w-5 h-5 border-2 border-gray-400 rounded-full bg-white" />
              )}
            </div>
            <img 
              src={autocheckImage} 
              alt="AutoCheck" 
              className="h-5 sm:h-6 w-auto max-w-full object-contain flex-shrink" 
            />
          </button>

          {/* CARFAX Column */}
          <button
            type="button"
            onClick={() => handleIntegrationClick("CarFax")}
            className={`
              flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 transition-all cursor-pointer w-full
              ${selectedHistoryService === "CarFax"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300 bg-white hover:border-blue-600"
              }
            `}
          >
            {/* Radio Button */}
            <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
              {selectedHistoryService === "CarFax" ? (
                <div className="relative w-5 h-5">
                  <div className="absolute inset-0 border-2 border-blue-600 bg-white rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full" />
                  </div>
                </div>
              ) : (
                <div className="w-5 h-5 border-2 border-gray-400 rounded-full bg-white" />
              )}
            </div>
            <img 
              src={carfaxImage} 
              alt="CarFax" 
              className="h-5 sm:h-6 w-auto max-w-full object-contain flex-shrink" 
            />
          </button>
        </div>
        <div className="mt-3 sm:mt-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">History</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
            {historyOptions.map((option) => {
              const isSelected = formData.history === option.value;
              const Icon = option.icon;
              
              // Define color classes based on severity
              const severityColors = {
                green: isSelected 
                  ? 'bg-green-50 border-green-400 text-green-700 hover:bg-green-100'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50',
                yellow: isSelected
                  ? 'bg-yellow-50 border-yellow-400 text-yellow-700 hover:bg-yellow-100'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50',
                red: isSelected
                  ? 'bg-red-50 border-red-400 text-red-700 hover:bg-red-100'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50',
                gray: isSelected
                  ? 'bg-gray-50 border-gray-400 text-gray-700 hover:bg-gray-100'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              };
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSelectChange(option.value, 'history')}
                  aria-label={`Accident history: ${option.label}`}
                  className={cn(
                    "h-10 w-full rounded-md border-2 px-3 py-2 text-sm font-medium transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400",
                    "inline-flex items-center justify-center gap-1.5",
                    severityColors[option.severity]
                  )}
                  aria-pressed={isSelected}
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Windshield, Engine Lights, and Maintenance Condition Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Windshield Section */}
        <div className="bg-white rounded-lg p-3 sm:p-4 md:p-5 lg:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Windshield</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {windshieldOptions.map((option) => {
              const isSelected = formData.windshield === option.value;
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSelectChange(option.value, "windshield")}
                  className={cn(
                    "h-10 w-full rounded-md border-2 px-3 py-2 text-sm font-medium transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400",
                    "inline-flex items-center justify-center gap-1.5",
                    isSelected ? option.colorScheme.selected : option.colorScheme.unselected
                  )}
                  aria-pressed={isSelected}
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Engine Lights Section */}
        <div className="bg-white rounded-lg p-3 sm:p-4 md:p-5 lg:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Warning Lights</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {engineLightsOptions.map((option) => {
              // Parse current selection to check if this option is selected
              const currentValue = formData.engineLights || '';
              const currentSelections = currentValue 
                ? currentValue.split(',').map(v => v.trim()).filter(Boolean)
                : [];
              const isSelected = currentSelections.includes(option.value);
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleWarningLightsToggle(option.value)}
                  className={cn(
                    "h-10 w-full rounded-md border-2 px-3 py-2 text-sm font-medium transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400",
                    "inline-flex items-center justify-center gap-1.5",
                    isSelected ? option.colorScheme.selected : option.colorScheme.unselected
                  )}
                  aria-pressed={isSelected}
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Maintenance Section */}
        <div className="bg-white rounded-lg p-3 sm:p-4 md:p-5 lg:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Maintenance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {maintenanceOptions.map((option) => {
              const isSelected = formData.maintenance === option.value;
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSelectChange(option.value, "maintenance")}
                  className={cn(
                    "h-10 w-full rounded-md border-2 px-3 py-2 text-sm font-medium transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400",
                    "inline-flex items-center justify-center gap-1.5",
                    isSelected ? option.colorScheme.selected : option.colorScheme.unselected
                  )}
                  aria-pressed={isSelected}
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Brakes and Tires Combined Section */}
      <BrakesAndTiresSection
        brakesData={parseQuadrantData(brakesValue)}
        tiresData={parseQuadrantData(tiresValue)}
        onBrakesChange={(data) => {
          const valueString = quadrantDataToString(data);
          onSelectChange(valueString, "brakes");
        }}
        onTiresChange={(data) => {
          const valueString = quadrantDataToString(data);
          onSelectChange(valueString, "tire");
        }}
      />

      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        <div>
          <label htmlFor="reconEstimate" className="block text-sm sm:text-base font-bold text-gray-700 mb-1 sm:mb-2">
            Recon Estimate
          </label>
          <Input
            id="reconEstimate"
            name="reconEstimate"
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleReconEstimateChange}
            placeholder="$0"
            className="font-mono focus:ring-1 focus:ring-offset-0"
          />
        </div>
        <div>
          <label htmlFor="reconDetails" className="block text-sm sm:text-base font-bold text-gray-700 mb-1 sm:mb-2">
            Recon Details
          </label>
          <Textarea
            id="reconDetails"
            name="reconDetails"
            value={formData.reconDetails}
            onChange={onChange}
            placeholder="Enter reconditioning details..."
            className="min-h-[100px] focus-visible:ring-custom-blue"
          />
        </div>
      </div>

      {/* Alert Dialog */}
      <AlertDialog open={alert.open} onOpenChange={closeAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">{alert.title}</AlertDialogTitle>
          </AlertDialogHeader>
          
          {/* Large Logo Section */}
          <div className="flex justify-center py-6">
            <img 
              src={currentService === "AutoCheck" ? autocheckImage : carfaxImage} 
              alt={currentService} 
              className="h-20 w-auto object-contain" 
            />
          </div>
          
          <AlertDialogDescription className="text-center px-6 pb-4">
            {alert.message}
          </AlertDialogDescription>
          
          <AlertDialogFooter>
            <AlertDialogAction onClick={closeAlert}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VehicleCondition;
