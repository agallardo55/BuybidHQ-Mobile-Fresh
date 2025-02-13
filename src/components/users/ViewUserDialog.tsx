
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
        <div className="mt-4">
          <InfoRow label="Full Name" value={user.fullName} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Role" value={user.role} />
          <InfoRow label="Status" value={user.status} />
          <InfoRow label="Mobile Number" value={user.mobileNumber} />
          <InfoRow label="Address" value={user.address} />
          <InfoRow label="City" value={user.city} />
          <InfoRow label="State" value={user.state} />
          <InfoRow label="ZIP Code" value={user.zipCode} />
          <InfoRow label="Dealership" value={user.dealershipName} />
          <div className={cn(
            "mt-2 px-2 py-1 text-xs font-medium rounded-full w-fit",
            user.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          )}>
            {user.isActive ? "Active" : "Inactive"}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewUserDialog;
