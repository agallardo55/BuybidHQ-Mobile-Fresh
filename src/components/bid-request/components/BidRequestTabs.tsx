import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BidRequest } from "../types";
import VehicleDetails from "./VehicleDetails";
import VehicleCondition from "./VehicleCondition";
import Reconditioning from "./Reconditioning";
import { Car, Eye, Wrench, DollarSign, Loader2 } from "lucide-react";

interface BidRequestTabsProps {
  request: BidRequest;
  onStatusUpdate?: (responseId: string, status: "pending" | "accepted" | "declined") => Promise<void>;
  onBidRequestStatusUpdate?: (requestId: string, status: "pending" | "accepted" | "declined") => void;
}

const BidRequestTabs = ({ request, onStatusUpdate, onBidRequestStatusUpdate }: BidRequestTabsProps) => {
  // Local state for optimistic UI updates
  const [localOfferStatuses, setLocalOfferStatuses] = useState<Record<string, "pending" | "accepted" | "declined">>({});
  const [loadingOffers, setLoadingOffers] = useState<Set<string>>(new Set());

  // Clear local state when request data changes (after successful update)
  useEffect(() => {
    setLocalOfferStatuses({});
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
      <TabsList className="grid w-full grid-cols-4 mb-3">
        <TabsTrigger value="details" className="flex items-center gap-2 text-xs px-2 py-1.5">
          <Car size={14} />
          Details
        </TabsTrigger>
        <TabsTrigger value="appearance" className="flex items-center gap-2 text-xs px-2 py-1.5">
          <Eye size={14} />
          Appearance
        </TabsTrigger>
        <TabsTrigger value="condition" className="flex items-center gap-2 text-xs px-2 py-1.5">
          <Wrench size={14} />
          Condition
        </TabsTrigger>
        <TabsTrigger value="offers" className="flex items-center gap-2 text-xs px-2 py-1.5">
          <DollarSign size={14} />
          Offers
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
          <h3 className="text-lg font-semibold mb-3">Vehicle Appearance</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-bold text-black">Exterior Color</label>
              <p className="text-sm font-normal mt-1 bg-gray-50 p-2 rounded">{request.exteriorColor || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-bold text-black">Interior Color</label>
              <p className="text-sm font-normal mt-1 bg-gray-50 p-2 rounded">{request.interiorColor || 'Not specified'}</p>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-bold text-black">Accessories & Options</label>
              <p className="text-sm font-normal mt-1 bg-gray-50 p-2 rounded">{request.accessories || 'None listed'}</p>
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
          <h3 className="text-lg font-semibold mb-3">Bid Offers</h3>
          {request.offers.length > 0 ? (
            <div className="space-y-3">
              {request.offers.map((offer, index) => (
                <div key={offer.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{offer.buyerName}</h4>
                      <p className="text-sm text-gray-600">
                        Submitted on {new Date(offer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">
                          ${offer.amount.toLocaleString()}
                        </p>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={getCurrentStatus(offer.id, offer.status)}
                          onValueChange={(value: "pending" | "accepted" | "declined") => {
                            console.log('🎯 Select onValueChange:', { offerId: offer.id, currentStatus: offer.status, newValue: value });
                            handleStatusUpdate(offer.id, value);
                          }}
                          disabled={loadingOffers.has(offer.id)}
                        >
                          <SelectTrigger className={`w-[110px] h-8 text-sm focus:ring-0 focus:ring-offset-0 ${loadingOffers.has(offer.id) ? 'opacity-50' : ''}
                            ${getCurrentStatus(offer.id, offer.status) === 'accepted' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' : ''}
                            ${getCurrentStatus(offer.id, offer.status) === 'declined' ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200' : ''}
                          `}>
                            {loadingOffers.has(offer.id) ? (
                              <div className="flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span className="text-xs">Updating...</span>
                              </div>
                            ) : (
                              <SelectValue>{getStatusDisplayText(getCurrentStatus(offer.id, offer.status))}</SelectValue>
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending" className="data-[highlighted]:!bg-gray-100 data-[highlighted]:!text-gray-700 focus:!bg-gray-100 focus:!text-gray-700 [&>span:first-child]:hidden">Pending</SelectItem>
                            <SelectItem value="accepted" className="data-[highlighted]:!bg-green-100 data-[highlighted]:!text-green-700 focus:!bg-green-100 focus:!text-green-700 [&>span:first-child]:hidden">Accepted</SelectItem>
                            <SelectItem value="declined" className="data-[highlighted]:!bg-red-100 data-[highlighted]:!text-red-700 focus:!bg-red-100 focus:!text-red-700 [&>span:first-child]:hidden">Not Selected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <DollarSign size={40} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">No offers received yet</p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default BidRequestTabs;