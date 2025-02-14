
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PaginatedResponse, UsePaginatedUsersProps } from "./types";

export const useUsersQuery = ({ pageSize, currentPage, searchTerm }: UsePaginatedUsersProps) => {
  return useQuery({
    queryKey: ['users', currentPage, pageSize, searchTerm],
    queryFn: async (): Promise<PaginatedResponse> => {
      // First, get total count with search filter if present
      let query = supabase
        .from('buybidhq_users')
        .select('count', { count: 'exact' })
        .is('deleted_at', null);  // Only count non-deleted users

      if (searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        const possibleRoles = ['admin', 'dealer', 'basic', 'individual'];
        const isRoleSearch = possibleRoles.some(role => role.includes(searchTermLower));
        
        if (isRoleSearch) {
          query = query.ilike('role', `%${searchTermLower}%`);
        } else {
          query = query.or(`full_name.ilike.%${searchTermLower}%,email.ilike.%${searchTermLower}%`);
        }
      }

      const { count, error: countError } = await query;

      if (countError) {
        toast.error("Failed to fetch total users count: " + countError.message);
        throw countError;
      }

      // Then get paginated data
      const startRange = (currentPage - 1) * pageSize;
      const endRange = startRange + pageSize - 1;

      let dataQuery = supabase
        .from('buybidhq_users')
        .select(`
          id,
          email,
          full_name,
          role,
          status,
          mobile_number,
          address,
          city,
          state,
          zip_code,
          dealership_id,
          is_active,
          dealerships:dealership_id (
            dealer_name,
            business_phone,
            business_email,
            address,
            city,
            state,
            zip_code,
            dealer_id
          )
        `)
        .is('deleted_at', null);

      if (searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        const possibleRoles = ['admin', 'dealer', 'basic', 'individual'];
        const isRoleSearch = possibleRoles.some(role => role.includes(searchTermLower));
        
        if (isRoleSearch) {
          dataQuery = dataQuery.ilike('role', `%${searchTermLower}%`);
        } else {
          dataQuery = dataQuery.or(`full_name.ilike.%${searchTermLower}%,email.ilike.%${searchTermLower}%`);
        }
      }

      dataQuery = dataQuery.range(startRange, endRange);

      const { data: users, error } = await dataQuery;

      if (error) {
        toast.error("Failed to fetch users: " + error.message);
        throw error;
      }

      return {
        users: users.map(user => ({
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          status: user.status || 'active',
          mobileNumber: user.mobile_number,
          address: user.address,
          city: user.city,
          state: user.state,
          zipCode: user.zip_code,
          dealershipId: user.dealership_id || undefined,
          dealershipName: user.dealerships?.dealer_name,
          dealershipInfo: user.dealerships ? {
            dealerName: user.dealerships.dealer_name,
            dealerId: user.dealerships.dealer_id || '',
            businessPhone: user.dealerships.business_phone,
            businessEmail: user.dealerships.business_email,
            address: user.dealerships.address || '',
            city: user.dealerships.city || '',
            state: user.dealerships.state || '',
            zipCode: user.dealerships.zip_code || ''
          } : undefined,
          isActive: user.is_active
        })),
        total: count || 0
      };
    },
  });
};
