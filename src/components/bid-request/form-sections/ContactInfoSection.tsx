
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CarrierType } from "@/types/buyers";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useBuyers } from "@/hooks/useBuyers";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const CARRIER_OPTIONS: CarrierType[] = [
  'Verizon Wireless',
  'AT&T',
  'T-Mobile',
  'Sprint',
  'US Cellular',
  'Metro PCS',
  'Boost Mobile',
  'Cricket',
  'Virgin Mobile',
  'Landline',
  'VoIP'
];

interface ContactInfoSectionProps {
  mobile: string;
  carrier: CarrierType | "";
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCarrierChange: (value: string) => void;
}

const ContactInfoSection = ({ 
  mobile, 
  carrier, 
  onChange, 
  onCarrierChange 
}: ContactInfoSectionProps) => {
  const { currentUser } = useCurrentUser();
  const { validateCarrier } = useBuyers();
  const [isValidating, setIsValidating] = useState(false);
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timeout when the mobile number changes
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }

    // Only proceed if we have a valid mobile number
    if (!mobile || mobile.length < 10 || !currentUser?.id) {
      return;
    }

    // Set a new timeout to validate the carrier after a delay
    const timeout = setTimeout(async () => {
      setIsValidating(true);
      try {
        const result = await validateCarrier(currentUser.id, mobile);
        if (result) {
          if (result.line_type === 'mobile' && result.carrier) {
            if (CARRIER_OPTIONS.includes(result.carrier as CarrierType)) {
              onCarrierChange(result.carrier);
              toast.success("Carrier detected automatically");
            } else {
              toast.error("Carrier not supported");
            }
          } else if (result.line_type === 'landline') {
            onCarrierChange('Landline');
            toast.warning("This appears to be a landline number");
          } else if (result.line_type === 'voip') {
            onCarrierChange('VoIP');
            toast.warning("This appears to be a VoIP number");
          }
        }
      } catch (error) {
        console.error('Error validating carrier:', error);
        toast.error("Failed to detect carrier automatically");
      } finally {
        setIsValidating(false);
      }
    }, 1000); // 1 second delay after typing stops

    setValidationTimeout(timeout);

    // Cleanup function to clear the timeout
    return () => {
      clearTimeout(timeout);
    };
  }, [mobile, currentUser?.id, onCarrierChange, validateCarrier]);

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">Mobile</label>
        <Input 
          placeholder="Enter mobile number"
          name="mobile"
          value={mobile}
          onChange={onChange}
        />
        {isValidating && (
          <p className="text-sm text-gray-500">
            Detecting carrier...
          </p>
        )}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Mobile Carrier</label>
        <Select
          value={carrier}
          onValueChange={onCarrierChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select carrier" />
          </SelectTrigger>
          <SelectContent>
            {CARRIER_OPTIONS.map(carrier => (
              <SelectItem key={carrier} value={carrier}>
                {carrier}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">
          Carrier will be detected automatically when possible
        </p>
      </div>
    </>
  );
};

export default ContactInfoSection;

