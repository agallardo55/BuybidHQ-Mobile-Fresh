
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/notificationToast";
import { DealershipFormData } from "@/types/dealerships";
import { DealershipWizardData } from "@/types/dealership-wizard";

export const useDealershipMutations = () => {
  const queryClient = useQueryClient();

  const createDealership = useMutation({
    mutationFn: async (data: DealershipWizardData) => {
      console.log('Creating dealership with wizard data:', data);
      
      // First, create the dealership
      const dealershipData = {
        dealer_name: data.dealership.dealerName,
        dealer_id: data.dealership.dealerId || null,
        business_phone: data.dealership.businessPhone,
        business_email: data.dealership.businessEmail,
        address: data.dealership.address || null,
        city: data.dealership.city || null,
        state: data.dealership.state || null,
        zip_code: data.dealership.zipCode || null,
      };
      
      const { data: dealershipResult, error: dealershipError } = await supabase
        .from('dealerships')
        .insert([dealershipData])
        .select()
        .single();

      if (dealershipError) {
        console.error('Dealership creation error:', dealershipError);
        throw new Error(`Failed to create dealership: ${dealershipError.message}`);
      }
      
      // Then, create the admin user
      const adminUserData = {
        full_name: data.adminUser.fullName,
        email: data.adminUser.email,
        mobile_number: data.adminUser.mobileNumber,
        phone_carrier: data.adminUser.phoneCarrier || null,
        address: data.adminUser.address || null,
        city: data.adminUser.city || null,
        state: data.adminUser.state || null,
        zip_code: data.adminUser.zipCode || null,
        role: data.adminUser.accountType as const,
        is_active: data.adminUser.isActive,
        dealership_id: dealershipResult.id,
      };

      const { data: userResult, error: userError } = await supabase
        .from('buybidhq_users')
        .insert([adminUserData])
        .select()
        .single();

      if (userError) {
        console.error('Admin user creation error:', userError);
        // If user creation fails, we should clean up the dealership
        await supabase.from('dealerships').delete().eq('id', dealershipResult.id);
        throw new Error(`Failed to create admin user: ${userError.message}`);
      }

      // Map account type to app_role
      const appRoleMap: Record<string, string> = {
        'basic': 'member',
        'individual': 'account_admin',
        'associate': 'member'
      };

      // Update user app_role based on account type
      const { error: roleUpdateError } = await supabase
        .from('buybidhq_users')
        .update({ app_role: appRoleMap[data.adminUser.accountType] || 'member' })
        .eq('id', userResult.id);

      if (roleUpdateError) {
        console.error('Role update error:', roleUpdateError);
        // Don't fail the whole operation for this
      }

      // Only create account_admin entry for 'individual' type
      if (data.adminUser.accountType === 'individual') {
        const { error: accountAdminError } = await supabase
          .from('account_administrators')
          .insert([{
            user_id: userResult.id,
            account_id: userResult.account_id,
            email: userResult.email,
            full_name: userResult.full_name,
            mobile_number: userResult.mobile_number,
            status: 'active',
            granted_by: userResult.id, // Self-granted during creation
            granted_at: new Date().toISOString()
          }]);

        if (accountAdminError) {
          console.error('Account admin creation error:', accountAdminError);
          // Don't fail the whole operation for this
        }
      }

      console.log('Created dealership and admin user:', { dealershipResult, userResult });
      return { dealership: dealershipResult, adminUser: userResult };
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
      // First, soft delete all users associated with this dealership
      const { error: usersError } = await supabase
        .from('buybidhq_users')
        .update({ is_active: false })
        .eq('dealership_id', id);

      if (usersError) {
        console.error('Error soft deleting associated users:', usersError);
        throw new Error(`Failed to delete associated users: ${usersError.message}`);
      }

      // Then, soft delete the dealership itself
      const { error: dealershipError } = await supabase
        .from('dealerships')
        .update({ is_active: false })
        .eq('id', id);

      if (dealershipError) {
        console.error('Error soft deleting dealership:', dealershipError);
        throw new Error(`Failed to delete dealership: ${dealershipError.message}`);
      }
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
