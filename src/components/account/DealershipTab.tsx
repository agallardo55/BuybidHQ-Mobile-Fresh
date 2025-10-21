
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAccountForm } from "@/hooks/useAccountForm";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const states = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export const DealershipTab = () => {
  const { formData, setFormData, handleChange, isLoading } = useAccountForm();
  const { currentUser } = useCurrentUser();
  const { toast } = useToast();

  const handleStateChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      state: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const canEditDealership = currentUser?.app_role === 'member' || currentUser?.app_role === 'account_admin';

    // Validate required fields
    let validationFields = ['dealershipAddress', 'city', 'state', 'zipCode'];
    if (canEditDealership) {
      validationFields.push('dealershipName');
    }

    const missingFields = validationFields.filter(field => {
      const value = formData[field as keyof typeof formData];
      return !value || value.toString().trim() === '';
    });

    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in all required fields: ${missingFields.join(', ')}.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Always update user address in buybidhq_users
      const { error: userError } = await supabase
        .from('buybidhq_users')
        .update({
          address: formData.dealershipAddress,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
        } as any)
        .eq('id', user.id as any);

      if (userError) throw userError;

      // For Members and Account Admins, also update/create dealership record
      if (canEditDealership) {
        const { error: dealerError } = await supabase
          .from('individual_dealers')
          .upsert({
            user_id: user.id,
            business_name: formData.dealershipName,
            license_number: formData.licenseNumber || null,
            address: formData.dealershipAddress,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
            business_email: currentUser?.email || '',
            business_phone: currentUser?.mobile_number || null,
          } as any, {
            onConflict: 'user_id'
          });

        if (dealerError) throw dealerError;
      }

      toast({
        title: "Success",
        description: canEditDealership 
          ? "Dealership information updated successfully."
          : "Address information updated successfully.",
      });

      // Invalidate currentUser query to refresh the data
      window.location.reload();
    } catch (error) {
      console.error('Error updating information:', error);
      toast({
        title: "Error",
        description: "Failed to update details. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading || !currentUser) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const canEditDealershipInfo = currentUser.app_role === 'member' || currentUser.app_role === 'account_admin';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="dealershipName" className="block text-sm font-medium text-gray-700 mb-1">
              Dealership Name {canEditDealershipInfo && <span className="text-red-500">*</span>}
            </label>
            <Input
              id="dealershipName"
              name="dealershipName"
              type="text"
              value={formData.dealershipName}
              onChange={handleChange}
              placeholder="Business/Dealership name"
              disabled={!canEditDealershipInfo}
              className={!canEditDealershipInfo ? "bg-gray-50" : ""}
              required={canEditDealershipInfo}
            />
            {!canEditDealershipInfo && (
              <p className="text-xs text-gray-500 mt-1">Contact support to change dealership information</p>
            )}
          </div>
          <div>
            <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
              License Number
            </label>
            <Input
              id="licenseNumber"
              name="licenseNumber"
              type="text"
              value={formData.licenseNumber}
              onChange={handleChange}
              placeholder="Dealer license number"
              disabled={!canEditDealershipInfo}
              className={!canEditDealershipInfo ? "bg-gray-50" : ""}
            />
          </div>
          <div>
            <label htmlFor="dealershipAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <Input
              id="dealershipAddress"
              name="dealershipAddress"
              type="text"
              required
              value={formData.dealershipAddress}
              onChange={handleChange}
              placeholder="Street address"
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <Input
              id="city"
              name="city"
              type="text"
              required
              value={formData.city}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <Select 
                onValueChange={handleStateChange} 
                value={formData.state}
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
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code <span className="text-red-500">*</span>
              </label>
              <Input
                id="zipCode"
                name="zipCode"
                type="text"
                required
                value={formData.zipCode}
                onChange={handleChange}
                pattern="[0-9]{5}"
                maxLength={5}
                placeholder="12345"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          Save Changes
        </Button>
      </div>
      <div className="h-8 border-t mt-6"></div>
    </form>
  );
};
