
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCurrentUser } from "../useCurrentUser";
import { useNavigate } from "react-router-dom";
import { BuyerResponse, MappedBuyer } from "./types";

export const useBuyersQuery = () => {
  const { currentUser } = useCurrentUser();
  const navigate = useNavigate();

  return useQuery({
    queryKey: ['buyers', currentUser?.role],
    queryFn: async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!session || sessionError) {
          console.error("No valid session:", sessionError);
          navigate('/signin');
          return [];
        }

        console.log("Current user role:", currentUser?.role);

        // Using the new access cache for efficient querying
        const { data, error } = await supabase
          .from('buyers')
          .select(`
            id,
            user_id,
            buyer_name,
            email,
            dealer_name,
            buyer_mobile,
            buyer_phone,
            city,
            state,
            zip_code,
            accepted_bids,
            pending_bids,
            declined_bids,
            phone_carrier,
            phone_validation_status
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Buyer fetch error:", error);
          if (error.code === 'PGRST116') {
            navigate('/signin');
            return [];
          }
          throw error;
        }

        if (!data) {
          console.log("No data returned from query");
          return [];
        }

        console.log("Raw buyers data:", data);

        const typedData = data as unknown as BuyerResponse[];
        const mappedBuyers: MappedBuyer[] = typedData.map(buyer => {
          console.log("Mapping buyer data:", buyer);
          console.log("Phone carrier:", buyer.phone_carrier);
          
          return {
            id: buyer.id,
            user_id: buyer.user_id || '',
            name: buyer.buyer_name || '',
            email: buyer.email || '',
            dealership: buyer.dealer_name || '',
            mobileNumber: buyer.buyer_mobile || '',
            businessNumber: buyer.buyer_phone || '',
            location: `${buyer.city || ''}, ${buyer.state || ''}`.replace(/, $/, ''),
            acceptedBids: buyer.accepted_bids || 0,
            pendingBids: buyer.pending_bids || 0,
            declinedBids: buyer.declined_bids || 0,
            phoneCarrier: buyer.phone_carrier || 'N/A',
            phoneValidationStatus: buyer.phone_validation_status
          };
        });

        console.log("Mapped buyers with carriers:", mappedBuyers);
        return mappedBuyers;
      } catch (error: any) {
        console.error("Error in buyers query:", error);
        if (error.message?.includes('JWT')) {
          navigate('/signin');
          return [];
        }
        toast.error("Failed to fetch buyers. Please try again.");
        throw error;
      }
    },
    enabled: !!currentUser,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('JWT') || 
          error?.message?.includes('Invalid refresh token')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
