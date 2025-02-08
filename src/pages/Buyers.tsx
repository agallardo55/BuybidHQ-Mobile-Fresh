
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
  const itemsPerPage = 5;

  // Sample data - in a real app, this would come from an API
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
                <Link to="/create-bid-request">
                  <Button variant="default" className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Plus className="h-4 w-4" />
                    Bid Request
                  </Button>
                </Link>
                <Button variant="default" className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Plus className="h-4 w-4" />
                  Buyer
                </Button>
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
