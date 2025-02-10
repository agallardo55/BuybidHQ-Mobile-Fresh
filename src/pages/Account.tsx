import DashboardNavigation from "@/components/DashboardNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const Account = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    businessNumber: "",
    dealershipName: "",
    licenseNumber: "",
    dealershipAddress: "",
    city: "",
    state: "",
    zipCode: "",
    subscriptionType: "basic",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",
  });

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
      setFormData((prev) => ({
        ...prev,
        [name]: formatPhoneNumber(value),
      }));
    } else if (name === 'cardNumber') {
      // Format card number as **** **** **** ****
      const formatted = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim();
      setFormData((prev) => ({
        ...prev,
        [name]: formatted,
      }));
    } else if (name === 'cardExpiry') {
      // Format expiry as MM/YY
      const expiry = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d{0,2})/, '$1/$2')
        .substr(0, 5);
      setFormData((prev) => ({
        ...prev,
        [name]: expiry,
      }));
    } else if (name === 'cardCvc') {
      // Only allow numbers and max 3 digits
      const cvc = value.replace(/\D/g, '').substr(0, 3);
      setFormData((prev) => ({
        ...prev,
        [name]: cvc,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleStateChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      state: value,
    }));
  };

  const handleSubscriptionChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      subscriptionType: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated account data:", formData);
    toast({
      title: "Account updated",
      description: "Your account details have been successfully updated.",
    });
  };

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 w-full lg:w-[80%] mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Account Settings</h1>
          
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="mb-4 w-full flex flex-wrap gap-2">
              <TabsTrigger value="personal" className="flex-1">Personal</TabsTrigger>
              <TabsTrigger value="dealership" className="flex-1">Dealership</TabsTrigger>
              <TabsTrigger value="subscription" className="flex-1">Subscription</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
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
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                      <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
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
                      <label htmlFor="businessNumber" className="block text-sm font-medium text-gray-700 mb-1">
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
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    Save Changes
                  </Button>
                </div>
                <div className="h-8 border-t mt-6"></div>
              </form>
            </TabsContent>

            <TabsContent value="dealership">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label htmlFor="dealershipName" className="block text-sm font-medium text-gray-700 mb-1">
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
                        <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
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
                      <label htmlFor="dealershipAddress" className="block text-sm font-medium text-gray-700 mb-1">
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
                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                      <div className="sm:col-span-2">
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
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
                      <div className="sm:col-span-2">
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
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
                      <div className="sm:col-span-2">
                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
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
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    Save Changes
                  </Button>
                </div>
                <div className="h-8 border-t mt-6"></div>
              </form>
            </TabsContent>

            <TabsContent value="subscription">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="subscriptionType" className="block text-sm font-medium text-gray-700 mb-1">
                    Subscription Plan
                  </label>
                  <Select onValueChange={handleSubscriptionChange} value={formData.subscriptionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic Plan</SelectItem>
                      <SelectItem value="pro">Pro Plan</SelectItem>
                      <SelectItem value="enterprise">Enterprise Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Payment Method</h3>
                  
                  <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name
                    </label>
                    <Input
                      id="cardName"
                      name="cardName"
                      type="text"
                      value={formData.cardName}
                      onChange={handleChange}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      type="text"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      placeholder="**** **** **** ****"
                      maxLength={19}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <Input
                        id="cardExpiry"
                        name="cardExpiry"
                        type="text"
                        value={formData.cardExpiry}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>

                    <div>
                      <label htmlFor="cardCvc" className="block text-sm font-medium text-gray-700 mb-1">
                        CVC
                      </label>
                      <Input
                        id="cardCvc"
                        name="cardCvc"
                        type="text"
                        value={formData.cardCvc}
                        onChange={handleChange}
                        placeholder="123"
                        maxLength={3}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      Update Payment Details
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Account;
