
import React from "react";
import { Card } from "@/components/ui/card";
import { User, Building2, Phone } from "lucide-react";

interface SellerInformationProps {
  buyer: {
    name: string;
    dealership: string;
    mobileNumber: string;
  };
}

const SellerInformation = ({ buyer }: SellerInformationProps) => {
  return (
    <Card className="p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold mb-2">Seller Information</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-gray-500" />
          <span>{buyer.name}</span>
        </div>
        <div className="flex items-center">
          <Building2 className="h-4 w-4 mr-2 text-gray-500" />
          <span>{buyer.dealership}</span>
        </div>
        <div className="flex items-center">
          <Phone className="h-4 w-4 mr-2 text-gray-500" />
          <span>{buyer.mobileNumber}</span>
        </div>
      </div>
    </Card>
  );
};

export default SellerInformation;
