import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Phone, Mail, MapPin, User, Eye, Pencil, Trash2 } from "lucide-react";
import { Dealership } from "@/types/dealerships";

interface DealershipMobileCardProps {
  dealership: Dealership;
  onView: (dealership: Dealership) => void;
  onEdit: (dealership: Dealership) => void;
  onDelete: (dealership: Dealership) => void;
}

export const DealershipMobileCard = ({
  dealership,
  onView,
  onEdit,
  onDelete
}: DealershipMobileCardProps) => {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-base">{dealership.dealer_name}</h3>
            <p className="text-sm text-muted-foreground">ID: {dealership.dealer_id}</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{dealership.business_phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{dealership.business_email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{dealership.city}, {dealership.state}</span>
          </div>
          {dealership.primary_dealer && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <div>{dealership.primary_dealer.full_name}</div>
                <div className="text-xs text-muted-foreground">{dealership.primary_dealer.email}</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(dealership)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(dealership)}
            className="flex-1"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(dealership)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};