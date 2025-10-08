import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAccountAdminGuard } from "@/hooks/useRoleGuard";
import MarketplaceFilters from "@/components/marketplace/MarketplaceFilters";
import MarketplaceGrid from "@/components/marketplace/MarketplaceGrid";

// Mock vehicle data
const mockVehicles = [
  {
    id: "1",
    year: "2023",
    make: "Toyota",
    model: "Camry",
    trim: "SE",
    mileage: "15,234",
    price: 28500,
    image: "/placeholder.svg"
  },
  {
    id: "2",
    year: "2022",
    make: "Honda",
    model: "Accord",
    trim: "EX-L",
    mileage: "22,100",
    price: 26900,
    image: "/placeholder.svg"
  },
  {
    id: "3",
    year: "2024",
    make: "Ford",
    model: "F-150",
    trim: "Lariat",
    mileage: "8,450",
    price: 52000,
    image: "/placeholder.svg"
  },
  {
    id: "4",
    year: "2023",
    make: "Chevrolet",
    model: "Silverado",
    trim: "LT",
    mileage: "12,890",
    price: 45500,
    image: "/placeholder.svg"
  },
  {
    id: "5",
    year: "2022",
    make: "Nissan",
    model: "Altima",
    trim: "SV",
    mileage: "28,650",
    price: 24200,
    image: "/placeholder.svg"
  },
  {
    id: "6",
    year: "2023",
    make: "Tesla",
    model: "Model 3",
    trim: "Long Range",
    mileage: "5,200",
    price: 48900,
    image: "/placeholder.svg"
  },
];

const Marketplace = () => {
  const { isAuthorized, isLoading } = useAccountAdminGuard("/dashboard");
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
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
          <p className="text-muted-foreground mt-2">Browse available vehicles</p>
        </div>

        {/* White Card Container */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          {/* Filters Row */}
          <div className="mb-6">
            <MarketplaceFilters filters={filters} setFilters={setFilters} />
          </div>

          {/* Vehicle Grid */}
          <MarketplaceGrid vehicles={mockVehicles} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Marketplace;
