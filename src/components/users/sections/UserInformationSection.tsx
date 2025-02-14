
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
import { UserFormData } from "@/types/users";

interface UserInformationSectionProps {
  formData: UserFormData;
  onFormDataChange: (data: Partial<UserFormData>) => void;
}

const UserInformationSection = ({
  formData,
  onFormDataChange,
}: UserInformationSectionProps) => {
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

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    onFormDataChange({ mobileNumber: formattedNumber });
  };

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">User Information</h3>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Enter full name"
              value={formData.fullName}
              onChange={(e) => onFormDataChange({ fullName: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) => onFormDataChange({ email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: "admin" | "dealer" | "basic" | "individual") => 
                onFormDataChange({ role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {['admin', 'dealer', 'basic', 'individual'].map(role => (
                  <SelectItem key={role} value={role} className="capitalize">
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobileNumber">Mobile Number</Label>
            <Input
              id="mobileNumber"
              placeholder="(123) 456-7890"
              value={formData.mobileNumber}
              onChange={handlePhoneNumberChange}
              maxLength={14}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => onFormDataChange({ isActive: checked })}
              className="data-[state=checked]:bg-custom-blue data-[state=unchecked]:bg-input"
            />
            <Label htmlFor="isActive">Active User</Label>
          </div>
        </div>

        {(formData.role === 'basic' || formData.role === 'individual') && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Address Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  placeholder="Enter street address"
                  value={formData.address || ''}
                  onChange={(e) => onFormDataChange({ address: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={formData.city || ''}
                  onChange={(e) => onFormDataChange({ city: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select
                  value={formData.state || ''}
                  onValueChange={(value) => onFormDataChange({ state: value })}
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
                  value={formData.zipCode || ''}
                  onChange={(e) => onFormDataChange({ zipCode: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInformationSection;
