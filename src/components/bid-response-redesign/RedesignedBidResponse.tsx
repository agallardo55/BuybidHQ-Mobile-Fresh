import { useState } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicSupabase } from "@/integrations/supabase/publicClient";
import { ErrorState, LoadingState } from "@/components/bid-response/BidResponseStates";
import MainOfferPage from "./MainOfferPage";
import DetailPage from "./DetailPage";
import { QuickBidDetails } from "./types";
import { useBidSubmission } from "@/hooks/useBidSubmission";
import { toast } from "sonner";

const useQuickBidDetails = () => {
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const token = searchParams.get('token');

  return useQuery<QuickBidDetails>({
    queryKey: ['quickBidDetails', id, token],
    queryFn: async () => {
      if (!token) throw new Error('No bid token provided');
      if (!id) throw new Error('No bid request ID provided');

      const { data: requestDetails, error: requestError } = await publicSupabase
        .rpc('get_public_bid_request_details', { p_token: token });

      if (requestError) {
        console.error('Error fetching bid request details:', {
          message: requestError.message,
          code: requestError.code,
          details: requestError.details,
          hint: requestError.hint,
          fullError: requestError
        });
        throw new Error(`Failed to load bid request details: ${requestError.message}`);
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
        vehicle_body_style: request.vehicle_body_style,
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

const RedesignedBidResponse = () => {
  const { data, isLoading, error } = useQuickBidDetails();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [currentView, setCurrentView] = useState('offer'); // 'offer' or 'details'
  const [submitted, setSubmitted] = useState(false);

  const showAlert = (title: string, message: string | { amount: string; description: string }, type: string) => {
    const body = typeof message === 'string' ? message : `${message.amount} — ${message.description}`;
    if (type === 'success') {
      toast.success(body, { description: title });
    } else {
      toast.error(body, { description: title });
    }
  };

  const { isSubmitting, handleSubmit } = useBidSubmission({
    token,
    showAlert,
    setSubmitted
  });

  const handleOfferSubmit = (amount: number) => {
    handleSubmit({ offerAmount: amount.toString() });
  };

  const handleViewDetails = () => {
    setCurrentView('details');
    // Use setTimeout to ensure DOM is rendered before scrolling
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 0);
  };

  const handleBackToOffer = () => {
    setCurrentView('offer');
    // Use setTimeout to ensure DOM is rendered before scrolling
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 0);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error.message} />;
  }

  if (!data) {
    return <ErrorState message="No bid details found." />;
  }

  return (
    <div>
      {currentView === 'offer' ? (
        <MainOfferPage
          vehicle={data}
          onViewDetails={handleViewDetails}
          onSubmitOffer={handleOfferSubmit}
          isSubmitting={isSubmitting}
          hasSubmitted={submitted || !!data.submitted_offer_amount}
        />
      ) : (
        <DetailPage vehicle={data} onBackToOffer={handleBackToOffer} />
      )}
    </div>
  );
};

export default RedesignedBidResponse;
