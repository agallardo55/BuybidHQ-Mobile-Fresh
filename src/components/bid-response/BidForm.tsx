import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BidResponseFormData } from "./types";
import { toast } from "@/utils/notificationToast";

interface BidFormProps {
  onSubmit: (data: BidResponseFormData) => void;
  isSubmitting: boolean;
  existingBidAmount?: string | null;
}

const BidForm = ({ onSubmit, isSubmitting, existingBidAmount }: BidFormProps) => {
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
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };

  const [formData, setFormData] = useState<BidResponseFormData>({
    offerAmount: existingBidAmount ? formatNumber(existingBidAmount) : "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BidResponseFormData, string>>>({});

  const validateForm = () => {
    const newErrors: Partial<Record<keyof BidResponseFormData, string>> = {};
    
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

    if (errors[name as keyof BidResponseFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg shadow-sm p-4 animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-900">Submit Your Bid</h2>
      
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
        className="w-full h-12 text-lg bg-custom-blue hover:bg-custom-blue/90 disabled:opacity-50"
        disabled={isSubmitting || !!existingBidAmount}
      >
        {existingBidAmount ? "Offer Already Submitted" : isSubmitting ? "Submitting..." : "Submit Bid"}
      </Button>
    </form>
  );
};

export default BidForm;
