
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PrivacyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const PrivacyDialog = ({ open, onOpenChange }: PrivacyDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>BuybidHQ Privacy Policy</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div className="space-y-6 text-left">
            <div>
              <h3 className="text-lg font-semibold">1. Introduction</h3>
              <p>Your privacy is important to us. This Privacy Policy explains how BuybidHQ collects, uses, and protects the information you provide while using our platform. By accessing or using BuybidHQ, you agree to this policy.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">2. Information We Collect</h3>
              <p>We collect information to provide and improve our services. The types of information we collect include:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Personal Information: Contact details such as name, email, and phone number.</li>
                <li>Vehicle Information: VIN, vehicle details, photos, and condition descriptions submitted through the platform.</li>
                <li>SMS Communication Data: Contact information for SMS recipients and message content for bid requests.</li>
                <li>Usage Data: Information about how you interact with the app, including log data and device information.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">3. How We Use Your Information</h3>
              <p>We use the information collected to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Provide, maintain, and improve our services.</li>
                <li>Facilitate bid requests via SMS and manage vehicle data.</li>
                <li>Communicate with you and provide support.</li>
                <li>Ensure security and prevent misuse of the platform.</li>
              </ul>
              <p className="mt-2">We do not use your data for marketing, tracking, or advertising purposes.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">4. Sharing of Information</h3>
              <p>We do not sell, trade, or share your personal information with third parties for marketing purposes. Information may be shared with service providers (e.g., Twilio for SMS services) only to the extent necessary to provide the service.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">5. Data Retention and Security</h3>
              <p>We retain your data for as long as necessary to fulfill the purposes outlined in this policy. We implement appropriate security measures to protect your information from unauthorized access, alteration, disclosure, or destruction.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">6. Your Rights</h3>
              <p>Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Access, update, or delete your personal data.</li>
                <li>Withdraw consent for data processing.</li>
              </ul>
              <p className="mt-2">To exercise these rights, please contact us at support@buybidHQ.com.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">7. Cookies</h3>
              <p>BuybidHQ uses only essential cookies for functionality, such as session and authentication cookies. We do not use tracking or marketing cookies.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">8. Third-Party Services</h3>
              <p>Our app integrates with third-party services (e.g., Supabase for backend and Twilio for SMS). These services have their own privacy policies that govern how they handle your data.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">9. Changes to this Policy</h3>
              <p>We may update this Privacy Policy from time to time. Changes will be posted on this page, and your continued use of the service constitutes acceptance of the updated terms.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">10. Contact Us</h3>
              <p>If you have any questions about this Privacy Policy or your data, please contact us at support@buybidHQ.com.</p>
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyDialog;
