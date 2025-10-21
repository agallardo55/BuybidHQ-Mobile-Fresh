
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAccountForm } from "@/hooks/useAccountForm";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { RoleDisplay } from "./form-sections/RoleDisplay";
import { ContactInfo } from "./form-sections/ContactInfo";

export const PersonalInfoTab = () => {
  const { formData, handleChange, isLoading } = useAccountForm();
  const { toast } = useToast();
  const { currentUser } = useCurrentUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.mobileNumber) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields: Full Name, Email, and Mobile Number.",
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
      } as any;

      const { error: userError } = await supabase
        .from('buybidhq_users')
        .update(updateData)
        .eq('id', user.id as any);

      if (userError) throw userError;

      toast({
        title: "Success",
        description: "Personal information updated successfully.",
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
