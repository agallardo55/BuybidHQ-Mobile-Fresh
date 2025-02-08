
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
    buyerName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BidResponseFormData, string>>>({});

  const validateForm = () => {
    const newErrors: Partial<Record<keyof BidResponseFormData, string>> = {};
    
    if (!formData.offerAmount) newErrors.offerAmount = "Offer amount is required";
    if (!formData.buyerName) newErrors.buyerName = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

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
          <label htmlFor="buyerName" className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="buyerName"
            name="buyerName"
            type="text"
            placeholder="Enter your full name"
            value={formData.buyerName}
            onChange={handleChange}
            className={errors.buyerName ? "border-red-500" : ""}
          />
          {errors.buyerName && (
            <p className="text-red-500 text-sm mt-1">{errors.buyerName}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone <span className="text-red-500">*</span>
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handleChange}
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
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
