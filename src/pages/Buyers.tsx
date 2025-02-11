
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
import { Search, UserRound, Plus, Bell } from "lucide-react";
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
import DashboardNavigation from "@/components/DashboardNavigation";
import Footer from "@/components/Footer";

interface Buyer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  acceptedBids: number;
  pendingBids: number;
  declinedBids: number;
}

const Buyers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
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
      acceptedBids: 12,
      pendingBids: 4,
      declinedBids: 3,
    },
    {
      id: "2",
      name: "Sarah Williams",
      email: "sarah.w@email.com",
      phone: "(555) 234-5678",
      location: "New York, NY",
      acceptedBids: 18,
      pendingBids: 6,
      declinedBids: 5,
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike.j@email.com",
      phone: "(555) 345-6789",
      location: "Chicago, IL",
      acceptedBids: 6,
      pendingBids: 3,
      declinedBids: 2,
    },
    {
      id: "4",
      name: "Emily Brown",
      email: "emily.b@email.com",
      phone: "(555) 456-7890",
      location: "Houston, TX",
      acceptedBids: 15,
      pendingBids: 8,
      declinedBids: 4,
    },
    {
      id: "5",
      name: "David Wilson",
      email: "david.w@email.com",
      phone: "(555) 567-8901",
      location: "Miami, FL",
      acceptedBids: 9,
      pendingBids: 4,
      declinedBids: 3,
    },
    {
      id: "6",
      name: "Lisa Anderson",
      email: "lisa.a@email.com",
      phone: "(555) 678-9012",
      location: "Seattle, WA",
      acceptedBids: 22,
      pendingBids: 7,
      declinedBids: 6,
    }
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

  console.log({
    filteredBuyersLength: filteredBuyers.length,
    itemsPerPage,
    totalPages,
    shouldShowPagination: filteredBuyers.length > itemsPerPage
  });

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardNavigation />

      <div className="pt-24 px-4 sm:px-8 flex-grow pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Buyers</h1>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-[300px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search buyers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
                      <Plus className="h-4 w-4" />
                      Buyer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-[672px] h-[90vh] sm:h-auto overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Buyer</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <TableHead>Accepted</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Declined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBuyers.map((buyer) => (
                    <TableRow key={buyer.id}>
                      <TableCell>{buyer.name}</TableCell>
                      <TableCell>{buyer.email}</TableCell>
                      <TableCell>{buyer.phone}</TableCell>
                      <TableCell>{buyer.location}</TableCell>
                      <TableCell>{buyer.acceptedBids}</TableCell>
                      <TableCell>{buyer.pendingBids}</TableCell>
                      <TableCell>{buyer.declinedBids}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Buyers;

