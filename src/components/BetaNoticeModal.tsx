import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

interface BetaNoticeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BetaNoticeModal = ({ open, onOpenChange }: BetaNoticeModalProps) => {
  const handleUnderstand = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        {/* Blue Header Section */}
        <div className="bg-blue-600 px-6 py-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-white text-sm font-semibold tracking-wider uppercase">
              PUBLIC BETA
            </p>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="px-6 py-6">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-bold mb-4">
              Welcome to the new experience
            </DialogTitle>
            <DialogDescription className="text-base text-gray-700 leading-relaxed">
              We are currently in{" "}
              <span className="text-blue-600 font-semibold">Beta Testing</span>.
              During this phase, you may encounter bugs or errors in the application. 
              We appreciate your patience and feedback as we continue to improve the platform.
            </DialogDescription>
          </DialogHeader>

          {/* Action Button */}
          <div className="mt-6">
            <Button
              onClick={handleUnderstand}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-medium"
            >
              I Understand
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

