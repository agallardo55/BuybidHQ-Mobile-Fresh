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
              <p>Welcome to BuybidHQ ("BuybidHQ," "we," "us," or "our"). By accessing or using our platform (the "Service"), you agree to these Terms of Service ("Terms"). If you do not agree, do not use BuybidHQ.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">2. Description of Service (Communications Platform Only)</h3>
              <p>BuybidHQ is a web-based communications and workflow platform that helps auto dealers request and exchange information about used vehicles, including sending bid requests via SMS and managing related vehicle details (e.g., VIN scanning, vehicle information, condition descriptions, and photo capture).</p>
              <p className="mt-2"><strong>BuybidHQ does not buy, sell, list, broker, insure, transport, finance, warranty, or otherwise transact vehicles.</strong> BuybidHQ is <strong>not a marketplace operator, auctioneer, dealer, broker, agent, or fiduciary</strong> for any user.</p>
              <p className="mt-2"><strong>All negotiations, agreements, inspections, representations, payments, title/registration, delivery, disputes, and any transaction</strong> occur <strong>solely between the participating buyer and seller</strong> (the "Users"). BuybidHQ does not verify vehicles, vehicle condition, ownership, lien status, pricing, identity, licensing status, or the accuracy of user-provided information.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">3. Subscription Membership Levels</h3>
              <p>BuybidHQ offers subscription membership levels with varying features and access:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Free Beta Plan:</strong> Limited-time promotional tier providing access to core bid request features during the Beta period. Does not include Market View access or premium support.</li>
                <li><strong>Buybid Connect Plan:</strong> Monthly subscription ($99/month) providing full access to all bid request features, Market View access, and standard support.</li>
                <li><strong>Annual Plan:</strong> Annual subscription ($599/year) providing full access to all bid request features, Market View access, priority support, and discounted annual pricing.</li>
              </ul>
              <p className="mt-2">You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">4. Beta Plan – Limited Time Offer</h3>
              <p>The Free Beta Plan is offered at BuybidHQ's sole discretion. By using the Beta Plan, you acknowledge and agree that:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>The Beta Plan may be modified, updated, suspended, or terminated at any time without prior notice.</li>
                <li>Features, functionality, and access levels may change at BuybidHQ's discretion.</li>
                <li>BuybidHQ may transition Beta users to paid plans or alternative arrangements.</li>
                <li>No guarantees are made regarding duration or availability.</li>
                <li>Continued use after modifications constitutes acceptance of the updated Terms.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">5. Acceptable Use</h3>
              <p>You agree to use BuybidHQ lawfully and not to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Misuse the Service for unauthorized data collection, scraping, or distribution.</li>
                <li>Interfere with or compromise the security, availability, or integrity of the Service.</li>
                <li>Use the Service to send unlawful, deceptive, harassing, or unsolicited communications.</li>
                <li>Upload or share content you do not have the right to use, or content that violates laws or third-party rights.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">6. Data and Privacy</h3>
              <p>BuybidHQ processes information necessary to provide the Service, including vehicle data, uploaded photos, and contact information used for communications. We do not track users for marketing or advertising purposes. For details, refer to our Privacy Policy.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">7. SMS Communication and Consent</h3>
              <p>By using BuybidHQ's SMS features, you represent and warrant that you have obtained any required consent from recipients and that your communications comply with applicable laws and industry rules (including those related to texting). You are solely responsible for the content and legality of messages you send. Misuse may result in suspension or termination.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">8. Billing, Auto-Renewal, and Refunds</h3>
              <p>If you purchase a paid subscription, you authorize BuybidHQ (and our payment processor) to charge applicable fees and taxes to your payment method on a recurring basis until you cancel.</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Auto-renewal:</strong> Subscriptions renew automatically unless canceled before the renewal date.</li>
                <li><strong>Cancellation:</strong> You can cancel at any time. Unless required by law, cancellation takes effect at the end of the current billing period.</li>
                <li><strong>Refunds:</strong> Fees are non-refundable except where required by law or where BuybidHQ agrees otherwise in writing.</li>
                <li><strong>Failed payments:</strong> If payment fails, we may suspend or downgrade access until payment is successfully processed.</li>
                <li><strong>Price changes:</strong> We may change pricing upon notice; changes apply at the next renewal unless stated otherwise.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">9. User Content and License</h3>
              <p>"User Content" includes any text, photos, vehicle details, messages, or other content you submit through the Service.</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Your rights:</strong> You retain ownership of your User Content.</li>
                <li><strong>Your permission to us:</strong> You grant BuybidHQ a non-exclusive, worldwide, royalty-free license to host, store, reproduce, transmit, display, and process User Content <strong>only as necessary</strong> to operate, maintain, and improve the Service and to provide features you request (including sending messages and sharing bid request details with recipients you select).</li>
                <li><strong>Your responsibilities:</strong> You represent and warrant that you have all rights and permissions needed to submit the User Content and that it does not violate any laws or third-party rights.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">10. Compliance Responsibilities (Dealers and Users)</h3>
              <p>You are solely responsible for complying with all laws, rules, and regulations related to your use of the Service and any transactions, including but not limited to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Dealer licensing and business compliance requirements</li>
                <li>Required disclosures (vehicle condition, title/branding, odometer, prior use, etc.)</li>
                <li>Privacy and data protection obligations for any personal information you collect, upload, or share</li>
                <li>Communications compliance (including texting laws and consent requirements)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">11. Third-Party Services</h3>
              <p>The Service may integrate with or rely on third-party services (e.g., SMS delivery providers, VIN decoding sources, hosting and storage providers, payment processors). These services are not controlled by BuybidHQ and may be subject to third-party terms.</p>
              <p className="mt-2">BuybidHQ is not responsible for third-party service outages, errors, changes, or interruptions, and we do not guarantee continued availability of any third-party integration.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">12. Account Security and Access</h3>
              <p>You are responsible for safeguarding your account credentials and for all activity that occurs under your account.</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>You agree not to share login credentials except as expressly permitted by your subscription plan (if applicable).</li>
                <li>You must promptly notify BuybidHQ of any suspected unauthorized access or security incident.</li>
                <li>We may suspend access to protect the Service, your account, or other users.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">13. Data Retention and Deletion</h3>
              <p>BuybidHQ may retain and delete certain data (including photos and message logs) according to our operational needs and legal obligations.</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>We may delete or anonymize content after a reasonable period of time, including to reduce storage risk and cost.</li>
                <li>You are responsible for maintaining your own records, backups, and documentation related to any transaction or compliance requirement.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">14. User-to-User Transactions and Disputes</h3>
              <p>BuybidHQ is not a party to any user-to-user transaction. If you choose to transact with another user, you do so at your own risk.</p>
              <p className="mt-2">BuybidHQ does not provide escrow, payment processing for vehicle transactions, vehicle inspections, or dispute resolution between users. Users are solely responsible for resolving any disputes, claims, chargebacks, returns, title issues, fraud, misrepresentation, or other conflicts arising from their interactions.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">15. Indemnification</h3>
              <p>To the fullest extent permitted by law, you agree to defend, indemnify, and hold harmless BuybidHQ, its affiliates, and their officers, directors, employees, and agents from and against any claims, damages, liabilities, losses, and expenses (including reasonable attorneys' fees) arising out of or related to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Your use of the Service</li>
                <li>Your User Content or communications (including SMS)</li>
                <li>Any transaction or dispute between you and another user</li>
                <li>Your violation of these Terms or applicable laws</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">16. Modifications and Updates</h3>
              <p>We may update these Terms at any time. Continued use of the Service after changes become effective constitutes acceptance of the updated Terms.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">17. Termination</h3>
              <p>We may suspend or terminate access to BuybidHQ at our sole discretion, with or without notice, including for violations of these Terms or actions that create risk for BuybidHQ, users, or third parties.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">18. Disclaimer of Warranties</h3>
              <p>The Service is provided "as is" and "as available." To the fullest extent permitted by law, BuybidHQ disclaims all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Service will be uninterrupted, error-free, or secure.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">19. Limitation of Liability</h3>
              <p>To the fullest extent permitted by law, BuybidHQ and its affiliates will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or any loss of profits, revenues, data, goodwill, or business opportunities, arising from or related to your use of the Service or any user-to-user interaction or transaction.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">20. Arbitration Agreement and Class Action Waiver</h3>
              <p><strong>Please read this section carefully. It affects your legal rights.</strong></p>

              <h4 className="font-semibold mt-4">20.1 Agreement to Arbitrate</h4>
              <p>You and BuybidHQ agree that any dispute, claim, or controversy arising out of or relating to these Terms or the Service (collectively, "Disputes") will be resolved by <strong>binding, individual arbitration</strong> and not in court, except as expressly stated below.</p>

              <h4 className="font-semibold mt-4">20.2 Exceptions</h4>
              <p>Either party may choose to bring:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>An individual claim in <strong>small claims court</strong> if it qualifies, or</li>
                <li>A claim for <strong>injunctive or equitable relief</strong> in court to stop unauthorized use, abuse, or infringement of intellectual property or to address security-related harm.</li>
              </ul>

              <h4 className="font-semibold mt-4">20.3 No Class Actions</h4>
              <p>You and BuybidHQ agree that Disputes will be brought only in an <strong>individual capacity</strong> and not as a plaintiff or class member in any purported class, collective, consolidated, or representative proceeding. The arbitrator may not consolidate claims or preside over any form of representative or class proceeding.</p>

              <h4 className="font-semibold mt-4">20.4 Arbitration Rules and Administration</h4>
              <p>The arbitration will be administered by a nationally recognized arbitration provider (e.g., AAA or JAMS) under its applicable consumer/commercial arbitration rules (as appropriate for the parties and Dispute). If the provider's rules conflict with this section, this section controls.</p>

              <h4 className="font-semibold mt-4">20.5 Location and Format</h4>
              <p>Arbitration will take place in <strong>Washington State</strong>, unless the parties agree otherwise. If permitted by the arbitration provider's rules, proceedings may occur by <strong>video, phone, or written submissions</strong>, especially for lower-value claims.</p>

              <h4 className="font-semibold mt-4">20.6 Arbitrator Authority</h4>
              <p>The arbitrator has exclusive authority to resolve any Dispute, including issues relating to the interpretation, applicability, enforceability, or formation of this Arbitration Agreement, except that a court (not an arbitrator) will decide any claim that the class action waiver is unenforceable.</p>

              <h4 className="font-semibold mt-4">20.7 Fees and Costs</h4>
              <p>Payment of arbitration fees will be governed by the arbitration provider's rules and applicable law. Each party will bear its own attorneys' fees and costs unless the arbitrator awards otherwise under applicable law or unless a fee-shifting provision applies.</p>

              <h4 className="font-semibold mt-4">20.8 Time Limit to Bring Claims</h4>
              <p>Any Dispute must be filed within the time limit permitted by applicable law. If applicable law requires a shorter or longer period, that law controls.</p>

              <h4 className="font-semibold mt-4">20.9 Severability</h4>
              <p>If any part of this Arbitration Agreement is found unenforceable, the remaining portions will remain in effect. If the class action waiver is found unenforceable, then the Arbitration Agreement will not apply to that Dispute, and it may proceed in court only to the extent required.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">21. Governing Law</h3>
              <p>These Terms are governed by the laws of Washington State, without regard to conflict of law principles, except that the Federal Arbitration Act governs the interpretation and enforcement of the Arbitration Agreement.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">22. Contact Us</h3>
              <p>Questions about these Terms: <a href="mailto:support@buybidhq.com" className="text-blue-600 hover:underline">support@buybidhq.com</a></p>
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default TermsDialog;
