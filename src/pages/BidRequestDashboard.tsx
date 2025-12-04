
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { createPortal } from "react-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchHeader from "@/components/bid-request/SearchHeader";
import BidRequestTable from "@/components/bid-request/BidRequestTable";
import TableFooter from "@/components/bid-request/TableFooter";
import { useBidRequestsForDashboard } from "@/hooks/bid-requests/useBidRequestsForDashboard";
import { BidRequest } from "@/components/bid-request/types";
import { DeleteBidRequestDialog } from "@/components/bid-request/DeleteBidRequestDialog";
import { useBidRequestDelete } from "@/hooks/bid-requests/useBidRequestDelete";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { BetaNoticeModal } from "@/components/BetaNoticeModal";
import { isAdmin } from "@/utils/auth-helpers";

type SortConfig = {
  field: keyof BidRequest | null;
  direction: 'asc' | 'desc' | null;
};

const BidRequestDashboard = () => {
  const { enrichUserProfile, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isMounted, setIsMounted] = useState(false);
  const [betaNoticeOpen, setBetaNoticeOpen] = useState(false);
  const isMobile = useIsMobile(); // Use the existing hook instead

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Trigger enrichment once after login
  useEffect(() => {
    enrichUserProfile().catch(err => {
      console.log('Background enrichment failed:', err);
    });
  }, []); // Only run once on mount

  // Show beta notice modal for non-super-admin users once per session
  useEffect(() => {
    if (!user) return;

    // Don't show for super admins
    if (isAdmin(user)) return;

    // Check if modal has already been shown this session
    const hasShownBetaNotice = sessionStorage.getItem('beta-notice-shown');
    if (hasShownBetaNotice) return;

    // Show the modal
    setBetaNoticeOpen(true);
  }, [user]);

  // Handle modal close - set sessionStorage flag
  const handleBetaNoticeClose = (open: boolean) => {
    setBetaNoticeOpen(open);
    if (!open) {
      sessionStorage.setItem('beta-notice-shown', 'true');
    }
  };
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'createdAt', direction: 'desc' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bidRequestToDelete, setBidRequestToDelete] = useState<BidRequest | null>(null);
  
  const { bidRequests = [], isLoading, updateBidRequest } = useBidRequestsForDashboard();
  const deleteMutation = useBidRequestDelete();

  // Reset to first page when search term changes
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  const handleSort = (field: keyof BidRequest) => {
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

  const sortRequests = (requests: BidRequest[]) => {
    if (!requests || !sortConfig.field || !sortConfig.direction) {
      return requests;
    }

    return [...requests].sort((a, b) => {
      const aValue = a[sortConfig.field!];
      const bValue = b[sortConfig.field!];

      if (sortConfig.field === 'createdAt') {
        const dateA = new Date(aValue as string).getTime();
        const dateB = new Date(bValue as string).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

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

  const filteredRequests = bidRequests.filter((request) => {
    if (!searchTerm) return true;
    
    const searchString = searchTerm.toLowerCase();
    return (
      request.year.toString().includes(searchString) ||
      request.make?.toLowerCase().includes(searchString) ||
      request.model?.toLowerCase().includes(searchString) ||
      request.buyer?.toLowerCase().includes(searchString) ||
      request.status.toLowerCase().includes(searchString) ||
      request.vin?.toLowerCase().includes(searchString) ||
      request.mileage?.toString().includes(searchString)
    );
  });

  const sortedRequests = sortRequests(filteredRequests);
  const totalPages = Math.ceil(sortedRequests.length / pageSize);

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
  const paginatedRequests = sortedRequests.slice(
    startIndex,
    startIndex + pageSize
  );

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleDelete = (id: string) => {
    const request = sortedRequests.find(r => r.id === id);
    if (request) {
      setBidRequestToDelete(request);
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = (reason?: string) => {
    if (bidRequestToDelete?.id) {
      deleteMutation.mutate(
        { id: bidRequestToDelete.id, reason },
        {
          onSuccess: () => {
            setDeleteDialogOpen(false);
            setBidRequestToDelete(null);
          }
        }
      );
    } else {
      console.error('Cannot delete: bid request ID is missing', bidRequestToDelete);
    }
  };

  return (
    <DashboardLayout>
      <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-20 sm:pb-6 flex-grow">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <SearchHeader 
              searchTerm={searchTerm}
              setSearchTerm={handleSearchChange}
            />
            
            {isLoading ? (
              <div className="text-center py-4">Loading bid requests...</div>
            ) : (
              <>
                <BidRequestTable 
                  requests={paginatedRequests}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  onDelete={handleDelete}
                />

                <TableFooter
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={sortedRequests.length}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={handlePageSizeChange}
                  getPageNumbers={getPageNumbers}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <DeleteBidRequestDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        bidRequest={bidRequestToDelete}
      />

      {user && !isAdmin(user) && (
        <BetaNoticeModal
          open={betaNoticeOpen}
          onOpenChange={handleBetaNoticeClose}
        />
      )}

      {/* Mobile FAB - adjust bottom spacing to account for footer */}
      {isMounted && isMobile && typeof document !== 'undefined' && createPortal(
        <Button 
          asChild
          variant="default" 
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[9999] w-14 h-14 rounded-full bg-accent hover:bg-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          aria-label="Create Bid Request"
        >
          <Link to="/create-bid-request">
            <Plus className="h-6 w-6" />
          </Link>
        </Button>,
        document.body
      )}
    </DashboardLayout>
  );
};

export default BidRequestDashboard;
