
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

  return (
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
  );
};

export default UserInformationSection;
