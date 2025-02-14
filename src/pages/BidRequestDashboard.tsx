
import { useState } from "react";
import DashboardNavigation from "@/components/DashboardNavigation";
import AdminFooter from "@/components/footer/AdminFooter";
import SearchHeader from "@/components/bid-request/SearchHeader";
import BidRequestTable from "@/components/bid-request/BidRequestTable";
import TableFooter from "@/components/bid-request/TableFooter";
import { useBidRequests } from "@/hooks/useBidRequests";

const BidRequestDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { bidRequests, isLoading, updateBidRequest } = useBidRequests();

  const updateStatus = async (id: string, newStatus: "Pending" | "Approved" | "Declined") => {
    updateBidRequest({ id, status: newStatus });
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
            
            {isLoading ? (
              <div className="text-center py-4">Loading bid requests...</div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      <AdminFooter />
    </div>
  );
};

export default BidRequestDashboard;
