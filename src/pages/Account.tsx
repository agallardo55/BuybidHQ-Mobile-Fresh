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
import { Skeleton } from "@/components/ui/skeleton";

const Account = () => {
  const { currentUser, isLoading } = useCurrentUser();
  const { account } = useAccount();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const isAdmin = currentUser?.role === 'admin';

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
        variant: "destructive",
      });
      
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
      
      window.history.replaceState({}, '', '/account');
    }
  }, [searchParams, toast, account?.plan]);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 flex-grow">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Account Settings</h1>
          
          {isLoading ? (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : (
            <>
              <ProfileImageSection />
              
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="mb-4 w-full flex flex-nowrap overflow-x-auto gap-2">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="dealership">Dealership</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="subscription">Subscription</TabsTrigger>
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
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Account;
