import { BidRequest } from "../bid-request/types";
import BookValuesCard from "../bid-response/BookValuesCard";

interface VehicleValuationProps {
  request: BidRequest;
}

const VehicleValuation = ({ request }: VehicleValuationProps) => {
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
  );
};

export default VehicleValuation;
