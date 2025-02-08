
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

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

  // Dummy data for demonstration
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img 
                  src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" 
                  alt="BuyBidHQ Logo" 
                  className="h-8 w-auto"
                />
              </Link>
            </div>
            
            <div className="flex items-center space-x-2">
              <UserRound className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">Account</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Bid Requests</h1>
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
                  {filteredRequests.map((request) => (
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
        </div>
      </div>
    </div>
  );
};

export default BidRequestDashboard;
