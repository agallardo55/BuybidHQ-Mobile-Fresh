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
import { Search, Plus } from "lucide-react";
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
import DashboardNavigation from "@/components/DashboardNavigation";
import Footer from "@/components/Footer";

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
      request.year.toString().includes(searchString) ||
      request.make.toLowerCase().includes(searchString) ||
      request.model.toLowerCase().includes(searchString) ||
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardNavigation />

      <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-6 flex-grow">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-[225px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
                <Link to="/create-bid-request" className="w-full sm:w-auto">
                  <Button variant="default" className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    Bid Request
                  </Button>
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto -mx-4 sm:-mx-6">
              <div className="inline-block min-w-full align-middle px-4 sm:px-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Year</TableHead>
                      <TableHead className="whitespace-nowrap">Make</TableHead>
                      <TableHead className="whitespace-nowrap">Model</TableHead>
                      <TableHead className="whitespace-nowrap">Trim</TableHead>
                      <TableHead className="whitespace-nowrap">VIN</TableHead>
                      <TableHead className="whitespace-nowrap">Mileage</TableHead>
                      <TableHead className="whitespace-nowrap">Buyer</TableHead>
                      <TableHead className="whitespace-nowrap">Dealership</TableHead>
                      <TableHead className="whitespace-nowrap">Highest Offer</TableHead>
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
              </div>
            </div>
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

      <Footer />
    </div>
  );
};

export default BidRequestDashboard;
