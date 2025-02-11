
import { useState } from "react";
import DashboardNavigation from "@/components/DashboardNavigation";
import AdminFooter from "@/components/footer/AdminFooter";
import UsersTable from "@/components/users/UsersTable";
import { UserFormData } from "@/types/users";
import AddUserDialog from "@/components/users/AddUserDialog";
import DeleteUserDialog from "@/components/users/DeleteUserDialog";
import { useUsers } from "@/hooks/useUsers";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const Users = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<UserFormData>({
    fullName: "",
    email: "",
    role: "basic",
    mobileNumber: "",
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
              {currentUser?.role === 'admin' && (
                <AddUserDialog
                  isOpen={isDialogOpen}
                  onOpenChange={setIsDialogOpen}
                  onSubmit={handleSubmit}
                  formData={formData}
                  onFormDataChange={handleFormDataChange}
                />
              )}
            </div>
            <div className="overflow-x-auto">
              <UsersTable
                users={users}
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
