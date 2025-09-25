
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DealershipFormData, UserFormData } from "@/types/users";

interface DealershipInformationSectionProps {
  formData: UserFormData;
  dealershipData: DealershipFormData;
  onFormDataChange: (data: Partial<UserFormData>) => void;
  onDealershipDataChange: (data: Partial<DealershipFormData>) => void;
}

const DealershipInformationSection = ({
  formData,
  dealershipData,
  onFormDataChange,
  onDealershipDataChange,
}: DealershipInformationSectionProps) => {
  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    if (phoneNumber.length >= 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
    if (phoneNumber.length > 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
    }
    if (phoneNumber.length > 3) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    if (phoneNumber.length > 0) {
      return `(${phoneNumber}`;
    }
    return phoneNumber;
  };

  const handleBusinessPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    onDealershipDataChange({ businessPhone: formattedNumber });
  };

  const handleAccountAdminChange = (checked: boolean) => {
    // Update the isAccountAdmin state
    onFormDataChange({ isAccountAdmin: checked });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Dealership Information</h3>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dealershipName">Dealership Name</Label>
            <Input
              id="dealershipName"
              placeholder="Enter dealership name"
              value={dealershipData.dealerName}
              onChange={(e) => onDealershipDataChange({ dealerName: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dealerId">Dealer ID</Label>
            <Input
              id="dealerId"
              placeholder="Enter dealer ID"
              value={dealershipData.dealerId}
              onChange={(e) => onDealershipDataChange({ dealerId: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessPhone">Business Phone</Label>
            <Input
              id="businessPhone"
              placeholder="(123) 456-7890"
              value={dealershipData.businessPhone}
              onChange={handleBusinessPhoneChange}
              maxLength={14}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessEmail">Business Email</Label>
            <Input
              id="businessEmail"
              type="email"
              placeholder="Enter business email"
              value={dealershipData.businessEmail}
              onChange={(e) => onDealershipDataChange({ businessEmail: e.target.value })}
            />
          </div>

          {formData.role === 'dealer' && (
            <div className="flex items-center space-x-2">
              <Switch
                id="isAccountAdmin"
                checked={formData.isAccountAdmin}
                onCheckedChange={handleAccountAdminChange}
                className="data-[state=checked]:bg-custom-blue data-[state=unchecked]:bg-input"
              />
              <Label htmlFor="isAccountAdmin">Account Admin</Label>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Dealership Address</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                placeholder="Enter street address"
                value={dealershipData.address}
                onChange={(e) => onDealershipDataChange({ address: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Enter city"
                value={dealershipData.city}
                onChange={(e) => onDealershipDataChange({ city: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select
                value={dealershipData.state}
                onValueChange={(value) => onDealershipDataChange({ state: value })}
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
                placeholder="Enter ZIP code"
                value={dealershipData.zipCode}
                onChange={(e) => onDealershipDataChange({ zipCode: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealershipInformationSection;
