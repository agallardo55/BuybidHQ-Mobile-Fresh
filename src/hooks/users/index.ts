
import { useUsersQuery } from "./useUsersQuery";
import { useUsersMutations } from "./useUsersMutations";
import { UsePaginatedUsersProps } from "./types";

export const useUsers = (props: UsePaginatedUsersProps) => {
  const { data, isLoading } = useUsersQuery(props);
  const { createUser, updateUser, deleteUser } = useUsersMutations();

  return {
    users: data?.users || [],
    total: data?.total || 0,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
  };
};

export * from "./types";
