import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BidRequest } from "../types";
import VehicleDetails from "./VehicleDetails";
import VehicleCondition from "./VehicleCondition";
import Reconditioning from "./Reconditioning";
import { Car, Eye, Wrench, DollarSign } from "lucide-react";

interface BidRequestTabsProps {
  request: BidRequest;
}

const BidRequestTabs = ({ request }: BidRequestTabsProps) => {
  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  return (
    <Tabs defaultValue="details" className="mt-2">
      <TabsList className="grid w-full grid-cols-4 mb-3">
        <TabsTrigger value="details" className="flex items-center gap-2 text-xs px-2 py-1.5">
          <Car size={14} />
          Details
        </TabsTrigger>
        <TabsTrigger value="appearance" className="flex items-center gap-2 text-xs px-2 py-1.5">
          <Eye size={14} />
          Appearance
        </TabsTrigger>
        <TabsTrigger value="condition" className="flex items-center gap-2 text-xs px-2 py-1.5">
          <Wrench size={14} />
          Condition
        </TabsTrigger>
        <TabsTrigger value="offers" className="flex items-center gap-2 text-xs px-2 py-1.5">
          <DollarSign size={14} />
          Offers
          {request.offers.length > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs px-1 py-0">
              {request.offers.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="min-h-[400px] overflow-y-auto">
        <VehicleDetails request={request} />
      </TabsContent>
      
      <TabsContent value="appearance" className="min-h-[400px] overflow-y-auto">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Vehicle Appearance</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Exterior Color</label>
              <p className="text-sm mt-1">{request.exteriorColor || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Interior Color</label>
              <p className="text-sm mt-1">{request.interiorColor || 'Not specified'}</p>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-600">Accessories & Options</label>
              <p className="text-sm mt-1">{request.accessories || 'None listed'}</p>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="condition" className="min-h-[400px] overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <VehicleCondition request={request} />
          <Reconditioning request={request} />
        </div>
      </TabsContent>
      
      <TabsContent value="offers" className="min-h-[400px] overflow-y-auto">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Bid Offers</h3>
          {request.offers.length > 0 ? (
            <div className="space-y-3">
              {request.offers.map((offer, index) => (
                <div key={offer.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{offer.buyerName}</h4>
                      <p className="text-sm text-gray-600">
                        Submitted on {new Date(offer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-600">
                        ${offer.amount.toLocaleString()}
                      </p>
                      <Badge 
                        variant={
                          offer.status === 'accepted' ? 'default' : 
                          offer.status === 'declined' ? 'destructive' : 
                          'secondary'
                        }
                      >
                        {capitalizeFirstLetter(offer.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <DollarSign size={40} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">No offers received yet</p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default BidRequestTabs;