
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VehicleDetails } from "@/components/bid-response/types";
import { BidResponseFormData } from "@/components/bid-response/types";
import { toast } from "sonner";
import { Car, Wrench, Cog, User, Building2, Phone } from "lucide-react";
import { useState } from "react";

interface QuickBidDetailsViewProps {
  vehicle: VehicleDetails;
  buyer: {
    name: string;
    dealership: string;
    mobileNumber: string;
  };
  notes: string;
  onSubmit: (data: BidResponseFormData) => void;
  isSubmitting: boolean;
  existingBidAmount?: string | null;
}

const QuickBidDetailsView = ({
  vehicle,
  buyer,
  notes,
  onSubmit,
  isSubmitting,
  existingBidAmount
}: QuickBidDetailsViewProps) => {
  const MAX_AMOUNT = 999999999; // 999 million

  const formatNumber = (value: string): string => {
    // Remove all non-numeric characters except decimal point
    let cleaned = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2) {
      cleaned = parts[0] + '.' + parts[1].slice(0, 2);
    }

    // Parse the number and check if it exceeds maximum
    const numValue = parseFloat(cleaned);
    if (!isNaN(numValue) && numValue > MAX_AMOUNT) {
      cleaned = MAX_AMOUNT.toString();
    }

    // Format with commas for thousands
    const [integerPart, decimalPart] = cleaned.split('.');
    let formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };

  const [formData, setFormData] = useState<BidResponseFormData>({
    offerAmount: existingBidAmount ? formatNumber(existingBidAmount) : "",
  });

  const [errors, setErrors] = useState<{offerAmount?: string}>({});

  const validateForm = () => {
    const newErrors: {offerAmount?: string} = {};
    
    if (!formData.offerAmount) {
      newErrors.offerAmount = "Offer amount is required";
    } else {
      const numericAmount = parseFloat(formData.offerAmount.replace(/,/g, ''));
      if (isNaN(numericAmount)) {
        newErrors.offerAmount = "Please enter a valid number";
      } else if (numericAmount <= 0) {
        newErrors.offerAmount = "Offer amount must be greater than 0";
      } else if (numericAmount > MAX_AMOUNT) {
        newErrors.offerAmount = "Offer amount cannot exceed $999,999,999";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (existingBidAmount) {
      toast.error("You have already submitted a bid");
      return;
    }

    if (validateForm()) {
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Error submitting bid:', error);
        toast.error("Failed to submit bid. Please try again.");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (existingBidAmount) return; // Prevent changes if there's an existing bid

    const { name, value } = e.target;
    const formattedValue = formatNumber(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-center">Quick Bid Request</h1>
        
        {/* Vehicle Information Card */}
        <Card className="p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-base font-bold">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            <div className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
              {vehicle.trim}
            </div>
          </div>
          
          <div className="text-gray-700 mb-3 text-sm">
            <p>VIN: {vehicle.vin}</p>
          </div>
          
          <div className="flex items-center text-gray-600 mb-3">
            <Car className="h-4 w-4 mr-1.5 text-gray-500" />
            <span className="text-sm">{vehicle.mileage} miles</span>
          </div>
          
          <div className="border-t border-gray-200 my-2"></div>
          
          <div className="space-y-2 text-gray-700 text-xs">
            <div className="flex items-center">
              <Wrench className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
              <span>Engine: {vehicle.engineCylinders}</span>
            </div>
            
            <div className="flex items-center">
              <Cog className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
              <span>Transmission: {vehicle.transmission}</span>
            </div>
            
            <div className="flex items-center">
              <Car className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
              <span>Drivetrain: {vehicle.drivetrain}</span>
            </div>
          </div>
        </Card>
        
        {/* Seller Information */}
        <Card className="p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold mb-2">Seller Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <span>{buyer.name}</span>
            </div>
            <div className="flex items-center">
              <Building2 className="h-4 w-4 mr-2 text-gray-500" />
              <span>{buyer.dealership}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-500" />
              <span>{buyer.mobileNumber}</span>
            </div>
          </div>
        </Card>
        
        {/* Notes Section */}
        {notes && (
          <Card className="p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold mb-2">Notes from Seller</h3>
            <p className="text-sm text-gray-700">{notes}</p>
          </Card>
        )}
        
        {/* Bid Form */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold text-gray-900">Submit Your Bid</h2>
          
          <div>
            <label htmlFor="offerAmount" className="block text-lg font-bold text-black mb-0.5">
              Your Offer <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
              <Input
                id="offerAmount"
                name="offerAmount"
                type="text"
                inputMode="numeric"
                pattern="[0-9,]*\.?[0-9]*"
                placeholder="Enter amount"
                value={formData.offerAmount}
                onChange={handleChange}
                className={`h-12 px-4 py-3 text-lg pl-7 ${errors.offerAmount ? "border-red-500" : ""} ${
                  existingBidAmount ? "bg-gray-100 text-gray-600" : ""
                }`}
                disabled={!!existingBidAmount}
                readOnly={!!existingBidAmount}
              />
            </div>
            {errors.offerAmount && (
              <p className="text-red-500 text-sm mt-1">{errors.offerAmount}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            disabled={isSubmitting || !!existingBidAmount}
          >
            {existingBidAmount ? "Offer Already Submitted" : isSubmitting ? "Submitting..." : "Submit Bid"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default QuickBidDetailsView;
