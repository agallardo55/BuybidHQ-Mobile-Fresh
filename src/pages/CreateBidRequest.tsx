
import DashboardNavigation from "@/components/DashboardNavigation";
import Footer from "@/components/Footer";
import MultiStepForm from "@/components/bid-request/MultiStepForm";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCreateBidRequest } from "@/components/bid-request/hooks/useCreateBidRequest";
import { useBuyers } from "@/hooks/useBuyers";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { logger } from '@/utils/logger';

const CreateBidRequest = () => {
  logger.debug('🔴 CreateBidRequest: COMPONENT CALLED', Date.now());
  
  const { currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const { buyers, isLoading: isLoadingBuyers } = useBuyers();
  
  useEffect(() => {
    logger.debug('🔍 CreateBidRequest: State update', {
      hasCurrentUser: !!currentUser,
      isLoadingUser,
      buyersCount: buyers?.length || 0,
      isLoadingBuyers
    });
  }, [currentUser, isLoadingUser, buyers?.length, isLoadingBuyers]);
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
    removeUploadedImage
  } = useCreateBidRequest();

  const [showValidation, setShowValidation] = useState(false);

  // Show loading state while critical data is fetching, but with timeout
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  useEffect(() => {
    if (isLoadingUser) {
      const timeout = setTimeout(() => {
        logger.warn('CreateBidRequest: User loading timeout, proceeding anyway');
        setLoadingTimeout(true);
      }, 2000); // 2 second timeout
      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoadingUser]);
  
  if (isLoadingUser && !loadingTimeout) {
    logger.debug('🔍 CreateBidRequest: Showing user loading state');
    return (
      <div className="min-h-screen bg-slate-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto mb-4" />
          <p className="text-slate-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  // Show error if user data failed to load
  if (!currentUser) {
    logger.warn('🔍 CreateBidRequest: No current user, showing error');
    return (
      <div className="min-h-screen bg-slate-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-rose-600 mb-4">Failed to load user data</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand text-white rounded hover:bg-brand/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  logger.debug('🔍 CreateBidRequest: Rendering form', {
    buyersCount: buyers?.length || 0,
    isLoadingBuyers
  });

  // Show loading state while buyers are fetching (but allow form to render with empty buyers)
  // Only show spinner if buyers are critical for initial render
  if (isLoadingBuyers && buyers?.length === 0) {
    // Allow form to render but show a loading indicator
    // The form can work with empty buyers initially
  }

  // Map buyers to the format expected by the components
  const mappedBuyers = buyers?.map(buyer => ({
    id: buyer.id,
    name: buyer.name,
    dealership: buyer.dealership,
    mobile: buyer.mobileNumber,
    email: buyer.email
  })) || [];

  const filteredBuyers = mappedBuyers.filter(buyer => 
    buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (buyer.dealership && buyer.dealership.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const onSubmit = () => {
    if (!currentUser?.id) {
      toast.error("User not found. Please try signing out and back in.");
      return;
    }
    if (!currentUser?.account_id) {
      toast.error("Account not found. Please contact support.");
      return;
    }
    handleSubmit(currentUser.id, currentUser.account_id);
  };

  // Handler for image deletion
  const handleDeleteImage = async (url: string, isUploaded: boolean) => {
    if (isUploaded) {
      try {
        await removeUploadedImage(url);
        // Update state after successful deletion
        setUploadedImageUrls(uploadedImageUrls.filter(imageUrl => imageUrl !== url));
      } catch (error) {
        logger.error('Error deleting image:', error);
      }
    }
  };

  logger.debug('🔴 CreateBidRequest: About to return JSX', Date.now());

  return (
    <div className="min-h-screen bg-slate-50/30 flex flex-col">
      <DashboardNavigation />
      <div className="pt-20 px-6 lg:px-12 pb-20 sm:pb-8 flex-grow">
        <div className="max-w-[1920px] mx-auto">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Create Bid Request</h1>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mt-0.5">
                Vehicle Submission Form
              </p>
            </div>
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
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateBidRequest;
