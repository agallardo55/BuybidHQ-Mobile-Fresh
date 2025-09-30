
import { BidRequest } from "../types";
import { getConditionDisplay } from "../utils/conditionFormatting";

interface VehicleConditionProps {
  request: BidRequest;
}

const VehicleCondition = ({ request }: VehicleConditionProps) => {
  return (
    <div className="bg-white p-3 rounded-lg border">
      <h3 className="font-semibold text-lg mb-2">Condition</h3>
      <div className="space-y-1">
        <div className="grid grid-cols-[100px_1fr] gap-1 text-sm">
          <div className="font-bold text-black">Windshield:</div>
          <div className="font-normal">{getConditionDisplay(request.windshield, 'windshield')}</div>
          <div className="font-bold text-black">Engine Lights:</div>
          <div className="font-normal">{getConditionDisplay(request.engineLights, 'engineLights')}</div>
          <div className="font-bold text-black">Brakes:</div>
          <div className="font-normal">{getConditionDisplay(request.brakes, 'brakesTires')}</div>
          <div className="font-bold text-black">Tires:</div>
          <div className="font-normal">{getConditionDisplay(request.tire, 'brakesTires')}</div>
          <div className="font-bold text-black">Maintenance:</div>
          <div className="font-normal">{getConditionDisplay(request.maintenance, 'maintenance')}</div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCondition;
