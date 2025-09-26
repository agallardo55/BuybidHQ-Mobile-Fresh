import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Placeholder data - this would come from actual API
const mockAccountAdmins = [
  {
    id: "1",
    full_name: "John Smith",
    email: "john.smith@dealership.com",
    phone: "(555) 123-4567",
    account_name: "Premium Auto Group",
    status: "active",
    created_at: "2024-01-15",
  },
  {
    id: "2", 
    full_name: "Sarah Wilson",
    email: "sarah.wilson@motors.com",
    phone: "(555) 987-6543",
    account_name: "Wilson Motors",
    status: "active",
    created_at: "2024-02-20",
  },
];

interface AccountAdminTableProps {
  searchTerm: string;
}

export const AccountAdminTable = ({ searchTerm }: AccountAdminTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter admins based on search term
  const filteredAdmins = mockAccountAdmins.filter(admin =>
    admin.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.account_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateAdmin = () => {
    console.log("Create new account admin");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Account Administrators</h2>
          <p className="text-sm text-muted-foreground">
            Manage account administrators and their permissions
          </p>
        </div>
        <Button onClick={handleCreateAdmin} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Account Admin
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdmins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-muted-foreground">
                    {searchTerm ? "No account admins found matching your search." : "No account admins found."}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.full_name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.phone}</TableCell>
                  <TableCell>{admin.account_name}</TableCell>
                  <TableCell>
                    <Badge variant={admin.status === 'active' ? 'default' : 'secondary'}>
                      {admin.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination placeholder */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredAdmins.length} of {mockAccountAdmins.length} account admins
        </div>
      </div>
    </div>
  );
};

export default AccountAdminTable;