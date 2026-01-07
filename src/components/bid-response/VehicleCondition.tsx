
import { VehicleDetails } from "./types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getConditionDisplay } from "@/components/bid-request/utils/conditionFormatting";
import MeasurementBadges from "./MeasurementBadges";

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-base lg:text-base text-lg font-medium text-gray-500">Windshield</p>
            <p className="text-base lg:text-base text-lg">{getConditionDisplay(vehicle.windshield, 'windshield')}</p>
          </div>
          <div>
            <p className="text-base lg:text-base text-lg font-medium text-gray-500">Engine Lights</p>
            <p className="text-base lg:text-base text-lg">{getConditionDisplay(vehicle.engineLights, 'engineLights')}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-base lg:text-base text-lg font-medium text-gray-500 mb-2">Brakes</p>
            <MeasurementBadges type="brakes" measurements={vehicle.brakes} />
          </div>
          <div className="md:col-span-2">
            <p className="text-base lg:text-base text-lg font-medium text-gray-500 mb-2">Tires</p>
            <MeasurementBadges type="tires" measurements={vehicle.tire} />
          </div>
          <div>
            <p className="text-base lg:text-base text-lg font-medium text-gray-500">Maintenance</p>
            <p className="text-base lg:text-base text-lg">{getConditionDisplay(vehicle.maintenance, 'maintenance')}</p>
          </div>
          <div>
            <p className="text-base lg:text-base text-lg font-medium text-gray-500">Recon Estimate</p>
            <p className="text-base lg:text-base text-lg">${parseFloat(vehicle.reconEstimate).toLocaleString()}</p>
          </div>
        </div>
        {vehicle.reconDetails && (
          <div>
            <p className="text-base lg:text-base text-lg font-medium text-gray-500">Recon Details</p>
            <p className="text-base lg:text-base text-lg whitespace-pre-wrap">{vehicle.reconDetails}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VehicleCondition;

