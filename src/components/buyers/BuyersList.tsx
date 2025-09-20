
import { Buyer } from "@/types/buyers";
import BuyersTable from "./BuyersTable";
import TableFooter from "@/components/bid-request/TableFooter";
import { BuyerMobileCard } from "./BuyerMobileCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface BuyersListProps {
  buyers: Buyer[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  totalItems: number;
  onDelete: (buyerId: string) => void;
  onEdit: (buyer: Buyer) => void;
  sortConfig: {
    field: keyof Buyer | null;
    direction: 'asc' | 'desc' | null;
  };
  onSort: (field: keyof Buyer) => void;
}

const BuyersList = ({ 
  buyers, 
  currentPage, 
  totalPages, 
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems,
  onDelete,
  onEdit,
  sortConfig,
  onSort
}: BuyersListProps) => {
  const isMobile = useIsMobile();
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

  if (isMobile) {
    return (
      <div>
        <div className="space-y-4 mb-6">
          {buyers.map((buyer) => (
            <BuyerMobileCard
              key={buyer.id}
              buyer={buyer}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
        <TableFooter
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          getPageNumbers={getPageNumbers}
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <BuyersTable 
        buyers={buyers} 
        onDelete={onDelete}
        onEdit={onEdit}
        sortConfig={sortConfig}
        onSort={onSort}
      />
      <TableFooter
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        getPageNumbers={getPageNumbers}
      />
    </div>
  );
};

export default BuyersList;
