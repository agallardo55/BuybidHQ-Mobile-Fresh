import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MarketplaceFilters from "@/components/marketplace/MarketplaceFilters";
import MarketplaceGrid from "@/components/marketplace/MarketplaceGrid";
import MarketplaceVehicleDialog from "@/components/marketplace/MarketplaceVehicleDialog";
import Pagination from "@/components/marketplace/Pagination";
import { useBidRequests } from "@/hooks/useBidRequests";
import { usePrefetchVehicleDetails } from "@/hooks/marketplace/usePrefetchVehicleDetails";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAccount } from "@/hooks/useAccount";
import { canUserSeePrices } from "@/utils/planHelpers";
import { formatDistanceToNow } from "date-fns";
import MarketplaceGridSkeleton from "@/components/marketplace/MarketplaceGridSkeleton";
import { formatMileage } from "@/utils/mileageFormatter";

const Marketplace = () => {
  const { currentUser } = useCurrentUser();
  const { account } = useAccount();
  const {
    bidRequests,
    isLoading: isBidRequestsLoading
  } = useBidRequests({ scope: 'global' });
  const {
    prefetchImages
  } = usePrefetchVehicleDetails();
  const [filters, setFilters] = useState({
    make: "all",
    model: "all",
    yearFrom: "all",
    yearTo: "all",
    priceFrom: "",
    priceTo: "",
    mileageFrom: "",
    mileageTo: ""
  });
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Show 12 vehicles per page (4 columns x 3 rows)
  const handleViewDetails = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setIsDialogOpen(true);
  };
  const handleVehicleHover = (vehicleId: string) => {
    prefetchImages(vehicleId);
  };

  // Reset to page 1 when filters or sort order change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortOrder]);

  // Find selected request from already-loaded data
  const selectedRequest = useMemo(() => {
    return bidRequests.find(bid => bid.id === selectedVehicleId);
  }, [bidRequests, selectedVehicleId]);

  // Extract unique makes, models, and years from bid requests
  const {
    availableMakes,
    availableModels,
    availableYears
  } = useMemo(() => {
    const makes = new Set<string>();
    const models = new Set<string>();
    const years = new Set<string>();
    bidRequests.forEach(bid => {
      if (bid.make && bid.make !== "N/A") makes.add(bid.make);
      if (bid.year) years.add(String(bid.year));

      // Filter models based on selected make (hierarchical filtering)
      if (filters.make === "all" || !filters.make) {
        // Show all models when no make is selected
        if (bid.model && bid.model !== "N/A") models.add(bid.model);
      } else {
        // Only show models for the selected make
        if (bid.make?.toLowerCase() === filters.make.toLowerCase() && bid.model && bid.model !== "N/A") {
          models.add(bid.model);
        }
      }
    });
    return {
      availableMakes: Array.from(makes).sort(),
      availableModels: Array.from(models).sort(),
      availableYears: Array.from(years).sort((a, b) => Number(b) - Number(a))
    };
  }, [bidRequests, filters.make]);

  // Transform bid requests to vehicle format and apply filters
  const vehicles = useMemo(() => {
    const filtered = bidRequests.map(bid => {
      return {
        id: bid.id,
        year: String(bid.year || "N/A"),
        make: bid.make || "N/A",
        model: bid.model || "N/A",
        trim: bid.trim || "",
        mileage: formatMileage(bid.mileage),
        price: bid.offerSummary?.highestOffer || 0,
        image: bid.primaryImage || "/placeholder.svg",
        createdAt: bid.createdAt ? formatDistanceToNow(new Date(bid.createdAt), {
          addSuffix: true
        }) : undefined
      };
    }).filter(vehicle => {
      // Filter by make
      if (filters.make && filters.make !== "all" && !vehicle.make.toLowerCase().includes(filters.make.toLowerCase())) {
        return false;
      }

      // Filter by model
      if (filters.model && filters.model !== "all" && !vehicle.model.toLowerCase().includes(filters.model.toLowerCase())) {
        return false;
      }

      // Filter by year range
      const vehicleYear = parseInt(vehicle.year);
      if (filters.yearFrom && filters.yearFrom !== "all" && vehicleYear < parseInt(filters.yearFrom)) {
        return false;
      }
      if (filters.yearTo && filters.yearTo !== "all" && vehicleYear > parseInt(filters.yearTo)) {
        return false;
      }

      // Filter by price range
      if (filters.priceFrom && vehicle.price < parseInt(filters.priceFrom)) {
        return false;
      }
      if (filters.priceTo && vehicle.price > parseInt(filters.priceTo)) {
        return false;
      }

      // Filter by mileage range
      const vehicleMileage = parseInt(vehicle.mileage.replace(/[^0-9]/g, ''));
      if (filters.mileageFrom && vehicleMileage < parseInt(filters.mileageFrom)) {
        return false;
      }
      if (filters.mileageTo && vehicleMileage > parseInt(filters.mileageTo)) {
        return false;
      }
      return true;
    });

    // Sort by date
    return filtered.sort((a, b) => {
      const dateA = bidRequests.find(bid => bid.id === a.id)?.createdAt;
      const dateB = bidRequests.find(bid => bid.id === b.id)?.createdAt;
      if (!dateA || !dateB) return 0;
      const timeA = new Date(dateA).getTime();
      const timeB = new Date(dateB).getTime();
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });
  }, [bidRequests, filters, sortOrder]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    const totalPages = Math.ceil(vehicles.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedVehicles = vehicles.slice(startIndex, endIndex);

    return {
      vehicles: paginatedVehicles,
      totalPages,
      totalItems: vehicles.length,
    };
  }, [vehicles, currentPage, itemsPerPage]);

  // Determine if user should see prices (admins/super_admins always can, paid users can, free users cannot)
  const shouldShowPrices = useMemo(() => {
    return canUserSeePrices(
      account?.plan,
      currentUser?.role,
      currentUser?.app_role
    );
  }, [account?.plan, currentUser?.role, currentUser?.app_role]);
  
  if (isBidRequestsLoading) {
    return (
      <DashboardLayout>
        <div className="pt-20 px-6 lg:px-12 pb-20 sm:pb-8 flex-grow bg-slate-50/30">
          <div className="max-w-[1920px] mx-auto">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <div className="mb-6">
                <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Market View</h1>
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mt-0.5">
                  Vehicle Inventory Browser
                </p>
              </div>
              <div className="mb-6">
                <MarketplaceFilters
                  filters={filters}
                  setFilters={setFilters}
                  availableMakes={[]}
                  availableModels={[]}
                  availableYears={[]}
                />
              </div>
              <MarketplaceGridSkeleton />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pt-20 px-6 lg:px-12 pb-20 sm:pb-8 flex-grow bg-slate-50/30">
        <div className="max-w-[1920px] mx-auto">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Market View</h1>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mt-0.5">
                Vehicle Inventory Browser
              </p>
            </div>

            <div className="mb-6">
              <MarketplaceFilters
                filters={filters}
                setFilters={setFilters}
                availableMakes={availableMakes}
                availableModels={availableModels}
                availableYears={availableYears}
              />
            </div>

            {vehicles.length === 0 ? (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium text-slate-900">No Vehicles Found</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Try adjusting your filters to find what you're looking for.
                </p>
              </div>
            ) : (
              <>
                <MarketplaceGrid
                  vehicles={paginatedData.vehicles}
                  onViewDetails={handleViewDetails}
                  onVehicleHover={handleVehicleHover}
                  sortOrder={sortOrder}
                  onSortChange={setSortOrder}
                  shouldShowPrices={shouldShowPrices}
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={paginatedData.totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={paginatedData.totalItems}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <MarketplaceVehicleDialog
        request={selectedRequest}
        vehicleId={selectedVehicleId}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </DashboardLayout>
  );
};

export default Marketplace;