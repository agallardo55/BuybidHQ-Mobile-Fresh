
import { BidRequest } from "../types";
import { getConditionDisplay } from "../utils/conditionFormatting";

interface VehicleConditionProps {
  request: BidRequest;
}

const VehicleCondition = ({ request }: VehicleConditionProps) => {
  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="font-semibold text-lg mb-2">Condition</h3>
      <div className="space-y-1">
        <div className="grid grid-cols-[100px_1fr] gap-1 text-sm">
          <div className="text-gray-500">Windshield:</div>
          <div className="font-medium">{getConditionDisplay(request.windshield, 'windshield')}</div>
          <div className="text-gray-500">Engine Lights:</div>
          <div className="font-medium">{getConditionDisplay(request.engineLights, 'engineLights')}</div>
          <div className="text-gray-500">Brakes:</div>
          <div className="font-medium">{getConditionDisplay(request.brakes, 'brakesTires')}</div>
          <div className="text-gray-500">Tires:</div>
          <div className="font-medium">{getConditionDisplay(request.tire, 'brakesTires')}</div>
          <div className="text-gray-500">Maintenance:</div>
          <div className="font-medium">{getConditionDisplay(request.maintenance, 'maintenance')}</div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCondition;
