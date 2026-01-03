
export interface BidRequest {
  id: string;
  createdAt: string;
  status: "Pending" | "Approved" | "Completed" | "Declined";
  userId: string;
  accountId: string;
  vehicleId: string;
  // Legacy fields for backward compatibility
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  vin?: string;
  mileage?: number;
  buyer?: string;
  primaryImage?: string | null;
  offers?: {
    id: string;
    amount: number;
    buyerName: string;
    createdAt: string;
    status: "pending" | "accepted" | "declined";
  }[];
  // Aggregated offer summary for table display
  offerSummary?: {
    count: number;
    highestOffer: number | null;
    acceptedCount: number;
    pendingCount: number;
    declinedCount: number;
    hasAcceptedOffer: boolean;
  };
  engineCylinders?: string;
  transmission?: string;
  drivetrain?: string;
  exteriorColor?: string;
  interiorColor?: string;
  accessories?: string;
  windshield?: string;
  engineLights?: string;
  brakes?: string;
  tire?: string;
  maintenance?: string;
  reconEstimate?: string;
  reconDetails?: string;
  bodyStyle?: string;
  history?: string;
  historyService?: string;
  // Book values - flat structure
  mmrWholesale?: number;
  mmrRetail?: number;
  kbbWholesale?: number;
  kbbRetail?: number;
  jdPowerWholesale?: number;
  jdPowerRetail?: number;
  auctionWholesale?: number;
  auctionRetail?: number;
  bookValuesCondition?: string;
  // Enhanced fields matching data model
  vehicle?: {
    id: string;
    year?: string;
    make?: string;
    model?: string;
    trim?: string;
    vin?: string;
    mileage?: string;
    engine?: string;
    transmission?: string;
    drivetrain?: string;
    exterior?: string;
    interior?: string;
    options?: string;
    bodyStyle?: string;
    body_style?: string;
    history?: string;
    historyService?: string;
  };
  reconditioning?: {
    id: string;
    windshield?: string;
    engine_light?: string;
    brakes?: string;
    tires?: string;
    maintenance?: string;
    recon_estimate?: string;
    recon_details?: string;
  };
  book_values?: {
    id: string;
    mmr_wholesale?: number;
    mmr_retail?: number;
    kbb_wholesale?: number;
    kbb_retail?: number;
    jd_power_wholesale?: number;
    jd_power_retail?: number;
    auction_wholesale?: number;
    auction_retail?: number;
    condition?: string;
  };
  images?: {
    id: string;
    image_url?: string;
    sequence_order?: number;
  }[];
  responses?: {
    id: string;
    offer_amount: number;
    status: string;
    buyer_id: string;
    buyers?: {
      id: string;
      buyer_name?: string;
      dealer_name?: string;
      email: string;
    };
  }[];
}

export interface TrimOption {
  name: string;
  description: string;
  year: number;
  specs?: {
    engine?: string;
    transmission?: string;
    drivetrain?: string;
    bodyStyle?: string;
  }
}

export interface BidRequestFormData {
  year: string;
  make: string;
  model: string;
  trim: string;
  displayTrim: string;
  availableTrims: TrimOption[];
  vin: string;
  mileage: string;
  exteriorColor: string;
  interiorColor: string;
  accessories: string;
  windshield: string;
  engineLights: string;
  brakes: string;
  tire: string;
  maintenance: string;
  history?: string;
  historyService: string;
  reconEstimate: string;
  reconDetails: string;
  engineCylinders: string;
  transmission: string;
  drivetrain: string;
  bodyStyle: string;
  // Book Values
  mmrWholesale: string;
  mmrRetail: string;
  kbbWholesale: string;
  kbbRetail: string;
  jdPowerWholesale: string;
  jdPowerRetail: string;
  auctionWholesale: string;
  auctionRetail: string;
  bookValuesCondition: string;
}

export interface FormErrors {
  year?: string;
  make?: string;
  model?: string;
  vin?: string;
  mileage?: string;
  buyers?: string;
  [key: string]: string | undefined;
}

export interface FormState {
  formData: BidRequestFormData;
  errors: FormErrors;
  selectedBuyers: string[];
  uploadedImageUrls: string[];
  selectedFileUrls: string[];
  isSubmitting: boolean;
  searchTerm: string;
  showValidation: boolean;
}

export interface FormStateActions {
  setFormData: (data: Partial<BidRequestFormData>) => void;
  setErrors: (errors: FormErrors) => void;
  setSelectedBuyers: (buyers: string[]) => void;
  setUploadedImageUrls: (urls: string[]) => void;
  setSelectedFileUrls: (urls: string[]) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setSearchTerm: (term: string) => void;
  setShowValidation: (show: boolean) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }) => void;
  handleSelectChange: (value: string, name: string) => void;
  handleImagesUploaded: (urls: string[]) => void;
  toggleBuyer: (buyerId: string) => void;
  handleBatchChanges: (changes: Array<{ name: string; value: string }>) => void;
  removeUploadedImage: (url: string) => void; // Add the new function type
}
