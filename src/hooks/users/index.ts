
import { useUsersQuery } from "./useUsersQuery";
import { useUsersMutations } from "./useUsersMutations";
import { UsersQueryParams } from "./types";

export const useUsers = (params: UsersQueryParams) => {
  const { data, isLoading, error } = useUsersQuery(params);
  const mutations = useUsersMutations();

  return {
    users: data?.users || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutations
  };
};

export type * from "./types";
