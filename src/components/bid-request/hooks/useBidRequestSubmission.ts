
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
      const { data: requestId, error } = await supabase.rpc('create_complete_bid_request', {
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

      // Fetch buyer details for notifications
      const { data: buyers, error: buyersError } = await supabase
        .from('buyers')
        .select('id, buyer_mobile, buyer_name, email')
        .in('id', selectedBuyers);

      if (buyersError) {
        console.error('Error fetching buyers:', buyersError);
        throw buyersError;
      }

      // Generate submission tokens and send notifications to each buyer
      for (const buyer of buyers) {
        // Generate a submission token for this buyer
        const { data: token, error: tokenError } = await supabase
          .rpc('generate_bid_submission_token', {
            p_bid_request_id: requestId,
            p_buyer_id: buyer.id
          });

        if (tokenError) {
          console.error(`Error generating token for buyer ${buyer.id}:`, tokenError);
          continue;
        }

        const bidResponseUrl = `${window.location.origin}/bid-response?request=${requestId}&token=${token}`;
        
        // Send SMS notification if mobile number is available
        if (buyer.buyer_mobile) {
          try {
            const { error: smsError } = await supabase.functions.invoke('send-bid-sms', {
              body: {
                type: 'bid_request',
                phoneNumber: buyer.buyer_mobile,
                vehicleDetails: {
                  year: formData.year,
                  make: formData.make,
                  model: formData.model
                },
                bidRequestUrl: bidResponseUrl
              }
            });

            if (smsError) {
              console.error(`Error sending SMS to buyer ${buyer.id}:`, smsError);
              toast.error(`Failed to send SMS to ${buyer.buyer_name}`);
            } else {
              console.log(`SMS sent successfully to buyer ${buyer.id} at ${buyer.buyer_mobile}`);
              toast.success(`SMS notification sent to ${buyer.buyer_name}`);
            }
          } catch (smsError) {
            console.error(`Error invoking SMS function for buyer ${buyer.id}:`, smsError);
            toast.error(`Failed to send SMS to ${buyer.buyer_name}`);
          }
        }

        // Send email notification if email is available
        if (buyer.email) {
          try {
            const { error: emailError } = await supabase.functions.invoke('send-bid-email', {
              body: {
                type: 'bid_request',
                email: buyer.email,
                buyerName: buyer.buyer_name,
                vehicleDetails: {
                  year: formData.year,
                  make: formData.make,
                  model: formData.model
                },
                bidRequestUrl: bidResponseUrl
              }
            });

            if (emailError) {
              console.error(`Error sending email to buyer ${buyer.id}:`, emailError);
              toast.error(`Failed to send email to ${buyer.buyer_name}`);
            } else {
              console.log(`Email sent successfully to buyer ${buyer.id} at ${buyer.email}`);
              toast.success(`Email notification sent to ${buyer.buyer_name}`);
            }
          } catch (emailError) {
            console.error(`Error invoking email function for buyer ${buyer.id}:`, emailError);
            toast.error(`Failed to send email to ${buyer.buyer_name}`);
          }
        }

        // Show warning if neither SMS nor email could be sent
        if (!buyer.buyer_mobile && !buyer.email) {
          toast.error(`No contact information available for ${buyer.buyer_name}`);
        }
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
