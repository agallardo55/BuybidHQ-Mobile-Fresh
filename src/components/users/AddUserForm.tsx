
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Switch
} from "@/components/ui/switch";
import { UserFormData, DealershipFormData } from "@/types/users";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// US States list with abbreviations
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 
  'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 
  'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 
  'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

interface AddUserFormProps {
  onSubmit: (e: React.FormEvent, dealershipData?: DealershipFormData) => void;
  formData: UserFormData;
  onFormDataChange: (data: Partial<UserFormData>) => void;
  readOnlyDealership?: string;
}

const AddUserForm = ({ onSubmit, formData, onFormDataChange, readOnlyDealership }: AddUserFormProps) => {
  const { currentUser } = useCurrentUser();
  const [dealershipData, setDealershipData] = useState<DealershipFormData>({
    dealerName: '',
    businessPhone: '',
    businessEmail: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });
  
  const availableRoles = currentUser?.role === 'admin' 
    ? ['admin', 'dealer', 'basic', 'individual']
    : ['basic', 'individual'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.role === 'dealer') {
      onSubmit(e, dealershipData);
    } else {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
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
                {availableRoles.map(role => (
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
              placeholder="Enter mobile number"
              value={formData.mobileNumber}
              onChange={(e) => onFormDataChange({ mobileNumber: e.target.value })}
              required
            />
          </div>

          {formData.role === 'dealer' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="dealerName">Dealership Name</Label>
                <Input
                  id="dealerName"
                  placeholder="Enter dealership name"
                  value={dealershipData.dealerName}
                  onChange={(e) => setDealershipData(prev => ({ ...prev, dealerName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessPhone">Business Phone</Label>
                <Input
                  id="businessPhone"
                  placeholder="Enter business phone"
                  value={dealershipData.businessPhone}
                  onChange={(e) => setDealershipData(prev => ({ ...prev, businessPhone: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessEmail">Business Email</Label>
                <Input
                  id="businessEmail"
                  type="email"
                  placeholder="Enter business email"
                  value={dealershipData.businessEmail}
                  onChange={(e) => setDealershipData(prev => ({ ...prev, businessEmail: e.target.value }))}
                  required
                />
              </div>
            </>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Enter address"
              value={formData.address}
              onChange={(e) => onFormDataChange({ address: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="Enter city"
              value={formData.city}
              onChange={(e) => onFormDataChange({ city: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Select
              value={formData.state}
              onValueChange={(value: string) => onFormDataChange({ state: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map(state => (
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
              value={formData.zipCode}
              onChange={(e) => onFormDataChange({ zipCode: e.target.value })}
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

          {formData.role === 'dealer' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="dealershipAddress">Dealership Address</Label>
                <Input
                  id="dealershipAddress"
                  placeholder="Enter dealership address"
                  value={dealershipData.address}
                  onChange={(e) => setDealershipData(prev => ({ ...prev, address: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dealershipCity">Dealership City</Label>
                <Input
                  id="dealershipCity"
                  placeholder="Enter dealership city"
                  value={dealershipData.city}
                  onChange={(e) => setDealershipData(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dealershipState">Dealership State</Label>
                <Select
                  value={dealershipData.state}
                  onValueChange={(value: string) => setDealershipData(prev => ({ ...prev, state: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map(state => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dealershipZipCode">Dealership ZIP Code</Label>
                <Input
                  id="dealershipZipCode"
                  placeholder="Enter dealership ZIP code"
                  value={dealershipData.zipCode}
                  onChange={(e) => setDealershipData(prev => ({ ...prev, zipCode: e.target.value }))}
                  required
                />
              </div>
            </>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full mt-6 bg-custom-blue hover:bg-custom-blue/90">
        {readOnlyDealership ? 'Update User' : 'Add User'}
      </Button>
    </form>
  );
};

export default AddUserForm;
