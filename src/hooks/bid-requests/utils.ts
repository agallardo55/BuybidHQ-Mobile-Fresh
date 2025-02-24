
import { BidRequest } from "@/components/bid-request/types";

interface BidRequestDetails {
  request_id: string;
  created_at: string;
  status: string;
  year: string;
  make: string;
  model: string;
  trim_level: string;
  vin: string;
  mileage: string;
  user_full_name: string;
  engine_cylinders: string;
  transmission: string;
  drivetrain: string;
  exterior_color: string;
  interior_color: string;
  accessories: string;
  windshield: string;
  engine_lights: string;
  brakes: string;
  tire: string;
  maintenance: string;
  recon_estimate: string;
  recon_details: string;
}

interface BidOffer {
  amount: number;
  buyerName: string;
  createdAt: string;
}

export const mapResponsesToOffers = (
  responses: Array<{
    bid_request_id: string;
    offer_amount: number;
    created_at: string;
    buyers: {
      buyer_name: string | null;
      dealer_name: string | null;
    } | null;
  }> | null
): Map<string, BidOffer[]> => {
  const responsesMap = new Map<string, BidOffer[]>();

  if (!responses) return responsesMap;

  responses.forEach(response => {
    const offers = responsesMap.get(response.bid_request_id) || [];
    if (response.offer_amount && response.buyers?.buyer_name) {
      const buyerName = response.buyers.dealer_name 
        ? `${response.buyers.buyer_name} (${response.buyers.dealer_name})`
        : response.buyers.buyer_name;
      
      offers.push({
        amount: response.offer_amount,
        buyerName: buyerName,
        createdAt: response.created_at
      });
    }
    if (offers.length > 0) {
      responsesMap.set(response.bid_request_id, offers);
    }
  });

  return responsesMap;
};

export const transformBidRequest = (
  item: BidRequestDetails,
  offers: BidOffer[]
): BidRequest => {
  const status = ["Pending", "Approved", "Declined"].includes(item.status) 
    ? item.status as "Pending" | "Approved" | "Declined"
    : "Pending";

  return {
    id: item.request_id,
    createdAt: item.created_at,
    year: parseInt(item.year) || 0,
    make: item.make,
    model: item.model,
    trim: item.trim_level,
    vin: item.vin,
    mileage: parseInt(item.mileage),
    buyer: item.user_full_name || 'Unknown',
    offers,
    status,
    engineCylinders: item.engine_cylinders,
    transmission: item.transmission,
    drivetrain: item.drivetrain,
    exteriorColor: item.exterior_color,
    interiorColor: item.interior_color,
    accessories: item.accessories,
    windshield: item.windshield,
    engineLights: item.engine_lights,
    brakes: item.brakes,
    tire: item.tire,
    maintenance: item.maintenance,
    reconEstimate: item.recon_estimate,
    reconDetails: item.recon_details
  };
};
