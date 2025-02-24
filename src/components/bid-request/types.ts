export interface BidRequest {
  id: string;
  createdAt: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  vin: string;
  mileage: number;
  buyer: string;
  offers: {
    id: string;
    amount: number;
    buyerName: string;
    createdAt: string;
    status: "pending" | "accepted" | "declined";
  }[];
  status: "pending" | "accepted" | "declined";
  engineCylinders: string;
  transmission: string;
  drivetrain: string;
  exteriorColor: string;
  interiorColor: string;
  accessories: string;
  windshield: string;
  engineLights: string;
  brakes: string;
  tire: string;
  maintenance: string;
  reconEstimate: string;
  reconDetails: string;
}

export interface TrimOption {
  name: string;
  description: string;
  specs?: {
    engine?: string;
    transmission?: string;
    drivetrain?: string;
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
  reconEstimate: string;
  reconDetails: string;
  engineCylinders: string;
  transmission: string;
  drivetrain: string;
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
}
