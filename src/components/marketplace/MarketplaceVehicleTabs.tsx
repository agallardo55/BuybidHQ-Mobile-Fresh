import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BidRequest } from "../bid-request/types";
import VehicleDetails from "../bid-request/components/VehicleDetails";
import VehicleCondition from "../bid-request/components/VehicleCondition";

interface MarketplaceVehicleTabsProps {
  request: BidRequest;
}

const MarketplaceVehicleTabs = ({ request }: MarketplaceVehicleTabsProps) => {
  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="condition">Condition</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-4">
        <VehicleDetails request={request} />
      </TabsContent>

      <TabsContent value="appearance" className="space-y-4">
        <div className="bg-white p-3 rounded-lg border">
          <h3 className="font-semibold text-lg mb-2">Appearance</h3>
          <div className="space-y-1">
            <div className="grid grid-cols-[120px_1fr] gap-1 text-sm">
              <div className="font-bold text-black">Exterior Color:</div>
              <div className="font-normal bg-gray-50 p-2 rounded">{request.vehicle?.exterior || request.exteriorColor || 'Not specified'}</div>
              <div className="font-bold text-black">Interior Color:</div>
              <div className="font-normal bg-gray-50 p-2 rounded">{request.vehicle?.interior || request.interiorColor || 'Not specified'}</div>
              <div className="font-bold text-black">Accessories:</div>
              <div className="font-normal bg-gray-50 p-2 rounded">{request.vehicle?.options || request.accessories || 'None'}</div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="condition" className="space-y-4">
        <VehicleCondition request={request} />
      </TabsContent>
    </Tabs>
  );
};

export default MarketplaceVehicleTabs;
