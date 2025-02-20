
import { VehicleDetails } from "./types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Props {
  vehicle: VehicleDetails;
}

const VehicleInformation = ({ vehicle }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Year</p>
            <p className="text-sm">{vehicle.year}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Make</p>
            <p className="text-sm">{vehicle.make}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Model</p>
            <p className="text-sm">{vehicle.model}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Trim</p>
            <p className="text-sm">{vehicle.trim}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Exterior Color</p>
            <p className="text-sm">{vehicle.exteriorColor}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Interior Color</p>
            <p className="text-sm">{vehicle.interiorColor}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">VIN</p>
            <p className="text-sm">{vehicle.vin}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Mileage</p>
            <p className="text-sm">{vehicle.mileage?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Transmission</p>
            <p className="text-sm">{vehicle.transmission}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Engine</p>
            <p className="text-sm">{vehicle.engineCylinders}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Drivetrain</p>
            <p className="text-sm">{vehicle.drivetrain}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleInformation;
