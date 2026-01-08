
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
              <p>BuybidHQ ("BuybidHQ," "we," "us," or "our") values your privacy. This Privacy Policy explains how we collect, use, disclose, and protect information when you access or use our platform (the "Service"). By using BuybidHQ, you agree to this Privacy Policy.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">2. Information We Collect</h3>
              <p>We collect information to operate the Service and support user-directed communications.</p>

              <h4 className="font-semibold mt-4">2.1 Information You Provide</h4>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Account Information:</strong> name, email address, phone number, and account settings.</li>
                <li><strong>Vehicle and Bid Request Information:</strong> VIN, vehicle details, photos, condition notes, and any other information you submit in connection with a bid request.</li>
                <li><strong>Contacts and Recipient Information:</strong> phone numbers and contact details you upload or select to send bid requests.</li>
              </ul>

              <h4 className="font-semibold mt-4">2.2 SMS Communication Data (No Message Bodies Stored)</h4>
              <p>BuybidHQ facilitates SMS sending through third-party providers. <strong>We do not store SMS message bodies/content</strong> in our systems.</p>
              <p className="mt-2">We may store <strong>limited SMS metadata</strong> necessary to operate and support the Service, such as:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>sender/account identifier</li>
                <li>recipient phone number</li>
                <li>send timestamp</li>
                <li>delivery status (e.g., sent, delivered, failed)</li>
                <li>provider message identifier</li>
                <li>error codes (if any)</li>
              </ul>

              <h4 className="font-semibold mt-4">2.3 Information Collected Automatically</h4>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Usage Data:</strong> pages/screens viewed, actions taken, timestamps, and general feature usage.</li>
                <li><strong>Device/Log Data:</strong> IP address, device type, browser type, operating system, and diagnostic logs.</li>
                <li><strong>Cookies and Similar Technologies:</strong> limited to essential cookies needed for authentication, sessions, and security.</li>
              </ul>

              <h4 className="font-semibold mt-4">2.4 Information From Third Parties</h4>
              <p>We may receive limited information from vendors that help provide the Service (e.g., delivery status, error codes, and message identifiers from SMS providers; infrastructure logs from hosting/database providers).</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">3. How We Use Your Information</h3>
              <p>We use information to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Provide and operate the Service,</strong> including account creation, authentication, bid request workflows, and displaying vehicle/bid information you choose to share.</li>
                <li><strong>Facilitate communications</strong> by sending SMS messages to recipients you designate and tracking delivery outcomes via metadata.</li>
                <li><strong>Maintain and improve</strong> performance, reliability, and features.</li>
                <li><strong>Provide customer support</strong> and respond to requests.</li>
                <li><strong>Protect the Service</strong> (fraud prevention, abuse detection, troubleshooting, auditing, and enforcing our Terms).</li>
                <li><strong>Comply with legal obligations</strong> and respond to lawful requests.</li>
              </ul>
              <p className="mt-2"><strong>We do not sell your personal information.</strong></p>
              <p><strong>We do not use your data for targeted advertising.</strong></p>
              <p><strong>We do not track you across third-party websites for marketing purposes.</strong></p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">4. Legal Bases (if applicable)</h3>
              <p>Where required by law, our legal bases may include:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>providing the Service under a contract with you</li>
                <li>legitimate interests (security, reliability, fraud prevention, and service improvement)</li>
                <li>your consent (where required)</li>
                <li>compliance with legal obligations</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">5. Sharing and Disclosure of Information</h3>
              <p>We do not sell or share personal information with third parties for their marketing purposes. We may share information only in these circumstances:</p>

              <h4 className="font-semibold mt-4">5.1 Service Providers (Vendors)</h4>
              <p>We share information with vendors that help us operate the Service, such as:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>SMS/communications providers</strong> (to deliver messages; they may process message content as part of delivery)</li>
                <li><strong>Hosting, database, and storage providers</strong></li>
                <li><strong>Payment processors</strong> (for subscription billing)</li>
              </ul>
              <p className="mt-2">Vendors may access information only as needed to perform services for us and are expected to protect it.</p>

              <h4 className="font-semibold mt-4">5.2 User-Directed Sharing</h4>
              <p>When you send a bid request through the Service, you direct us to share the vehicle details and related information you selected with the recipients you designate.</p>

              <h4 className="font-semibold mt-4">5.3 Legal and Safety</h4>
              <p>We may disclose information if we believe in good faith that disclosure is necessary to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>comply with law, regulation, subpoena, or legal process</li>
                <li>protect the rights, property, and safety of BuybidHQ, our users, or others</li>
                <li>investigate and prevent fraud, security issues, or misuse</li>
              </ul>

              <h4 className="font-semibold mt-4">5.4 Business Transfers</h4>
              <p>If we are involved in a merger, acquisition, financing, reorganization, bankruptcy, or sale of assets, information may be transferred as part of that transaction subject to appropriate protections.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">6. Data Retention</h3>
              <p>We retain information for as long as reasonably necessary to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>provide the Service and maintain your account</li>
                <li>comply with legal, accounting, or regulatory requirements</li>
                <li>resolve disputes and enforce agreements</li>
                <li>maintain security and prevent abuse</li>
              </ul>
              <p className="mt-2">Because <strong>we do not store SMS message bodies</strong>, our retained SMS-related data is generally limited to <strong>delivery/status metadata</strong> (as described above). We may delete or anonymize certain data periodically or upon account closure, subject to legal and operational requirements. Users are responsible for maintaining their own records as needed for business and compliance purposes.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">7. Data Security</h3>
              <p>We use reasonable administrative, technical, and organizational safeguards designed to protect information from unauthorized access, loss, misuse, alteration, or disclosure. However, no method of transmission or storage is 100% secure.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">8. Your Rights and Choices</h3>
              <p>Depending on your location, you may have rights such as:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>access, correct, or update your personal information</li>
                <li>request deletion of personal information (subject to legal/operational exceptions)</li>
                <li>object to or restrict certain processing</li>
                <li>withdraw consent where processing is based on consent</li>
              </ul>
              <p className="mt-2">To exercise these rights, contact <a href="mailto:support@buybidhq.com" className="text-blue-600 hover:underline">support@buybidhq.com</a>.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">9. Cookies</h3>
              <p>BuybidHQ uses only <strong>essential cookies</strong> required for core functionality (authentication, session management, security). We do not use tracking or marketing cookies.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">10. Third-Party Services</h3>
              <p>The Service integrates with third-party services (e.g., Supabase for backend services, an SMS provider such as Twilio for message delivery, payment processors for billing). These third parties process data under their own privacy policies. BuybidHQ is not responsible for the privacy practices of third parties, but we aim to work with reputable providers.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">11. Children's Privacy</h3>
              <p>BuybidHQ is intended for business use and is not directed to children. We do not knowingly collect personal information from children under 13 (or the applicable age in your jurisdiction). If you believe a child has provided personal information, contact us.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">12. Changes to This Policy</h3>
              <p>We may update this Privacy Policy from time to time. Updates will be posted, and continued use of the Service after changes become effective constitutes acceptance of the updated Privacy Policy.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">13. Contact Us</h3>
              <p>If you have questions about this Privacy Policy or your data, contact: <a href="mailto:support@buybidhq.com" className="text-blue-600 hover:underline">support@buybidhq.com</a>.</p>
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyDialog;
