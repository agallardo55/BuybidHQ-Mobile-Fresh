import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Building, Pencil, Trash, Check, AlertCircle, XCircle } from "lucide-react";
import { Buyer } from "@/types/buyers";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface BuyerMobileCardProps {
  buyer: Buyer;
  onEdit: (buyer: Buyer) => void;
  onDelete: (buyerId: string) => void;
}

export const BuyerMobileCard = ({
  buyer,
  onEdit,
  onDelete
}: BuyerMobileCardProps) => {
  const { currentUser } = useCurrentUser();

  const canManageBuyer = (buyer: Buyer) => {
    return currentUser?.role === 'admin' || currentUser?.id === buyer.user_id;
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-base">{buyer.name}</h3>
            <p className="text-sm text-muted-foreground">{buyer.dealership}</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{buyer.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{buyer.mobileNumber}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-green-600">{buyer.acceptedBids}</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-yellow-600">{buyer.pendingBids}</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-red-600">{buyer.declinedBids}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          {canManageBuyer(buyer) && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(buyer)}
                className="flex-1"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(buyer.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};