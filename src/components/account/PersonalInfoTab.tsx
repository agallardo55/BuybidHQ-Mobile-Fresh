
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAccountForm } from "@/hooks/useAccountForm";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const PersonalInfoTab = () => {
  const { formData, handleChange, isLoading } = useAccountForm();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('buybidhq_users')
        .update({
          full_name: formData.fullName,
          email: formData.email,
          mobile_number: formData.mobileNumber,
        })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      toast({
        title: "Account updated",
        description: "Your account details have been successfully updated.",
      });
    } catch (error) {
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
            <label htmlFor="businessNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Business Number
            </label>
            <Input
              id="businessNumber"
              name="businessNumber"
              type="tel"
              required
              value={formData.businessNumber}
              onChange={handleChange}
              placeholder="(123) 456-7890"
              maxLength={14}
            />
          </div>
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
