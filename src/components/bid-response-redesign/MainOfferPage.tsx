
import { useState } from "react";
import { QuickBidDetails } from "./types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, User, Building2 } from "lucide-react";
import { ImageModal } from "./ImageModal";

interface MainOfferPageProps {
  vehicle: QuickBidDetails;
  onViewDetails: () => void;
}

const MainOfferPage = ({ vehicle, onViewDetails }: MainOfferPageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");

  const formatCurrency = (value: string) => {
    if (!value) return "";

    // Remove all non-digits
    const numericValue = value.replace(/\D/g, '');

    if (!numericValue) return "";

    // Convert to number and divide by 100 to get cents
    const number = parseInt(numericValue) / 100;

    // Format with commas and 2 decimal places
    return number.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleOfferChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Remove all non-digits
    const numericValue = input.replace(/\D/g, '');
    setOfferAmount(numericValue);
  };

  const getConditionColor = (condition: string | undefined) => {
    switch (condition?.toLowerCase()) {
      case 'excellent':
        return 'text-[#00B67A]'; // Bright green from image
      case 'good':
        return 'text-green-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Calculate recommended minimum offer (you can adjust this logic)
  const recommendedMinOffer = vehicle.kbb_wholesale || vehicle.mmr_wholesale || 0;

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 flex items-center justify-between">
        <img
          src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png"
          alt="BuybidHQ Logo"
          className="h-8 sm:h-10 w-auto"
        />
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg"
          onClick={() => {
            // Navigate to beta card on index page
            window.location.href = '/#beta';
          }}
        >
          Free Trial
        </Button>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Vehicle Card */}
        <Card className="overflow-hidden rounded-3xl shadow-lg bg-white">
          {/* Hero Image */}
          <div className="relative">
            <img
              src={vehicle.vehicle_images[0]}
              alt="Vehicle"
              className="w-full h-64 sm:h-96 object-cover cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            />
            <Button
              variant="default"
              className="absolute bottom-4 right-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-full px-6 py-3 text-sm"
              onClick={() => setIsModalOpen(true)}
            >
              VIEW {vehicle.vehicle_images.length} PHOTOS
            </Button>
          </div>

          {/* Vehicle Info */}
          <div className="p-6 sm:p-8">
            {/* Vehicle Title */}
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6">
              {vehicle.vehicle_year} {vehicle.vehicle_make} {vehicle.vehicle_model} {vehicle.vehicle_trim || ''}
            </h2>

            {/* Vehicle Info Grid with Dividers */}
            <div className="grid grid-cols-3 divide-x divide-gray-200">
              <div className="pr-3 sm:pr-4">
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 sm:mb-2">Year</p>
                <p className="text-lg sm:text-xl md:text-2xl font-black text-gray-900">{vehicle.vehicle_year}</p>
              </div>
              <div className="px-3 sm:px-4">
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 sm:mb-2">Mileage</p>
                <p className="text-lg sm:text-xl md:text-2xl font-black text-gray-900">
                  {vehicle.vehicle_mileage && !isNaN(Number(vehicle.vehicle_mileage))
                    ? Number(vehicle.vehicle_mileage).toLocaleString()
                    : vehicle.vehicle_mileage || 'N/A'} mi
                </p>
              </div>
              <div className="pl-3 sm:pl-4">
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 sm:mb-2">Condition</p>
                <p className={`text-lg sm:text-xl md:text-2xl font-black ${getConditionColor(vehicle.book_values_condition)}`}>
                  {vehicle.book_values_condition
                    ? vehicle.book_values_condition.charAt(0).toUpperCase() + vehicle.book_values_condition.slice(1)
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Seller Information */}
        <Card className="p-6 rounded-2xl shadow-lg bg-white">
          <div className="space-y-4">
            {/* Seller */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Seller</p>
                <p className="text-xl font-black text-gray-900">{vehicle.buyer_name}</p>
              </div>
            </div>

            {/* Dealership */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Dealership</p>
                <p className="text-xl font-black text-gray-900">{vehicle.buyer_dealership}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Place Your Offer Section */}
        <Card className="p-6 sm:p-8 rounded-2xl shadow-lg bg-white">
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6">Place Your Offer</h3>

          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <div className="flex items-center">
              <span className="text-5xl sm:text-6xl font-black text-gray-600 mr-2">$</span>
              <input
                type="text"
                value={formatCurrency(offerAmount)}
                onChange={handleOfferChange}
                className="flex-grow text-5xl sm:text-6xl font-black text-gray-700 placeholder:text-gray-400 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                placeholder="0.00"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 mb-6 text-sm text-gray-600">
            <Info className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" />
            <p>
              Recommended min. offer: <span className="font-bold text-gray-900">${recommendedMinOffer.toLocaleString()}</span>.
              Submitting constitutes a binding agreement under our{' '}
              <a href="/privacy" className="text-brand underline font-semibold">Privacy Policy</a>.
            </p>
          </div>

          <Button
            className="w-full bg-brand hover:bg-brand/90 text-white font-bold text-lg py-6 rounded-xl"
            onClick={() => {
              // Handle submit
            }}
          >
            Submit Offer
          </Button>
        </Card>

        {/* View Details Link */}
        <Button
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold text-lg py-6 rounded-xl uppercase tracking-wide"
          onClick={onViewDetails}
        >
          Vehicle Details
        </Button>
      </div>

      {/* Image Modal */}
      <ImageModal
        images={vehicle.vehicle_images}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        startIndex={0}
      />
    </div>
  );
};

export default MainOfferPage;
