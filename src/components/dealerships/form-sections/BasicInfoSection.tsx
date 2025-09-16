
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FormSection from "./FormSection";

interface BasicInfoSectionProps {
  dealerName: string;
  dealerId: string;
  businessPhone: string;
  businessEmail: string;
  licenseNumber: string;
  website: string;
  notes: string;
  onChange: (field: string, value: string) => void;
}

const BasicInfoSection = ({
  dealerName,
  dealerId,
  businessPhone,
  businessEmail,
  licenseNumber,
  website,
  notes,
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
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenseNumber">License Number</Label>
          <Input
            id="licenseNumber"
            value={licenseNumber}
            onChange={(e) => onChange('licenseNumber', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={website}
            onChange={(e) => onChange('website', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => onChange('notes', e.target.value)}
          rows={3}
        />
      </div>
    </FormSection>
  );
};

export default BasicInfoSection;
