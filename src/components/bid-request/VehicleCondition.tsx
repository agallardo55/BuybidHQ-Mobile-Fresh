
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import autocheckImage from "@/assets/autocheck.png";
import carfaxImage from "@/assets/carfax_logo.svg";
import ChipSelector from "./components/ChipSelector";
import QuadrantLayout from "./components/QuadrantLayout";
import { ThumbsUp, Star, Zap, AlertTriangle, Cog, List, Car, Wrench, Check, Gauge, ScrollText } from "lucide-react";

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
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (value: string, name: string) => void;
}

const VehicleCondition = ({ formData, onChange, onSelectChange }: VehicleConditionProps) => {
  const [displayValue, setDisplayValue] = useState('$0');
  const [currentService, setCurrentService] = useState<string>('');
  const [selectedHistoryService, setSelectedHistoryService] = useState<string | null>(null);
  const { alert, showAlert, closeAlert } = useAlertDialog();

  const handleIntegrationClick = (service: string) => {
    // Toggle selection
    if (selectedHistoryService === service) {
      setSelectedHistoryService(null);
    } else {
      setSelectedHistoryService(service);
    }
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
  const handleChipChange = (selectedValues: string[], fieldName: string) => {
    // Convert array to comma-separated string for formData storage
    const valueString = selectedValues.length > 0 ? selectedValues.join(',') : '';
    onSelectChange(valueString, fieldName);
  };

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
        selected: "bg-green-100 text-green-700 border-green-300 hover:bg-green-200",
        unselected: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
      }
    },
    { 
      value: 'chips', 
      label: 'Stars', 
      icon: Star,
      colorScheme: {
        selected: "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200",
        unselected: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
      }
    },
    { 
      value: 'smallCracks', 
      label: 'Cracks', 
      icon: Zap,
      colorScheme: {
        selected: "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200",
        unselected: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
      }
    },
    { 
      value: 'largeCracks', 
      label: 'Replace', 
      icon: AlertTriangle,
      colorScheme: {
        selected: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200",
        unselected: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
      }
    },
  ];

  const engineLightsOptions = [
    { 
      value: 'none', 
      label: 'None', 
      icon: ThumbsUp,
      colorScheme: {
        selected: "bg-green-100 text-green-700 border-green-300 hover:bg-green-200",
        unselected: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
      }
    },
    { 
      value: 'engine', 
      label: 'Engine', 
      icon: AlertTriangle,
      colorScheme: {
        selected: "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200",
        unselected: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
      }
    },
    { 
      value: 'maintenance', 
      label: 'Transmission', 
      icon: Cog,
      colorScheme: {
        selected: "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200",
        unselected: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
      }
    },
    { 
      value: 'drivetrain', 
      label: 'Drivetrain', 
      icon: Car,
      colorScheme: {
        selected: "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200",
        unselected: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
      }
    },
    { 
      value: 'multiple', 
      label: 'Multiple', 
      icon: List,
      colorScheme: {
        selected: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200",
        unselected: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
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
        selected: "bg-green-100 text-green-700 border-green-300 hover:bg-green-200",
        unselected: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
      }
    },
    { 
      value: 'basicService', 
      label: 'Basic', 
      icon: OneWrench,
      colorScheme: {
        selected: "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200",
        unselected: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
      }
    },
    { 
      value: 'minorService', 
      label: 'Minor', 
      icon: TwoWrenches,
      colorScheme: {
        selected: "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200",
        unselected: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
      }
    },
    { 
      value: 'majorService', 
      label: 'Major', 
      icon: ThreeWrenches,
      colorScheme: {
        selected: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200",
        unselected: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
      }
    },
  ];

  const historyOptions = [
    { 
      value: 'noAccidents', 
      label: 'No Accidents', 
      icon: ThumbsUp,
      colorScheme: {
        selected: "bg-green-100 text-green-700 border-green-300 hover:bg-green-200",
        unselected: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
      }
    },
    { 
      value: 'minorAccident', 
      label: 'Minor Accident', 
      icon: AlertTriangle,
      colorScheme: {
        selected: "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200",
        unselected: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
      }
    },
    { 
      value: 'odomError', 
      label: 'Odom Error', 
      icon: Gauge,
      colorScheme: {
        selected: "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200",
        unselected: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
      }
    },
    { 
      value: 'majorAccident', 
      label: 'Major Accident', 
      icon: TwoExclamations,
      colorScheme: {
        selected: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200",
        unselected: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
      }
    },
    { 
      value: 'brandedIssue', 
      label: 'Branded Title', 
      icon: ScrollText,
      colorScheme: {
        selected: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200",
        unselected: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
      }
    },
  ];

  return (
    <div className="space-y-4">
      {/* Vehicle History Report Integrations */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
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
        <div className="mt-4">
          <ChipSelector
            options={historyOptions}
            selectedValues={formData.history || ""}
            onChange={handleChipChange}
            label="History"
            name="history"
          />
        </div>
      </div>

      {/* Windshield and Engine Lights Condition Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <ChipSelector
            options={windshieldOptions}
            selectedValues={formData.windshield || ""}
            onChange={handleChipChange}
            label="Windshield"
            name="windshield"
          />
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <ChipSelector
            options={engineLightsOptions}
            selectedValues={formData.engineLights || ""}
            onChange={handleChipChange}
            label="Engine Lights"
            name="engineLights"
          />
        </div>
      </div>

      {/* Maintenance Condition Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <ChipSelector
            options={maintenanceOptions}
            selectedValues={formData.maintenance || ""}
            onChange={handleChipChange}
            label="Maintenance"
            name="maintenance"
          />
        </div>
        <div></div>
      </div>

      {/* Brakes Quadrant Layout */}
      <QuadrantLayout
        title="Brakes"
        measurementType="brake"
        data={parseQuadrantData(formData.brakes)}
        onMeasurementChange={(position, value) => handleQuadrantMeasurementChange("brakes", position, value)}
      />

      {/* Tire Quadrant Layout */}
      <QuadrantLayout
        title="Tires"
        measurementType="tire"
        data={parseQuadrantData(formData.tire)}
        onMeasurementChange={(position, value) => handleQuadrantMeasurementChange("tire", position, value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="reconEstimate" className="block text-sm font-bold text-gray-700 mb-1">
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
          <label htmlFor="reconDetails" className="block text-sm font-bold text-gray-700 mb-1">
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
