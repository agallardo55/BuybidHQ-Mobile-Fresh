
import { useState } from "react";
import DashboardNavigation from "@/components/DashboardNavigation";
import AdminFooter from "@/components/footer/AdminFooter";
import { useDealershipsQuery } from "@/hooks/dealerships/useDealershipsQuery";
import { useDealershipMutations } from "@/hooks/dealerships/useDealershipMutations";
import { Dealership } from "@/types/dealerships";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

const Dealerships = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedDealership, setSelectedDealership] = useState<Dealership | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data, isLoading } = useDealershipsQuery({
    pageSize,
    currentPage,
    searchTerm,
  });

  const dealerships = data?.dealerships || [];
  const total = data?.total || 0;

  const mutations = useDealershipMutations();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F6F6F7]">
        <DashboardNavigation />
        <div className="pt-24 px-4 sm:px-8 flex-grow">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              Loading dealerships...
            </div>
          </div>
        </div>
        <AdminFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F6F7]">
      <DashboardNavigation />

      <div className="pt-24 px-4 sm:px-8 flex-grow">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Dealerships</h1>
              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 sm:items-center">
                <Input
                  placeholder="Search dealerships..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="max-w-xs"
                />
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-accent hover:bg-accent/90">
                      <Plus className="mr-2 h-4 w-4" /> Add Dealership
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Dealership</DialogTitle>
                    </DialogHeader>
                    {/* Add dealership form component here */}
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dealership Name</TableHead>
                    <TableHead>Dealer ID</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Primary Dealer</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dealerships.map((dealership) => (
                    <TableRow key={dealership.id}>
                      <TableCell className="font-medium">{dealership.dealer_name}</TableCell>
                      <TableCell>{dealership.dealer_id}</TableCell>
                      <TableCell>
                        <div>{dealership.business_phone}</div>
                        <div className="text-sm text-gray-500">{dealership.business_email}</div>
                      </TableCell>
                      <TableCell>
                        <div>{dealership.city}</div>
                        <div className="text-sm text-gray-500">{dealership.state}</div>
                      </TableCell>
                      <TableCell>
                        {/* Add primary dealer info here */}
                      </TableCell>
                      <TableCell>
                        {/* Add action buttons here */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      <AdminFooter />
    </div>
  );
};

export default Dealerships;
