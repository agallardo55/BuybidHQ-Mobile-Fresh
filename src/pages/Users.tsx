
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { User } from "@/types/users";
import AddUserDialog from "@/components/users/AddUserDialog";
import DeleteUserDialog from "@/components/users/DeleteUserDialog";

import EditUserDialog from "@/components/users/EditUserDialog";
import { useUsers } from "@/hooks/users";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import UsersSearch from "@/components/users/UsersSearch";
import UsersTableWrapper from "@/components/users/UsersTableWrapper";

type SortConfig = {
  field: keyof User | null;
  direction: 'asc' | 'desc' | null;
};

const Users = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'full_name', direction: 'asc' });

  const { currentUser, isLoading: isUserLoading } = useCurrentUser();
  const { users, total, isLoading, mutations } = useUsers({
    pageSize,
    currentPage,
    searchTerm,
  });

  const handleSort = (field: keyof User) => {
    setSortConfig((currentConfig) => {
      if (currentConfig.field === field) {
        if (currentConfig.direction === 'asc') {
          return { field, direction: 'desc' };
        } else if (currentConfig.direction === 'desc') {
          return { field: null, direction: null };
        }
      }
      return { field, direction: 'asc' };
    });
  };

  const sortUsers = (users: User[]) => {
    if (!sortConfig.field || !sortConfig.direction) {
      return users;
    }

    return [...users].sort((a, b) => {
      const aValue = a[sortConfig.field!];
      const bValue = b[sortConfig.field!];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const stringA = String(aValue).toLowerCase();
      const stringB = String(bValue).toLowerCase();
      
      return sortConfig.direction === 'asc'
        ? stringA.localeCompare(stringB)
        : stringB.localeCompare(stringA);
    });
  };

  const handleDelete = (userId: string) => {
    if (!userId) return;
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };


  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const confirmDelete = (reason?: string) => {
    if (!userToDelete) return;
    mutations.deleteUser.mutate({ 
      userId: userToDelete, 
      reason 
    });
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(total / pageSize);
  const sortedUsers = sortUsers(users);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="pt-20 px-6 lg:px-12 pb-20 sm:pb-8 flex-grow bg-slate-50/30">
          <div className="max-w-[1920px] mx-auto">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 sm:p-8">
              Loading users...
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pt-20 px-6 lg:px-12 pb-20 sm:pb-8 flex-grow bg-slate-50/30">
        <div className="max-w-[1920px] mx-auto">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Users</h1>
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mt-0.5">
                  User Account Management
                </p>
              </div>
              <div className="flex items-center gap-3">
                <UsersSearch
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                />
                <AddUserDialog />
              </div>
            </div>

            <UsersTableWrapper
              users={sortedUsers}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              total={total}
              onPageChange={setCurrentPage}
              onPageSizeChange={handlePageSizeChange}
              onEdit={handleEdit}
              onDelete={handleDelete}

              sortConfig={sortConfig}
              onSort={handleSort}
            />
          </div>
        </div>
      </div>

      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
      />


      <EditUserDialog
        user={selectedUser}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdate={(userId, userData, dealershipData) => {
          if (!userId) return;
          mutations.updateUser.mutate({ userId, userData, dealershipData });
        }}
      />
    </DashboardLayout>
  );
};

export default Users;
