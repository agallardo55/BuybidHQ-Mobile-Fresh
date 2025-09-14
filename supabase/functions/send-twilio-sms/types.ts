export type SMSRequest = BidRequestSMS | BidResponseSMS | TestSMS;

export interface BidRequestSMS {
  type: 'bid_request';
  phoneNumber: string;
  senderName: string;
  bidRequestUrl: string;
  vehicleDetails: {
    year: string;
    make: string;
    model: string;
  };
}

export interface BidResponseSMS {
  type: 'bid_response';
  phoneNumber: string;
  offerAmount: string;
  buyerName: string;
  vehicleDetails: {
    year: string;
    make: string;
    model: string;
  };
}

export interface TestSMS {
  type: 'test';
  phoneNumber: string;
  message?: string;
}