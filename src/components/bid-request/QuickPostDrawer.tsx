
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { toast } from "sonner";
import { useBuyers } from "@/hooks/useBuyers";
import VinInput from "./components/VinInput";
import BasicVehicleFields from "./components/BasicVehicleFields";
import TrimSelector from "./components/TrimSelector";
import MileageInput from "./components/MileageInput";
import NotesInput from "./components/NotesInput";
import BuyerSelector from "./components/BuyerSelector";
import { TrimOption } from "./types";
import { useVinDecoder } from "./vin-scanner/useVinDecoder";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { supabase } from "@/integrations/supabase/client";

interface QuickPostDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickPostDrawer = ({
  isOpen,
  onClose
}: QuickPostDrawerProps) => {
  // Form state
  const [vin, setVin] = useState("");
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [mileage, setMileage] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState("");
  const [selectedTrim, setSelectedTrim] = useState("");
  const [availableTrims, setAvailableTrims] = useState<TrimOption[]>([{
    name: "Base",
    description: "Base Trim",
    specs: {
      engine: "4 Cylinder",
      transmission: "Automatic",
      drivetrain: "FWD"
    }
  }, {
    name: "Sport",
    description: "Sport Trim",
    specs: {
      engine: "6 Cylinder",
      transmission: "Manual",
      drivetrain: "AWD"
    }
  }, {
    name: "Limited",
    description: "Limited Edition",
    specs: {
      engine: "6 Cylinder Turbo",
      transmission: "Automatic",
      drivetrain: "AWD"
    }
  }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current user
  const { user } = useCurrentUser();

  // Use the buyers hook to get real buyers
  const {
    buyers = []
  } = useBuyers();

  // Map buyers to the format expected by BuyerSelector with all required properties
  const mappedBuyers = buyers.map(buyer => ({
    id: buyer.id,
    user_id: buyer.user_id,
    name: buyer.name,
    email: buyer.email,
    dealership: buyer.dealership,
    dealerId: buyer.dealerId,
    mobileNumber: buyer.mobileNumber,
    businessNumber: buyer.businessNumber,
    location: buyer.location,
    address: buyer.address,
    city: buyer.city,
    state: buyer.state,
    zipCode: buyer.zipCode,
    acceptedBids: buyer.acceptedBids,
    pendingBids: buyer.pendingBids,
    declinedBids: buyer.declinedBids,
    phoneCarrier: buyer.phoneCarrier,
    phoneValidationStatus: buyer.phoneValidationStatus
  }));

  // Use the VIN decoder hook
  const {
    isLoading,
    decodeVin
  } = useVinDecoder(vehicleData => {
    console.log("VIN decoder returned vehicle data:", vehicleData);

    // Update form state with the retrieved vehicle data
    setYear(vehicleData.year || "");
    setMake(vehicleData.make || "");
    setModel(vehicleData.model || "");

    // Handle trims
    if (vehicleData.availableTrims && vehicleData.availableTrims.length > 0) {
      setAvailableTrims(vehicleData.availableTrims);
      setSelectedTrim(vehicleData.trim || vehicleData.availableTrims[0]?.name || "");
    }
    toast.success("Vehicle information retrieved successfully");
  });
  
  const handleVinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVin(e.target.value);
  };
  
  const handleFetchVin = () => {
    if (!vin) {
      toast.error("Please enter a VIN");
      return;
    }
    if (vin.length !== 17) {
      toast.error("Please enter a valid 17-character VIN");
      return;
    }

    // Call the VIN decoder
    decodeVin(vin);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!vin || !year || !make || !model || !selectedBuyer) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!user?.id) {
      toast.error("You must be logged in to create a bid request");
      return;
    }

    setIsSubmitting(true);
    const requestId = crypto.randomUUID();

    try {
      console.log(`[${requestId}] Starting quick bid request submission`);

      // Get the selected buyer details
      const selectedBuyerData = mappedBuyers.find(buyer => buyer.id === selectedBuyer);
      if (!selectedBuyerData) {
        throw new Error("Selected buyer not found");
      }

      // Get sender's details
      const { data: userData, error: userError } = await supabase
        .from('buybidhq_users')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (userError) {
        throw userError;
      }

      const senderName = userData.full_name || 'BuyBidHQ User';

      // Prepare vehicle data matching database schema
      const vehicleData = {
        year,
        make,
        model,
        trim: selectedTrim,
        vin,
        mileage,
        engine: availableTrims.find(trim => trim.name === selectedTrim)?.specs?.engine || '',
        transmission: availableTrims.find(trim => trim.name === selectedTrim)?.specs?.transmission || '',
        drivetrain: availableTrims.find(trim => trim.name === selectedTrim)?.specs?.drivetrain || '',
        exterior: '',
        interior: '',
        options: notes
      };

      // Prepare reconditioning data with default values
      const reconData = {
        windshield: 'Good',
        engine_light: 'No',
        brakes: 'Good',
        tires: 'Good',
        maintenance: 'Up to date',
        recon_estimate: '0',
        recon_details: notes || 'No additional details'
      };

      // Create the bid request
      const { data: bidRequestData, error: bidRequestError } = await supabase.rpc('create_complete_bid_request', {
        vehicle_data: vehicleData,
        recon_data: reconData,
        image_urls: [],
        buyer_ids: [selectedBuyer],
        creator_id: user.id
      });

      if (bidRequestError) {
        throw bidRequestError;
      }

      console.log(`[${requestId}] Quick bid request created successfully:`, bidRequestData);

      // Generate bid submission token
      const { data: tokenResponse, error: tokenError } = await supabase
        .rpc('generate_bid_submission_token', {
          p_bid_request_id: bidRequestData,
          p_buyer_id: selectedBuyer
        });

      if (tokenError || !tokenResponse) {
        console.error(`[${requestId}] Error generating token:`, tokenError);
        toast.error(`Created bid request but failed to generate secure link for ${selectedBuyerData.name}`);
      } else {
        // Generate bid submission URL with secure token
        const bidRequestUrl = `${window.location.origin}/bid-response/${bidRequestData}?token=${encodeURIComponent(tokenResponse)}`;

        // Send notification via Knock Edge Function
        const { error: knockError } = await supabase.functions.invoke('send-knock-sms', {
          body: {
            type: 'bid_request',
            phoneNumber: selectedBuyerData.mobileNumber,
            senderName: senderName,
            bidRequestUrl,
            vehicleDetails: {
              year,
              make,
              model
            }
          }
        });

        if (knockError) {
          console.error(`[${requestId}] Error sending notification to buyer:`, knockError);
          toast.error(`Bid request created but failed to send notification to ${selectedBuyerData.name}`);
        } else {
          console.log(`[${requestId}] SMS notification sent successfully to:`, selectedBuyerData.name);
        }
      }

      toast.success("Quick bid request created successfully");
      
      // Reset form
      setVin("");
      setYear("");
      setMake("");
      setModel("");
      setMileage("");
      setNotes("");
      setSelectedBuyer("");
      setSelectedTrim("");
      
      // Close drawer
      onClose();
    } catch (error: any) {
      console.error(`[${requestId}] Error in quick bid request submission:`, error);
      toast.error(`Failed to create bid request: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Quick Post</SheetTitle>
          <SheetDescription>
            Create a quick bid request with minimal details.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-3">
            <VinInput value={vin} onChange={handleVinChange} onFetchDetails={handleFetchVin} isLoading={isLoading} />

            <BasicVehicleFields year={year} make={make} model={model} onYearChange={e => setYear(e.target.value)} onMakeChange={e => setMake(e.target.value)} onModelChange={e => setModel(e.target.value)} />

            <TrimSelector selectedTrim={selectedTrim} availableTrims={availableTrims} onTrimChange={setSelectedTrim} />

            <MileageInput mileage={mileage} onChange={e => setMileage(e.target.value)} />

            <NotesInput notes={notes} onChange={e => setNotes(e.target.value)} />
            
            <BuyerSelector selectedBuyer={selectedBuyer} buyers={mappedBuyers} onBuyerChange={setSelectedBuyer} />
          </div>

          <SheetFooter className="pt-2 flex flex-row gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-initial h-8 text-sm">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 sm:flex-initial bg-accent text-white hover:bg-accent/90 h-8 text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>;
};

export default QuickPostDrawer;
