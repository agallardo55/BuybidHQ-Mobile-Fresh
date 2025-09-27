
import { Input } from "@/components/ui/input";
import { usePhoneFormat } from "@/hooks/signup/usePhoneFormat";

interface ContactInfoSectionProps {
  mobile: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ContactInfoSection = ({ 
  mobile, 
  onChange 
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
    </>
  );
};

export default ContactInfoSection;
