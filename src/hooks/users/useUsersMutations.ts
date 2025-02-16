
import { useCreateUser } from "./mutations/useCreateUser";
import { useUpdateUser } from "./mutations/useUpdateUser";
import { useDeleteUser } from "./mutations/useDeleteUser";

export const useUsersMutations = () => {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  return {
    createUser,
    updateUser,
    deleteUser
  };
};
