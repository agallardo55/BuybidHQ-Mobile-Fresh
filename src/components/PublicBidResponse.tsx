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
import { toast } from "sonner";

interface QuickBidDetails {
  request: {
    id: string;
    seller_name: string;
    seller_notes?: string;
    seller_email?: string;
    seller_phone?: string;
  };
  vehicle: {
    year: number;
    make: string;
    model: string;
    trim_level?: string;
    vin?: string;
    mileage: number;
    exterior_color?: string;
    interior_color?: string;
    engine_cylinders?: string;
    transmission?: string;
    drivetrain?: string;
    accessories?: string;
    recon_estimate?: string;
    recon_details?: string;
  };
  buyer: {
    id: string;
    buyer_name: string;
    dealer_name?: string;
    email: string;
  };
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

      const request = requestDetails[0];
      
      return {
        request: {
          id: request.request_id,
          seller_name: 'Seller', // Use a default value since this isn't in the response
          seller_notes: '', // No seller notes available
          seller_email: '',
          seller_phone: '',
        },
        vehicle: {
          year: parseInt(request.vehicle_year) || 0,
          make: request.vehicle_make || '',
          model: request.vehicle_model || '',
          trim_level: request.vehicle_trim,
          vin: request.vehicle_vin,
          mileage: parseInt(request.vehicle_mileage) || 0,
          exterior_color: '', // Not available in this response
          interior_color: '', // Not available in this response
          engine_cylinders: request.vehicle_engine,
          transmission: request.vehicle_transmission,
          drivetrain: request.vehicle_drivetrain,
          accessories: '', // Not available in this response
          recon_estimate: '',
          recon_details: '',
        },
        buyer: {
          id: '', // Not available in this response
          buyer_name: request.buyer_name || '',
          dealer_name: request.buyer_dealership || '',
          email: '', // Not available in this response
        }
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
              year: String(data.vehicle.year),
              make: data.vehicle.make,
              model: data.vehicle.model,
              trim: data.vehicle.trim_level || '',
              vin: data.vehicle.vin || '',
              mileage: String(data.vehicle.mileage),
              exteriorColor: data.vehicle.exterior_color || '',
              interiorColor: data.vehicle.interior_color || '',
              engineCylinders: data.vehicle.engine_cylinders || '',
              transmission: data.vehicle.transmission || '',
              drivetrain: data.vehicle.drivetrain || '',
              accessories: data.vehicle.accessories || '',
              windshield: 'clear',
              engineLights: 'none',
              brakes: 'acceptable',
              tire: 'acceptable',
              maintenance: 'upToDate',
              reconEstimate: data.vehicle.recon_estimate || '',
              reconDetails: data.vehicle.recon_details || '',
              images: []
            }}
            buyer={{
              name: data.buyer.buyer_name,
              dealership: data.buyer.dealer_name || '',
              mobileNumber: ''
            }}
          />
          <BidForm 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting}
            existingBidAmount={null}
          />
          <BidResponseMarketing />
        </div>
      ) : null}
    </BidResponseLayout>
  );
};

export default PublicBidResponse;