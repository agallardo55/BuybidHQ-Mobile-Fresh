import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, UserRound, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Buyer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  totalBids: number;
  successfulBids: number;
  joinedDate: string;
}

const Buyers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    mobileNumber: "",
    businessNumber: "",
    dealershipName: "",
    licenseNumber: "",
    dealershipAddress: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    
    if (phoneNumber.length >= 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
    
    if (phoneNumber.length > 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
    }
    if (phoneNumber.length > 3) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    if (phoneNumber.length > 0) {
      return `(${phoneNumber}`;
    }
    return phoneNumber;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'mobileNumber' || name === 'businessNumber') {
      setFormData((prev) => ({
        ...prev,
        [name]: formatPhoneNumber(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleStateChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      state: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to save the buyer
    console.log("New buyer data:", formData);
    toast.success("Buyer added successfully!");
    setIsDialogOpen(false);
    setFormData({
      fullName: "",
      email: "",
      password: "",
      mobileNumber: "",
      businessNumber: "",
      dealershipName: "",
      licenseNumber: "",
      dealershipAddress: "",
      city: "",
      state: "",
      zipCode: "",
    });
  };

  const buyers: Buyer[] = [
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "(555) 123-4567",
      location: "Los Angeles, CA",
      totalBids: 15,
      successfulBids: 8,
      joinedDate: "2023-08-15",
    },
    {
      id: "2",
      name: "Sarah Williams",
      email: "sarah.w@email.com",
      phone: "(555) 234-5678",
      location: "New York, NY",
      totalBids: 23,
      successfulBids: 12,
      joinedDate: "2023-06-20",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike.j@email.com",
      phone: "(555) 345-6789",
      location: "Chicago, IL",
      totalBids: 8,
      successfulBids: 3,
      joinedDate: "2023-09-10",
    },
  ];

  const filteredBuyers = buyers.filter((buyer) => {
    const searchString = searchTerm.toLowerCase();
    return (
      buyer.name.toLowerCase().includes(searchString) ||
      buyer.email.toLowerCase().includes(searchString) ||
      buyer.location.toLowerCase().includes(searchString)
    );
  });

  const totalPages = Math.ceil(filteredBuyers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBuyers = filteredBuyers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center">
                <img 
                  src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" 
                  alt="BuyBidHQ Logo" 
                  className="h-8 w-auto"
                />
              </Link>
              <Link 
                to="/dashboard" 
                className="text-gray-700 hover:text-accent transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                to="/buyers" 
                className="text-gray-700 hover:text-accent transition-colors"
              >
                Buyers
              </Link>
              <button 
                className="text-gray-700 hover:text-accent transition-colors"
              >
                Marketplace
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <UserRound className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">Account</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Buyers</h1>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search buyers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-[300px]"
                  />
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                      <Plus className="h-4 w-4" />
                      Buyer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[672px]">
                    <DialogHeader>
                      <DialogTitle>Add New Buyer</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                            Full Name
                          </label>
                          <Input
                            id="fullName"
                            name="fullName"
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                          </label>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
                            Mobile Number
                          </label>
                          <Input
                            id="mobileNumber"
                            name="mobileNumber"
                            type="tel"
                            required
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            placeholder="(123) 456-7890"
                            maxLength={14}
                          />
                        </div>
                        <div>
                          <label htmlFor="businessNumber" className="block text-sm font-medium text-gray-700">
                            Business Number
                          </label>
                          <Input
                            id="businessNumber"
                            name="businessNumber"
                            type="tel"
                            required
                            value={formData.businessNumber}
                            onChange={handleChange}
                            placeholder="(123) 456-7890"
                            maxLength={14}
                          />
                        </div>
                        <div>
                          <label htmlFor="dealershipName" className="block text-sm font-medium text-gray-700">
                            Dealership Name
                          </label>
                          <Input
                            id="dealershipName"
                            name="dealershipName"
                            type="text"
                            required
                            value={formData.dealershipName}
                            onChange={handleChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                            Dealer ID
                          </label>
                          <Input
                            id="licenseNumber"
                            name="licenseNumber"
                            type="text"
                            required
                            value={formData.licenseNumber}
                            onChange={handleChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="dealershipAddress" className="block text-sm font-medium text-gray-700">
                            Dealership Address
                          </label>
                          <Input
                            id="dealershipAddress"
                            name="dealershipAddress"
                            type="text"
                            required
                            value={formData.dealershipAddress}
                            onChange={handleChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                            City
                          </label>
                          <Input
                            id="city"
                            name="city"
                            type="text"
                            required
                            value={formData.city}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                              State
                            </label>
                            <Select onValueChange={handleStateChange} value={formData.state}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                              <SelectContent>
                                {states.map((state) => (
                                  <SelectItem key={state} value={state}>
                                    {state}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                              ZIP Code
                            </label>
                            <Input
                              id="zipCode"
                              name="zipCode"
                              type="text"
                              required
                              value={formData.zipCode}
                              onChange={handleChange}
                              pattern="[0-9]{5}"
                              maxLength={5}
                              placeholder="12345"
                            />
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                        >
                          Add Buyer
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Total Bids</TableHead>
                    <TableHead>Successful Bids</TableHead>
                    <TableHead>Joined Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBuyers.map((buyer) => (
                    <TableRow key={buyer.id}>
                      <TableCell>{buyer.name}</TableCell>
                      <TableCell>{buyer.email}</TableCell>
                      <TableCell>{buyer.phone}</TableCell>
                      <TableCell>{buyer.location}</TableCell>
                      <TableCell>{buyer.totalBids}</TableCell>
                      <TableCell>{buyer.successfulBids}</TableCell>
                      <TableCell>{new Date(buyer.joinedDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredBuyers.length > itemsPerPage && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <PaginationItem key={index + 1}>
                          <PaginationLink
                            onClick={() => setCurrentPage(index + 1)}
                            isActive={currentPage === index + 1}
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Buyers;
