import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserData } from "@/hooks/useCurrentUser";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/notificationToast";
import { useQueryClient } from "@tanstack/react-query";
import { formatPhoneForInput, formatPhoneForDisplay } from "@/utils/phoneUtils";

interface ProfileSettingsSectionProps {
  user: UserData | null | undefined;
}

export const ProfileSettingsSection = ({ user }: ProfileSettingsSectionProps) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    mobile_number: formatPhoneForDisplay(user?.mobile_number) || "",
    role: user?.role || "",
  });

  const handleChange = (field: string, value: string) => {
    // Format phone number if the field is mobile_number
    const formattedValue = field === 'mobile_number' ? formatPhoneForInput(value) : value;
    setFormData((prev) => ({ ...prev, [field]: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("buybidhq_users")
        .update({
          full_name: formData.full_name,
          mobile_number: formData.mobile_number,
        })
        .eq("id", user?.id);

      if (error) throw error;

      // Invalidate currentUser cache so profile completion recalculates with new data
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });

      toast.success("Profile modifications committed successfully");
    } catch (error: any) {
      toast.error(`Operation failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">PROFILE SETTINGS</h1>
        <p className="text-xs uppercase tracking-widest text-slate-500 mt-2">
          USER IDENTITY CONFIGURATION
        </p>
      </div>

      <Card className="border-slate-200 shadow-none">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                FULL NAME
              </Label>
              <Input
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                className="bg-white border-slate-200 h-10"
                placeholder="Enter full name"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                EMAIL ADDRESS
              </Label>
              <Input
                value={formData.email}
                disabled
                className="bg-slate-50 border-slate-200 h-10 text-slate-500"
              />
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                CONTACT SUPPORT TO MODIFY
              </p>
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                MOBILE NUMBER
              </Label>
              <Input
                type="tel"
                value={formData.mobile_number}
                onChange={(e) => handleChange("mobile_number", e.target.value)}
                className="bg-white border-slate-200 h-10"
                placeholder="(000) 000-0000"
                maxLength={14}
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                SYSTEM ROLE
              </Label>
              <Input
                value={formData.role}
                disabled
                className="bg-slate-50 border-slate-200 h-10 text-slate-500 uppercase"
              />
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                ASSIGNED BY ADMINISTRATOR
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand hover:bg-brand/90 text-white h-10 px-6 text-xs font-medium uppercase tracking-widest"
            >
              {isSubmitting ? "PROCESSING..." : "UPDATE"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
