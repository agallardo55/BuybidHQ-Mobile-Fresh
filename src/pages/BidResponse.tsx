
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { BidResponseFormData, VehicleDetails } from "@/components/bid-response/types";
import VehicleDetailsSection from "@/components/bid-response/VehicleDetailsSection";
import BidForm from "@/components/bid-response/BidForm";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

const BidResponse = () => {
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSendingSMS, setIsSendingSMS] = useState(false);

  const requestId = searchParams.get('request');
  const buyerId = searchParams.get('buyer');

  const handleSendSMS = async () => {
    if (!phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }

    setIsSendingSMS(true);
    try {
      // Construct the bid request URL
      const bidRequestUrl = `${window.location.origin}/bid-response?request=${requestId}&buyer=${buyerId}`;

      const { data, error } = await supabase.functions.invoke('send-bid-sms', {
        body: {
          phoneNumber,
          bidRequestUrl
        }
      });

      if (error) throw error;

      toast.success("SMS sent successfully!");
      setPhoneNumber(""); // Clear the input after successful send
    } catch (err) {
      console.error('Error sending SMS:', err);
      toast.error("Failed to send SMS. Please try again.");
    } finally {
      setIsSendingSMS(false);
    }
  };

  useEffect(() => {
    const fetchBidRequestDetails = async () => {
      if (!requestId) {
        setError('Invalid request ID');
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_bid_request_details', {
          p_request_id: requestId
        });

        if (error) throw error;

        if (data && data[0]) {
          setVehicleDetails({
            year: data[0].year,
            make: data[0].make,
            model: data[0].model,
            trim: data[0].trim_level,
            mileage: data[0].mileage,
            exteriorColor: data[0].exterior_color,
            interiorColor: data[0].interior_color,
            vin: data[0].vin,
            windshield: data[0].windshield,
            engineLights: data[0].engine_lights,
            brakes: data[0].brakes,
            tire: data[0].tire,
            maintenance: data[0].maintenance,
            reconEstimate: data[0].recon_estimate,
            reconDetails: data[0].recon_details,
            accessories: data[0].accessories,
            transmission: data[0].transmission,
            engineCylinders: data[0].engine_cylinders,
            drivetrain: data[0].drivetrain,
            userFullName: data[0].user_full_name,
            dealership: data[0].dealership,
            mobileNumber: data[0].mobile_number
          });
        } else {
          setError('Bid request not found');
        }
      } catch (err) {
        console.error('Error fetching bid request:', err);
        setError('Failed to load bid request details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBidRequestDetails();
  }, [requestId]);

  const handleSubmit = async (formData: BidResponseFormData) => {
    if (!requestId || !buyerId) {
      toast.error("Invalid request or buyer ID");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('bid_responses')
        .insert({
          bid_request_id: requestId,
          buyer_id: buyerId,
          offer_amount: parseFloat(formData.offerAmount),
          status: 'pending'
        });

      if (error) throw error;

      toast.success("Your bid has been submitted successfully!");
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast.error("Failed to submit bid. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="w-full bg-white shadow-sm py-4">
          <div className="max-w-2xl mx-auto px-4">
            <img src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" alt="BuyBid Logo" className="h-8" />
          </div>
        </header>
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="w-full bg-white shadow-sm py-4">
          <div className="max-w-2xl mx-auto px-4">
            <img src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" alt="BuyBid Logo" className="h-8" />
          </div>
        </header>
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="w-full bg-white shadow-sm py-4">
          <div className="max-w-2xl mx-auto px-4 flex justify-between items-center">
            <img src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" alt="BuyBid Logo" className="h-8" />
            <Link to="/signup">
              <Button variant="default" className="bg-custom-blue hover:bg-custom-blue/90">
                Join Now
              </Button>
            </Link>
          </div>
        </header>
        <div className="px-4 py-8 flex items-center justify-center flex-grow">
          <div className="w-full max-w-lg text-center space-y-4 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900">Thank You!</h2>
            <p className="text-gray-600">
              Your bid has been received. We'll be in touch shortly.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!vehicleDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-white shadow-sm py-4">
        <div className="max-w-2xl mx-auto px-4 flex justify-between items-center">
          <img src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" alt="BuyBid Logo" className="h-8" />
          <Link to="/signup">
            <Button variant="default" className="bg-custom-blue hover:bg-custom-blue/90">
              Join Now
            </Button>
          </Link>
        </div>
      </header>
      <div className="max-w-2xl mx-auto p-4 space-y-6 flex-grow">
        <VehicleDetailsSection vehicle={vehicleDetails} />
        <div className="bg-white rounded-lg p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold">Share Bid Request</h3>
          <div className="flex gap-2">
            <Input
              type="tel"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleSendSMS}
              disabled={isSendingSMS}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isSendingSMS ? "Sending..." : "Send SMS"}
            </Button>
          </div>
        </div>
        <BidForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        <div className="bg-gray-50 rounded-lg p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Why Join BuyBidHQ?</h3>
          <p className="text-gray-600">
            Join our network of dealerships and get access to exclusive vehicle listings, real-time bidding, 
            and comprehensive vehicle condition reports. Start expanding your inventory today!
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BidResponse;
