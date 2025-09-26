
import { Table, TableBody } from "@/components/ui/table";
import { BidRequest } from "./types";
import { useState } from "react";
import BidRequestDialog from "./BidRequestDialog";
import { useBidResponseMutation } from "@/hooks/bid-requests/useBidResponseMutation";
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
  const isMobile = useIsMobile();

  const handleRowClick = (request: BidRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const handleStatusUpdate = (responseId: string, status: "pending" | "accepted" | "declined") => {
    updateBidResponseStatus({ responseId, status });
  };

  if (isMobile) {
    return (
      <>
        <div className="space-y-4">
          {requests && requests.length > 0 ? (
            requests.map((request) => (
              <BidRequestMobileCard
                key={request.id}
                request={request}
                onClick={() => handleRowClick(request)}
              />
            ))
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
          onStatusUpdate={handleStatusUpdate}
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
                requests.map((request) => (
                <TableRowComponent
                  key={request.id}
                  request={request}
                  onClick={() => handleRowClick(request)}
                  onStatusUpdate={handleStatusUpdate}
                />
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-muted-foreground">
                    No bid requests found
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <BidRequestDialog
        request={selectedRequest}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
};

export default BidRequestTable;
