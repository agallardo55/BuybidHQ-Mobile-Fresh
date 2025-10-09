import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import MarketplaceFilters from "@/components/marketplace/MarketplaceFilters";
import MarketplaceGrid from "@/components/marketplace/MarketplaceGrid";
import MarketplaceVehicleDialog from "@/components/marketplace/MarketplaceVehicleDialog";
import { useBidRequests } from "@/hooks/useBidRequests";
import { usePrefetchVehicleDetails } from "@/hooks/marketplace/usePrefetchVehicleDetails";
import { formatDistanceToNow } from "date-fns";

const Marketplace = () => {
  // Check for both legacy admin role and new app_role system
  const { isAuthorized, isLoading: isAuthLoading } = useRoleGuard({
    anyOfRoles: ['admin'],  // Legacy admin role
    anyOfAppRoles: ['account_admin', 'super_admin'],  // New system roles
    redirectTo: "/dashboard",
    showToast: true,
    accessDeniedMessage: 'Admin or super admin access required.'
  });
  
  const { bidRequests, isLoading: isBidRequestsLoading } = useBidRequests();
  const { prefetchImages } = usePrefetchVehicleDetails();
  
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

  const handleViewDetails = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setIsDialogOpen(true);
  };

  const handleVehicleHover = (vehicleId: string) => {
    prefetchImages(vehicleId);
  };

  // Find selected request from already-loaded data
  const selectedRequest = useMemo(() => {
    return bidRequests.find(bid => bid.id === selectedVehicleId);
  }, [bidRequests, selectedVehicleId]);

  // Extract unique makes, models, and years from bid requests
  const { availableMakes, availableModels, availableYears } = useMemo(() => {
    const makes = new Set<string>();
    const models = new Set<string>();
    const years = new Set<string>();

    bidRequests.forEach((bid) => {
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
    const filtered = bidRequests
      .map((bid) => {
        const mileageStr = typeof bid.mileage === 'string' ? bid.mileage : String(bid.mileage || '0');
        const mileageNum = parseInt(mileageStr.replace(/[^0-9]/g, ''));
        
        return {
          id: bid.id,
          year: String(bid.year || "N/A"),
          make: bid.make || "N/A",
          model: bid.model || "N/A",
          trim: bid.trim || "",
          mileage: mileageNum.toLocaleString('en-US'),
          price: bid.offerSummary?.highestOffer || 0,
          image: bid.primaryImage || "/placeholder.svg",
          createdAt: bid.createdAt ? formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true }) : undefined
        };
      })
      .filter((vehicle) => {
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

  const isLoading = isAuthLoading || isBidRequestsLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* White Card Container */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Vehicle Marketplace</h1>
            <p className="text-muted-foreground mt-1">Browse and filter vehicles</p>
          </div>

          {/* Filters Row */}
          <div className="mb-6">
            <MarketplaceFilters 
              filters={filters} 
              setFilters={setFilters}
              availableMakes={availableMakes}
              availableModels={availableModels}
              availableYears={availableYears}
            />
          </div>

          {/* Vehicle Grid */}
          <MarketplaceGrid 
            vehicles={vehicles} 
            onViewDetails={handleViewDetails}
            onVehicleHover={handleVehicleHover}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
          />
        </div>
      </div>

      {/* Vehicle Details Dialog */}
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
