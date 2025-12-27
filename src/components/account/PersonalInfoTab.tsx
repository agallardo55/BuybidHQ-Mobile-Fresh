import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { RoleDisplay } from "./form-sections/RoleDisplay";
import { ContactInfo } from "./form-sections/ContactInfo";

const personalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits"),
});

export const PersonalInfoTab = () => {
  const { toast } = useToast();
  const { currentUser, isLoading: isUserLoading } = useCurrentUser();

  const form = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: currentUser?.full_name || "",
      email: currentUser?.email || "",
      mobileNumber: currentUser?.mobile_number || "",
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: z.infer<typeof personalInfoSchema>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const updateData = {
        full_name: values.fullName,
        email: values.email,
        mobile_number: values.mobileNumber,
      };

      const { error: userError } = await supabase
        .from('buybidhq_users')
        .update(updateData)
        .eq('id', user.id);

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

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <RoleDisplay />
            <ContactInfo control={form.control} />
          </div>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
        <div className="h-8 border-t mt-6"></div>
      </form>
    </Form>
  );
};