
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
import { Switch } from "@/components/ui/switch";
import { UserFormData, DealershipFormData } from "@/types/users";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Separator } from "@/components/ui/separator";

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
    dealerId: '',
    businessPhone: '',
    businessEmail: '',
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.role === 'dealer') {
      onSubmit(e, dealershipData);
    } else {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* User Information Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">User Information</h3>
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

          <div className="flex items-center space-x-2 self-end">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => onFormDataChange({ isActive: checked })}
              className="data-[state=checked]:bg-custom-blue data-[state=unchecked]:bg-input"
            />
            <Label htmlFor="isActive">Active User</Label>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Dealership Information Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Dealership Information</h3>
          <div className="space-y-2">
            <Select
              value={formData.role}
              onValueChange={(value: "admin" | "dealer" | "basic" | "individual") => 
                onFormDataChange({ role: value })}
            >
              <SelectTrigger className="w-[200px]">
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
        </div>

        {formData.role === 'dealer' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dealershipName">Dealership Name</Label>
              <Input
                id="dealershipName"
                placeholder="Enter dealership name"
                value={dealershipData.dealerName}
                onChange={(e) => setDealershipData(prev => ({ ...prev, dealerName: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dealerId">Dealer ID</Label>
              <Input
                id="dealerId"
                placeholder="Enter dealer ID"
                value={dealershipData.dealerId}
                onChange={(e) => setDealershipData(prev => ({ ...prev, dealerId: e.target.value }))}
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
          </div>
        )}
      </div>

      <Button type="submit" className="w-full mt-6 bg-custom-blue hover:bg-custom-blue/90">
        {readOnlyDealership ? 'Update User' : 'Add User'}
      </Button>
    </form>
  );
};

export default AddUserForm;
