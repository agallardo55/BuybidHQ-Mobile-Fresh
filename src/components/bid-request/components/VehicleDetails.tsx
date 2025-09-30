
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
            <div className="font-bold text-black">Year:</div>
            <div className="font-normal">{request.year}</div>
            <div className="font-bold text-black">Make:</div>
            <div className="font-normal">{request.make}</div>
            <div className="font-bold text-black">Model:</div>
            <div className="font-normal">{request.model}</div>
            <div className="font-bold text-black">Trim:</div>
            <div className="font-normal">{request.trim}</div>
            <div className="font-bold text-black">VIN:</div>
            <div className="font-normal break-all">{request.vin}</div>
            <div className="font-bold text-black">Mileage:</div>
            <div className="font-normal">{request.mileage.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg border">
        <h3 className="font-semibold text-lg mb-2">Technical Specs</h3>
        <div className="space-y-1">
          <div className="grid grid-cols-[100px_1fr] gap-1 text-sm">
            <div className="font-bold text-black">Engine:</div>
            <div className="font-normal">{request.engineCylinders}</div>
            <div className="font-bold text-black">Transmission:</div>
            <div className="font-normal">{request.transmission}</div>
            <div className="font-bold text-black">Drivetrain:</div>
            <div className="font-normal">{request.drivetrain}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
