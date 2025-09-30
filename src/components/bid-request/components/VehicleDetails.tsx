
import { BidRequest } from "../types";

interface VehicleDetailsProps {
  request: BidRequest;
}

const VehicleDetails = ({ request }: VehicleDetailsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="bg-white p-3 rounded-lg border">
        <h3 className="font-semibold text-lg mb-2">Details</h3>
        <div className="space-y-1">
          <div className="grid grid-cols-[100px_1fr] gap-1 text-sm">
            <div className="font-bold text-gray-500">Year:</div>
            <div className="font-medium">{request.year}</div>
            <div className="font-bold text-gray-500">Make:</div>
            <div className="font-medium">{request.make}</div>
            <div className="font-bold text-gray-500">Model:</div>
            <div className="font-medium">{request.model}</div>
            <div className="font-bold text-gray-500">Trim:</div>
            <div className="font-medium">{request.trim}</div>
            <div className="font-bold text-gray-500">VIN:</div>
            <div className="font-medium break-all">{request.vin}</div>
            <div className="font-bold text-gray-500">Mileage:</div>
            <div className="font-medium">{request.mileage.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg border">
        <h3 className="font-semibold text-lg mb-2">Technical Specs</h3>
        <div className="space-y-1">
          <div className="grid grid-cols-[100px_1fr] gap-1 text-sm">
            <div className="font-bold text-gray-500">Engine:</div>
            <div className="font-medium">{request.engineCylinders}</div>
            <div className="font-bold text-gray-500">Transmission:</div>
            <div className="font-medium">{request.transmission}</div>
            <div className="font-bold text-gray-500">Drivetrain:</div>
            <div className="font-medium">{request.drivetrain}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
