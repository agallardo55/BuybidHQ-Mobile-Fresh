import { MFASection } from "./MFASection";
import { SubscriptionSection } from "./SubscriptionSection";

export const SettingsTab = () => {
  return (
    <div className="space-y-6">
      <MFASection />
      <SubscriptionSection />
    </div>
  );
};