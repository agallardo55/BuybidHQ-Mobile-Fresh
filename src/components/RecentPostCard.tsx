import carPlaceholder from "@/assets/car-placeholder.png";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface RecentPostCardProps {
  vehicle: {
    year: string;
    make: string;
    model: string;
    mileage: string;
  };
  imageUrl: string | null;
  highestOffer: number | null;
}

export const RecentPostCard = ({
  vehicle,
  imageUrl,
  highestOffer,
}: RecentPostCardProps) => {

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border">
      <div className="aspect-video relative overflow-hidden bg-muted">
        <img
          src={imageUrl || carPlaceholder}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold text-lg text-foreground line-clamp-1">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {vehicle.mileage} miles
          </Badge>
          {highestOffer ? (
            <span className="text-sm font-medium text-accent">
              ${highestOffer.toLocaleString()}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Taking Bids</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
