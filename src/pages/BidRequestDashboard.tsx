
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import DashboardNavigation from "@/components/DashboardNavigation";
import AdminFooter from "@/components/footer/AdminFooter";
import SearchHeader from "@/components/bid-request/SearchHeader";
import BidRequestTable from "@/components/bid-request/BidRequestTable";
import TableFooter from "@/components/bid-request/TableFooter";
import { BidRequest } from "@/components/bid-request/types";

const BidRequestDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [bidRequests, setBidRequests] = useState<BidRequest[]>([
    {
      id: "1",
      year: 2020,
      make: "Toyota",
      model: "Camry",
      trim: "SE",
      vin: "1HGCM82633A123456",
      mileage: 45000,
      buyer: "John Smith",
      dealership: "ABC Motors",
      highestOffer: 18500,
      status: "Pending"
    },
    {
      id: "2",
      year: 2019,
      make: "Honda",
      model: "CR-V",
      trim: "EX-L",
      vin: "2HKRW2H54JH123456",
      mileage: 35000,
      buyer: "Sarah Johnson",
      dealership: "XYZ Auto",
      highestOffer: 22000,
      status: "Approved"
    },
    {
      id: "3",
      year: 2021,
      make: "Ford",
      model: "F-150",
      trim: "XLT",
      vin: "1FTEW1E53MFB12345",
      mileage: 28000,
      buyer: "Michael Brown",
      dealership: "Premium Cars",
      highestOffer: 35000,
      status: "Declined"
    }
  ]);
  const { toast } = useToast();

  const updateStatus = async (id: string, newStatus: "Pending" | "Approved" | "Declined") => {
    setBidRequests(prevRequests =>
      prevRequests.map(request =>
        request.id === id ? { ...request, status: newStatus } : request
      )
    );

    toast({
      title: "Status Updated",
      description: `Bid request status changed to ${newStatus}`,
    });
  };

  const filteredRequests = bidRequests.filter((request) => {
    const searchString = searchTerm.toLowerCase();
    return (
      request.year.toString().includes(searchString) ||
      request.make.toLowerCase().includes(searchString) ||
      request.model.toLowerCase().includes(searchString) ||
      request.buyer.toLowerCase().includes(searchString) ||
      request.dealership.toLowerCase().includes(searchString) ||
      request.status.toLowerCase().includes(searchString)
    );
  });

  const totalPages = Math.ceil(filteredRequests.length / pageSize);

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    return range;
  };

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRequests = filteredRequests.slice(
    startIndex,
    startIndex + pageSize
  );

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardNavigation />

      <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-6 flex-grow">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <SearchHeader 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
            
            <BidRequestTable 
              requests={paginatedRequests}
              onStatusUpdate={updateStatus}
            />

            <TableFooter
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredRequests.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={handlePageSizeChange}
              getPageNumbers={getPageNumbers}
            />
          </div>
        </div>
      </div>

      <AdminFooter />
    </div>
  );
};

export default BidRequestDashboard;
