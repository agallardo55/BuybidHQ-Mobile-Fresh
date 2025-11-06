import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BidRequest } from "../types";
import VehicleDetails from "./VehicleDetails";
import VehicleCondition from "./VehicleCondition";
import Reconditioning from "./Reconditioning";
import { Car, Eye, Wrench, DollarSign, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BidRequestTabsProps {
  request: BidRequest;
  onStatusUpdate?: (responseId: string, status: "pending" | "accepted" | "declined") => Promise<void>;
  onBidRequestStatusUpdate?: (requestId: string, status: "pending" | "accepted" | "declined") => void;
}

const BidRequestTabs = ({ request, onStatusUpdate, onBidRequestStatusUpdate }: BidRequestTabsProps) => {
  // Local state for optimistic UI updates
  const [localOfferStatuses, setLocalOfferStatuses] = useState<Record<string, "pending" | "accepted" | "declined">>({});
  const [loadingOffers, setLoadingOffers] = useState<Set<string>>(new Set());
  const [invitedBuyers, setInvitedBuyers] = useState<Array<{
    id: string;
    buyer_name: string | null;
    dealer_name: string | null;
    hasResponded: boolean;
    offerAmount?: number;
    offerStatus?: string;
    offerCreatedAt?: string;
    responseId?: string;
  }>>([]);
  const [loadingBuyers, setLoadingBuyers] = useState(false);

  // Clear local state when request data changes (after successful update)
  useEffect(() => {
    setLocalOfferStatuses({});
  }, [request.id, request.offers]);

  // Fetch invited buyers for this bid request
  useEffect(() => {
    const fetchInvitedBuyers = async () => {
      if (!request?.id) return;
      
      setLoadingBuyers(true);
      try {
        // Fetch buyers associated with this bid request via bid_submission_tokens
        const { data: tokens, error: tokensError } = await supabase
          .from('bid_submission_tokens')
          .select(`
            buyer_id,
            buyers!inner(
              id,
              buyer_name,
              dealer_name
            )
          `)
          .eq('bid_request_id', request.id);

        if (tokensError) {
          console.error('Error fetching invited buyers:', tokensError);
          setLoadingBuyers(false);
          return;
        }

        // Fetch responses to check which buyers have responded
        const { data: responses, error: responsesError } = await supabase
          .from('bid_responses')
          .select('id, buyer_id, offer_amount, status, created_at')
          .eq('bid_request_id', request.id);

        if (responsesError) {
          console.error('Error fetching responses:', responsesError);
        }

        // Combine buyer data with response status
        const buyersWithStatus = (tokens || []).map((token: any) => {
          const buyer = token.buyers;
          const response = responses?.find((r: any) => r.buyer_id === buyer.id);
          
          return {
            id: buyer.id,
            buyer_name: buyer.buyer_name || null,
            dealer_name: buyer.dealer_name || null,
            hasResponded: !!response,
            offerAmount: response?.offer_amount,
            offerStatus: response?.status,
            offerCreatedAt: response?.created_at,
            responseId: response?.id,
          };
        });

        setInvitedBuyers(buyersWithStatus);
      } catch (error) {
        console.error('Error in fetchInvitedBuyers:', error);
      } finally {
        setLoadingBuyers(false);
      }
    };

    fetchInvitedBuyers();
  }, [request.id, request.offers]);

  // Helper function to get display text for status
  const getStatusDisplayText = (status: string) => {
    if (status.toLowerCase() === 'declined') return 'Not Selected';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Get current status (local state first, then server data)
  const getCurrentStatus = (offerId: string, serverStatus: string) => {
    return localOfferStatuses[offerId] || serverStatus.toLowerCase();
  };

  const handleStatusUpdate = async (offerId: string, value: "pending" | "accepted" | "declined") => {
    console.log('🔄 BidRequestTabs handleStatusUpdate called:', { offerId, value });
    
    // Immediately update local state for optimistic UI
    setLocalOfferStatuses(prev => ({ ...prev, [offerId]: value }));
    setLoadingOffers(prev => new Set([...prev, offerId]));
    
    try {
      if (onStatusUpdate) {
        await onStatusUpdate(offerId, value);
        // On success, clear local state (server data will be fresh)
        setLocalOfferStatuses(prev => {
          const newState = { ...prev };
          delete newState[offerId];
          return newState;
        });
      }
    } catch (error) {
      // On error, revert local state to original
      setLocalOfferStatuses(prev => {
        const newState = { ...prev };
        delete newState[offerId];
        return newState;
      });
      console.error('Failed to update offer status:', error);
    } finally {
      setLoadingOffers(prev => {
        const newSet = new Set(prev);
        newSet.delete(offerId);
        return newSet;
      });
    }
  };
  return (
    <Tabs defaultValue="details" className="mt-2">
      <TabsList className="flex w-full overflow-x-auto mb-3 scrollbar-thin scrollbar-thumb-gray-300 md:grid md:grid-cols-4">
        <TabsTrigger value="details" className="flex items-center gap-1 md:gap-2 text-xs px-2 py-1.5 whitespace-nowrap flex-shrink-0 md:flex-shrink">
          <Car size={14} />
          <span className="hidden sm:inline">Details</span>
        </TabsTrigger>
        <TabsTrigger value="appearance" className="flex items-center gap-1 md:gap-2 text-xs px-2 py-1.5 whitespace-nowrap flex-shrink-0 md:flex-shrink">
          <Eye size={14} />
          <span className="hidden sm:inline">Appearance</span>
        </TabsTrigger>
        <TabsTrigger value="condition" className="flex items-center gap-1 md:gap-2 text-xs px-2 py-1.5 whitespace-nowrap flex-shrink-0 md:flex-shrink">
          <Wrench size={14} />
          <span className="hidden sm:inline">Condition</span>
        </TabsTrigger>
        <TabsTrigger value="offers" className="flex items-center gap-1 md:gap-2 text-xs px-2 py-1.5 whitespace-nowrap flex-shrink-0 md:flex-shrink">
          <DollarSign size={14} />
          <span className="hidden sm:inline">Offers</span>
          {request.offers.length > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs px-1 py-0">
              {request.offers.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="min-h-[320px] overflow-y-auto">
        <VehicleDetails request={request} />
      </TabsContent>
      
      <TabsContent value="appearance" className="min-h-[320px] overflow-y-auto">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-base md:text-lg font-semibold mb-3">Vehicle Appearance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-bold text-black">Exterior Color</label>
              <p className="text-sm font-normal mt-1 p-2 rounded block w-full" style={{ backgroundColor: '#ECEEF0' }}>{request.exteriorColor || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-bold text-black">Interior Color</label>
              <p className="text-sm font-normal mt-1 p-2 rounded block w-full" style={{ backgroundColor: '#ECEEF0' }}>{request.interiorColor || 'Not specified'}</p>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="text-sm font-bold text-black">Accessories & Options</label>
              <p className="text-sm font-normal mt-1 p-2 rounded block w-full" style={{ backgroundColor: '#ECEEF0' }}>{request.accessories || 'None listed'}</p>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="condition" className="min-h-[320px] overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <VehicleCondition request={request} />
          <Reconditioning request={request} />
        </div>
      </TabsContent>
      
      <TabsContent value="offers" className="min-h-[320px] overflow-y-auto">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-base md:text-lg font-semibold mb-3">Bid Offers</h3>
          {loadingBuyers ? (
            <div className="text-center py-6">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">Loading buyers...</p>
            </div>
          ) : invitedBuyers.length > 0 ? (
            <div className="space-y-3">
              {invitedBuyers.map((buyer) => (
                <div key={buyer.id} className="border rounded-lg p-3" style={{ backgroundColor: '#ECEEF0' }}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium uppercase text-sm sm:text-base">
                        {buyer.buyer_name || 'Unknown Buyer'}
                        {buyer.dealer_name && ` (${buyer.dealer_name})`}
                      </h4>
                      {buyer.hasResponded && buyer.offerCreatedAt && (
                        <p className="text-xs sm:text-sm text-gray-600">
                          Submitted on {new Date(buyer.offerCreatedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      {buyer.hasResponded && buyer.offerAmount !== undefined ? (
                        <>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-green-600">
                              ${buyer.offerAmount.toLocaleString()}
                            </p>
                          </div>
                          <div onClick={(e) => e.stopPropagation()}>
                            <Select
                              value={getCurrentStatus(buyer.responseId || buyer.id, buyer.offerStatus || 'pending')}
                              onValueChange={(value: "pending" | "accepted" | "declined") => {
                                if (buyer.responseId) {
                                  handleStatusUpdate(buyer.responseId, value);
                                }
                              }}
                              disabled={loadingOffers.has(buyer.responseId || buyer.id)}
                            >
                              <SelectTrigger className={`w-full sm:w-[110px] h-8 text-xs sm:text-sm focus:ring-0 focus:ring-offset-0 ${loadingOffers.has(buyer.responseId || buyer.id) ? 'opacity-50' : ''}
                                ${getCurrentStatus(buyer.responseId || buyer.id, buyer.offerStatus || 'pending') === 'accepted' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' : ''}
                                ${getCurrentStatus(buyer.responseId || buyer.id, buyer.offerStatus || 'pending') === 'declined' ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200' : ''}
                              `}>
                                {loadingOffers.has(buyer.responseId || buyer.id) ? (
                                  <div className="flex items-center gap-1">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span className="text-xs">Updating...</span>
                                  </div>
                                ) : (
                                  <SelectValue>{getStatusDisplayText(getCurrentStatus(buyer.responseId || buyer.id, buyer.offerStatus || 'pending'))}</SelectValue>
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending" className="data-[highlighted]:!bg-gray-100 data-[highlighted]:!text-gray-700 focus:!bg-gray-100 focus:!text-gray-700 [&>span:first-child]:hidden">Pending</SelectItem>
                                <SelectItem value="accepted" className="data-[highlighted]:!bg-green-100 data-[highlighted]:!text-green-700 focus:!bg-green-100 focus:!text-green-700 [&>span:first-child]:hidden">Accepted</SelectItem>
                                <SelectItem value="declined" className="data-[highlighted]:!bg-red-100 data-[highlighted]:!text-red-700 focus:!bg-red-100 focus:!text-red-700 [&>span:first-child]:hidden">Not Selected</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      ) : (
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Pending</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <DollarSign size={40} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">No buyers invited yet</p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default BidRequestTabs;