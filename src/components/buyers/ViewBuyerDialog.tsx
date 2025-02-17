
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Buyer } from "@/types/buyers";
import { cn } from "@/lib/utils";

interface ViewBuyerDialogProps {
  buyer: Buyer | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ViewBuyerDialog = ({ buyer, isOpen, onOpenChange }: ViewBuyerDialogProps) => {
  if (!buyer) return null;

  const InfoRow = ({ label, value }: { label: string; value: string | number | null }) => (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 col-span-2">{value || 'N/A'}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Buyer Details</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <InfoRow label="Name" value={buyer.name} />
          <InfoRow label="Email" value={buyer.email} />
          <InfoRow label="Dealership" value={buyer.dealership} />
          <InfoRow label="Mobile Number" value={buyer.mobileNumber} />
          <InfoRow label="Business Number" value={buyer.businessNumber} />
          <InfoRow label="Mobile Carrier" value={buyer.phoneCarrier} />
          <InfoRow label="Location" value={buyer.location} />
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Owner Information</h4>
            <InfoRow label="Owner Name" value={buyer.ownerName} />
            <InfoRow label="Owner Email" value={buyer.ownerEmail} />
          </div>
          <div className="mt-4 border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Bid Statistics</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-2 rounded">
                <p className="text-xs text-green-600">Accepted</p>
                <p className="text-lg font-semibold text-green-700">{buyer.acceptedBids}</p>
              </div>
              <div className="bg-yellow-50 p-2 rounded">
                <p className="text-xs text-yellow-600">Pending</p>
                <p className="text-lg font-semibold text-yellow-700">{buyer.pendingBids}</p>
              </div>
              <div className="bg-red-50 p-2 rounded">
                <p className="text-xs text-red-600">Declined</p>
                <p className="text-lg font-semibold text-red-700">{buyer.declinedBids}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewBuyerDialog;
