import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import DashboardNavigation from "@/components/DashboardNavigation";
import AdminFooter from "@/components/footer/AdminFooter";
import SearchHeader from "@/components/bid-request/SearchHeader";
import BidRequestTable from "@/components/bid-request/BidRequestTable";
import TableFooter from "@/components/bid-request/TableFooter";
import { BidRequest } from "@/components/bid-request/types";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const BidRequestDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [bidRequests, setBidRequests] = useState<BidRequest[]>([]);
  const [lastRequestUrl, setLastRequestUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLastRequest = async () => {
      const { data, error } = await supabase
        .from('bid_requests')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        // For demo purposes, using a fixed buyer ID. In production, this should be dynamic
        const demoUrl = `/bid-response?request=${data.id}&buyer=cc051b17-ce03-440f-9e44-31b293d53460`;
        setLastRequestUrl(demoUrl);
      }
    };

    fetchLastRequest();
  }, []);

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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Bid Requests</h1>
              {lastRequestUrl && (
                <Link to={lastRequestUrl} target="_blank">
                  <Button variant="outline" className="border-custom-blue text-custom-blue hover:bg-custom-blue/10">
                    View Last Request
                  </Button>
                </Link>
              )}
            </div>
            
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
