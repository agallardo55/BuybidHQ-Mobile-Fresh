
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BidResponseFormData } from "./types";

interface BidFormProps {
  onSubmit: (data: BidResponseFormData) => void;
  isSubmitting: boolean;
}

const BidForm = ({ onSubmit, isSubmitting }: BidFormProps) => {
  const [formData, setFormData] = useState<BidResponseFormData>({
    offerAmount: "",
    message: "",
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof BidResponseFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-sm p-4 animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-900">Submit Your Bid</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="offerAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Your Offer <span className="text-red-500">*</span>
          </label>
          <Input
            id="offerAmount"
            name="offerAmount"
            type="number"
            placeholder="Enter your offer amount"
            value={formData.offerAmount}
            onChange={handleChange}
            className={errors.offerAmount ? "border-red-500" : ""}
          />
          {errors.offerAmount && (
            <p className="text-red-500 text-sm mt-1">{errors.offerAmount}</p>
          )}
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <Textarea
            id="message"
            name="message"
            placeholder="Any additional comments..."
            value={formData.message}
            onChange={handleChange}
            className="min-h-[100px]"
          />
        </div>
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
