
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAccountForm } from "@/hooks/useAccountForm";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CarrierType } from "@/types/users";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const CARRIER_OPTIONS: CarrierType[] = [
  'Verizon Wireless',
  'AT&T',
  'T-Mobile',
  'Sprint',
  'US Cellular',
  'Metro PCS',
  'Boost Mobile',
  'Cricket',
  'Virgin Mobile'
];

export const PersonalInfoTab = () => {
  const { formData, handleChange, isLoading } = useAccountForm();
  const { toast } = useToast();
  const { currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const updateData = {
        full_name: formData.fullName,
        email: formData.email,
        mobile_number: formData.mobileNumber,
        phone_carrier: formData.phoneCarrier,
      };

      // Only include address fields if not admin
      if (!isAdmin) {
        Object.assign(updateData, {
          address: formData.dealershipAddress,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode
        });
      }

      const { error: userError } = await supabase
        .from('buybidhq_users')
        .update(updateData)
        .eq('id', user.id);

      if (userError) throw userError;

      toast({
        title: "Success",
        description: "Your personal information has been updated.",
      });
    } catch (error: any) {
      console.error('Error updating account:', error);
      toast({
        title: "Error",
        description: "Failed to update account details. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <Input
              id="mobileNumber"
              name="mobileNumber"
              type="tel"
              required
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="(123) 456-7890"
              maxLength={14}
            />
          </div>
          <div>
            <label htmlFor="phoneCarrier" className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Carrier
            </label>
            <Select
              value={formData.phoneCarrier}
              onValueChange={(value) => handleChange({ target: { name: 'phoneCarrier', value } })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select carrier" />
              </SelectTrigger>
              <SelectContent>
                {CARRIER_OPTIONS.map(carrier => (
                  <SelectItem key={carrier} value={carrier}>
                    {carrier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Only show address fields for non-admin users */}
          {!isAdmin && (
            <>
              <div>
                <label htmlFor="dealershipAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <Input
                  id="dealershipAddress"
                  name="dealershipAddress"
                  type="text"
                  value={formData.dealershipAddress}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <Input
                    id="state"
                    name="state"
                    type="text"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    type="text"
                    value={formData.zipCode}
                    onChange={handleChange}
                    maxLength={5}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          Save Changes
        </Button>
      </div>
      <div className="h-8 border-t mt-6"></div>
    </form>
  );
};
