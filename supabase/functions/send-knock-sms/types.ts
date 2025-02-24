
export interface BaseSMSRequest {
  type: 'bid_request' | 'bid_response' | 'test'
  phoneNumber: string
  vehicleDetails?: {
    year: string
    make: string
    model: string
  }
}

export interface BidRequestSMS extends BaseSMSRequest {
  type: 'bid_request'
  bidRequestUrl: string
}

export interface BidResponseSMS extends BaseSMSRequest {
  type: 'bid_response'
  offerAmount: string
  buyerName: string
}

export interface TestSMS extends BaseSMSRequest {
  type: 'test'
  message?: string
}

export type SMSRequest = BidRequestSMS | BidResponseSMS | TestSMS
