
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
  const { mutateAsync: updateBidResponseStatus } = useBidResponseMutation();
  const isMobile = useIsMobile();

  const handleRowClick = (request: BidRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const handleStatusUpdate = async (responseId: string, status: "pending" | "accepted" | "declined") => {
    return updateBidResponseStatus({ responseId, status });
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

  // Calculate how many empty rows are needed to reach minimum of 10 rows
  const getEmptyRowsCount = () => {
    return Math.max(0, 10 - requests.length);
  };

  return (
    <>
      <div className="overflow-x-auto -mx-4 sm:-mx-6 scrollbar-thin scrollbar-thumb-gray-300">
        <div className="inline-block min-w-full align-middle px-4 sm:px-6">
          <Table>
            <TableHeaders sortConfig={sortConfig} onSort={onSort} />
            <TableBody>
              {requests && requests.length > 0 ? (
                <>
                  {requests.map((request) => (
                    <TableRowComponent
                      key={request.id}
                      request={request}
                      onClick={() => handleRowClick(request)}
                    />
                  ))}
                  {/* Render empty placeholder rows */}
                  {Array.from({ length: getEmptyRowsCount() }).map((_, index) => (
                    <tr key={`empty-${index}`} className="h-[44px] border-b">
                      {Array.from({ length: 10 }).map((_, cellIndex) => (
                        <td key={`empty-cell-${cellIndex}`} className="h-[44px]">
                          &nbsp;
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ) : (
                <>
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-muted-foreground">
                      No bid requests found
                    </td>
                  </tr>
                  {/* Render 9 empty placeholder rows when no requests */}
                  {Array.from({ length: 9 }).map((_, index) => (
                    <tr key={`empty-${index}`} className="h-[44px] border-b">
                      {Array.from({ length: 10 }).map((_, cellIndex) => (
                        <td key={`empty-cell-${cellIndex}`} className="h-[44px]">
                          &nbsp;
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
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
