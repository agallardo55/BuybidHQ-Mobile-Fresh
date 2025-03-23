
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CarrierType } from "@/types/buyers";
import { usePhoneFormat } from "@/hooks/signup/usePhoneFormat";

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
  const { formatPhoneNumber } = usePhoneFormat();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Get the current input value directly from the event
    const inputValue = e.target.value;
    
    // Format the value
    const formattedNumber = formatPhoneNumber(inputValue);
    
    // Create a new event with the formatted value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: formattedNumber
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    // Pass the synthetic event to the parent component
    onChange(syntheticEvent);
  };

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">Mobile</label>
        <Input 
          placeholder="Enter mobile number"
          name="mobile"
          value={mobile}
          onChange={handlePhoneChange}
          required
          maxLength={14} // (XXX) XXX-XXXX format
          type="tel" // Use tel type for better mobile keyboard
          inputMode="tel" // Ensure numeric keyboard on mobile
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Mobile Carrier (Optional)</label>
        <Select
          value={carrier}
          onValueChange={onCarrierChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select carrier (optional)" />
          </SelectTrigger>
          <SelectContent>
            {CARRIER_OPTIONS.map(carrier => (
              <SelectItem key={carrier} value={carrier}>
                {carrier}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default ContactInfoSection;
