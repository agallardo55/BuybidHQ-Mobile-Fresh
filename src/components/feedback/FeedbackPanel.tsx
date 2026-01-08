import { useState } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface FeedbackPanelProps {
  onClose: () => void;
}

type FeedbackType = "bug" | "feedback" | "request";

export const FeedbackPanel = ({ onClose }: FeedbackPanelProps) => {
  const { data: user } = useCurrentUser();
  const [selectedType, setSelectedType] = useState<FeedbackType>("feedback");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async () => {
    if (!message.trim()) {
      setStatusMessage({ type: "error", text: "Please enter a message" });
      setTimeout(() => setStatusMessage(null), 2000);
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      // Insert feedback into database
      const { error: insertError } = await supabase
        .from("feedback")
        .insert({
          user_id: user?.id,
          type: selectedType,
          message: message.trim(),
        });

      if (insertError) throw insertError;

      // Call Edge Function to send email
      const { error: emailError } = await supabase.functions.invoke("send-feedback-email", {
        body: {
          type: selectedType,
          message: message.trim(),
          userEmail: user?.email,
          userName: user?.full_name,
        },
      });

      if (emailError) {
        console.error("Email send failed:", emailError);
        // Don't throw - feedback is saved, email is secondary
      }

      // Show success message
      setStatusMessage({ type: "success", text: `${selectedType.toUpperCase()} RECEIVED` });
      setMessage("");

      // Close panel after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error("Feedback submission error:", error);
      setStatusMessage({ type: "error", text: `Failed to submit: ${error.message}` });
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-6 w-[336px] bg-white rounded-lg shadow-2xl border border-slate-200 z-[9999]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Submit Ticket
        </h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Type Selection */}
        {!statusMessage && <div className="flex gap-2">
          <Button
            onClick={() => setSelectedType("bug")}
            variant={selectedType === "bug" ? "default" : "outline"}
            className={`flex-1 h-8 text-xs font-medium uppercase tracking-wide ${
              selectedType === "bug"
                ? "bg-brand text-white hover:bg-brand/90"
                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Bug
          </Button>
          <Button
            onClick={() => setSelectedType("feedback")}
            variant={selectedType === "feedback" ? "default" : "outline"}
            className={`flex-1 h-8 text-xs font-medium uppercase tracking-wide ${
              selectedType === "feedback"
                ? "bg-brand text-white hover:bg-brand/90"
                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Feedback
          </Button>
          <Button
            onClick={() => setSelectedType("request")}
            variant={selectedType === "request" ? "default" : "outline"}
            className={`flex-1 h-8 text-xs font-medium uppercase tracking-wide ${
              selectedType === "request"
                ? "bg-brand text-white hover:bg-brand/90"
                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Request
          </Button>
        </div>}

        {/* Message Textarea */}
        {!statusMessage && <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your feedback..."
          className="min-h-[140px] resize-none bg-white border-slate-200 text-sm text-slate-900 placeholder:text-slate-400"
        />}

        {/* Status Message */}
        {statusMessage && (
          <div className="flex flex-col items-center justify-center py-6">
            {statusMessage.type === "success" ? (
              <>
                {/* Green checkmark circle */}
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Check className="w-10 h-10 text-green-600 stroke-[3]" />
                </div>
                {/* Title */}
                <h3 className="text-sm font-bold text-slate-900 tracking-wide mb-1">
                  {statusMessage.text}
                </h3>
                {/* Subtitle */}
                <p className="text-xs text-slate-500 font-medium">
                  WE'LL PROCESS THIS IMMEDIATELY.
                </p>
              </>
            ) : (
              <div className="px-3 py-2 rounded text-xs font-medium text-center bg-red-50 text-red-700 border border-red-200">
                {statusMessage.text}
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        {!statusMessage && <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !message.trim()}
          className="w-full h-9 text-xs bg-brand hover:bg-brand/90 text-white font-medium uppercase tracking-widest disabled:opacity-50"
        >
          {isSubmitting ? "Sending..." : `Send ${selectedType}`}
        </Button>}
      </div>
    </div>
  );
};
