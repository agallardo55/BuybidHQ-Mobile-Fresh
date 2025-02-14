
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
        <div className="space-y-6">
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

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Dealership Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  placeholder="Enter street address"
                  value={dealershipData.address || ''}
                  onChange={(e) => setDealershipData({ ...dealershipData, address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={dealershipData.city || ''}
                  onChange={(e) => setDealershipData({ ...dealershipData, city: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="Enter state"
                  value={dealershipData.state || ''}
                  onChange={(e) => setDealershipData({ ...dealershipData, state: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  placeholder="Enter ZIP code"
                  value={dealershipData.zipCode || ''}
                  onChange={(e) => setDealershipData({ ...dealershipData, zipCode: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealershipInformationSection;
