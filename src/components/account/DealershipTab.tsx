
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
  const { toast } = useToast();
  const { currentUser } = useCurrentUser();

  const isAssociate = currentUser?.role === 'associate';

  const handleStateChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      state: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isAssociate) {
      toast({
        title: "Unauthorized",
        description: "Associates cannot modify dealership information.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('buybidhq_users')
        .update({
          address: formData.dealershipAddress,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
        })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      toast({
        title: "Dealership updated",
        description: "Your dealership details have been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating dealership:', error);
      toast({
        title: "Error",
        description: "Failed to update dealership details. Please try again.",
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
            <label htmlFor="dealershipName" className="block text-sm font-medium text-gray-700 mb-1">
              Dealership Name
            </label>
            <Input
              id="dealershipName"
              name="dealershipName"
              type="text"
              required
              value={formData.dealershipName}
              onChange={handleChange}
              disabled={isAssociate}
              className={isAssociate ? "bg-gray-100" : ""}
            />
          </div>
          <div>
            <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Dealer ID
            </label>
            <Input
              id="licenseNumber"
              name="licenseNumber"
              type="text"
              placeholder="(Optional)"
              value={formData.licenseNumber}
              onChange={handleChange}
              disabled={isAssociate}
              className={isAssociate ? "bg-gray-100" : ""}
            />
          </div>
          <div>
            <label htmlFor="dealershipAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Dealership Address
            </label>
            <Input
              id="dealershipAddress"
              name="dealershipAddress"
              type="text"
              required
              value={formData.dealershipAddress}
              onChange={handleChange}
              disabled={isAssociate}
              className={isAssociate ? "bg-gray-100" : ""}
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
              required
              value={formData.city}
              onChange={handleChange}
              disabled={isAssociate}
              className={isAssociate ? "bg-gray-100" : ""}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <Select 
                onValueChange={handleStateChange} 
                value={formData.state}
                disabled={isAssociate}
              >
                <SelectTrigger className={isAssociate ? "bg-gray-100" : ""}>
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
                ZIP Code
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
                disabled={isAssociate}
                className={isAssociate ? "bg-gray-100" : ""}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          disabled={isAssociate}
        >
          Save Changes
        </Button>
      </div>
      {isAssociate && (
        <p className="text-sm text-gray-500 text-center mt-2">
          Only dealers can modify dealership information.
        </p>
      )}
      <div className="h-8 border-t mt-6"></div>
    </form>
  );
};
