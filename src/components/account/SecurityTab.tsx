
import { PasswordUpdateForm } from "./PasswordUpdateForm";
import { MFASection } from "./MFASection";

export const SecurityTab = () => {
  return (
    <div className="space-y-6">
      <MFASection />
      <PasswordUpdateForm />
    </div>
  );
};
