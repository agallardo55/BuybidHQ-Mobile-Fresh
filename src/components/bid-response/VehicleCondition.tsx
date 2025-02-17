
import { VehicleDetails } from "./types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Props {
  vehicle: VehicleDetails;
}

const VehicleCondition = ({ vehicle }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Condition</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Windshield</p>
            <p className="text-sm">{vehicle.windshield}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Engine Lights</p>
            <p className="text-sm">{vehicle.engineLights}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Brakes</p>
            <p className="text-sm">{vehicle.brakes}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tires</p>
            <p className="text-sm">{vehicle.tire}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Maintenance</p>
            <p className="text-sm">{vehicle.maintenance}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Recon Estimate</p>
            <p className="text-sm">${parseFloat(vehicle.reconEstimate).toLocaleString()}</p>
          </div>
        </div>
        {vehicle.reconDetails && (
          <div>
            <p className="text-sm font-medium text-gray-500">Recon Details</p>
            <p className="text-sm whitespace-pre-wrap">{vehicle.reconDetails}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VehicleCondition;
