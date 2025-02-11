import { useState } from "react";
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

const Buyers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const itemsPerPage = 5;

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

  const handleFormDataChange = (data: Partial<BuyerFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New buyer data:", formData);
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
  };

  const buyers: Buyer[] = [
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@email.com",
      dealership: "Smith Auto Sales",
      phone: "(555) 123-4567",
      location: "Los Angeles, CA",
      acceptedBids: 12,
      pendingBids: 4,
      declinedBids: 3,
    },
    {
      id: "2",
      name: "Sarah Williams",
      email: "sarah.w@email.com",
      dealership: "Williams Motors",
      phone: "(555) 234-5678",
      location: "New York, NY",
      acceptedBids: 18,
      pendingBids: 6,
      declinedBids: 5,
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike.j@email.com",
      dealership: "Johnson Dealership",
      phone: "(555) 345-6789",
      location: "Chicago, IL",
      acceptedBids: 6,
      pendingBids: 3,
      declinedBids: 2,
    },
    {
      id: "4",
      name: "Emily Brown",
      email: "emily.b@email.com",
      dealership: "Brown Auto Group",
      phone: "(555) 456-7890",
      location: "Houston, TX",
      acceptedBids: 15,
      pendingBids: 8,
      declinedBids: 4,
    },
    {
      id: "5",
      name: "David Wilson",
      email: "david.w@email.com",
      dealership: "Wilson Cars",
      phone: "(555) 567-8901",
      location: "Miami, FL",
      acceptedBids: 9,
      pendingBids: 4,
      declinedBids: 3,
    },
    {
      id: "6",
      name: "Lisa Anderson",
      email: "lisa.a@email.com",
      dealership: "Anderson Autos",
      phone: "(555) 678-9012",
      location: "Seattle, WA",
      acceptedBids: 22,
      pendingBids: 7,
      declinedBids: 6,
    }
  ];

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
