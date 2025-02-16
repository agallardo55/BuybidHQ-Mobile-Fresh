
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DealershipFormData } from "@/types/dealerships";

interface DealershipFormProps {
  initialData?: Partial<DealershipFormData>;
  onSubmit: (data: DealershipFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const DealershipForm = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting
}: DealershipFormProps) => {
  const [formData, setFormData] = useState<DealershipFormData>({
    dealerName: initialData?.dealerName || "",
    dealerId: initialData?.dealerId || "",
    businessPhone: initialData?.businessPhone || "",
    businessEmail: initialData?.businessEmail || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    zipCode: initialData?.zipCode || "",
    licenseNumber: initialData?.licenseNumber || "",
    website: initialData?.website || "",
    notes: initialData?.notes || "",
  });

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  const handleChange = (field: keyof DealershipFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const formatPhoneNumber = (value: string) => {
    const phone = value.replace(/\D/g, '');
    if (phone.length >= 10) {
      return `(${phone.slice(0,3)}) ${phone.slice(3,6)}-${phone.slice(6,10)}`;
    }
    return value;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dealerName">Dealership Name *</Label>
          <Input
            id="dealerName"
            value={formData.dealerName}
            onChange={(e) => handleChange('dealerName', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dealerId">Dealer ID</Label>
          <Input
            id="dealerId"
            value={formData.dealerId}
            onChange={(e) => handleChange('dealerId', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessPhone">Business Phone *</Label>
          <Input
            id="businessPhone"
            value={formData.businessPhone}
            onChange={(e) => handleChange('businessPhone', formatPhoneNumber(e.target.value))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessEmail">Business Email *</Label>
          <Input
            id="businessEmail"
            type="email"
            value={formData.businessEmail}
            onChange={(e) => handleChange('businessEmail', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Address Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="address">Street Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Select
              value={formData.state}
              onValueChange={(value) => handleChange('state', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Additional Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="licenseNumber">License Number</Label>
            <Input
              id="licenseNumber"
              value={formData.licenseNumber}
              onChange={(e) => handleChange('licenseNumber', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="h-24"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};

export default DealershipForm;
