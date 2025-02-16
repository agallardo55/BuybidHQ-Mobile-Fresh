
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BidRequest } from "@/components/bid-request/types";
import { toast } from "sonner";
import { useCurrentUser } from "./useCurrentUser";

export const useBidRequests = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useCurrentUser();

  const { data: bidRequests = [], isLoading } = useQuery({
    queryKey: ['bidRequests', currentUser?.role],
    queryFn: async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!session || sessionError) {
          console.error("No valid session:", sessionError);
          return [];
        }

        console.log("Current user role:", currentUser?.role);

        // Mock data with consistent data structure
        const mockData: BidRequest[] = [
          {
            id: "1",
            createdAt: new Date().toISOString(),
            year: 2021,
            make: "Toyota",
            model: "Camry",
            trim: "XSE",
            vin: "1HGCM82633A123456",
            mileage: 35000,
            buyer: "John Smith",
            highestOffer: 25000,
            status: "Pending" as const,
            engineCylinders: "4 Cylinder",
            transmission: "Automatic",
            drivetrain: "FWD",
            exteriorColor: "Pearl White",
            interiorColor: "Black",
            accessories: "Navigation, Sunroof",
            windshield: "Good",
            engineLights: "No warnings",
            brakes: "Good",
            tire: "New",
            maintenance: "Up to date",
            reconEstimate: "500",
            reconDetails: "Minor detailing needed"
          },
          {
            id: "2",
            createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            year: 2020,
            make: "Honda",
            model: "Accord",
            trim: "Sport",
            vin: "5FNRL6H58NB064752",
            mileage: 45000,
            buyer: "Sarah Johnson",
            highestOffer: 22500,
            status: "Approved" as const,
            engineCylinders: "4 Cylinder",
            transmission: "Automatic",
            drivetrain: "FWD",
            exteriorColor: "Silver",
            interiorColor: "Gray",
            accessories: "Apple CarPlay, Android Auto",
            windshield: "Good",
            engineLights: "No warnings",
            brakes: "Good",
            tire: "Good",
            maintenance: "Up to date",
            reconEstimate: "800",
            reconDetails: "Minor paint touch-up needed"
          },
          {
            id: "3",
            createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            year: 2019,
            make: "BMW",
            model: "330i",
            trim: "xDrive",
            vin: "WBA8B9G55GNT12345",
            mileage: 55000,
            buyer: "Michael Brown",
            highestOffer: 28000,
            status: "Declined" as const,
            engineCylinders: "4 Cylinder Turbo",
            transmission: "Automatic",
            drivetrain: "AWD",
            exteriorColor: "Black Sapphire",
            interiorColor: "Cognac",
            accessories: "Premium Package, M Sport Package",
            windshield: "Needs replacement",
            engineLights: "Check engine",
            brakes: "Need service",
            tire: "Fair",
            maintenance: "Service due",
            reconEstimate: "2500",
            reconDetails: "Brake service, windshield replacement needed"
          }
        ];

        return mockData;

      } catch (error) {
        console.error("Error in bid requests query:", error);
        toast.error("Failed to fetch bid requests. Please try again.");
        throw error;
      }
    },
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes (renamed from cacheTime)
  });

  const updateBidRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "Pending" | "Approved" | "Declined" }) => {
      const { error } = await supabase
        .from('bid_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bidRequests'] });
      toast.success("Bid request status updated successfully");
    },
    onError: (error) => {
      console.error("Update bid request error:", error);
      toast.error("Failed to update bid request status. Please try again.");
    },
  });

  return {
    bidRequests,
    isLoading,
    updateBidRequest: updateBidRequestMutation.mutate,
  };
};
