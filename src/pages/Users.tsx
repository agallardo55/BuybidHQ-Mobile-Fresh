import { useState } from "react";
import DashboardNavigation from "@/components/DashboardNavigation";
import AdminFooter from "@/components/footer/AdminFooter";
import UsersTable from "@/components/users/UsersTable";
import { UserFormData } from "@/types/users";
import AddUserDialog from "@/components/users/AddUserDialog";
import DeleteUserDialog from "@/components/users/DeleteUserDialog";
import { useUsers } from "@/hooks/useUsers";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Users = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState<UserFormData>({
    fullName: "",
    email: "",
    role: "basic",
    mobileNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    dealership: "",
    isActive: true,
  });

  const { currentUser, isLoading: isUserLoading } = useCurrentUser();
  const { users, isLoading, createUser, deleteUser } = useUsers();

  const handleFormDataChange = (data: Partial<UserFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createUser(formData);
    setIsDialogOpen(false);
    setFormData({
      fullName: "",
      email: "",
      role: "basic",
      mobileNumber: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      dealership: "",
      isActive: true,
    });
  };

  const handleDelete = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F6F6F7]">
        <DashboardNavigation />
        <div className="pt-24 px-4 sm:px-8 flex-grow">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              Loading users...
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

      <div className="pt-24 px-4 sm:px-8 flex-grow pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Users</h1>
              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 sm:items-center">
                <div className="relative w-full sm:w-[300px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {/* TODO: Implement proper authentication and role-based access control later */}
                <AddUserDialog
                  isOpen={isDialogOpen}
                  onOpenChange={setIsDialogOpen}
                  onSubmit={handleSubmit}
                  formData={formData}
                  onFormDataChange={handleFormDataChange}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <UsersTable
                users={filteredUsers}
                onEdit={() => {}}
                onDelete={handleDelete}
                onView={() => {}}
                currentUserRole={currentUser?.role}
              />
            </div>
          </div>
        </div>
      </div>

      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
      />

      <AdminFooter />
    </div>
  );
};

export default Users;
