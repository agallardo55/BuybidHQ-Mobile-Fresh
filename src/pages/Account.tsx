
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

const Account = () => {
  const { currentUser, isLoading } = useCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 flex-grow">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Account Settings</h1>
          
          <ProfileImageSection />
          
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="mb-4 w-full flex flex-wrap gap-2">
              <TabsTrigger value="personal" className="flex-1">Personal</TabsTrigger>
              {!isAdmin && <TabsTrigger value="dealership" className="flex-1">Dealership</TabsTrigger>}
              <TabsTrigger value="security" className="flex-1">Security</TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
              {!isAdmin && <TabsTrigger value="subscription" className="flex-1">Subscription</TabsTrigger>}
            </TabsList>

            <TabsContent value="personal">
              <PersonalInfoTab />
            </TabsContent>

            {!isAdmin && (
              <TabsContent value="dealership">
                <DealershipTab />
              </TabsContent>
            )}

            <TabsContent value="security">
              <SecurityTab />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsTab />
            </TabsContent>

            {!isAdmin && (
              <TabsContent value="subscription">
                <SubscriptionTab />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Account;
