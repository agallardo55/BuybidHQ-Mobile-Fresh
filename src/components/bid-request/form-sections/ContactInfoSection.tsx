
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CarrierType } from "@/types/buyers";

const CARRIER_OPTIONS: CarrierType[] = [
  'Verizon Wireless',
  'AT&T',
  'T-Mobile',
  'Sprint',
  'US Cellular',
  'Metro PCS',
  'Boost Mobile',
  'Cricket',
  'Virgin Mobile'
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
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Mobile Carrier</label>
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
        <p className="text-sm text-gray-500">
          Carrier will be auto-detected during validation
        </p>
      </div>
    </>
  );
};

export default ContactInfoSection;
