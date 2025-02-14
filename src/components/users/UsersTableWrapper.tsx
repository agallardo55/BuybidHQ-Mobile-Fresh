
import { User } from "@/types/users";
import UsersTable from "./UsersTable";
import UsersTableFooter from "./UsersTableFooter";

interface UsersTableWrapperProps {
  users: User[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onView: (user: User) => void;
  sortConfig: {
    field: keyof User | null;
    direction: 'asc' | 'desc' | null;
  };
  onSort: (field: keyof User) => void;
}

const UsersTableWrapper = ({
  users,
  currentPage,
  totalPages,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onView,
  sortConfig,
  onSort,
}: UsersTableWrapperProps) => {
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    return range;
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <UsersTable
          users={users}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          sortConfig={sortConfig}
          onSort={onSort}
        />
      </div>
      <UsersTableFooter
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        getPageNumbers={getPageNumbers}
      />
    </div>
  );
};

export default UsersTableWrapper;
