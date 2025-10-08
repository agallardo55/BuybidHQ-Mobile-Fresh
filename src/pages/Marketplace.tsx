import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import MarketplaceFilters from "@/components/marketplace/MarketplaceFilters";
import MarketplaceGrid from "@/components/marketplace/MarketplaceGrid";
import { useBidRequests } from "@/hooks/useBidRequests";

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
  
  const [filters, setFilters] = useState({
    make: "",
    model: "",
    yearFrom: "",
    yearTo: "",
    priceFrom: "",
    priceTo: "",
    mileageFrom: "",
    mileageTo: ""
  });

  // Transform bid requests to vehicle format and apply filters
  const vehicles = useMemo(() => {
    return bidRequests
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
          image: bid.primaryImage || "/placeholder.svg"
        };
      })
      .filter((vehicle) => {
        // Filter by make
        if (filters.make && !vehicle.make.toLowerCase().includes(filters.make.toLowerCase())) {
          return false;
        }
        
        // Filter by model
        if (filters.model && !vehicle.model.toLowerCase().includes(filters.model.toLowerCase())) {
          return false;
        }
        
        // Filter by year range
        const vehicleYear = parseInt(vehicle.year);
        if (filters.yearFrom && vehicleYear < parseInt(filters.yearFrom)) {
          return false;
        }
        if (filters.yearTo && vehicleYear > parseInt(filters.yearTo)) {
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
  }, [bidRequests, filters]);

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
          {/* Filters Row */}
          <div className="mb-6">
            <MarketplaceFilters filters={filters} setFilters={setFilters} />
          </div>

          {/* Vehicle Grid */}
          <MarketplaceGrid vehicles={vehicles} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Marketplace;
