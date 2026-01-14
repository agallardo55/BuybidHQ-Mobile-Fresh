import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import ImagePreviewDialog from "../bid-request/components/ImagePreviewDialog";
import UpgradeDialog from "./UpgradeDialog";
import { BidRequest } from "../bid-request/types";
import { useVehicleImages } from "@/hooks/marketplace/useVehicleImages";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAccount } from "@/hooks/useAccount";
import { canUserSeePrices } from "@/utils/planHelpers";
import { cn } from "@/lib/utils";
import { X, Calendar, Gauge, DollarSign, FileText, Wind, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { getConditionDisplay } from "../bid-request/utils/conditionFormatting";
import { formatMileage } from "@/utils/mileageFormatter";

interface MarketplaceVehicleDialogProps {
  request?: BidRequest | null;
  vehicleId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const MarketplaceVehicleDialog = ({
  request: propsRequest,
  vehicleId,
  isOpen,
  onOpenChange
}: MarketplaceVehicleDialogProps) => {
  const [request, setRequest] = useState<BidRequest | null>(propsRequest || null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const { currentUser } = useCurrentUser();
  const { account } = useAccount();

  // Check if user should see prices
  const shouldShowPrices = useMemo(() => {
    return canUserSeePrices(
      account?.plan,
      currentUser?.role,
      currentUser?.app_role
    );
  }, [account?.plan, currentUser?.role, currentUser?.app_role]);

  // Use React Query for image caching
  const { data: images = [], isLoading: imagesLoading } = useVehicleImages(
    request?.id || vehicleId,
    isOpen && !!(request?.id || vehicleId) && shouldShowPrices
  );

  useEffect(() => {
    if (propsRequest) {
      setRequest(propsRequest);
      setLoading(false);
      return;
    }

    const fetchVehicleData = async () => {
      if (!vehicleId) return;

      setLoading(true);
      setError(null);

      try {
        const [bidRequestData] = await Promise.all([
          supabase
            .from('bid_requests')
            .select(`
              *,
              vehicle:vehicles(*),
              reconditioning:reconditioning(*),
              book_values:book_values(*),
              responses:bid_responses(
                id,
                offer_amount,
                status,
                buyer_id,
                buyers:buyers(
                  id,
                  buyer_name,
                  dealer_name,
                  email
                )
              )
            `)
            .eq('id', vehicleId)
            .single()
        ]);

        if (bidRequestData.error) {
          console.error('Error fetching bid request:', bidRequestData.error);
          setError('Failed to load vehicle details. Please try again.');
          return;
        }

        setRequest(bidRequestData.data as unknown as BidRequest);
      } catch (error) {
        console.error('Error in fetchVehicleData:', error);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && vehicleId && !propsRequest) {
      fetchVehicleData();
    }
  }, [vehicleId, isOpen, propsRequest]);

  const isLoadingData = loading || imagesLoading;

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MM/dd/yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onOpenChange(false);
      setIsClosing(false);
    }, 300);
  };

  const vehicle = (request as any)?.vehicle || request;

  // Helper to get book value with fallback to nested object
  const getBookValue = (flatField: number | undefined, nestedPath: keyof NonNullable<typeof request.book_values>) => {
    if (!request) return undefined;
    return flatField || (request as any)?.book_values?.[nestedPath];
  };

  // Helper to get reconditioning value with fallback to nested object
  const getReconValue = (flatField: string | undefined, nestedPath: keyof NonNullable<typeof request.reconditioning>) => {
    if (!request) return undefined;
    return flatField || (request as any)?.reconditioning?.[nestedPath];
  };

  // Parse brakes/tires for wheel grid
  const parseMeasurements = (measurementString: string | undefined) => {
    const defaultData = { FL: null, FR: null, RL: null, RR: null };

    if (!measurementString || measurementString === 'notSpecified' || measurementString === '') {
      return defaultData;
    }

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

  // Get highest offer from responses
  const getHighestOffer = () => {
    if (!request?.responses || request.responses.length === 0) return null;

    const offers = request.responses
      .filter((response: any) => response.offer_amount !== null && response.offer_amount !== undefined)
      .map((response: any) => response.offer_amount);

    if (offers.length === 0) return null;

    return Math.max(...offers);
  };

  const highestOffer = getHighestOffer();

  // If user cannot see prices, show upgrade dialog
  if (!shouldShowPrices && isOpen) {
    return (
      <UpgradeDialog
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      />
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          hideCloseButton={true}
          className={cn(
            "!max-w-7xl w-[95vw] h-[92vh] p-0 bg-white overflow-hidden flex flex-col",
            "animate-in fade-in-0 slide-in-from-bottom-4 duration-500",
            isClosing && "animate-out fade-out-0 slide-out-to-bottom-4 duration-300",
            "!bg-slate-700 !border-none !shadow-none !outline-none !ring-0"
          )}
        >
          <VisuallyHidden>
            <DialogTitle>Vehicle Details</DialogTitle>
            <DialogDescription>Detailed information about the selected vehicle</DialogDescription>
          </VisuallyHidden>
          {isLoadingData ? (
            <div className="flex items-center justify-center py-12 text-white">
              <div>Loading vehicle details...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-white">
              <div>{error}</div>
            </div>
          ) : request ? (
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
                  <Button onClick={handleClose} variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-slate-50">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-0.5">Listed Date</p>
                        <p className="text-sm font-semibold text-slate-900">{formatDate(request.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                        <Gauge className="h-4 w-4 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-0.5">Mileage</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatMileage(vehicle?.mileage || request.mileage)} mi
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-0.5">Highest Offer</p>
                        <p className="text-base font-bold text-slate-900">
                          {highestOffer ? `$${Number(highestOffer).toLocaleString()}` : 'No offers yet'}
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
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          No images available
                        </div>
                      )}
                    </div>

                    {images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {images.map((url, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={cn(
                              "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                              currentImageIndex === index
                                ? "border-blue-500 ring-2 ring-blue-200"
                                : "border-slate-300 hover:border-slate-400"
                            )}
                          >
                            <img src={url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                          </button>
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
                  {(request.accessories || vehicle?.options) && (
                    <div className="px-4 pb-4">
                      <div className="border border-slate-200 rounded-lg p-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Additional Equipment</h3>
                        <div className="bg-slate-50 text-slate-700 text-xs p-3 rounded-lg whitespace-pre-wrap leading-relaxed">
                          {vehicle?.options || request.accessories}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column (60%) - Valuation & Condition */}
                <div className="w-[60%] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 bg-white">
                  <div className="p-4 pt-6 space-y-4 pb-6">
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
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase text-slate-400 font-medium mb-0.5">History Status</p>
                              <p className="text-sm font-bold text-slate-900">{request.history || 'Not specified'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Condition Report Card */}
                      <div className="border border-slate-200 rounded-lg p-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                          Condition Report
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
                        </div>
                      </div>
                    </div>

                    {/* Brakes and Tires Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Brakes Card */}
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

                      {/* Tires Card */}
                      <div className="border border-slate-200 rounded-lg p-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Tires Tread Depth</h3>
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
          ) : null}
        </DialogContent>
      </Dialog>

      <ImagePreviewDialog
        previewImage={selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      />
    </>
  );
};

export default MarketplaceVehicleDialog;
