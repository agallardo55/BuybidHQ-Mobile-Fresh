import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users } from "lucide-react";

interface TableNavigationProps {
  activeTab: 'dealerships' | 'account-admins';
  onTabChange: (tab: 'dealerships' | 'account-admins') => void;
}

export const TableNavigation = ({ activeTab, onTabChange }: TableNavigationProps) => {
  return (
    <div className="mb-6">
      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as 'dealerships' | 'account-admins')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="dealerships" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Dealerships
          </TabsTrigger>
          <TabsTrigger value="account-admins" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Account Admins
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default TableNavigation;