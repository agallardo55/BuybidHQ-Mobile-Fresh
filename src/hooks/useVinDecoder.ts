/**
 * Simplified VIN decoder hook
 * Replaces complex useVinDecoder with clean, focused logic
 */
import { useState } from "react";
import { toast } from "sonner";
import { vinService, VehicleData } from "@/services/vinService";
import { useAuth } from "@/contexts/AuthContext";
import { hasRole } from "@/utils/auth-helpers";

export function useVinDecoder() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const decodeVin = async (vin: string, onSuccess?: (data: VehicleData) => void): Promise<void> => {
    setIsLoading(true);
    
    try {
      const result = await vinService.decodeVin(vin);
      
      if (result.success && result.data) {
        onSuccess?.(result.data);
        toast.success("Vehicle information retrieved successfully");
      } else {
        // Check if user is admin or superadmin for detailed error messages
        const isAdminOrSuperAdmin = hasRole(user, 'admin') || hasRole(user, 'super_admin');
        
        if (isAdminOrSuperAdmin) {
          // Show detailed error for admin/superadmin
          toast.error(result.error || "Failed to decode VIN");
        } else {
          // Show generic error for other roles with auto-dismiss
          toast.error("Something went wrong", {
            duration: 3000,
            description: "Please try again or contact support if the issue persists."
          });
        }
      }
    } catch (error) {
      // Check if user is admin or superadmin for detailed error messages
      const isAdminOrSuperAdmin = hasRole(user, 'admin') || hasRole(user, 'super_admin');
      
      if (isAdminOrSuperAdmin) {
        // Show detailed error for admin/superadmin
        toast.error("An unexpected error occurred");
      } else {
        // Show generic error for other roles with auto-dismiss
        toast.error("Something went wrong", {
          duration: 3000,
          description: "Please try again or contact support if the issue persists."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    decodeVin
  };
}
