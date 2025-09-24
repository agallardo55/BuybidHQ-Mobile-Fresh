
import { PasswordUpdateForm } from "./PasswordUpdateForm";
import { MFASection } from "./MFASection";
import { SecurityDashboard } from "@/components/security/SecurityDashboard";
import { EmailVerificationPrompt } from "@/components/security/EmailVerificationPrompt";

export const SecurityTab = () => {
  return (
    <div className="space-y-6">
      <EmailVerificationPrompt />
      <MFASection />
      <PasswordUpdateForm />
      <SecurityDashboard />
    </div>
  );
};
