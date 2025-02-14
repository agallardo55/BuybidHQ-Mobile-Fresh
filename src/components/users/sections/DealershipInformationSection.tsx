
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  setDealershipData: (data: DealershipFormData) => void;
}

const DealershipInformationSection = ({
  formData,
  dealershipData,
  onFormDataChange,
  setDealershipData,
}: DealershipInformationSectionProps) => {
  return (
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
              onChange={(e) => setDealershipData({ ...dealershipData, dealerName: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dealerId">Dealer ID</Label>
            <Input
              id="dealerId"
              placeholder="Enter dealer ID"
              value={dealershipData.dealerId}
              onChange={(e) => setDealershipData({ ...dealershipData, dealerId: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessPhone">Business Phone</Label>
            <Input
              id="businessPhone"
              placeholder="Enter business phone"
              value={dealershipData.businessPhone}
              onChange={(e) => setDealershipData({ ...dealershipData, businessPhone: e.target.value })}
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
              onChange={(e) => setDealershipData({ ...dealershipData, businessEmail: e.target.value })}
              required
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DealershipInformationSection;
