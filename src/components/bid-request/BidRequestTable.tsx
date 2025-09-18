
import { Table, TableBody } from "@/components/ui/table";
import { BidRequest } from "./types";
import { useState } from "react";
import BidRequestDialog from "./BidRequestDialog";
import { useBidResponseMutation } from "@/hooks/bid-requests/useBidResponseMutation";
import { useBidRequestMutation } from "@/hooks/bid-requests/useBidRequestMutation";
import { TableHeaders } from "./components/TableHeaders";
import { TableRowComponent } from "./components/TableRow";
import { BidRequestMobileCard } from "./BidRequestMobileCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface BidRequestTableProps {
  requests: BidRequest[];
  sortConfig: {
    field: keyof BidRequest | null;
    direction: 'asc' | 'desc' | null;
  };
  onSort: (field: keyof BidRequest) => void;
}

const BidRequestTable = ({ requests, sortConfig, onSort }: BidRequestTableProps) => {
  const [selectedRequest, setSelectedRequest] = useState<BidRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { mutate: updateBidResponseStatus } = useBidResponseMutation();
  const { mutate: updateBidRequestStatus } = useBidRequestMutation();
  const isMobile = useIsMobile();

  const handleRowClick = (request: BidRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const handleStatusUpdate = (responseId: string, status: "pending" | "accepted" | "declined") => {
    updateBidResponseStatus({ responseId, status });
  };

  const handleBidRequestStatusUpdate = (requestId: string, status: "pending" | "accepted" | "declined") => {
    updateBidRequestStatus({ id: requestId, status });
  };

  if (isMobile) {
    return (
      <>
        <div className="space-y-4">
          {requests && requests.length > 0 ? (
            requests.flatMap((request) => {
              if (!request.offers?.length) {
                return [(
                  <BidRequestMobileCard
                    key={request.id}
                    request={request}
                    onClick={() => handleRowClick(request)}
                    onBidRequestStatusUpdate={handleBidRequestStatusUpdate}
                  />
                )];
              }

              return request.offers.map((offer, index) => (
                <BidRequestMobileCard
                  key={`${request.id}-${index}`}
                  request={request}
                  offer={offer}
                  onClick={() => handleRowClick(request)}
                  onStatusUpdate={handleStatusUpdate}
                />
              ));
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No bid requests found
            </div>
          )}
        </div>

        <BidRequestDialog
          request={selectedRequest}
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </>
    );
  }

  return (
    <>
      <div className="overflow-x-auto -mx-4 sm:-mx-6 scrollbar-thin scrollbar-thumb-gray-300">
        <div className="inline-block min-w-full align-middle px-4 sm:px-6">
          <Table>
            <TableHeaders sortConfig={sortConfig} onSort={onSort} />
            <TableBody>
              {requests && requests.length > 0 ? (
                requests.flatMap((request) => {
                  if (!request.offers?.length) {
                    return [(
                      <TableRowComponent
                        key={request.id}
                        request={request}
                        onClick={() => handleRowClick(request)}
                        onBidRequestStatusUpdate={handleBidRequestStatusUpdate}
                      />
                    )];
                  }

                  return request.offers.map((offer, index) => (
                    <TableRowComponent
                      key={`${request.id}-${index}`}
                      request={request}
                      offer={offer}
                      onClick={() => handleRowClick(request)}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  ));
                })
              ) : (
                <TableRowComponent
                  key="empty-row"
                  request={{
                    id: "empty",
                    createdAt: new Date().toISOString(),
                    year: 0,
                    make: "",
                    model: "",
                    trim: "",
                    vin: "",
                    mileage: 0,
                    buyer: "",
                    offers: [],
                    status: "pending",
                    engineCylinders: "",
                    transmission: "",
                    drivetrain: "",
                    exteriorColor: "",
                    interiorColor: "",
                    accessories: "",
                    windshield: "",
                    engineLights: "",
                    brakes: "",
                    tire: "",
                    maintenance: "",
                    reconEstimate: "",
                    reconDetails: ""
                  }}
                  onClick={() => {}}
                />
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <BidRequestDialog
        request={selectedRequest}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
};

export default BidRequestTable;
