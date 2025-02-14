import { useState } from "react";
import DashboardNavigation from "@/components/DashboardNavigation";
import Footer from "@/components/Footer";
import { BuyerFormData, Buyer } from "@/types/buyers";
import { useBuyers } from "@/hooks/useBuyers";
import BuyersHeader from "@/components/buyers/BuyersHeader";
import BuyersList from "@/components/buyers/BuyersList";
import ViewBuyerDialog from "@/components/buyers/ViewBuyerDialog";
import DeleteBuyerDialog from "@/components/buyers/DeleteBuyerDialog";
import EditBuyerDialog from "@/components/buyers/EditBuyerDialog";

type SortConfig = {
  field: keyof Buyer | null;
  direction: 'asc' | 'desc' | null;
};

const defaultFormData: BuyerFormData = {
  fullName: "",
  email: "",
  mobileNumber: "",
  businessNumber: "",
  dealershipName: "",
  licenseNumber: "",
  dealershipAddress: "",
  city: "",
  state: "",
  zipCode: "",
};

const Buyers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [buyerToDelete, setBuyerToDelete] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', direction: 'asc' });
  const [formData, setFormData] = useState<BuyerFormData>(defaultFormData);

  const { buyers, isLoading, createBuyer, deleteBuyer, updateBuyer } = useBuyers();

  const handleSort = (field: keyof Buyer) => {
    setSortConfig((currentConfig) => {
      if (currentConfig.field === field) {
        if (currentConfig.direction === 'asc') {
          return { field, direction: 'desc' };
        } else if (currentConfig.direction === 'desc') {
          return { field: null, direction: null };
        }
      }
      return { field, direction: 'asc' };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBuyer(formData);
    setFormData(defaultFormData);
    setIsDialogOpen(false);
  };

  const sortBuyers = (buyers: Buyer[]) => {
    if (!sortConfig.field || !sortConfig.direction) {
      return buyers;
    }

    return [...buyers].sort((a, b) => {
      const aValue = a[sortConfig.field!];
      const bValue = b[sortConfig.field!];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const stringA = String(aValue).toLowerCase();
      const stringB = String(bValue).toLowerCase();
      
      return sortConfig.direction === 'asc'
        ? stringA.localeCompare(stringB)
        : stringB.localeCompare(stringA);
    });
  };

  const filteredBuyers = buyers.filter((buyer) => {
    const searchString = searchTerm.toLowerCase();
    return (
      buyer.name.toLowerCase().includes(searchString) ||
      buyer.email.toLowerCase().includes(searchString) ||
      buyer.location.toLowerCase().includes(searchString)
    );
  });

  const sortedBuyers = sortBuyers(filteredBuyers);
  const totalPages = Math.ceil(sortedBuyers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedBuyers = sortedBuyers.slice(
    startIndex,
    startIndex + pageSize
  );

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleFormDataChange = (data: Partial<BuyerFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const handleDelete = (buyerId: string) => {
    setBuyerToDelete(buyerId);
    setIsDeleteDialogOpen(true);
  };

  const handleView = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setIsEditDialogOpen(true);
  };

  const confirmDelete = (reason?: string) => {
    if (buyerToDelete) {
      deleteBuyer(buyerToDelete);
      setBuyerToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F6F6F7]">
        <DashboardNavigation />
        <div className="pt-24 px-4 sm:px-8 flex-grow">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              Loading buyers...
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F6F7]">
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
              onView={handleView}
              onDelete={handleDelete}
              onEdit={handleEdit}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          </div>
        </div>
      </div>

      <ViewBuyerDialog
        buyer={selectedBuyer}
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />

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
