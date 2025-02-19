
import { useBuyersQuery } from "./buyers/useBuyersQuery";
import { useBuyersMutations } from "./buyers/useBuyersMutations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBuyers = () => {
  const { data: buyers = [], isLoading } = useBuyersQuery();
  const { createBuyer, updateBuyer, deleteBuyer } = useBuyersMutations();

  const validateCarrier = async (userId: string, phoneNumber: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('validate-carrier', {
        body: { user_id: userId, phone_number: phoneNumber }
      });

      if (error) {
        console.error('Carrier validation error:', error);
        toast.error('Failed to validate carrier. Please try again.');
        return null;
      }

      console.log('Carrier validation response:', data);
      return data;
    } catch (error) {
      console.error('Error in carrier validation:', error);
      toast.error('An error occurred during carrier validation');
      return null;
    }
  };

  return {
    buyers,
    isLoading,
    createBuyer,
    updateBuyer,
    deleteBuyer,
    validateCarrier
  };
};
