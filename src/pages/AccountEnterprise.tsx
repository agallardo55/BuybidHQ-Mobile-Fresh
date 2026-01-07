import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "@/hooks/useAccount";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Section imports (will be created)
import { ProfileSettingsSection } from "@/components/account-enterprise/ProfileSettingsSection";
import { DealershipConfigSection } from "@/components/account-enterprise/DealershipConfigSection";
import { CredentialSecuritySection } from "@/components/account-enterprise/CredentialSecuritySection";
import { NotificationPreferencesSection } from "@/components/account-enterprise/NotificationPreferencesSection";
import { MembershipTierSection } from "@/components/account-enterprise/MembershipTierSection";

type AccountSection =
  | "profile"
  | "dealership"
  | "security"
  | "notifications"
  | "billing";

const NAVIGATION_ITEMS: { id: AccountSection; label: string }[] = [
  { id: "profile", label: "PROFILE SETTINGS" },
  { id: "dealership", label: "DEALERSHIP INFORMATION" },
  { id: "security", label: "CREDENTIAL SECURITY" },
  { id: "notifications", label: "NOTIFICATION SYSTEM" },
  { id: "billing", label: "MEMBERSHIP TIER" },
];

const AccountEnterprise = () => {
  const { currentUser, isLoading } = useCurrentUser();
  const { account } = useAccount();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<AccountSection>("profile");

  useEffect(() => {
    const isCanceled = searchParams.get('canceled') === 'true';
    const isSuccess = searchParams.get('success') === 'true';

    if (isCanceled) {
      const currentPlan = account?.plan || 'free';
      const planName = currentPlan === 'free' ? 'Baseline' :
                      currentPlan === 'connect' ? 'Connect Premium' :
                      currentPlan === 'annual' ? 'Enterprise' : 'current';

      toast({
        title: "Transaction Cancelled",
        description: `Subscription modification cancelled. Active plan: ${planName}`,
        variant: "destructive",
      });

      window.history.replaceState({}, '', '/account');
    }

    if (isSuccess) {
      // Refetch account data to show updated plan
      queryClient.invalidateQueries({ queryKey: ['account'] });

      toast({
        title: "Transaction Completed",
        description: "Subscription updated successfully.",
        variant: "default",
      });

      window.history.replaceState({}, '', '/account');
    }
  }, [searchParams, toast, queryClient, account?.plan]);

  // Check for tab parameter in URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && NAVIGATION_ITEMS.some(item => item.id === tab)) {
      setActiveSection(tab as AccountSection);
    }
  }, [searchParams]);

  const renderSection = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      );
    }

    switch (activeSection) {
      case "profile":
        return <ProfileSettingsSection user={currentUser} />;
      case "dealership":
        return <DealershipConfigSection user={currentUser} />;
      case "security":
        return <CredentialSecuritySection user={currentUser} />;
      case "notifications":
        return <NotificationPreferencesSection user={currentUser} />;
      case "billing":
        return <MembershipTierSection account={account} user={currentUser} />;
      default:
        return <ProfileSettingsSection user={currentUser} />;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 pt-20">
        <div className="flex">
          {/* Fixed Sidebar Navigation */}
          <aside className="w-72 bg-white border-r border-slate-200 min-h-screen fixed left-0 top-0 pt-20">
            <div className="p-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-6">
                ACCOUNT MANAGEMENT
              </h2>
              <nav className="space-y-1">
                {NAVIGATION_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 text-[11px] font-medium uppercase tracking-widest transition-colors",
                      activeSection === item.id
                        ? "bg-brand text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="ml-72 flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              {renderSection()}
            </div>
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountEnterprise;
