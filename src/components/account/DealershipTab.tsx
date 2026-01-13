
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useQueryClient } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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

const dealershipInfoSchema = z.object({
  dealershipName: z.string(),
  licenseNumber: z.string().optional(),
  dealershipAddress: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "ZIP Code must be 5 digits").max(5, "ZIP Code must be 5 digits"),
});

export const DealershipTab = () => {
  const { user } = useAuth();
  const { currentUser, isLoading } = useCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof dealershipInfoSchema>>({
    resolver: zodResolver(dealershipInfoSchema),
    defaultValues: {
      dealershipName: currentUser?.dealer_name || "",
      licenseNumber: currentUser?.license_number || "",
      dealershipAddress: currentUser?.address || "",
      city: currentUser?.city || "",
      state: currentUser?.state || "",
      zipCode: currentUser?.zip_code || "",
    },
  });

  const {
    formState: { isSubmitting },
  } = form;
  
  const canEditDealershipInfo = currentUser?.app_role === 'member' || currentUser?.app_role === 'account_admin';

  const onSubmit = async (values: z.infer<typeof dealershipInfoSchema>) => {
    try {
      if (!user) throw new Error("No user found");

      // Always update user address in buybidhq_users
      const { error: userError } = await supabase
        .from('buybidhq_users')
        .update({
          address: values.dealershipAddress,
          city: values.city,
          state: values.state,
          zip_code: values.zipCode,
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // For Members and Account Admins, also update/create dealership record
      if (canEditDealershipInfo) {
        const { error: dealerError } = await supabase
          .from('individual_dealers')
          .upsert({
            user_id: user.id,
            business_name: values.dealershipName,
            license_number: values.licenseNumber || null,
            address: values.dealershipAddress,
            city: values.city,
            state: values.state,
            zip_code: values.zipCode,
            business_email: currentUser?.email || '',
            business_phone: currentUser?.mobile_number || null,
          }, {
            onConflict: 'user_id'
          });

        if (dealerError) throw dealerError;
      }

      // Invalidate currentUser cache so profile completion recalculates with new data
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });

      toast({
        title: "Success",
        description: canEditDealershipInfo
          ? "Dealership information updated successfully."
          : "Address information updated successfully.",
      });
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="dealershipName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dealership Name {canEditDealershipInfo && <span className="text-red-500">*</span>}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Business/Dealership name" disabled={!canEditDealershipInfo} className={!canEditDealershipInfo ? "bg-gray-50" : ""} />
                  </FormControl>
                  {!canEditDealershipInfo && (
                    <p className="text-xs text-gray-500 mt-1">Contact support to change dealership information</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="licenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Dealer license number" disabled={!canEditDealershipInfo} className={!canEditDealershipInfo ? "bg-gray-50" : ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dealershipAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Street address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} pattern="[0-9]{5}" maxLength={5} placeholder="12345" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
