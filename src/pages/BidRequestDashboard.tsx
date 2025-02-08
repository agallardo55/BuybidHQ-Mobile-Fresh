
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface BidRequest {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  vin: string;
  mileage: number;
  buyer: string;
  dealership: string;
  highestOffer: number;
}

const BidRequestDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Sample data - in a real app, this would come from an API
  const bidRequests: BidRequest[] = [
    {
      id: "1",
      year: 2021,
      make: "Toyota",
      model: "Camry",
      trim: "SE",
      vin: "1HGCM82633A123456",
      mileage: 35000,
      buyer: "John Smith",
      dealership: "ABC Motors",
      highestOffer: 22500,
    },
    {
      id: "2",
      year: 2020,
      make: "Honda",
      model: "CR-V",
      trim: "EX-L",
      vin: "5J6RW2H89LA123456",
      mileage: 42000,
      buyer: "Jane Doe",
      dealership: "XYZ Auto",
      highestOffer: 24800,
    },
    {
      id: "3",
      year: 2022,
      make: "Ford",
      model: "F-150",
      trim: "XLT",
      vin: "1FTEW1E53NFA12345",
      mileage: 28000,
      buyer: "Mike Johnson",
      dealership: "Ford Direct",
      highestOffer: 35600,
    },
    {
      id: "4",
      year: 2021,
      make: "Tesla",
      model: "Model 3",
      trim: "Long Range",
      vin: "5YJ3E1EA1MF123456",
      mileage: 15000,
      buyer: "Sarah Williams",
      dealership: "Tesla Store",
      highestOffer: 41200,
    },
    {
      id: "5",
      year: 2020,
      make: "BMW",
      model: "X5",
      trim: "xDrive40i",
      vin: "5UXCR6C06L9B12345",
      mileage: 32000,
      buyer: "Tom Brown",
      dealership: "BMW Excellence",
      highestOffer: 45800,
    },
    {
      id: "6",
      year: 2022,
      make: "Mercedes",
      model: "C-Class",
      trim: "C300",
      vin: "WDDWF4KB1NR123456",
      mileage: 12000,
      buyer: "Emily Davis",
      dealership: "Mercedes World",
      highestOffer: 39900,
    },
  ];

  const filteredRequests = bidRequests.filter((request) => {
    const searchString = searchTerm.toLowerCase();
    return (
      request.make.toLowerCase().includes(searchString) ||
      request.model.toLowerCase().includes(searchString) ||
      request.vin.toLowerCase().includes(searchString) ||
      request.buyer.toLowerCase().includes(searchString) ||
      request.dealership.toLowerCase().includes(searchString)
    );
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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
                onClick={() => setShowComingSoon(true)}
                className="text-gray-700 hover:text-accent transition-colors"
              >
                Marketplace
              </button>
              <Link 
                to="/create-bid-request" 
                className="text-gray-700 hover:text-accent transition-colors"
              >
                Bid Request
              </Link>
            </div>
            
            <div className="flex items-center space-x-2">
              <UserRound className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">Account</span>
            </div>
          </div>
        </div>
      </nav>

      <Dialog open={showComingSoon} onOpenChange={setShowComingSoon}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <span className="text-2xl font-bold animate-fade-in">
                  Coming Soon!
                </span>
                <p className="text-gray-500 text-sm animate-fade-in">
                  We're working hard to bring you an amazing marketplace experience.
                  Stay tuned!
                </p>
                <img
                  src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d"
                  alt="Vehicle Auction Marketplace"
                  className="w-full h-48 object-cover rounded-lg animate-fade-in"
                />
              </div>
            </DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div className="pt-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search bid requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-[300px]"
                  />
                </div>
                <Link to="/create-bid-request">
                  <Button variant="default" className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Plus className="h-4 w-4" />
                    Bid Request
                  </Button>
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Make</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Trim</TableHead>
                    <TableHead>VIN</TableHead>
                    <TableHead>Mileage</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Dealership</TableHead>
                    <TableHead>Highest Offer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.year}</TableCell>
                      <TableCell>{request.make}</TableCell>
                      <TableCell>{request.model}</TableCell>
                      <TableCell>{request.trim}</TableCell>
                      <TableCell>{request.vin}</TableCell>
                      <TableCell>{request.mileage.toLocaleString()}</TableCell>
                      <TableCell>{request.buyer}</TableCell>
                      <TableCell>{request.dealership}</TableCell>
                      <TableCell>${request.highestOffer.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredRequests.length > itemsPerPage && (
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

export default BidRequestDashboard;
