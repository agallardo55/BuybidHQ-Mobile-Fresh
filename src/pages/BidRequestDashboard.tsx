
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
import { isAdmin } from "@/utils/auth-helpers";
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingToast } from "@/components/onboarding/OnboardingToast";

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
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    enrichUserProfile().catch(err => {
      console.log('Background enrichment failed:', err);
    });
  }, []);

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
      <div className="pt-20 px-6 lg:px-12 pb-20 sm:pb-8 flex-grow bg-slate-50/30">
        <div className="max-w-[1920px] mx-auto">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <SearchHeader
              searchTerm={searchTerm}
              setSearchTerm={handleSearchChange}
            />

            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : paginatedRequests.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-lg font-semibold text-slate-900">No Bid Requests Found</h3>
                <p className="mt-2 text-sm text-slate-500">
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

      {isMounted && isMobile && createPortal(
        <Button
          asChild
          variant="default"
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[9999] w-14 h-14 rounded-full bg-brand hover:bg-brand/90 text-white shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30 transition-all duration-200 hover:scale-105"
          aria-label="Create Bid Request"
        >
          <Link to="/create-bid-request">
            <Plus className="h-6 w-6" />
          </Link>
        </Button>,
        document.body
      )}

      {/* Onboarding completion toast */}
      <OnboardingToast delay={2000} />
    </DashboardLayout>
  );
};

export default BidRequestDashboard;
