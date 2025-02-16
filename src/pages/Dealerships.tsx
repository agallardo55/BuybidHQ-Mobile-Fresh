
import { useState } from "react";
import DashboardNavigation from "@/components/DashboardNavigation";
import AdminFooter from "@/components/footer/AdminFooter";
import { useDealershipsQuery } from "@/hooks/dealerships/useDealershipsQuery";
import { useDealershipMutations } from "@/hooks/dealerships/useDealershipMutations";
import { Dealership, DealershipFormData } from "@/types/dealerships";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import DealershipForm from "@/components/dealerships/DealershipForm";
import DealershipTableFooter from "@/components/dealerships/DealershipTableFooter";

const Dealerships = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedDealership, setSelectedDealership] = useState<Dealership | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data, isLoading } = useDealershipsQuery({
    pageSize,
    currentPage,
    searchTerm,
  });

  const dealerships = data?.dealerships || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const mutations = useDealershipMutations();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCreateDealership = async (formData: DealershipFormData) => {
    try {
      await mutations.createDealership.mutateAsync(formData);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating dealership:', error);
    }
  };

  const handleUpdateDealership = async (formData: DealershipFormData) => {
    if (!selectedDealership) return;
    
    try {
      await mutations.updateDealership.mutateAsync({
        id: selectedDealership.id,
        data: formData
      });
      setIsEditDialogOpen(false);
      setSelectedDealership(null);
    } catch (error) {
      console.error('Error updating dealership:', error);
    }
  };

  const handleDeleteDealership = async () => {
    if (!selectedDealership) return;
    
    try {
      await mutations.deleteDealership.mutateAsync(selectedDealership.id);
      setIsDeleteDialogOpen(false);
      setSelectedDealership(null);
    } catch (error) {
      console.error('Error deleting dealership:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F6F6F7]">
        <DashboardNavigation />
        <div className="pt-24 px-4 sm:px-8 flex-grow">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              Loading dealerships...
            </div>
          </div>
        </div>
        <AdminFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F6F7]">
      <DashboardNavigation />

      <div className="pt-24 px-4 sm:px-8 flex-grow">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Dealerships</h1>
              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 sm:items-center">
                <Input
                  placeholder="Search dealerships..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="max

-w-xs"
                />
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-accent hover:bg-accent/90">
                      <Plus className="mr-2 h-4 w-4" /> Add Dealership
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Add New Dealership</DialogTitle>
                    </DialogHeader>
                    <DealershipForm
                      onSubmit={handleCreateDealership}
                      onCancel={() => setIsCreateDialogOpen(false)}
                      isSubmitting={mutations.createDealership.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dealership Name</TableHead>
                    <TableHead>Dealer ID</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Primary Dealer</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dealerships.map((dealership) => (
                    <TableRow key={dealership.id}>
                      <TableCell className="font-medium">{dealership.dealer_name}</TableCell>
                      <TableCell>{dealership.dealer_id}</TableCell>
                      <TableCell>
                        <div>{dealership.business_phone}</div>
                        <div className="text-sm text-gray-500">{dealership.business_email}</div>
                      </TableCell>
                      <TableCell>
                        <div>{dealership.city}</div>
                        <div className="text-sm text-gray-500">{dealership.state}</div>
                      </TableCell>
                      <TableCell>
                        <div>{dealership.primary_dealer?.full_name}</div>
                        <div className="text-sm text-gray-500">{dealership.primary_dealer?.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedDealership(dealership);
                              // Add view action here
                            }}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedDealership(dealership);
                              setIsEditDialogOpen(true);
                            }}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedDealership(dealership);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <DealershipTableFooter
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              total={total}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </div>
      </div>

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
              onSubmit={handleUpdateDealership}
              onCancel={() => setIsEditDialogOpen(false)}
              isSubmitting={mutations.updateDealership.isPending}
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
              onClick={handleDeleteDealership}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AdminFooter />
    </div>
  );
};

export default Dealerships;
