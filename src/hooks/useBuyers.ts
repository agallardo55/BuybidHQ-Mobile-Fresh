
import { useBuyersQuery } from "./buyers/useBuyersQuery";
import { useBuyersMutations } from "./buyers/useBuyersMutations";

export const useBuyers = () => {
  const { data: buyers = [], isLoading } = useBuyersQuery();
  const { createBuyer, updateBuyer, deleteBuyer } = useBuyersMutations();

  return {
    buyers,
    isLoading,
    createBuyer,
    updateBuyer,
    deleteBuyer,
  };
};
