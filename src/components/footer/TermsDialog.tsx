import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type TermsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const TermsDialog = ({ open, onOpenChange }: TermsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>BuybidHQ Terms of Service</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div className="space-y-6 text-left">
            <div>
              <h3 className="text-lg font-semibold">1. Introduction</h3>
              <p>Welcome to BuybidHQ! By accessing or using our platform, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use BuybidHQ.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">2. Description of Service</h3>
              <p>BuybidHQ is a web-based application that allows auto dealers to send bid requests for used vehicles via SMS and manage related vehicle details. The app includes features such as VIN scanning, vehicle information management, condition description, photo capture, and SMS communication with contacts.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">3. Subscription Membership Levels</h3>
              <p>BuybidHQ offers three subscription membership levels with varying features and access:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Free Beta Plan:</strong> A limited-time promotional tier providing access to core bid request features during the Beta period. Does not include Market View access or premium support features.</li>
                <li><strong>Buybid Connect Plan:</strong> A monthly subscription ($99/month) providing full access to all bid request features, Market View access, and standard support.</li>
                <li><strong>Annual Plan:</strong> An annual subscription ($599/year) providing full access to all bid request features, Market View access, priority support, and discounted annual pricing.</li>
              </ul>
              <p className="mt-2">You are responsible for maintaining the confidentiality of your login credentials and any activity under your account.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">4. Beta Plan - Limited Time Offer</h3>
              <p>The Free Beta Plan is a limited time promotional offer provided at BuybidHQ's sole discretion. By using the Beta Plan, you acknowledge and agree that:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>The Beta Plan may be modified, updated, suspended, or terminated at any time without prior notice.</li>
                <li>Features, functionality, and access levels included in the Beta Plan may change at BuybidHQ's discretion.</li>
                <li>BuybidHQ reserves the right to transition Beta Plan users to paid plans or alternative arrangements.</li>
                <li>No guarantees are made regarding the duration or availability of the Beta Plan.</li>
                <li>Users will be notified of significant changes when reasonably possible, but BuybidHQ is not obligated to provide advance notice.</li>
              </ul>
              <p className="mt-2">Continued use of the Beta Plan after any modifications constitutes acceptance of the updated terms.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">5. Acceptable Use</h3>
              <p>When using BuybidHQ, you agree to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Use the platform for lawful purposes only.</li>
                <li>Not misuse the app for unauthorized data collection or distribution.</li>
                <li>Avoid any activity that could compromise the security of the service.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">6. Data and Privacy</h3>
              <p>BuybidHQ collects and processes information necessary for service functionality, including vehicle data and SMS contact information. We do not track users for marketing or advertising purposes. For more details, refer to our Privacy Policy.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">7. SMS Communication</h3>
              <p>By using BuybidHQ's SMS feature, you confirm that you have obtained consent from recipients to send them bid requests. Misuse of this feature may result in account suspension or termination.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">8. Modifications and Updates</h3>
              <p>We reserve the right to update or modify these Terms at any time without prior notice. Continued use of the service after changes are made constitutes acceptance of the new terms.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">9. Termination</h3>
              <p>We may suspend or terminate your access to BuybidHQ at our sole discretion, with or without notice, for any violation of these Terms or for other reasons deemed necessary.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">10. Disclaimer of Warranties</h3>
              <p>BuybidHQ is provided on an "as is" and "as available" basis. We make no warranties, expressed or implied, regarding the reliability, availability, or accuracy of the service.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">11. Limitation of Liability</h3>
              <p>To the fullest extent permitted by law, BuybidHQ and its affiliates will not be liable for any indirect, incidental, or consequential damages resulting from the use of the service.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">12. Governing Law</h3>
              <p>These Terms are governed by the laws of [Your State/Region], without regard to conflict of law principles.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">13. Contact Us</h3>
              <p>If you have any questions about these Terms, please contact us at support@buybidHQ.com.</p>
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default TermsDialog;
