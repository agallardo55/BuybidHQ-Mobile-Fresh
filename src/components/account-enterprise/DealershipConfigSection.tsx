import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserData } from "@/hooks/useCurrentUser";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DealershipConfigSectionProps {
  user: UserData | null | undefined;
}

export const DealershipConfigSection = ({ user }: DealershipConfigSectionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    business_name: "",
    license_number: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    business_phone: "",
    business_email: "",
  });

  useEffect(() => {
    const fetchDealershipData = async () => {
      if (!user?.id) return;

      const { data } = await supabase
        .from("individual_dealers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setFormData({
          business_name: data.business_name || "",
          license_number: data.license_number || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          zip_code: data.zip_code || "",
          business_phone: data.business_phone || "",
          business_email: data.business_email || "",
        });
      }
    };

    fetchDealershipData();
  }, [user?.id]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("individual_dealers")
        .upsert({
          user_id: user?.id,
          ...formData,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success("Dealership configuration committed successfully");
    } catch (error: any) {
      toast.error(`Operation failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">DEALERSHIP INFORMATION</h1>
        <p className="text-xs uppercase tracking-widest text-slate-500 mt-2">
          BUSINESS ENTITY REGISTRY
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Information */}
        <Card className="border-slate-200 shadow-none">
          <div className="p-6 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 pb-3 border-b border-slate-200">
              BUSINESS INFORMATION
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                  BUSINESS NAME
                </Label>
                <Input
                  value={formData.business_name}
                  onChange={(e) => handleChange("business_name", e.target.value)}
                  className="bg-white border-slate-200 h-10"
                  placeholder="Enter business name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                  LICENSE NUMBER
                </Label>
                <Input
                  value={formData.license_number}
                  onChange={(e) => handleChange("license_number", e.target.value)}
                  className="bg-white border-slate-200 h-10"
                  placeholder="Enter license number"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                  BUSINESS PHONE
                </Label>
                <Input
                  value={formData.business_phone}
                  onChange={(e) => handleChange("business_phone", e.target.value)}
                  className="bg-white border-slate-200 h-10"
                  placeholder="(000) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                  BUSINESS EMAIL
                </Label>
                <Input
                  value={formData.business_email}
                  onChange={(e) => handleChange("business_email", e.target.value)}
                  className="bg-white border-slate-200 h-10"
                  placeholder="business@example.com"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Location Registry */}
        <Card className="border-slate-200 shadow-none">
          <div className="p-6 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 pb-3 border-b border-slate-200">
              LOCATION REGISTRY
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                  STREET ADDRESS
                </Label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="bg-white border-slate-200 h-10"
                  placeholder="Enter street address"
                />
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                    CITY
                  </Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="bg-white border-slate-200 h-10"
                    placeholder="Enter city"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                    STATE
                  </Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className="bg-white border-slate-200 h-10"
                    placeholder="Enter state"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                    ZIP CODE
                  </Label>
                  <Input
                    value={formData.zip_code}
                    onChange={(e) => handleChange("zip_code", e.target.value)}
                    className="bg-white border-slate-200 h-10"
                    placeholder="00000"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand hover:bg-brand/90 text-white h-10 px-6 text-xs font-medium uppercase tracking-widest"
        >
          {isSubmitting ? "PROCESSING..." : "COMMIT CHANGES"}
        </Button>
      </form>
    </div>
  );
};
