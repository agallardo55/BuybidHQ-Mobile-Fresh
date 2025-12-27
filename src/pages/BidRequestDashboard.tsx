
import { useState, useEffect, useMemo } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";

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
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    enrichUserProfile().catch(err => {
      console.log('Background enrichment failed:', err);
    });
  }, []);

  useEffect(() => {
    if (!user || isAdmin(user)) return;

    const hasShownBetaNotice = sessionStorage.getItem('beta-notice-shown');
    if (hasShownBetaNotice) return;

    setBetaNoticeOpen(true);
  }, [user]);

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

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  const handleSort = (field: keyof BidRequest) => {
    setSortConfig((currentConfig) => {
      if (currentConfig.field === field) {
        if (currentConfig.direction === 'asc') return { field, direction: 'desc' };
        if (currentConfig.direction === 'desc') return { field: null, direction: null };
      }
      return { field, direction: 'asc' };
    });
  };

  const filteredRequests = useMemo(() => {
    if (!searchTerm) return bidRequests;
    const searchString = searchTerm.toLowerCase();
    return bidRequests.filter((request) =>
      Object.values(request).some(value =>
        String(value).toLowerCase().includes(searchString)
      )
    );
  }, [bidRequests, searchTerm]);

  const sortedRequests = useMemo(() => {
    if (!sortConfig.field || !sortConfig.direction) return filteredRequests;

    return [...filteredRequests].sort((a, b) => {
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
  }, [filteredRequests, sortConfig]);

  const totalPages = Math.ceil(sortedRequests.length / pageSize);
  const paginatedRequests = sortedRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
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
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : paginatedRequests.length === 0 ? (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium text-gray-900">No Bid Requests Found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  There are no bid requests that match your current search criteria.
                </p>
              </div>
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

      {isMounted && isMobile && createPortal(
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
