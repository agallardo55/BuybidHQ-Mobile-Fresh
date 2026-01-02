import { BidRequest } from "../bid-request/types";
import BookValuesCard from "../bid-response/BookValuesCard";
import { getHistoryDisplay } from "../bid-response/utils/historyFormatting";
import { formatCurrencyDisplay } from "@/utils/currencyUtils";

interface VehicleValuationProps {
  request: BidRequest;
}

const VehicleValuation = ({ request }: VehicleValuationProps) => {
  // Extract from both flat and nested structures
  const historyService = request.historyService || request.vehicle?.historyService || '';
  const history = request.history || request.vehicle?.history || '';
  const reconEstimate = request.reconEstimate || request.reconditioning?.recon_estimate || '';
  const reconDetails = request.reconDetails || request.reconditioning?.recon_details || '';

  // Book values - support both flat and nested structures
  const bookValues = request.book_values || {};
  const kbbWholesale = bookValues.kbb_wholesale || request.kbbWholesale;
  const kbbRetail = bookValues.kbb_retail || request.kbbRetail;
  const jdPowerWholesale = bookValues.jd_power_wholesale || request.jdPowerWholesale;
  const jdPowerRetail = bookValues.jd_power_retail || request.jdPowerRetail;
  const mmrWholesale = bookValues.mmr_wholesale || request.mmrWholesale;
  const mmrRetail = bookValues.mmr_retail || request.mmrRetail;
  const auctionWholesale = bookValues.auction_wholesale || request.auctionWholesale;
  const auctionRetail = bookValues.auction_retail || request.auctionRetail;
  const bookValuesCondition = bookValues.condition || request.bookValuesCondition;

  return (
    <div className="space-y-4">
      {/* History & Reconditioning Card */}
      <div className="bg-white p-3 rounded-lg border">
        <h3 className="font-semibold text-lg mb-2">History & Reconditioning</h3>
        <div className="space-y-1">
          <div className="grid grid-cols-[140px_1fr] gap-1 text-sm">
            <div className="font-bold text-black">History Service:</div>
            <div className="font-normal bg-gray-50 p-2 rounded">
              {historyService || 'Not specified'}
            </div>

            <div className="font-bold text-black">Accident History:</div>
            <div className="font-normal bg-gray-50 p-2 rounded">
              {getHistoryDisplay(history)}
            </div>

            <div className="font-bold text-black">Recon Estimate:</div>
            <div className="font-normal bg-gray-50 p-2 rounded">
              {formatCurrencyDisplay(reconEstimate)}
            </div>

            {reconDetails && (
              <>
                <div className="font-bold text-black">Recon Details:</div>
                <div className="font-normal bg-gray-50 p-2 rounded">
                  {reconDetails}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reuse BookValuesCard */}
      <BookValuesCard
        kbbWholesale={kbbWholesale}
        kbbRetail={kbbRetail}
        jdPowerWholesale={jdPowerWholesale}
        jdPowerRetail={jdPowerRetail}
        mmrWholesale={mmrWholesale}
        mmrRetail={mmrRetail}
        auctionWholesale={auctionWholesale}
        auctionRetail={auctionRetail}
        bookValuesCondition={bookValuesCondition}
      />
    </div>
  );
};

export default VehicleValuation;
