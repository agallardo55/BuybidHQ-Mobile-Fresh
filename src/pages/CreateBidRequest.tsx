
import DashboardNavigation from "@/components/DashboardNavigation";
import Footer from "@/components/Footer";
import MultiStepForm from "@/components/bid-request/MultiStepForm";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCreateBidRequest } from "@/components/bid-request/hooks/useCreateBidRequest";
import { useBuyers } from "@/hooks/useBuyers";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { BidRequestFormData } from "@/components/bid-request/types";

const CreateBidRequest = () => {
  const { currentUser } = useCurrentUser();
  const { buyers } = useBuyers();
  const location = useLocation();
  const {
    formData,
    errors,
    isSubmitting,
    selectedBuyers,
    searchTerm,
    setSearchTerm,
    handleChange,
    handleSelectChange,
    handleImagesUploaded,
    toggleBuyer,
    handleSubmit,
    setErrors,
    handleBatchChanges,
    uploadedImageUrls,
    selectedFileUrls,
    setUploadedImageUrls,
    removeUploadedImage,
    setFormData
  } = useCreateBidRequest();

  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    // Check if we have quick post data from the dialog
    const quickPostData = location.state?.quickPostData;
    if (quickPostData) {
      // Update form data with quick post data
      setFormData({
        ...formData,
        ...quickPostData
      });
    }
  }, [location.state]);

  const mappedBuyers = buyers?.map(buyer => ({
    id: buyer.id,
    name: buyer.name,
    dealership: buyer.dealership,
    mobile: buyer.mobileNumber
  })) || [];

  const filteredBuyers = mappedBuyers.filter(buyer => 
    buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buyer.dealership?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = () => {
    if (!currentUser?.id) {
      return;
    }
    handleSubmit(currentUser.id);
  };

  // Handler for image deletion
  const handleDeleteImage = async (url: string, isUploaded: boolean) => {
    if (isUploaded) {
      try {
        await removeUploadedImage(url);
        // Update state after successful deletion
        setUploadedImageUrls(uploadedImageUrls.filter(imageUrl => imageUrl !== url));
      } catch (error) {
        console.error('Error deleting image:', error);
      }
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
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
              onImagesUploaded={handleImagesUploaded}
              showValidation={showValidation}
              setShowValidation={setShowValidation}
              setErrors={setErrors}
              onBatchChange={handleBatchChanges}
              uploadedImageUrls={uploadedImageUrls}
              selectedFileUrls={selectedFileUrls}
              onDeleteImage={handleDeleteImage}
            />
            <div className="mt-6 pt-4 border-t border-gray-200 bg-white">
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateBidRequest;
