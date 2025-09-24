
import { PasswordUpdateForm } from "./PasswordUpdateForm";
import { MFASection } from "./MFASection";
import { SecurityDashboard } from "@/components/security/SecurityDashboard";

export const SecurityTab = () => {
  return (
    <div className="space-y-6">
      <MFASection />
      <PasswordUpdateForm />
      <SecurityDashboard />
    </div>
  );
};
