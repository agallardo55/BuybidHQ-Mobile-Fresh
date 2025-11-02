import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VehicleCardProps {
  vehicle: {
    id: string;
    year: string;
    make: string;
    model: string;
    trim: string;
    mileage: string;
    price: number;
    image: string;
    createdAt?: string;
  };
  onViewDetails?: (vehicleId: string) => void;
  onHover?: (vehicleId: string) => void;
  shouldShowPrices?: boolean;
}

const VehicleCard = ({ vehicle, onViewDetails, onHover, shouldShowPrices = true }: VehicleCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col h-full"
      onMouseEnter={() => onHover?.(vehicle.id)}
    >
      {/* Vehicle Image */}
      <div className="aspect-video bg-muted relative overflow-hidden">
        <img
          src={vehicle.image}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover"
        />
      </div>

      <CardHeader className="pb-3">
        {vehicle.createdAt && (
          <div className="text-xs text-muted-foreground mb-2">
            Posted {vehicle.createdAt}
          </div>
        )}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-sm text-muted-foreground">{vehicle.trim}</p>
          </div>
          <Badge variant="secondary">{vehicle.mileage} mi</Badge>
        </div>
      </CardHeader>

      {/* Spacer to push content to bottom */}
      <div className="flex-grow" />

      <CardContent className="pb-3">
        <div className="text-xs text-muted-foreground mb-1">Highest Offer</div>
        <div className={`text-2xl font-bold text-primary ${!shouldShowPrices ? 'blur-sm select-none' : ''}`}>
          {shouldShowPrices ? formatPrice(vehicle.price) : '$•••,•••'}
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full" 
          variant="default"
          onClick={() => onViewDetails?.(vehicle.id)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VehicleCard;
