
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";

const CreateBidRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    year: "",
    make: "",
    model: "",
    trim: "",
    vin: "",
    mileage: "",
    exteriorColor: "",
    interiorColor: "",
    accessories: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle form submission
    // For now, just navigate back to dashboard
    navigate("/dashboard");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center">
                <img 
                  src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" 
                  alt="BuyBidHQ Logo" 
                  className="h-8 w-auto"
                />
              </Link>
              <Link 
                to="/dashboard" 
                className="text-gray-700"
              >
                Dashboard
              </Link>
              <Link 
                to="/create-bid-request" 
                className="text-gray-700"
              >
                Bid Request
              </Link>
            </div>
            
            <div className="flex items-center space-x-2">
              <UserRound className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">Account</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Bid Request</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Basic Vehicle Information */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <Input
                      id="year"
                      name="year"
                      type="number"
                      value={formData.year}
                      onChange={handleChange}
                      required
                      placeholder="2024"
                    />
                  </div>
                  <div>
                    <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
                      Make
                    </label>
                    <Input
                      id="make"
                      name="make"
                      type="text"
                      value={formData.make}
                      onChange={handleChange}
                      required
                      placeholder="Toyota"
                    />
                  </div>
                  <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                      Model
                    </label>
                    <Input
                      id="model"
                      name="model"
                      type="text"
                      value={formData.model}
                      onChange={handleChange}
                      required
                      placeholder="Camry"
                    />
                  </div>
                  <div>
                    <label htmlFor="trim" className="block text-sm font-medium text-gray-700 mb-1">
                      Trim
                    </label>
                    <Input
                      id="trim"
                      name="trim"
                      type="text"
                      value={formData.trim}
                      onChange={handleChange}
                      required
                      placeholder="SE"
                    />
                  </div>
                  <div>
                    <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">
                      VIN
                    </label>
                    <Input
                      id="vin"
                      name="vin"
                      type="text"
                      value={formData.vin}
                      onChange={handleChange}
                      required
                      placeholder="1HGCM82633A123456"
                    />
                  </div>
                  <div>
                    <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1">
                      Mileage
                    </label>
                    <Input
                      id="mileage"
                      name="mileage"
                      type="number"
                      value={formData.mileage}
                      onChange={handleChange}
                      required
                      placeholder="35000"
                    />
                  </div>
                </div>

                {/* Right Column - Colors and Accessories */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="exteriorColor" className="block text-sm font-medium text-gray-700 mb-1">
                      Exterior Color
                    </label>
                    <Input
                      id="exteriorColor"
                      name="exteriorColor"
                      type="text"
                      value={formData.exteriorColor}
                      onChange={handleChange}
                      required
                      placeholder="Midnight Black"
                    />
                  </div>
                  <div>
                    <label htmlFor="interiorColor" className="block text-sm font-medium text-gray-700 mb-1">
                      Interior Color
                    </label>
                    <Input
                      id="interiorColor"
                      name="interiorColor"
                      type="text"
                      value={formData.interiorColor}
                      onChange={handleChange}
                      required
                      placeholder="Black Leather"
                    />
                  </div>
                  <div>
                    <label htmlFor="accessories" className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Equipment/Accessories
                    </label>
                    <Textarea
                      id="accessories"
                      name="accessories"
                      value={formData.accessories}
                      onChange={handleChange}
                      placeholder="List any additional equipment or accessories..."
                      className="min-h-[200px]"
                    />
                  </div>
                </div>
              </div>
              
              <Button type="submit" className="w-full mt-6">
                Submit Bid Request
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBidRequest;
