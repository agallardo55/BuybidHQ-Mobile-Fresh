
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/types/users";
import { cn } from "@/lib/utils";

interface ViewUserDialogProps {
  user: User | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ViewUserDialog = ({ user, isOpen, onOpenChange }: ViewUserDialogProps) => {
  if (!user) return null;

  const InfoRow = ({ label, value }: { label: string; value: string | null }) => (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 col-span-2">{value || 'N/A'}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="personal" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="dealership">Dealership</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="mt-4 space-y-0">
            <InfoRow label="Full Name" value={user.full_name} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Role" value={user.role} />
            <InfoRow label="Status" value={user.status} />
            <InfoRow label="Mobile Number" value={user.mobile_number} />
            <InfoRow label="Address" value={user.address} />
            <InfoRow label="City" value={user.city} />
            <InfoRow label="State" value={user.state} />
            <InfoRow label="ZIP Code" value={user.zip_code} />
            
            <div className={cn(
              "mt-4 px-2 py-1 text-xs font-medium rounded-full w-fit",
              user.is_active
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            )}>
              {user.is_active ? "Active" : "Inactive"}
            </div>
          </TabsContent>
          
          <TabsContent value="dealership" className="mt-4 space-y-0">
            {user.dealership ? (
              <>
                <InfoRow label="Dealership Name" value={user.dealership.dealer_name} />
                <InfoRow label="Dealer ID" value={user.dealership.dealer_id} />
                <InfoRow label="Business Phone" value={user.dealership.business_phone} />
                <InfoRow label="Business Email" value={user.dealership.business_email} />
                <InfoRow label="Address" value={user.dealership.address} />
                <InfoRow label="City" value={user.dealership.city} />
                <InfoRow label="State" value={user.dealership.state} />
                <InfoRow label="ZIP Code" value={user.dealership.zip_code} />
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No dealership information available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ViewUserDialog;
