
import { useState } from "react";
import DashboardNavigation from "@/components/DashboardNavigation";
import Footer from "@/components/Footer";
import { BuyerFormData } from "@/types/buyers";
import { useBuyers } from "@/hooks/useBuyers";
import BuyersHeader from "@/components/buyers/BuyersHeader";
import BuyersList from "@/components/buyers/BuyersList";

const Buyers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const itemsPerPage = 5;

  const { buyers, isLoading, createBuyer } = useBuyers();

  const [formData, setFormData] = useState<BuyerFormData>({
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
  });

  const handleFormDataChange = (data: Partial<BuyerFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createBuyer(formData, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setFormData({
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
        });
      }
    });
  };

  const filteredBuyers = buyers.filter((buyer) => {
    const searchString = searchTerm.toLowerCase();
    return (
      buyer.name.toLowerCase().includes(searchString) ||
      buyer.email.toLowerCase().includes(searchString) ||
      buyer.location.toLowerCase().includes(searchString)
    );
  });

  const totalPages = Math.ceil(filteredBuyers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBuyers = filteredBuyers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F6F6F7]">
        <DashboardNavigation />
        <div className="pt-24 px-4 sm:px-8 flex-grow">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              Loading buyers...
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F6F7]">
      <DashboardNavigation />
      <div className="pt-24 px-4 sm:px-8 flex-grow pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <BuyersHeader
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
              formData={formData}
              onFormDataChange={handleFormDataChange}
              onSubmit={handleSubmit}
            />
            <BuyersList
              buyers={paginatedBuyers}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Buyers;
