import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BidRequest } from "./types";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ImagePreviewDialog from "./components/ImagePreviewDialog";
import { format, parseISO } from "date-fns";
import { X, Trophy, Loader2, Calendar, User, DollarSign, FileText, ThumbsUp, Wind, AlertTriangle, ShieldCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getConditionDisplay } from "./utils/conditionFormatting";
import MeasurementBadges from "@/components/bid-response/MeasurementBadges";
import { getBrakeStatus, getTireStatus } from "./utils/measurementUtils";
import { formatMileage } from "@/utils/mileageFormatter";

interface BidRequestDialogProps {
  request: BidRequest | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate?: (responseId: string, status: "pending" | "accepted" | "declined") => Promise<void>;
  onBidRequestStatusUpdate?: (requestId: string, status: "pending" | "accepted" | "declined") => void;
}

const BidRequestDialog = ({ request, isOpen, onOpenChange, onStatusUpdate }: BidRequestDialogProps) => {
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      if (!request?.id) return;

      try {
        const { data, error } = await supabase
          .from('images')
          .select('image_url')
          .eq('bid_request_id', request.id)
          .order('sequence_order', { ascending: true });

        if (error) {
          console.error('Error fetching images:', error);
          return;
        }

        const urls = data.map(img => img.image_url).filter((url): url is string => url !== null);
        setImages(urls);
      } catch (error) {
        console.error('Error in fetchImages:', error);
      }
    };

    if (isOpen) {
      fetchImages();
      setCurrentImageIndex(0);
    }
  }, [request, isOpen]);

  // Fetch invited buyers
  useEffect(() => {
    const fetchInvitedBuyers = async () => {
      if (!request?.id) return;

      setLoadingBuyers(true);
      try {
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

        const { data: responses, error: responsesError } = await supabase
          .from('bid_responses')
          .select('id, buyer_id, offer_amount, status, created_at')
          .eq('bid_request_id', request.id);

        if (responsesError) {
          console.error('Error fetching responses:', responsesError);
        }

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
  }, [request?.id, isOpen]);

  // Clear local state when request changes
  useEffect(() => {
    setLocalOfferStatuses({});
  }, [request?.id]);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MM/dd/yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getHighestOffer = () => {
    const respondedBuyers = invitedBuyers.filter(b => b.hasResponded && b.offerAmount !== undefined);
    if (respondedBuyers.length === 0) return null;
    return respondedBuyers.reduce((highest, current) =>
      (current.offerAmount || 0) > (highest.offerAmount || 0) ? current : highest
    );
  };

  const getCurrentStatus = (buyerId: string, serverStatus: string) => {
    return localOfferStatuses[buyerId] || serverStatus.toLowerCase();
  };

  const handleStatusUpdate = async (buyerId: string, responseId: string, value: "pending" | "accepted" | "declined") => {
    setLocalOfferStatuses(prev => ({ ...prev, [buyerId]: value }));
    setLoadingOffers(prev => new Set([...prev, buyerId]));

    try {
      if (onStatusUpdate) {
        await onStatusUpdate(responseId, value);
        setLocalOfferStatuses(prev => {
          const newState = { ...prev };
          delete newState[buyerId];
          return newState;
        });
      }
    } catch (error) {
      setLocalOfferStatuses(prev => {
        const newState = { ...prev };
        delete newState[buyerId];
        return newState;
      });
      console.error('Failed to update offer status:', error);
    } finally {
      setLoadingOffers(prev => {
        const newSet = new Set(prev);
        newSet.delete(buyerId);
        return newSet;
      });
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onOpenChange(false);
      setIsClosing(false);
    }, 300);
  };

  const highestOffer = getHighestOffer();
  const vehicle = (request as any)?.vehicle || request;

  // Helper to get book value with fallback to nested object
  const getBookValue = (flatField: number | undefined, nestedPath: keyof NonNullable<typeof request.book_values>) => {
    return flatField || (request as any)?.book_values?.[nestedPath];
  };

  // Helper to get reconditioning value with fallback to nested object
  const getReconValue = (flatField: string | undefined, nestedPath: keyof NonNullable<typeof request.reconditioning>) => {
    return flatField || (request as any)?.reconditioning?.[nestedPath];
  };

  // Parse brakes/tires for wheel grid - format: frontLeft:7,frontRight:8,rearLeft:6,rearRight:7
  const parseMeasurements = (measurementString: string | undefined) => {
    const defaultData = { FL: null, FR: null, RL: null, RR: null };

    if (!measurementString || measurementString === 'notSpecified' || measurementString === '') {
      return defaultData;
    }

    // Handle old format values like "acceptable", "replaceFront", etc.
    if (!measurementString.includes(':')) {
      return defaultData;
    }

    const result = { ...defaultData };

    measurementString.split(',').forEach(part => {
      const [position, val] = part.split(':');
      if (position && val) {
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) {
          if (position === 'frontLeft') result.FL = parsed;
          if (position === 'frontRight') result.FR = parsed;
          if (position === 'rearLeft') result.RL = parsed;
          if (position === 'rearRight') result.RR = parsed;
        }
      }
    });

    return result;
  };

  const brakesMeasurements = parseMeasurements(getReconValue(request?.brakes, 'brakes'));
  const tiresMeasurements = parseMeasurements(getReconValue(request?.tire, 'tires'));

  // Helper to get status color class
  const getStatusColor = (value: number | null, type: 'brakes' | 'tires') => {
    if (value === null) return 'bg-slate-200 text-slate-700 border-slate-300';

    const status = type === 'brakes' ? getBrakeStatus(value) : getTireStatus(value);

    if (status === 'green') return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    if (status === 'yellow') return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    if (status === 'orange') return 'bg-orange-100 text-orange-700 border-orange-300';
    if (status === 'red') return 'bg-red-100 text-red-700 border-red-300';

    return 'bg-slate-200 text-slate-700 border-slate-300';
  };

  if (!request) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          hideCloseButton={true}
          className={cn(
            "!max-w-7xl w-[95vw] h-[92vh] p-0 bg-white overflow-hidden flex flex-col",
            "animate-in fade-in-0 slide-in-from-bottom-4 duration-500",
            isClosing && "animate-out fade-out-0 slide-out-to-bottom-4 duration-300",
            "!bg-slate-700 !border-none !shadow-none !outline-none !ring-0" // Dark background, remove all effects
          )}
        >
          {/* Main White Container */}
          <div className="bg-white rounded-2xl m-3 flex flex-col h-[calc(100%-1.5rem)] overflow-hidden shadow-none border-none outline-none ring-0">
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-1">
                    {vehicle?.year || request.year} {vehicle?.make || request.make} {vehicle?.model || request.model}
                  </h1>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-semibold text-[10px] bg-slate-100 border-slate-300 text-slate-700 px-2 py-0.5">
                      {vehicle?.trim || request.trim || 'Standard'}
                    </Badge>
                    <span className="font-mono text-[10px] text-slate-500">
                      {vehicle?.vin || request.vin || 'N/A'}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={handleClose}
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Top Stats Cards */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="grid grid-cols-3 gap-3">
                {/* Submission Date Card */}
                <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-0.5">Submission Date</p>
                      <p className="text-sm font-semibold text-slate-900">{formatDate(request.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Assigned Buyer Card */}
                <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-0.5">Assigned Buyer</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {highestOffer ? highestOffer.buyer_name || 'Unknown' : request.buyer || 'Not Assigned'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Highest Offer Card */}
                <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-0.5">Highest Offer</p>
                      <p className="text-base font-bold text-slate-900">
                        {highestOffer && highestOffer.offerAmount ?
                          `$${highestOffer.offerAmount.toLocaleString()}` :
                          <span className="text-slate-400 text-sm font-normal">No offers yet</span>
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Two-Column Body */}
            <div className="flex flex-1 overflow-hidden min-h-0">
              {/* Left Column (40%) - Images & Specs */}
              <div className="w-[40%] border-r border-slate-200 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 bg-white">
                {/* Image Gallery */}
                <div className="p-4 pt-6">
                  <div className="bg-slate-200 rounded-xl overflow-hidden aspect-video mb-4">
                  {images.length > 0 ? (
                    <img
                      src={images[currentImageIndex]}
                      alt="Vehicle"
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage(images[currentImageIndex])}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      No images available
                    </div>
                  )}
                </div>

                {/* Thumbnail Grid */}
                {images.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "aspect-video rounded overflow-hidden cursor-pointer border-2 transition-all",
                          currentImageIndex === idx ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200 hover:border-slate-300"
                        )}
                        onClick={() => setCurrentImageIndex(idx)}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                </div>

                {/* Technical Specifications */}
                <div className="px-4 pb-4">
                  <div className="border border-slate-200 rounded-lg p-3">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Technical Specifications
                    </h3>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-slate-500">Mileage</span>
                        <span className="font-semibold text-slate-900 text-right">
                          {formatMileage(vehicle?.mileage || request.mileage)} mi
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-slate-500">Engine</span>
                        <span className="font-semibold text-slate-900 text-right">{vehicle?.engine || request.engineCylinders || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-slate-500">Transmission</span>
                        <span className="font-semibold text-slate-900 text-right">{vehicle?.transmission || request.transmission || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-slate-500">Drivetrain</span>
                        <span className="font-semibold text-slate-900 text-right">{vehicle?.drivetrain || request.drivetrain || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-slate-500">Body Style</span>
                        <span className="font-semibold text-slate-900 text-right">{vehicle?.bodyStyle || vehicle?.body_style || request.bodyStyle || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-slate-500">Exterior</span>
                        <span className="font-semibold text-slate-900 text-right">{vehicle?.exterior || request.exteriorColor || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-slate-500">Interior</span>
                        <span className="font-semibold text-slate-900 text-right">{vehicle?.interior || request.interiorColor || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Equipment Section */}
                {request.accessories && (
                  <div className="px-4 pb-4">
                    <div className="border border-slate-200 rounded-lg p-3">
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Additional Equipment</h3>
                      <div className="bg-slate-50 text-slate-700 text-xs p-3 rounded-lg whitespace-pre-wrap leading-relaxed">
                        {request.accessories}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column (60%) - Offers & Condition */}
              <div className="w-[60%] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 bg-white">
                <div className="p-4 pt-6 space-y-4 pb-6">
                  {/* Current Offers Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Current Offers
                      </h3>
                      {invitedBuyers.filter(b => b.hasResponded).length > 0 && (
                        <Badge variant="secondary" className="text-blue-600 bg-blue-50 border-blue-200">
                          {invitedBuyers.filter(b => b.hasResponded).length} Active {invitedBuyers.filter(b => b.hasResponded).length === 1 ? 'Bid' : 'Bids'}
                        </Badge>
                      )}
                    </div>

                  {loadingBuyers ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400 mb-2" />
                      <p className="text-slate-600 text-sm">Loading buyers...</p>
                    </div>
                  ) : invitedBuyers.length > 0 ? (
                    <div className="space-y-3">
                      {invitedBuyers.map((buyer) => {
                        const currentStatus = getCurrentStatus(buyer.id, buyer.offerStatus || 'pending');
                        const isWinner = currentStatus === 'accepted';
                        const isDeclined = currentStatus === 'declined';
                        const isLoading = loadingOffers.has(buyer.id);

                        return (
                          <div
                            key={buyer.id}
                            className={cn(
                              "relative border rounded-lg p-4 transition-all duration-300",
                              isWinner && "border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-100",
                              isDeclined && "opacity-60 grayscale",
                              !isWinner && !isDeclined && "border-slate-200 bg-white hover:border-slate-300",
                              buyer.hasResponded && !isDeclined && "hover:shadow-md"
                            )}
                          >
                            {/* Winning accent bar */}
                            {isWinner && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-lg" />
                            )}

                            <div className="flex items-center gap-4">
                              {/* Avatar */}
                              <div className="flex-shrink-0 w-11 h-11 rounded-full bg-slate-200 flex items-center justify-center">
                                <span className="text-lg font-bold text-slate-500">
                                  {(buyer.buyer_name || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>

                              {/* Name and Dealer */}
                              <div className="flex-1">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="font-bold text-base text-slate-900">
                                    {buyer.buyer_name || 'Unknown Buyer'}
                                  </h4>
                                  {isWinner && (
                                    <Badge className="bg-emerald-500 text-white flex items-center gap-1 px-1.5 py-0.5 text-xs">
                                      <Trophy className="h-2.5 w-2.5" />
                                      Winner
                                    </Badge>
                                  )}
                                </div>
                                {buyer.dealer_name && (
                                  <p className="text-xs uppercase text-slate-400 font-medium tracking-wide">{buyer.dealer_name}</p>
                                )}
                              </div>

                              {/* Offer Amount and Timestamp */}
                              {buyer.hasResponded && buyer.offerAmount !== undefined ? (
                                <div className="text-center">
                                  <p className={cn(
                                    "text-xl font-bold",
                                    isWinner ? "text-emerald-600" : "text-slate-900"
                                  )}>
                                    ${buyer.offerAmount.toLocaleString()}
                                  </p>
                                  {buyer.offerCreatedAt && (
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                      {new Date(buyer.offerCreatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center">
                                  <p className="text-xs text-slate-400">Awaiting response</p>
                                </div>
                              )}

                              {/* Selection Status */}
                              <div className="flex flex-col items-end gap-1">
                                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Selection Status</p>
                                <Select
                                  value={currentStatus}
                                  onValueChange={(value: "pending" | "accepted" | "declined") => {
                                    if (buyer.responseId && buyer.hasResponded) {
                                      handleStatusUpdate(buyer.id, buyer.responseId, value);
                                    }
                                  }}
                                  disabled={!buyer.hasResponded || buyer.offerAmount === undefined || isLoading}
                                >
                                  <SelectTrigger className={cn(
                                    "w-[130px] h-8 text-xs font-medium transition-all",
                                    currentStatus === 'accepted' && "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600",
                                    currentStatus === 'pending' && "bg-white text-slate-700 border-slate-300",
                                    currentStatus === 'declined' && "bg-slate-200 text-slate-600 border-slate-300",
                                    (!buyer.hasResponded || isLoading) && "opacity-50"
                                  )}>
                                    {isLoading ? (
                                      <div className="flex items-center gap-1.5">
                                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                        <span className="text-[10px]">Updating...</span>
                                      </div>
                                    ) : (
                                      <SelectValue>
                                        {currentStatus === 'accepted' && 'Winner'}
                                        {currentStatus === 'pending' && 'Pending Review'}
                                        {currentStatus === 'declined' && 'Not Selected'}
                                      </SelectValue>
                                    )}
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending Review</SelectItem>
                                    <SelectItem value="accepted">Accept (Winner)</SelectItem>
                                    <SelectItem value="declined">Decline</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                      <p className="text-slate-600">No buyers invited yet</p>
                    </div>
                  )}
                </div>

                  {/* Book Values */}
                  <div className="border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Book Values</h3>
                      {(request.bookValuesCondition || (request as any)?.book_values?.condition) && (
                        <Badge variant="outline" className="text-[10px] bg-blue-50 border-blue-200 text-blue-700">
                          Condition: {request.bookValuesCondition || (request as any)?.book_values?.condition}
                        </Badge>
                      )}
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden border border-slate-200 rounded-lg">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">Source</th>
                            <th className="text-right py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">Wholesale</th>
                            <th className="text-right py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">Retail</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-200">
                            <td className="py-2 px-3 text-slate-500">Manheim (MMR)</td>
                            <td className="py-2 px-3 text-right font-semibold text-slate-900">
                              {getBookValue(request.mmrWholesale, 'mmr_wholesale') ? `$${Number(getBookValue(request.mmrWholesale, 'mmr_wholesale')).toLocaleString()}` : '-'}
                            </td>
                            <td className="py-2 px-3 text-right font-semibold text-slate-900">
                              {getBookValue(request.mmrRetail, 'mmr_retail') ? `$${Number(getBookValue(request.mmrRetail, 'mmr_retail')).toLocaleString()}` : '-'}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <td className="py-2 px-3 text-slate-500">Kelley Blue Book</td>
                            <td className="py-2 px-3 text-right font-semibold text-slate-900">
                              {getBookValue(request.kbbWholesale, 'kbb_wholesale') ? `$${Number(getBookValue(request.kbbWholesale, 'kbb_wholesale')).toLocaleString()}` : '-'}
                            </td>
                            <td className="py-2 px-3 text-right font-semibold text-slate-900">
                              {getBookValue(request.kbbRetail, 'kbb_retail') ? `$${Number(getBookValue(request.kbbRetail, 'kbb_retail')).toLocaleString()}` : '-'}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <td className="py-2 px-3 text-slate-500">J.D. Power</td>
                            <td className="py-2 px-3 text-right font-semibold text-slate-900">
                              {getBookValue(request.jdPowerWholesale, 'jd_power_wholesale') ? `$${Number(getBookValue(request.jdPowerWholesale, 'jd_power_wholesale')).toLocaleString()}` : '-'}
                            </td>
                            <td className="py-2 px-3 text-right font-semibold text-slate-900">
                              {getBookValue(request.jdPowerRetail, 'jd_power_retail') ? `$${Number(getBookValue(request.jdPowerRetail, 'jd_power_retail')).toLocaleString()}` : '-'}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 text-slate-500">Auction</td>
                            <td className="py-2 px-3 text-right font-semibold text-slate-900">
                              {getBookValue(request.auctionWholesale, 'auction_wholesale') ? `$${Number(getBookValue(request.auctionWholesale, 'auction_wholesale')).toLocaleString()}` : '-'}
                            </td>
                            <td className="py-2 px-3 text-right font-semibold text-slate-900">
                              {getBookValue(request.auctionRetail, 'auction_retail') ? `$${Number(getBookValue(request.auctionRetail, 'auction_retail')).toLocaleString()}` : '-'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* History and Condition Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* History Report Card */}
                    <div className="border border-slate-200 rounded-lg p-3">
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                        History Report
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase text-slate-400 font-medium mb-0.5">Report Provider</p>
                            <p className="text-sm font-bold text-slate-900">{request.historyService || 'Unknown'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <ThumbsUp className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase text-slate-400 font-medium mb-0.5">Report Finding</p>
                            <p className="text-sm font-bold text-slate-900">{getConditionDisplay(request.history, 'history')}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Condition Details Card */}
                    <div className="border border-slate-200 rounded-lg p-3">
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Condition Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <Wind className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase text-slate-400 font-medium mb-0.5">Windshield</p>
                            <p className="text-sm font-bold text-slate-900">{getConditionDisplay(getReconValue(request.windshield, 'windshield'), 'windshield')}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase text-slate-400 font-medium mb-0.5">Warning Lights</p>
                            <p className="text-sm font-bold text-slate-900">{getConditionDisplay(request.engineLights || (request as any)?.reconditioning?.engine_light, 'engineLights')}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase text-slate-400 font-medium mb-0.5">Maintenance</p>
                            <p className="text-sm font-bold text-slate-900">{getConditionDisplay(request.maintenance, 'maintenance')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Brakes & Tires Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Brakes Condition Card */}
                    <div className="border border-slate-200 rounded-lg p-3">
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Brakes Condition</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                        {[
                          { key: 'FL', label: 'Front Left' },
                          { key: 'FR', label: 'Front Right' },
                          { key: 'RL', label: 'Rear Left' },
                          { key: 'RR', label: 'Rear Right' }
                        ].map(({ key, label }) => {
                          const value = brakesMeasurements[key as keyof typeof brakesMeasurements];
                          return (
                            <div key={key} className="text-center">
                              <p className="text-[10px] uppercase text-slate-400 font-medium mb-1">{label}</p>
                              <div className="inline-block bg-emerald-50 text-emerald-700 font-bold text-sm px-3 py-1.5 rounded-lg">
                                {value !== null ? `${value}mm` : 'N/A'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tires Condition Card */}
                    <div className="border border-slate-200 rounded-lg p-3">
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Tires Condition</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                        {[
                          { key: 'FL', label: 'Front Left' },
                          { key: 'FR', label: 'Front Right' },
                          { key: 'RL', label: 'Rear Left' },
                          { key: 'RR', label: 'Rear Right' }
                        ].map(({ key, label }) => {
                          const value = tiresMeasurements[key as keyof typeof tiresMeasurements];
                          return (
                            <div key={key} className="text-center">
                              <p className="text-[10px] uppercase text-slate-400 font-medium mb-1">{label}</p>
                              <div className="inline-block bg-emerald-50 text-emerald-700 font-bold text-sm px-3 py-1.5 rounded-lg">
                                {value !== null ? `${value}/32"` : 'N/A'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Reconditioning Details */}
                  <div className="border border-slate-200 rounded-lg p-3">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Reconditioning Details</h3>

                    {/* Estimated Cost Box */}
                    <div className="bg-emerald-50 rounded-lg p-4 flex items-center justify-between mb-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Estimated Recon Cost</p>
                      <p className="text-3xl font-bold text-emerald-800">
                        ${getReconValue(request.reconEstimate, 'recon_estimate') || '0'}
                      </p>
                    </div>

                    {/* Details Section */}
                    {getReconValue(request.reconDetails, 'recon_details') && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Details</p>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs text-slate-700 whitespace-pre-wrap">{getReconValue(request.reconDetails, 'recon_details')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 bg-white border-t border-slate-200 px-6 py-3">
              <div className="flex justify-end">
                <Button
                  onClick={handleClose}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 py-3 font-medium transition-all"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ImagePreviewDialog
        previewImage={selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      />
    </>
  );
};

export default BidRequestDialog;
