
import { supabase } from "@/integrations/supabase/client";
import { FormState } from "../types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useBidRequestSubmission = () => {
  const navigate = useNavigate();

  const submitBidRequest = async ({
    formState,
    userId,
  }: {
    formState: FormState;
    userId: string;
  }) => {
    const { formData, uploadedImageUrls, selectedBuyers } = formState;
    
    try {
      const { data, error } = await supabase.rpc('create_complete_bid_request', {
        vehicle_data: {
          year: formData.year,
          make: formData.make,
          model: formData.model,
          trim: formData.trim,
          vin: formData.vin,
          mileage: formData.mileage,
          engine: formData.engineCylinders,
          transmission: formData.transmission,
          drivetrain: formData.drivetrain,
          exterior: formData.exteriorColor,
          interior: formData.interiorColor,
          options: formData.accessories
        },
        recon_data: {
          windshield: formData.windshield || "clear",
          engineLights: formData.engineLights || "none",
          brakes: formData.brakes || "acceptable",
          tire: formData.tire || "acceptable",
          maintenance: formData.maintenance || "upToDate",
          reconEstimate: formData.reconEstimate,
          reconDetails: formData.reconDetails
        },
        image_urls: uploadedImageUrls,
        buyer_ids: selectedBuyers,
        creator_id: userId
      });

      if (error) {
        throw error;
      }

      toast.success("Bid request created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Error creating bid request:', error);
      if (error.message?.includes('uuid')) {
        toast.error("Invalid buyer selection. Please try again.");
      } else {
        toast.error("Failed to create bid request. Please try again.");
      }
      throw error;
    }
  };

  return { submitBidRequest };
};
