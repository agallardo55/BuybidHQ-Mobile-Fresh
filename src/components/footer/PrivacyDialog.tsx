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
          <DialogTitle>Privacy Policy</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">1. Information Collection</h3>
            <p>
              We collect information that you provide directly to us, including personal information such as your name, email address, and business details.
            </p>

            <h3 className="text-lg font-semibold">2. Use of Information</h3>
            <p>
              We use the information we collect to provide, maintain, and improve our services, and to communicate with you about your account and updates.
            </p>

            <h3 className="text-lg font-semibold">3. Data Security</h3>
            <p>
              We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.
            </p>

            <h3 className="text-lg font-semibold">4. Your Rights</h3>
            <p>
              You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.
            </p>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyDialog;
