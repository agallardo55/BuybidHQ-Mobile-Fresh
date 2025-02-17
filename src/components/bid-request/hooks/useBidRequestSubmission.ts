
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { FormState } from "../types";
import { toast } from "sonner";

interface BidRequestSubmissionProps {
  formState: FormState;
  userId: string;
}

export const useBidRequestSubmission = () => {
  const navigate = useNavigate();

  const submitBidRequest = async ({ formState, userId }: BidRequestSubmissionProps) => {
    const { formData, selectedBuyers, uploadedImageUrls } = formState;

    try {
      // Prepare vehicle data matching database schema
      const vehicleData = {
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
      };

      // Prepare reconditioning data matching database schema
      const reconData = {
        windshield: formData.windshield,
        engine_light: formData.engineLights,
        brakes: formData.brakes,
        tires: formData.tire,
        maintenance: formData.maintenance,
        recon_estimate: formData.reconEstimate,
        recon_details: formData.reconDetails
      };

      const { data, error } = await supabase.rpc('create_complete_bid_request', {
        vehicle_data: vehicleData,
        recon_data: reconData,
        image_urls: uploadedImageUrls,
        buyer_ids: selectedBuyers,
        creator_id: userId
      });

      if (error) {
        console.error('Error creating bid request:', error);
        toast.error('Failed to create bid request');
        throw error;
      }

      toast.success('Bid request created successfully');
      navigate('/dashboard');

    } catch (error) {
      console.error('Error in submitBidRequest:', error);
      toast.error('Failed to create bid request');
      throw error;
    }
  };

  return { submitBidRequest };
};
