
import { BidRequest } from "../types";

interface VehicleDetailsProps {
  request: BidRequest;
}

const VehicleDetails = ({ request }: VehicleDetailsProps) => {
  // Handle both flat structure and nested vehicle structure
  const vehicle = (request as any).vehicle || request;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="bg-white p-3 rounded-lg border">
        <h3 className="font-semibold text-lg mb-2">Details</h3>
        <div className="space-y-1">
          <div className="grid grid-cols-[100px_1fr] gap-1 text-sm">
            <div className="font-bold text-black">Year:</div>
            <div className="font-normal p-2 rounded block w-full" style={{ backgroundColor: '#ECEEF0' }}>{vehicle.year || request.year || 'N/A'}</div>
            <div className="font-bold text-black">Make:</div>
            <div className="font-normal p-2 rounded block w-full" style={{ backgroundColor: '#ECEEF0' }}>{vehicle.make || request.make || 'N/A'}</div>
            <div className="font-bold text-black">Model:</div>
            <div className="font-normal p-2 rounded block w-full" style={{ backgroundColor: '#ECEEF0' }}>{vehicle.model || request.model || 'N/A'}</div>
            <div className="font-bold text-black">Trim:</div>
            <div className="font-normal p-2 rounded block w-full" style={{ backgroundColor: '#ECEEF0' }}>{vehicle.trim || request.trim || 'N/A'}</div>
            <div className="font-bold text-black">VIN:</div>
            <div className="font-normal p-2 rounded break-all block w-full" style={{ backgroundColor: '#ECEEF0' }}>{vehicle.vin || request.vin || 'N/A'}</div>
            <div className="font-bold text-black">Mileage:</div>
            <div className="font-normal p-2 rounded block w-full" style={{ backgroundColor: '#ECEEF0' }}>
              {(vehicle.mileage || request.mileage) ? Number(vehicle.mileage || request.mileage).toLocaleString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg border">
        <h3 className="font-semibold text-lg mb-2">Technical Specs</h3>
        <div className="space-y-1">
          <div className="grid grid-cols-[100px_1fr] gap-1 text-sm">
            <div className="font-bold text-black">Engine:</div>
            <div className="font-normal p-2 rounded block w-full" style={{ backgroundColor: '#ECEEF0' }}>{vehicle.engine || request.engineCylinders || 'N/A'}</div>
            <div className="font-bold text-black">Transmission:</div>
            <div className="font-normal p-2 rounded block w-full" style={{ backgroundColor: '#ECEEF0' }}>{vehicle.transmission || request.transmission || 'N/A'}</div>
            <div className="font-bold text-black">Drivetrain:</div>
            <div className="font-normal p-2 rounded block w-full" style={{ backgroundColor: '#ECEEF0' }}>{vehicle.drivetrain || request.drivetrain || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
