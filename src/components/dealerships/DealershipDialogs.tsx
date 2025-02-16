
import { Dealership, DealershipFormData } from "@/types/dealerships";
import DealershipForm from "./DealershipForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DealershipDialogsProps {
  selectedDealership: Dealership | null;
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  onCreateSubmit: (data: DealershipFormData) => Promise<void>;
  onUpdateSubmit: (data: DealershipFormData) => Promise<void>;
  onDeleteSubmit: () => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
}

const DealershipDialogs = ({
  selectedDealership,
  isCreateDialogOpen,
  isEditDialogOpen,
  isDeleteDialogOpen,
  setIsCreateDialogOpen,
  setIsEditDialogOpen,
  setIsDeleteDialogOpen,
  onCreateSubmit,
  onUpdateSubmit,
  onDeleteSubmit,
  isCreating,
  isUpdating,
}: DealershipDialogsProps) => {
  return (
    <>
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Dealership</DialogTitle>
          </DialogHeader>
          <DealershipForm
            onSubmit={onCreateSubmit}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={isCreating}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Dealership</DialogTitle>
          </DialogHeader>
          {selectedDealership && (
            <DealershipForm
              initialData={{
                dealerName: selectedDealership.dealer_name,
                dealerId: selectedDealership.dealer_id || "",
                businessPhone: selectedDealership.business_phone,
                businessEmail: selectedDealership.business_email,
                address: selectedDealership.address || "",
                city: selectedDealership.city || "",
                state: selectedDealership.state || "",
                zipCode: selectedDealership.zip_code || "",
                licenseNumber: selectedDealership.license_number || "",
                website: selectedDealership.website || "",
                notes: selectedDealership.notes || "",
              }}
              onSubmit={onUpdateSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
              isSubmitting={isUpdating}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the dealership. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteSubmit}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DealershipDialogs;
