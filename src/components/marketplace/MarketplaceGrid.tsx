import VehicleCard from "./VehicleCard";

interface Vehicle {
  id: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  mileage: string;
  price: number;
  image: string;
  createdAt?: string;
}

interface MarketplaceGridProps {
  vehicles: Vehicle[];
  onViewDetails?: (vehicleId: string) => void;
  onVehicleHover?: (vehicleId: string) => void;
  sortOrder: "newest" | "oldest";
  onSortChange: (order: "newest" | "oldest") => void;
  shouldShowPrices?: boolean;
}

const MarketplaceGrid = ({ vehicles, onViewDetails, onVehicleHover, sortOrder, onSortChange, shouldShowPrices = true }: MarketplaceGridProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
          Showing {vehicles.length} vehicles
        </p>
        <div className="flex items-center gap-2 text-[13px]">
          <span className="text-slate-500 font-medium">Sort:</span>
          <button
            onClick={() => onSortChange("newest")}
            className={`font-medium transition-colors ${
              sortOrder === "newest"
                ? "text-brand"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Newest
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => onSortChange("oldest")}
            className={`font-medium transition-colors ${
              sortOrder === "oldest"
                ? "text-brand"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Oldest
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {vehicles.map((vehicle) => (
          <VehicleCard 
            key={vehicle.id} 
            vehicle={vehicle} 
            onViewDetails={onViewDetails}
            onHover={onVehicleHover}
            shouldShowPrices={shouldShowPrices}
          />
        ))}
      </div>
    </div>
  );
};

export default MarketplaceGrid;
