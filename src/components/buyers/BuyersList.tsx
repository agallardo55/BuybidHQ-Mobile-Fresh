
import { Buyer } from "@/types/buyers";
import BuyersTable from "./BuyersTable";
import TableFooter from "@/components/bid-request/TableFooter";

interface BuyersListProps {
  buyers: Buyer[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  totalItems: number;
}

const BuyersList = ({ 
  buyers, 
  currentPage, 
  totalPages, 
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems
}: BuyersListProps) => {
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
    <div className="overflow-x-auto">
      <BuyersTable buyers={buyers} />
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
