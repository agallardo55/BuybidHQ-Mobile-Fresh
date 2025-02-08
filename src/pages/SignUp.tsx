import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SignUp = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'personal' | 'dealership'>('personal');
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    mobileNumber: "",
    businessNumber: "",
    dealershipName: "",
    licenseNumber: "",
    dealershipAddress: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStateChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      state: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sign up data:", formData);
    navigate("/dashboard");
  };

  const handleNext = () => {
    if (formData.fullName && formData.email && formData.password && formData.mobileNumber && formData.businessNumber) {
      setCurrentStep('dealership');
    }
  };

  const handleBack = () => {
    setCurrentStep('personal');
  };

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[672px] w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <img 
            src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" 
            alt="BuyBidHQ Logo" 
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Create your account</h2>
          <div className="flex justify-center space-x-4 mt-4">
            <div className={`h-2 w-16 rounded ${currentStep === 'personal' ? 'bg-accent' : 'bg-gray-200'}`} />
            <div className={`h-2 w-16 rounded ${currentStep === 'dealership' ? 'bg-accent' : 'bg-gray-200'}`} />
          </div>
          <p className="mt-4 text-sm text-gray-600">
            {currentStep === 'personal' ? 'Step 1: Personal Information' : 'Step 2: Dealership Information'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {currentStep === 'personal' ? (
            <div className="space-y-4">
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
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
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
                />
              </div>
              <Button
                type="button"
                onClick={handleNext}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Next Step
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
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
                  <Select onValueChange={handleStateChange} value={formData.state}>
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
              <div className="flex space-x-4">
                <Button
                  type="button"
                  onClick={handleBack}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Sign up
                </Button>
              </div>
            </div>
          )}
          
          <div className="text-center mt-4">
            <Link to="/signin" className="text-sm text-[#325AE7] hover:text-[#325AE7]/90">
              Already have an account? Sign in
            </Link>
          </div>
          <Link to="/" className="block text-center text-sm text-[#325AE7] hover:text-[#325AE7]/90">
            ← Back Home
          </Link>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
