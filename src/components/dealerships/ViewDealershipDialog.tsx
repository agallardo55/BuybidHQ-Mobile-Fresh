import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Dealership } from "@/types/dealerships";
interface ViewDealershipDialogProps {
  dealership: Dealership | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}
const ViewDealershipDialog = ({
  dealership,
  isOpen,
  onOpenChange
}: ViewDealershipDialogProps) => {
  if (!dealership) return null;
  return <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>View Dealership Details</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Basic Information</h3>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Dealership Name</p>
                  <p className="text-sm">{dealership.dealer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dealer ID</p>
                  <p className="text-sm">{dealership.dealer_id || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-1">Contact Information</h3>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Business Phone</p>
                  <p className="text-sm">{dealership.business_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Business Email</p>
                  <p className="text-sm">{dealership.business_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Website</p>
                  <p className="text-sm">{dealership.website || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-1">Dealer Admin</h3>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-sm">
                    {dealership.primary_dealer?.full_name || 'Not Assigned'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm">
                    {dealership.primary_dealer?.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm">
                    {dealership.primary_dealer?.mobile_number || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Location</h3>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-sm">{dealership.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="text-sm">{dealership.city || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">State</p>
                  <p className="text-sm">{dealership.state || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ZIP Code</p>
                  <p className="text-sm">{dealership.zip_code || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-1">Additional Information</h3>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <p className="text-sm text-gray-500">License Number</p>
                  <p className="text-sm">{dealership.license_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-sm">{dealership.notes || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};
export default ViewDealershipDialog;