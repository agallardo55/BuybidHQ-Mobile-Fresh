
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
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    dealershipName: "",
    licenseNumber: "",
    dealershipAddress: "",
    city: "",
    state: "",
    zipCode: "",
    mobileNumber: "", // Changed from phoneNumber
    businessNumber: "", // Added new field
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
    // Sign up logic will be implemented later with backend integration
    console.log("Sign up data:", formData);
    navigate("/dashboard");
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
      <div className="max-w-6xl w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <img 
            src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" 
            alt="BuyBidHQ Logo" 
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Create your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Information Column */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h3>
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
            </div>

            {/* Dealership Information Column */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Dealership Information</h3>
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
          </div>

          <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
            Sign up
          </Button>
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
