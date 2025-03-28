
import React from "react";
import { Card } from "@/components/ui/card";

interface SellerNotesProps {
  notes: string;
}

const SellerNotes = ({ notes }: SellerNotesProps) => {
  if (!notes) return null;
  
  return (
    <Card className="p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold mb-2">Notes from Seller</h3>
      <p className="text-sm text-gray-700">{notes}</p>
    </Card>
  );
};

export default SellerNotes;
