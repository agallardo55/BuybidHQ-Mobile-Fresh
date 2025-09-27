
import { Link } from "react-router-dom";
import PersonalInfoForm from "@/components/signup/PersonalInfoForm";
import DealershipForm from "@/components/signup/DealershipForm";
import PlanSelectionForm from "@/components/signup/PlanSelectionForm";
import { useSignUpForm } from "@/hooks/useSignUpForm";

const SignUp = () => {
  const {
    formData,
    currentStep,
    isSubmitting,
    handleChange,
    handleStateChange,
    handlePlanSelect,
    handleNext,
    handleBack,
    handleSubmit,
  } = useSignUpForm();

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className={`${currentStep === 'plan' ? 'max-w-5xl' : currentStep === 'personal' ? 'max-w-xl' : 'max-w-2xl'} w-full space-y-6 bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-md`}>
        <div className="text-center">
          <img 
            src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" 
            alt="BuyBidHQ Logo" 
            className="mx-auto h-10 sm:h-12 w-auto"
          />
          <h2 className="mt-4 sm:mt-6 text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Create your account</h2>
          <div className="flex justify-center space-x-2 sm:space-x-4 mt-4">
            <div className={`h-2 w-12 sm:w-16 rounded ${currentStep === 'plan' ? 'bg-accent' : 'bg-gray-200'}`} />
            <div className={`h-2 w-12 sm:w-16 rounded ${currentStep === 'personal' ? 'bg-accent' : 'bg-gray-200'}`} />
            <div className={`h-2 w-12 sm:w-16 rounded ${currentStep === 'dealership' ? 'bg-accent' : 'bg-gray-200'}`} />
          </div>
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
            {currentStep === 'plan' ? 'Step 1: Select Your Plan' : 
             currentStep === 'personal' ? 'Step 2: Personal Information' :
             'Step 3: Dealership Information'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {currentStep === 'plan' ? (
            <PlanSelectionForm
              onSelect={handlePlanSelect}
              onBack={() => null}
            />
          ) : currentStep === 'personal' ? (
            <PersonalInfoForm
              formData={formData}
              onNext={handleNext}
              onChange={handleChange}
              onBack={handleBack}
            />
          ) : (
            <DealershipForm
              formData={formData}
              onBack={handleBack}
              onChange={handleChange}
              onStateChange={handleStateChange}
              isSubmitting={isSubmitting}
              states={states}
            />
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
