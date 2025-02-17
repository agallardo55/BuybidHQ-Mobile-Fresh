
import { useState } from "react";
import { Buyer, BuyerFormData } from "@/types/buyers";
import { useBuyers } from "@/hooks/useBuyers";

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
  phoneCarrier: "",
};

export const useBuyersState = () => {
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

  return {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    isDialogOpen,
    setIsDialogOpen,
    isViewDialogOpen,
    setIsViewDialogOpen,
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
  };
};
