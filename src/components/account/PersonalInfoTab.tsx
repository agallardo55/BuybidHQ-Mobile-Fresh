
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAccountForm } from "@/hooks/useAccountForm";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { RoleDisplay } from "./form-sections/RoleDisplay";
import { ContactInfo } from "./form-sections/ContactInfo";
import { AddressInfo } from "./form-sections/AddressInfo";

export const PersonalInfoTab = () => {
  const { formData, handleChange, isLoading } = useAccountForm();
  const { toast } = useToast();
  const { currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.mobileNumber || !formData.phoneCarrier) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields: Full Name, Email, Mobile Number, and Carrier.",
        variant: "destructive",
      });
      return;
    }

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
          <RoleDisplay />
          <ContactInfo formData={formData} handleChange={handleChange} />
          {!isAdmin && <AddressInfo formData={formData} handleChange={handleChange} />}
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
