
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
    // Get the raw input value
    const rawValue = e.target.value;
    
    // Format the phone number
    const formattedValue = formatPhoneNumber(rawValue);
    
    // Create a new synthetic event with the formatted value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: e.target.name,
        value: formattedValue
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    // Call the parent's onChange with our synthetic event
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
          type="tel"
          inputMode="tel"
          autoComplete="tel"
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
