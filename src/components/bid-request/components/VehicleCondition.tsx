
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
        <div className="grid grid-cols-[140px_1fr] gap-2 text-sm">
          <div className="font-bold text-black">History Service:</div>
          <div className="font-normal p-2 rounded block w-full bg-gray-50">{request.historyService || 'Not Specified'}</div>
          <div className="font-bold text-black">History:</div>
          <div className="font-normal p-2 rounded block w-full bg-gray-50">{getConditionDisplay(request.history, 'history')}</div>
          <div className="font-bold text-black">Windshield:</div>
          <div className="font-normal p-2 rounded block w-full bg-gray-50">{getConditionDisplay(request.windshield, 'windshield')}</div>
          <div className="font-bold text-black">Engine Lights:</div>
          <div className="font-normal p-2 rounded block w-full bg-gray-50">{getConditionDisplay(request.engineLights, 'engineLights')}</div>
          <div className="font-bold text-black">Brakes:</div>
          <div className="font-normal p-2 rounded block w-full bg-gray-50">{getConditionDisplay(request.brakes, 'brakesTires')}</div>
          <div className="font-bold text-black">Tires:</div>
          <div className="font-normal p-2 rounded block w-full bg-gray-50">{getConditionDisplay(request.tire, 'brakesTires')}</div>
          <div className="font-bold text-black">Maintenance:</div>
          <div className="font-normal p-2 rounded block w-full bg-gray-50">{getConditionDisplay(request.maintenance, 'maintenance')}</div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCondition;
