
import DashboardNavigation from "@/components/DashboardNavigation";
import Footer from "@/components/Footer";
import BuyersHeader from "@/components/buyers/BuyersHeader";
import BuyersList from "@/components/buyers/BuyersList";
import DeleteBuyerDialog from "@/components/buyers/DeleteBuyerDialog";
import EditBuyerDialog from "@/components/buyers/EditBuyerDialog";
import BuyersLoading from "@/components/buyers/BuyersLoading";
import { useBuyersState } from "@/hooks/buyers/useBuyersState";
import { filterBuyers, sortBuyers, handleSort } from "@/utils/buyerUtils";
import { Buyer } from "@/types/buyers";
import { MappedBuyer } from "@/hooks/buyers/types";

const Buyers = () => {
  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    isDialogOpen,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    selectedBuyer,
    setSelectedBuyer,
    buyerToDelete,
    setBuyerToDelete,
    sortConfig,
    setSortConfig,
    formData,
    setFormData,
    buyers,
    isLoading,
    createBuyer,
    deleteBuyer,
    updateBuyer,
    defaultFormData,
  } = useBuyersState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBuyer(formData);
    setFormData(defaultFormData);
    setIsDialogOpen(false);
  };

  const handleDelete = (buyerId: string) => {
    setBuyerToDelete(buyerId);
    setIsDeleteDialogOpen(true);
  };


  const handleEdit = (buyer: MappedBuyer) => {
    // Convert MappedBuyer to Buyer
    const convertedBuyer: Buyer = {
      ...buyer,
    };
    setSelectedBuyer(convertedBuyer);
    setIsEditDialogOpen(true);
  };

  const confirmDelete = (reason?: string) => {
    if (buyerToDelete) {
      deleteBuyer({ buyerId: buyerToDelete, reason });
      setBuyerToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleFormDataChange = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  if (isLoading) {
    return <BuyersLoading />;
  }

  const filteredBuyers = filterBuyers(buyers as unknown as Buyer[], searchTerm);
  const sortedBuyers = sortBuyers(filteredBuyers, sortConfig);
  const totalPages = Math.ceil(sortedBuyers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedBuyers = sortedBuyers.slice(startIndex, startIndex + pageSize);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <DashboardNavigation />
      <div className="pt-24 px-4 sm:px-8 flex-grow pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <BuyersHeader
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
              formData={formData}
              onFormDataChange={handleFormDataChange}
              onSubmit={handleSubmit}
            />
            <BuyersList
              buyers={paginatedBuyers}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
              totalItems={filteredBuyers.length}
              onDelete={handleDelete}
              onEdit={handleEdit}
              sortConfig={sortConfig}
              onSort={(field) => handleSort(field, sortConfig, setSortConfig)}
            />
          </div>
        </div>
      </div>

      <EditBuyerDialog
        buyer={selectedBuyer}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdate={updateBuyer}
      />

      <DeleteBuyerDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
      />

      <Footer />
    </div>
  );
};

export default Buyers;
