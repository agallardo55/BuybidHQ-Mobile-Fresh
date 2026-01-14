import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Flag, ArrowRight, Bug, Heart, CheckCircle2, X } from "lucide-react";

interface BetaNoticeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BetaNoticeModal = ({ open, onOpenChange }: BetaNoticeModalProps) => {
  const handleGetStarted = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-0 gap-0" hideCloseButton>
        <VisuallyHidden>
          <DialogTitle>Beta Notice</DialogTitle>
          <DialogDescription>Information about the beta version of the application</DialogDescription>
        </VisuallyHidden>
        {/* Gradient Header Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 px-6 py-8 text-center">
          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Flag className="h-6 w-6 text-white" />
            </div>
            <p className="text-white text-xs font-semibold tracking-wider uppercase">
              PUBLIC BETA 2.0
            </p>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="px-8 py-8 bg-white">
          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-3 text-gray-900">
            Welcome to the new experience
          </h2>

          {/* Description */}
          <p className="text-center text-gray-600 text-sm leading-relaxed mb-6">
            We're currently in{" "}
            <span className="text-blue-600 font-semibold">Beta Testing</span>. You're among the first to explore the redesigned platform. While we've polished every pixel, you might encounter a few rough edges.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Found a Bug Card */}
            <div className="text-left">
              <div className="flex items-start gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <Bug className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    FOUND A BUG?
                  </h3>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed ml-10">
                Report errors instantly via the help menu to help us improve.
              </p>
            </div>

            {/* Your Feedback Card */}
            <div className="text-left">
              <div className="flex items-start gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <Heart className="h-4 w-4 text-pink-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    YOUR FEEDBACK
                  </h3>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed ml-10">
                Your suggestions directly influence our feature roadmap.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleGetStarted}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold rounded-lg shadow-sm"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          {/* Verified Badge */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <p className="text-xs text-gray-500">Verified Early Access User</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

