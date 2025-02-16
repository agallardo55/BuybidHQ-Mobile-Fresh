
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FormSection from "./FormSection";

interface AdditionalInfoSectionProps {
  licenseNumber: string;
  website: string;
  notes: string;
  onChange: (field: string, value: string) => void;
}

const AdditionalInfoSection = ({
  licenseNumber,
  website,
  notes,
  onChange,
}: AdditionalInfoSectionProps) => {
  return (
    <FormSection title="Additional Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            type="url"
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
          className="h-24"
        />
      </div>
    </FormSection>
  );
};

export default AdditionalInfoSection;
