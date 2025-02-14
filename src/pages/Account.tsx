
import DashboardNavigation from "@/components/DashboardNavigation";
import Footer from "@/components/Footer";
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
import { useCurrentUser } from "@/hooks/useCurrentUser";

const Account = () => {
  const { currentUser, isLoading } = useCurrentUser();
  const isDealer = currentUser?.role === 'dealer';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardNavigation />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 flex-grow">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Account Settings</h1>
          
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="mb-4 w-full flex flex-wrap gap-2">
              <TabsTrigger value="personal" className="flex-1">Personal</TabsTrigger>
              <TabsTrigger value="dealership" className="flex-1">Dealership</TabsTrigger>
              <TabsTrigger value="security" className="flex-1">Security</TabsTrigger>
              {!isDealer && (
                <TabsTrigger value="subscription" className="flex-1">Subscription</TabsTrigger>
              )}
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

            {!isDealer && (
              <TabsContent value="subscription">
                <SubscriptionTab />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Account;
