
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
      <CardContent>
        <div className="space-y-3">
          <div className="flex gap-2">
            <p className="text-base text-gray-500 min-w-[180px]">Windshield:</p>
            <p className="text-base font-medium">{vehicle.windshield}</p>
          </div>
          <div className="flex gap-2">
            <p className="text-base text-gray-500 min-w-[180px]">Engine Lights:</p>
            <p className="text-base font-medium">{vehicle.engineLights}</p>
          </div>
          <div className="flex gap-2">
            <p className="text-base text-gray-500 min-w-[180px]">Brakes:</p>
            <p className="text-base font-medium">{vehicle.brakes}</p>
          </div>
          <div className="flex gap-2">
            <p className="text-base text-gray-500 min-w-[180px]">Tires:</p>
            <p className="text-base font-medium">{vehicle.tire}</p>
          </div>
          <div className="flex gap-2">
            <p className="text-base text-gray-500 min-w-[180px]">Maintenance:</p>
            <p className="text-base font-medium">{vehicle.maintenance}</p>
          </div>
          <div className="flex gap-2">
            <p className="text-base text-gray-500 min-w-[180px]">Recon Estimate:</p>
            <p className="text-base font-medium">${vehicle.reconEstimate}</p>
          </div>
          {vehicle.reconDetails && (
            <div className="flex gap-2">
              <p className="text-base text-gray-500 min-w-[180px]">Recon Details:</p>
              <p className="text-base font-medium">{vehicle.reconDetails}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleCondition;
