
import { Buyer } from "@/types/buyers";
import BuyersTable from "./BuyersTable";
import TableFooter from "@/components/bid-request/TableFooter";

interface BuyersListProps {
  buyers: Buyer[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const BuyersList = ({ buyers, currentPage, totalPages, onPageChange }: BuyersListProps) => {
  const pageSize = 5; // Default page size from Buyers.tsx

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
        totalItems={buyers.length}
        onPageChange={onPageChange}
        onPageSizeChange={() => {}} // We'll keep the page size fixed at 5 for now
        getPageNumbers={getPageNumbers}
      />
    </div>
  );
};

export default BuyersList;
