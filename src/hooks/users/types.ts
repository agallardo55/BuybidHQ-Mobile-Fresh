
import { UserFormData, DealershipFormData } from "@/types/users";

export interface DeleteUserParams {
  userId: string;
  reason?: string;
}

export interface UpdateUserParams {
  userId: string;
  userData: UserFormData;
  dealershipData?: DealershipFormData;
}

export interface CreateUserParams {
  userData: UserFormData;
  dealershipData?: DealershipFormData;
}

export interface UsersQueryParams {
  pageSize: number;
  currentPage: number;
  searchTerm?: string;
}
