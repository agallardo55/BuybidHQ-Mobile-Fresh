import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import DashboardNavigation from "@/components/DashboardNavigation";
import AdminFooter from "@/components/footer/AdminFooter";
import { User, UserFormData } from "@/types/users";
import UsersTable from "@/components/users/UsersTable";
import AddUserForm from "@/components/users/AddUserForm";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Users = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<UserFormData>({
    fullName: "",
    email: "",
    role: "basic",
    mobileNumber: "",
  });

  const { data: currentUser, isLoading: isUserLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      const { data: userData, error: userError } = await supabase
        .from('buybidhq_users')
        .select('role')
        .eq('id', user?.id)
        .single();
        
      if (userError) throw userError;
      return userData;
    },
    onSuccess: (data) => {
      // Redirect if user is not admin or dealer
      if (data.role !== 'admin' && data.role !== 'dealer') {
        toast.error("You don't have permission to access this page");
        navigate('/dashboard');
      }
    },
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buybidhq_users')
        .select('*');

      if (error) {
        toast.error("Failed to fetch users: " + error.message);
        throw error;
      }

      return data.map(user => ({
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        status: user.status || 'active',
        mobileNumber: user.mobile_number,
      }));
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      // Create a properly structured object for Supabase insert
      const insertData = {
        full_name: userData.fullName,
        email: userData.email,
        role: userData.role,
        mobile_number: userData.mobileNumber,
        status: 'active'
      };

      const { data, error } = await supabase
        .from('buybidhq_users')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("User added successfully!");
      setIsDialogOpen(false);
      setFormData({
        fullName: "",
        email: "",
        role: "basic",
        mobileNumber: "",
      });
    },
    onError: (error) => {
      toast.error("Failed to add user: " + error.message);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('buybidhq_users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("User deleted successfully!");
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (error) => {
      toast.error("Failed to delete user: " + error.message);
    },
  });

  const handleFormDataChange = (data: Partial<UserFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(formData);
  };

  const handleDelete = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete);
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
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                      <Plus className="h-4 w-4" />
                      User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                    </DialogHeader>
                    <AddUserForm
                      onSubmit={handleSubmit}
                      formData={formData}
                      onFormDataChange={handleFormDataChange}
                    />
                  </DialogContent>
                </Dialog>
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AdminFooter />
    </div>
  );
};

export default Users;
