
import { Link } from "react-router-dom";
import PersonalInfoForm from "@/components/signup/PersonalInfoForm";
import PlanSelectionForm from "@/components/signup/PlanSelectionForm";
import { useSignUpForm } from "@/hooks/useSignUpForm";

const SignUp = () => {
  const {
    formData,
    currentStep,
    isSubmitting,
    handleChange,
    handlePlanSelect,
    handleBack,
    handleSubmit,
  } = useSignUpForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className={`${currentStep === 'plan' ? 'max-w-5xl' : 'max-w-2xl'} w-full space-y-6 bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-md`}>
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
          </div>
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
            {currentStep === 'plan' ? 'Step 1: Select Your Plan' : 'Step 2: Personal Information'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {currentStep === 'plan' ? (
            <PlanSelectionForm
              onSelect={handlePlanSelect}
              onBack={() => null}
            />
          ) : (
            <PersonalInfoForm
              formData={formData}
              onNext={handleSubmit}
              onChange={handleChange}
              onBack={handleBack}
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
