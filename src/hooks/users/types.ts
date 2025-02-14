
export interface UsePaginatedUsersProps {
  pageSize: number;
  currentPage: number;
  searchTerm?: string;
}

export interface PaginatedResponse {
  users: any[];
  total: number;
}
