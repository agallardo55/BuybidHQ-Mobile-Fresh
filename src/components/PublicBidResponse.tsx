import { useState } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicSupabase } from "@/integrations/supabase/publicClient";
import VehicleDetailsSection from "@/components/bid-response/VehicleDetailsSection";
import BidForm from "@/components/bid-response/BidForm";
import BidResponseLayout from "@/components/bid-response/BidResponseLayout";
import { ErrorState, LoadingState, SubmittedState } from "@/components/bid-response/BidResponseStates";
import BidResponseMarketing from "@/components/bid-response/BidResponseMarketing";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import { AlertDialogCustom } from "@/components/bid-response/AlertDialogCustom";
import { BidResponseFormData } from "@/components/bid-response/types";
import { AlertType } from '@/hooks/useAlertDialog';
import { toast } from "@/utils/notificationToast";

interface QuickBidDetails {
  request_id: string;
  created_at: string;
  status: string;
  vehicle_year: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_trim: string;
  vehicle_vin: string;
  vehicle_mileage: string;
  vehicle_engine: string;
  vehicle_transmission: string;
  vehicle_drivetrain: string;
  vehicle_exterior_color: string;
  vehicle_interior_color: string;
  vehicle_accessories: string;
  buyer_name: string;
  buyer_dealership: string;
  buyer_mobile: string;
  is_used: boolean;
  submitted_offer_amount: number | null;
  submitted_at: string | null;
  vehicle_images: string[];
  kbb_wholesale?: number;
  kbb_retail?: number;
  jd_power_wholesale?: number;
  jd_power_retail?: number;
  mmr_wholesale?: number;
  mmr_retail?: number;
  auction_wholesale?: number;
  auction_retail?: number;
  windshield?: string;
  engine_lights?: string;
  brakes?: string;
  tire?: string;
  maintenance?: string;
  recon_estimate?: string;
  recon_details?: string;
  history?: string;
  history_service?: string;
  book_values_condition?: string;
}

interface UseBidSubmissionProps {
  token: string | null;
  showAlert: (title: string, message: string, type: AlertType) => void;
  setSubmitted: (submitted: boolean) => void;
}

const useBidSubmission = ({ token, showAlert, setSubmitted }: UseBidSubmissionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: BidResponseFormData): Promise<void> => {
    if (!token) {
      showAlert("Error", "Invalid submission token", "error");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Validate offer amount
      const cleanAmount = parseFloat(formData.offerAmount.replace(/[^0-9.]/g, ''));
      
      if (isNaN(cleanAmount) || cleanAmount <= 0) {
        throw new Error("Offer amount must be greater than 0");
      }

      const { data, error } = await publicSupabase.functions.invoke('submit-public-bid', {
        body: {
          token,
          offerAmount: cleanAmount
        }
      });

      if (error) {
        console.error('Submission error:', error);
        const errorMessage = error.message || 'Failed to submit bid';
        showAlert("Submission Failed", errorMessage, "error");
        toast.error("Failed to submit bid: " + errorMessage);
        return;
      }

      if (data?.success) {
        setSubmitted(true);
        showAlert("Success", "Your bid has been submitted successfully!", "success");
        toast.success("Bid submitted successfully!");
      } else {
        const errorMessage = data?.error || 'Unknown error occurred';
        showAlert("Submission Failed", errorMessage, "error");
        toast.error("Failed to submit bid: " + errorMessage);
      }
    } catch (error) {
      console.error('Error submitting bid:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      showAlert("Error", errorMessage, "error");
      toast.error("Error: " + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, handleSubmit };
};

const useQuickBidDetails = () => {
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const token = searchParams.get('token');

  return useQuery<QuickBidDetails>({
    queryKey: ['quickBidDetails', id, token],
    queryFn: async () => {
      if (!token) throw new Error('No bid token provided');
      if (!id) throw new Error('No bid request ID provided');

      // Use the new secure RPC to get bid request details with public client
      const { data: requestDetails, error: requestError } = await publicSupabase
        .rpc('get_public_bid_request_details', { p_token: token });

      if (requestError) {
        console.error('Error fetching bid request details:', requestError);
        throw new Error('Failed to load bid request details');
      }

      if (!requestDetails || requestDetails.length === 0) {
        throw new Error('Invalid or expired bid submission link');
      }

      const request = requestDetails[0] as any;
      
      return {
        request_id: request.request_id,
        created_at: request.created_at,
        status: request.status,
        vehicle_year: request.vehicle_year,
        vehicle_make: request.vehicle_make,
        vehicle_model: request.vehicle_model,
        vehicle_trim: request.vehicle_trim,
        vehicle_vin: request.vehicle_vin,
        vehicle_mileage: request.vehicle_mileage,
        vehicle_engine: request.vehicle_engine,
        vehicle_transmission: request.vehicle_transmission,
        vehicle_drivetrain: request.vehicle_drivetrain,
        buyer_name: request.buyer_name,
        buyer_dealership: request.buyer_dealership,
        buyer_mobile: request.buyer_mobile,
        is_used: request.is_used,
        submitted_offer_amount: request.submitted_offer_amount,
        submitted_at: request.submitted_at,
        vehicle_images: Array.isArray(request.vehicle_images) 
          ? request.vehicle_images as string[]
          : [],
        vehicle_exterior_color: request.vehicle_exterior_color,
        vehicle_interior_color: request.vehicle_interior_color,
        vehicle_accessories: request.vehicle_accessories,
        kbb_wholesale: request.kbb_wholesale,
        kbb_retail: request.kbb_retail,
        jd_power_wholesale: request.jd_power_wholesale,
        jd_power_retail: request.jd_power_retail,
        mmr_wholesale: request.mmr_wholesale,
        mmr_retail: request.mmr_retail,
        auction_wholesale: request.auction_wholesale,
        auction_retail: request.auction_retail,
        windshield: request.windshield,
        engine_lights: request.engine_lights,
        brakes: request.brakes,
        tire: request.tire,
        maintenance: request.maintenance,
        recon_estimate: request.recon_estimate,
        recon_details: request.recon_details,
        history: request.history,
        history_service: request.history_service,
        book_values_condition: request.book_values_condition,
      };
    },
    enabled: !!(id && token),
  });
};

const PublicBidResponse = () => {
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const [submitted, setSubmitted] = useState(false);

  const token = searchParams.get('token');
  
  const { data, isLoading, error } = useQuickBidDetails();
  const { alert, showAlert, setAlert } = useAlertDialog();
  const { isSubmitting, handleSubmit } = useBidSubmission({
    token,
    showAlert,
    setSubmitted
  });

  // Show error if no token or ID is provided
  if (!token || !id) {
    return (
      <BidResponseLayout>
        <ErrorState message="Invalid bid submission link. Please check your email and try again." />
      </BidResponseLayout>
    );
  }

  return (
    <BidResponseLayout>
      <AlertDialogCustom
        open={alert.open}
        onOpenChange={(open) => setAlert(prev => ({ ...prev, open }))}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />

      {error ? (
        <ErrorState message={error.message} />
      ) : isLoading ? (
        <LoadingState />
      ) : submitted ? (
        <SubmittedState 
          message="Thank you! Your offer has been submitted successfully."
        />
      ) : data ? (
        <div className="max-w-2xl mx-auto p-4 space-y-6 flex-grow">
          <VehicleDetailsSection 
            vehicle={{
              year: data.vehicle_year,
              make: data.vehicle_make,
              model: data.vehicle_model,
              trim: data.vehicle_trim || '',
              vin: data.vehicle_vin || '',
              mileage: data.vehicle_mileage,
              exteriorColor: data.vehicle_exterior_color || '',
              interiorColor: data.vehicle_interior_color || '',
              engineCylinders: data.vehicle_engine || '',
              transmission: data.vehicle_transmission || '',
              drivetrain: data.vehicle_drivetrain || '',
              accessories: data.vehicle_accessories || '',
            windshield: data.windshield || 'clear',
            engineLights: data.engine_lights || 'none',
            brakes: data.brakes || 'acceptable',
            tire: data.tire || 'acceptable',
            maintenance: data.maintenance || 'upToDate',
            reconEstimate: data.recon_estimate || '',
            reconDetails: data.recon_details || '',
            history: data.history,
            historyService: data.history_service,
              images: data.vehicle_images || [],
              kbbWholesale: data.kbb_wholesale,
              kbbRetail: data.kbb_retail,
              jdPowerWholesale: data.jd_power_wholesale,
              jdPowerRetail: data.jd_power_retail,
              mmrWholesale: data.mmr_wholesale,
              mmrRetail: data.mmr_retail,
              auctionWholesale: data.auction_wholesale,
              auctionRetail: data.auction_retail,
              bookValuesCondition: data.book_values_condition,
            }}
            buyer={{
              name: data.buyer_name,
              dealership: data.buyer_dealership || '',
              mobileNumber: data.buyer_mobile || ''
            }}
          />
          <BidForm 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting}
            existingBidAmount={data.submitted_offer_amount ? String(data.submitted_offer_amount) : null}
          />
          <BidResponseMarketing />
        </div>
      ) : null}
    </BidResponseLayout>
  );
};

export default PublicBidResponse;