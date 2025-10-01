
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import autocheckImage from "@/assets/autocheck.png";
import carfaxImage from "@/assets/carfax_logo.svg";

interface VehicleConditionProps {
  formData: {
    windshield: string;
    engineLights: string;
    brakes: string;
    tire: string;
    maintenance: string;
    reconEstimate: string;
    reconDetails: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (value: string, name: string) => void;
}

const VehicleCondition = ({ formData, onChange, onSelectChange }: VehicleConditionProps) => {
  const [displayValue, setDisplayValue] = useState('$0');
  const [currentService, setCurrentService] = useState<string>('');
  const { alert, showAlert, closeAlert } = useAlertDialog();

  const handleIntegrationClick = (service: string) => {
    setCurrentService(service);
    const title = service === "AutoCheck" ? "Autocheck Coming soon !!!" : "Carfax Coming Soon !!!";
    showAlert(
      title,
      `${service} integration is coming soon! Stay tuned for more integrations.`,
      "info"
    );
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

  return (
    <div className="space-y-4">
      {/* Vehicle History Report Integrations */}
      <div className="mb-6">
        <div className="flex gap-8 justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleIntegrationClick("AutoCheck")}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 min-w-[120px] justify-center"
          >
            <img src={autocheckImage} alt="AutoCheck" className="h-6 w-auto" />
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleIntegrationClick("CarFax")}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 min-w-[120px] justify-center"
          >
            <img src={carfaxImage} alt="CarFax" className="h-6 w-auto" />
          </Button>
        </div>
      </div>

      <div>
        <label htmlFor="windshield" className="block text-sm font-medium text-gray-700 mb-1">
          Windshield
        </label>
        <Select name="windshield" onValueChange={(value) => onSelectChange(value, "windshield")} value={formData.windshield || "unknown"}>
          <SelectTrigger>
            <SelectValue placeholder="Unknown" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unknown">Unknown</SelectItem>
            <SelectItem value="clear">Clear</SelectItem>
            <SelectItem value="chips">Chips</SelectItem>
            <SelectItem value="smallCracks">Small cracks</SelectItem>
            <SelectItem value="largeCracks">Large cracks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="engineLights" className="block text-sm font-medium text-gray-700 mb-1">
          Engine Lights
        </label>
        <Select name="engineLights" onValueChange={(value) => onSelectChange(value, "engineLights")} value={formData.engineLights || "unknown"}>
          <SelectTrigger>
            <SelectValue placeholder="Unknown" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unknown">Unknown</SelectItem>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="engine">Engine Light</SelectItem>
            <SelectItem value="maintenance">Maintenance Required</SelectItem>
            <SelectItem value="multiple">Multiple</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="brakes" className="block text-sm font-medium text-gray-700 mb-1">
          Brakes
        </label>
        <Select name="brakes" onValueChange={(value) => onSelectChange(value, "brakes")} value={formData.brakes || "unknown"}>
          <SelectTrigger>
            <SelectValue placeholder="Unknown" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unknown">Unknown</SelectItem>
            <SelectItem value="acceptable">Acceptable</SelectItem>
            <SelectItem value="replaceFront">Replace front</SelectItem>
            <SelectItem value="replaceRear">Replace rear</SelectItem>
            <SelectItem value="replaceAll">Replace all</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="tire" className="block text-sm font-medium text-gray-700 mb-1">
          Tire
        </label>
        <Select name="tire" onValueChange={(value) => onSelectChange(value, "tire")} value={formData.tire || "unknown"}>
          <SelectTrigger>
            <SelectValue placeholder="Unknown" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unknown">Unknown</SelectItem>
            <SelectItem value="acceptable">Acceptable</SelectItem>
            <SelectItem value="replaceFront">Replace front</SelectItem>
            <SelectItem value="replaceRear">Replace rear</SelectItem>
            <SelectItem value="replaceAll">Replace all</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="maintenance" className="block text-sm font-medium text-gray-700 mb-1">
          Maintenance
        </label>
        <Select name="maintenance" onValueChange={(value) => onSelectChange(value, "maintenance")} value={formData.maintenance || "unknown"}>
          <SelectTrigger>
            <SelectValue placeholder="Unknown" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unknown">Unknown</SelectItem>
            <SelectItem value="upToDate">Up to date</SelectItem>
            <SelectItem value="basicService">Basic service needed</SelectItem>
            <SelectItem value="minorService">Minor service needed</SelectItem>
            <SelectItem value="majorService">Major service needed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="reconEstimate" className="block text-sm font-medium text-gray-700 mb-1">
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
        <label htmlFor="reconDetails" className="block text-sm font-medium text-gray-700 mb-1">
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
