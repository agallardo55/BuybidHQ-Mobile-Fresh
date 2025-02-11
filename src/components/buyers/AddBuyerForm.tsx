
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BuyerFormData } from "@/types/buyers";
import { useState } from "react";

interface AddBuyerFormProps {
  onSubmit: (e: React.FormEvent) => void;
  formData: BuyerFormData;
  onFormDataChange: (data: Partial<BuyerFormData>) => void;
}

const AddBuyerForm = ({ onSubmit, formData, onFormDataChange }: AddBuyerFormProps) => {
  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    
    if (phoneNumber.length >= 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
    
    if (phoneNumber.length > 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
    }
    if (phoneNumber.length > 3) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    if (phoneNumber.length > 0) {
      return `(${phoneNumber}`;
    }
    return phoneNumber;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'mobileNumber' || name === 'businessNumber') {
      onFormDataChange({
        [name]: formatPhoneNumber(value),
      });
    } else {
      onFormDataChange({
        [name]: value,
      });
    }
  };

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <Input
              id="mobileNumber"
              name="mobileNumber"
              type="tel"
              required
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="(123) 456-7890"
              maxLength={14}
            />
          </div>
          <div>
            <label htmlFor="businessNumber" className="block text-sm font-medium text-gray-700">
              Business Number
            </label>
            <Input
              id="businessNumber"
              name="businessNumber"
              type="tel"
              required
              value={formData.businessNumber}
              onChange={handleChange}
              placeholder="(123) 456-7890"
              maxLength={14}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dealershipName" className="block text-sm font-medium text-gray-700">
              Dealership Name
            </label>
            <Input
              id="dealershipName"
              name="dealershipName"
              type="text"
              required
              value={formData.dealershipName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
              Dealer ID
            </label>
            <Input
              id="licenseNumber"
              name="licenseNumber"
              type="text"
              required
              value={formData.licenseNumber}
              onChange={handleChange}
            />
          </div>
        </div>
        <div>
          <label htmlFor="dealershipAddress" className="block text-sm font-medium text-gray-700">
            Dealership Address
          </label>
          <Input
            id="dealershipAddress"
            name="dealershipAddress"
            type="text"
            required
            value={formData.dealershipAddress}
            onChange={handleChange}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <Input
              id="city"
              name="city"
              type="text"
              required
              value={formData.city}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State
              </label>
              <Select onValueChange={(value) => onFormDataChange({ state: value })} value={formData.state}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                ZIP Code
              </label>
              <Input
                id="zipCode"
                name="zipCode"
                type="text"
                required
                value={formData.zipCode}
                onChange={handleChange}
                pattern="[0-9]{5}"
                maxLength={5}
                placeholder="12345"
              />
            </div>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          Add Buyer
        </Button>
      </div>
    </form>
  );
};

export default AddBuyerForm;
