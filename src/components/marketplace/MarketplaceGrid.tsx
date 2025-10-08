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
}

interface MarketplaceGridProps {
  vehicles: Vehicle[];
}

const MarketplaceGrid = ({ vehicles }: MarketplaceGridProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {vehicles.length} vehicles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </div>
  );
};

export default MarketplaceGrid;
