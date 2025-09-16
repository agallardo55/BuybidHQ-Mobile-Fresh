
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DealershipFormData } from "@/types/dealerships";

export const useDealershipMutations = () => {
  const queryClient = useQueryClient();

  const createDealership = useMutation({
    mutationFn: async (data: DealershipFormData) => {
      console.log('Creating dealership with data:', data);
      
      const insertData = {
        dealer_name: data.dealerName,
        dealer_id: data.dealerId || null,
        business_phone: data.businessPhone,
        business_email: data.businessEmail,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zip_code: data.zipCode || null,
        license_number: data.licenseNumber || null,
        website: data.website || null,
        notes: data.notes || null
      };
      
      console.log('Insert data:', insertData);
      
      const { data: result, error } = await supabase
        .from('dealerships')
        .insert([insertData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to create dealership: ${error.message}`);
      }
      
      console.log('Created dealership:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealerships'] });
      toast.success('Dealership created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating dealership:', error);
      const errorMessage = error?.message || 'Failed to create dealership';
      toast.error(errorMessage);
    }
  });

  const updateDealership = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DealershipFormData> }) => {
      console.log('Updating dealership:', id, 'with data:', data);
      
      const updateData = {
        dealer_name: data.dealerName,
        dealer_id: data.dealerId || null,
        business_phone: data.businessPhone,
        business_email: data.businessEmail,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zip_code: data.zipCode || null,
        license_number: data.licenseNumber || null,
        website: data.website || null,
        notes: data.notes || null
      };
      
      const { error } = await supabase
        .from('dealerships')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Supabase update error:', error);
        throw new Error(`Failed to update dealership: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealerships'] });
      toast.success('Dealership updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating dealership:', error);
      const errorMessage = error?.message || 'Failed to update dealership';
      toast.error(errorMessage);
    }
  });

  const deleteDealership = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dealerships')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealerships'] });
      toast.success('Dealership deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting dealership:', error);
      const errorMessage = error?.message || 'Failed to delete dealership';
      toast.error(errorMessage);
    }
  });

  return {
    createDealership,
    updateDealership,
    deleteDealership
  };
};
