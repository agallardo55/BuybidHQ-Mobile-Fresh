
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BidResponseFormData } from "./types";

interface BidFormProps {
  onSubmit: (data: BidResponseFormData) => void;
  isSubmitting: boolean;
}

const BidForm = ({ onSubmit, isSubmitting }: BidFormProps) => {
  const [formData, setFormData] = useState<BidResponseFormData>({
    offerAmount: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BidResponseFormData, string>>>({});

  const validateForm = () => {
    const newErrors: Partial<Record<keyof BidResponseFormData, string>> = {};
    
    if (!formData.offerAmount) newErrors.offerAmount = "Offer amount is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point and max 2 decimal places
    const parts = numericValue.split('.');
    const formattedValue = parts.length > 1 
      ? `${parts[0]}.${parts[1].slice(0, 2)}`
      : numericValue;

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

  const formatAsCurrency = (value: string) => {
    if (!value) return '';
    return `$${value}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-sm p-4 animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-900">Submit Your Bid</h2>
      
      <div>
        <label htmlFor="offerAmount" className="block text-sm font-medium text-gray-700 mb-1">
          Your Offer <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
          <Input
            id="offerAmount"
            name="offerAmount"
            type="text"
            placeholder="Enter amount"
            value={formData.offerAmount}
            onChange={handleChange}
            className={`pl-7 ${errors.offerAmount ? "border-red-500" : ""}`}
          />
        </div>
        {errors.offerAmount && (
          <p className="text-red-500 text-sm mt-1">{errors.offerAmount}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-custom-blue hover:bg-custom-blue/90"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Bid"}
      </Button>
    </form>
  );
};

export default BidForm;
