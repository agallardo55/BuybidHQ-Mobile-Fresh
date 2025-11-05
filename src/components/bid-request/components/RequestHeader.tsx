
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
    return offers.reduce((highest, current) => 
      current.amount > highest.amount ? current : highest
    );
  };

  const highestOffer = getHighestOffer(request.offers);

  return (
    <DialogHeader className="border-b pb-4">
      <div className="flex items-center justify-between">
        <DialogTitle className="text-2xl">Vehicle Details</DialogTitle>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="font-bold text-black">Date:</span>
          <p className="font-normal p-2 rounded mt-1 block w-full" style={{ backgroundColor: '#ECEEF0' }}>{formatDate(request.createdAt)}</p>
        </div>
        <div>
          <span className="font-bold text-black">Buyer:</span>
          <p className="font-normal p-2 rounded mt-1 block w-full" style={{ backgroundColor: '#ECEEF0' }}>
            {highestOffer ? highestOffer.buyerName : request.buyer}
          </p>
        </div>
        <div>
          <span className="font-bold text-black">Highest Offer:</span>
          <p className="font-normal p-2 rounded mt-1 block w-full" style={{ backgroundColor: '#ECEEF0' }}>
            {highestOffer === null ? (
              <span className="text-gray-500">No offers yet</span>
            ) : (
              `$${highestOffer.amount.toLocaleString()}`
            )}
          </p>
        </div>
      </div>
    </DialogHeader>
  );
};

export default RequestHeader;
