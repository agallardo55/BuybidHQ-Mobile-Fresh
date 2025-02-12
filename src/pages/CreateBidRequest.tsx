
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DashboardNavigation from "@/components/DashboardNavigation";
import Footer from "@/components/Footer";
import { BidRequestFormData, FormErrors } from "@/components/bid-request/types";
import MultiStepForm from "@/components/bid-request/MultiStepForm";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const CreateBidRequest = () => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBuyers, setSelectedBuyers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState<BidRequestFormData>({
    year: "",
    make: "",
    model: "",
    trim: "",
    vin: "",
    mileage: "",
    exteriorColor: "",
    interiorColor: "",
    accessories: "",
    windshield: "",
    engineLights: "",
    brakes: "",
    tire: "",
    maintenance: "",
    reconEstimate: "",
    reconDetails: "",
    engineCylinders: "",
    transmission: "",
    drivetrain: "",
  });

  const buyers = [
    { id: "1", name: "John Smith", dealership: "Premium Auto Sales", mobile: "(310) 555-0123" },
    { id: "2", name: "Sarah Williams", dealership: "Elite Motors", mobile: "(212) 555-0124" },
    { id: "3", name: "Mike Johnson", dealership: "Prestige Cars", mobile: "(312) 555-0125" },
    { id: "4", name: "Emily Brown", dealership: "City Auto Group", mobile: "(713) 555-0126" },
    { id: "5", name: "David Wilson", dealership: "Luxury Vehicles Inc", mobile: "(305) 555-0127" },
  ];

  const filteredBuyers = buyers.filter(buyer => 
    buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buyer.dealership.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.year) newErrors.year = "Year is required";
    if (!formData.make) newErrors.make = "Make is required";
    if (!formData.model) newErrors.model = "Model is required";
    if (!formData.vin) newErrors.vin = "VIN is required";
    if (!formData.mileage) newErrors.mileage = "Mileage is required";
    if (selectedBuyers.length === 0) newErrors.buyers = "Please select at least one buyer";
    
    if (formData.vin && formData.vin.length !== 17) {
      newErrors.vin = "VIN must be 17 characters";
    }
    
    const currentYear = new Date().getFullYear();
    const year = parseInt(formData.year);
    if (year < 1900 || year > currentYear + 1) {
      newErrors.year = `Year must be between 1900 and ${currentYear + 1}`;
    }

    if (parseInt(formData.mileage) < 0) {
      newErrors.mileage = "Mileage cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    if (!currentUser?.id) {
      toast.error("You must be logged in to create a bid request");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.rpc('create_complete_bid_request', {
        vehicle_data: {
          year: formData.year,
          make: formData.make,
          model: formData.model,
          trim: formData.trim,
          vin: formData.vin,
          mileage: formData.mileage,
          engine: formData.engineCylinders,
          transmission: formData.transmission,
          drivetrain: formData.drivetrain,
          exterior: formData.exteriorColor,
          interior: formData.interiorColor,
          options: formData.accessories
        },
        recon_data: {
          windshield: formData.windshield,
          engineLights: formData.engineLights,
          brakes: formData.brakes,
          tire: formData.tire,
          maintenance: formData.maintenance,
          reconEstimate: formData.reconEstimate,
          reconDetails: formData.reconDetails
        },
        image_urls: uploadedImageUrls,
        buyer_ids: selectedBuyers,
        creator_id: currentUser.id
      });

      if (error) throw error;

      toast.success("Bid request created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error('Error creating bid request:', error);
      toast.error("Failed to create bid request. Please try again.");
    } finally {
      setIsSubmitting(false);
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
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImagesUploaded = (urls: string[]) => {
    setUploadedImageUrls(prev => [...prev, ...urls]);
  };

  const toggleBuyer = (buyerId: string) => {
    setSelectedBuyers(prev => {
      if (prev.includes(buyerId)) {
        return prev.filter(id => id !== buyerId);
      }
      return [...prev, buyerId];
    });
    if (errors.buyers) {
      setErrors(prev => ({ ...prev, buyers: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardNavigation />
      <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-6 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h1 className="text-lg font-bold text-gray-900 mb-6">Create Bid Request</h1>
            <MultiStepForm
              formData={formData}
              errors={errors}
              onChange={handleChange}
              onSelectChange={handleSelectChange}
              selectedBuyers={selectedBuyers}
              toggleBuyer={toggleBuyer}
              buyers={filteredBuyers}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              onImagesUploaded={handleImagesUploaded}
            />
            <div className="mt-6 pt-4 border-t border-gray-200 bg-white">
              <p className="text-sm text-gray-500 text-center">
                Need help? Contact our support team at{" "}
                <a href="mailto:support@buybidhq.com" className="text-custom-blue hover:underline">
                  support@buybidhq.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateBidRequest;
