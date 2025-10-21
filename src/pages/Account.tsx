
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PersonalInfoTab } from "@/components/account/PersonalInfoTab";
import { DealershipTab } from "@/components/account/DealershipTab";
import { SubscriptionTab } from "@/components/account/SubscriptionTab";
import { SecurityTab } from "@/components/account/SecurityTab";
import { SettingsTab } from "@/components/account/SettingsTab";
import { ProfileImageSection } from "@/components/account/ProfileImageSection";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "@/hooks/useAccount";

const Account = () => {
  const { currentUser, isLoading } = useCurrentUser();
  const { account } = useAccount();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const isAdmin = currentUser?.role === 'admin';

  // Handle Stripe checkout result messages
  useEffect(() => {
    const isCanceled = searchParams.get('canceled') === 'true';
    const isSuccess = searchParams.get('success') === 'true';
    
    if (isCanceled) {
      const currentPlan = account?.plan || 'free';
      const planName = currentPlan === 'free' ? 'Free' : 
                      currentPlan === 'connect' ? 'Connect' : 
                      currentPlan === 'annual' ? 'Annual' : 'current';
      
      toast({
        title: "Checkout Cancelled",
        description: `Your subscription upgrade was cancelled. You're still on the ${planName} plan. You can try upgrading again anytime from the Subscription tab.`,
        variant: "default",
      });
      
      // Clear the URL parameter
      window.history.replaceState({}, '', '/account');
    }
    
    if (isSuccess) {
      const currentPlan = account?.plan || 'free';
      const planName = currentPlan === 'free' ? 'Free' : 
                      currentPlan === 'connect' ? 'Connect' : 
                      currentPlan === 'annual' ? 'Annual' : 'current';
      
      toast({
        title: "Payment Successful",
        description: `Your subscription has been updated successfully! You're now on the ${planName} plan.`,
        variant: "default",
      });
      
      // Clear the URL parameter
      window.history.replaceState({}, '', '/account');
    }
  }, [searchParams, toast, account?.plan]);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 flex-grow">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Account Settings</h1>
          
          <ProfileImageSection />
          
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="mb-4 w-full flex flex-wrap gap-2">
              <TabsTrigger value="personal" className="flex-1">Personal</TabsTrigger>
              <TabsTrigger value="dealership" className="flex-1">Dealership</TabsTrigger>
              <TabsTrigger value="security" className="flex-1">Security</TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
              <TabsTrigger value="subscription" className="flex-1">Subscription</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <PersonalInfoTab />
            </TabsContent>

            <TabsContent value="dealership">
              <DealershipTab />
            </TabsContent>

            <TabsContent value="security">
              <SecurityTab />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsTab />
            </TabsContent>

            <TabsContent value="subscription">
              <SubscriptionTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Account;
