
export type NotificationContent = {
  vehicle?: {
    year: string;
    make: string;
    model: string;
  };
  buyer?: {
    name: string;
    dealer: string;
  };
  offer_amount?: number;
  bid_request_id?: string;
};

export type Notification = {
  id: string;
  type: "bid_request" | "bid_response" | "bid_accepted" | "bid_declined";
  content: NotificationContent;
  created_at: string;
  read_at: string | null;
  cleared_at: string | null;
  user_id: string;
};
