
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useDealershipsQuery } from "@/hooks/dealerships/useDealershipsQuery";
import { useDealershipMutations } from "@/hooks/dealerships/useDealershipMutations";
import { Dealership, DealershipFormData } from "@/types/dealerships";
import { DealershipWizardData } from "@/types/dealership-wizard";
import DealershipList from "@/components/dealerships/DealershipList";
import DealershipDialogs from "@/components/dealerships/DealershipDialogs";
import DealershipHeader from "@/components/dealerships/DealershipHeader";
import DealershipTableFooter from "@/components/dealerships/DealershipTableFooter";

const Dealerships = () => {
  // Dealerships management page
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

  const handleCreateDealership = async (wizardData: DealershipWizardData) => {
    try {
      await mutations.createDealership.mutateAsync(wizardData);
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
      <DashboardLayout>
        <div className="pt-20 px-6 lg:px-12 pb-20 sm:pb-8 flex-grow bg-slate-50/30">
          <div className="max-w-[1920px] mx-auto">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <div className="text-sm text-slate-600">Loading dealerships...</div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pt-20 px-6 lg:px-12 pb-20 sm:pb-8 flex-grow bg-slate-50/30">
        <div className="max-w-[1920px] mx-auto">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <DealershipHeader
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              setIsCreateDialogOpen={setIsCreateDialogOpen}
            />

            <DealershipList
              dealerships={dealerships}
              onEdit={(dealership) => {
                setSelectedDealership(dealership);
                setIsEditDialogOpen(true);
              }}
              onDelete={(dealership) => {
                setSelectedDealership(dealership);
                setIsDeleteDialogOpen(true);
              }}
            />

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

      <DealershipDialogs
        selectedDealership={selectedDealership}
        isCreateDialogOpen={isCreateDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsCreateDialogOpen={setIsCreateDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        onCreateSubmit={handleCreateDealership}
        onUpdateSubmit={handleUpdateDealership}
        onDeleteSubmit={handleDeleteDealership}
        isCreating={mutations.createDealership.isPending}
        isUpdating={mutations.updateDealership.isPending}
      />
    </DashboardLayout>
  );
};

export default Dealerships;
