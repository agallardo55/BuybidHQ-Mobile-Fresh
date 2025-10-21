
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FormSection from "./FormSection";

interface BasicInfoSectionProps {
  dealerName: string;
  dealerId: string;
  businessPhone: string;
  businessEmail: string;
  onChange: (field: string, value: string) => void;
}

const BasicInfoSection = ({
  dealerName,
  dealerId,
  businessPhone,
  businessEmail,
  onChange,
}: BasicInfoSectionProps) => {
  const formatPhoneNumber = (value: string) => {
    const phone = value.replace(/\D/g, '');
    if (phone.length >= 10) {
      return `(${phone.slice(0,3)}) ${phone.slice(3,6)}-${phone.slice(6,10)}`;
    }
    return value;
  };

  return (
    <FormSection title="Basic Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dealerName">Dealership Name *</Label>
          <Input
            id="dealerName"
            value={dealerName}
            onChange={(e) => onChange('dealerName', e.target.value)}
            required
            autoComplete="organization"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dealerId">Dealer ID</Label>
          <Input
            id="dealerId"
            value={dealerId}
            onChange={(e) => onChange('dealerId', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessPhone">Business Phone *</Label>
          <Input
            id="businessPhone"
            value={businessPhone}
            onChange={(e) => onChange('businessPhone', formatPhoneNumber(e.target.value))}
            required
            autoComplete="tel"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessEmail">Business Email *</Label>
          <Input
            id="businessEmail"
            type="email"
            value={businessEmail}
            onChange={(e) => onChange('businessEmail', e.target.value)}
            required
            autoComplete="email"
          />
        </div>

      </div>
    </FormSection>
  );
};

export default BasicInfoSection;
