
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { BidRequest } from "../types";

interface RequestHeaderProps {
  request: BidRequest;
}

const RequestHeader = ({ request }: RequestHeaderProps) => {
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MM/dd/yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getHighestOffer = (offers: BidRequest['offers']) => {
    if (!offers || offers.length === 0) return null;
    return Math.max(...offers.map(offer => offer.amount));
  };

  const highestOffer = getHighestOffer(request.offers);

  return (
    <DialogHeader className="border-b pb-4">
      <div className="flex items-center justify-between">
        <DialogTitle className="text-2xl">Vehicle Details</DialogTitle>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium
          ${request.status === 'accepted' ? 'bg-green-100 text-green-800' : ''}
          ${request.status === 'pending' ? 'bg-blue-100 text-blue-800' : ''}
          ${request.status === 'declined' ? 'bg-red-100 text-red-800' : ''}
        `}>
          {request.status}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Date:</span>
          <p className="font-medium">{formatDate(request.createdAt)}</p>
        </div>
        <div>
          <span className="text-gray-500">Buyer:</span>
          <p className="font-medium">{request.buyer}</p>
        </div>
        <div>
          <span className="text-gray-500">Highest Offer:</span>
          <p className="font-medium">
            {highestOffer === null ? (
              <span className="text-gray-500">No offers yet</span>
            ) : (
              `$${highestOffer.toLocaleString()}`
            )}
          </p>
        </div>
      </div>
    </DialogHeader>
  );
};

export default RequestHeader;
