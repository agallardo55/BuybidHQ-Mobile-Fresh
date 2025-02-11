
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import DashboardNavigation from "@/components/DashboardNavigation";
import Footer from "@/components/Footer";
import { Buyer, BuyerFormData } from "@/types/buyers";
import BuyersTable from "@/components/buyers/BuyersTable";
import AddBuyerForm from "@/components/buyers/AddBuyerForm";
import BuyersSearch from "@/components/buyers/BuyersSearch";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Buyers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const itemsPerPage = 5;
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<BuyerFormData>({
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
  });

  const { data: buyers = [], isLoading } = useQuery({
    queryKey: ['buyers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buyers')
        .select('*');

      if (error) {
        toast.error("Failed to fetch buyers: " + error.message);
        throw error;
      }

      return data.map(buyer => ({
        id: buyer.id,
        name: buyer.buyer_name || '',
        email: buyer.email,
        dealership: buyer.dealer_name || '',
        phone: buyer.buyer_phone || '',
        location: `${buyer.city || ''}, ${buyer.state || ''}`,
        acceptedBids: 0, // These would need to be calculated from bid_requests table
        pendingBids: 0,
        declinedBids: 0,
      }));
    },
  });

  const createBuyerMutation = useMutation({
    mutationFn: async (buyerData: BuyerFormData) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('buyers')
        .insert([
          {
            user_id: userData.user.id,
            buyer_name: buyerData.fullName,
            email: buyerData.email,
            buyer_mobile: buyerData.mobileNumber,
            buyer_phone: buyerData.businessNumber,
            dealer_name: buyerData.dealershipName,
            dealer_number: buyerData.licenseNumber,
            address: buyerData.dealershipAddress,
            city: buyerData.city,
            state: buyerData.state,
            zip_code: buyerData.zipCode,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyers'] });
      toast.success("Buyer added successfully!");
      setIsDialogOpen(false);
      setFormData({
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
      });
    },
    onError: (error) => {
      toast.error("Failed to add buyer: " + error.message);
    },
  });

  const handleFormDataChange = (data: Partial<BuyerFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createBuyerMutation.mutate(formData);
  };

  const filteredBuyers = buyers.filter((buyer) => {
    const searchString = searchTerm.toLowerCase();
    return (
      buyer.name.toLowerCase().includes(searchString) ||
      buyer.email.toLowerCase().includes(searchString) ||
      buyer.location.toLowerCase().includes(searchString)
    );
  });

  const totalPages = Math.ceil(filteredBuyers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBuyers = filteredBuyers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Buyers</h1>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                <BuyersSearch 
                  searchTerm={searchTerm} 
                  onSearchChange={setSearchTerm} 
                />
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
                      <Plus className="h-4 w-4" />
                      Buyer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-[672px] h-[90vh] sm:h-auto overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Buyer</DialogTitle>
                    </DialogHeader>
                    <AddBuyerForm
                      onSubmit={handleSubmit}
                      formData={formData}
                      onFormDataChange={handleFormDataChange}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="overflow-x-auto">
              <BuyersTable buyers={paginatedBuyers} />
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <PaginationItem key={index + 1}>
                        <PaginationLink
                          onClick={() => setCurrentPage(index + 1)}
                          isActive={currentPage === index + 1}
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Buyers;
