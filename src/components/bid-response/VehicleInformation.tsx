
import { VehicleDetails } from "./types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Props {
  vehicle: VehicleDetails;
}

const VehicleInformation = ({ vehicle }: Props) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">VIN</p>
              <p className="text-sm">{vehicle.vin}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Mileage</p>
              <p className="text-sm">{vehicle.mileage?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Engine</p>
              <p className="text-sm">{vehicle.engineCylinders}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Transmission</p>
              <p className="text-sm">{vehicle.transmission}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Drivetrain</p>
              <p className="text-sm">{vehicle.drivetrain}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Colors & Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Exterior Color</p>
              <p className="text-sm">{vehicle.exteriorColor}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Interior Color</p>
              <p className="text-sm">{vehicle.interiorColor}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Accessories</p>
              <p className="text-sm">{vehicle.accessories}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Condition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
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
              <p className="text-sm font-medium text-gray-500">Reconditioning Estimate</p>
              <p className="text-sm">{vehicle.reconEstimate}</p>
            </div>
            {vehicle.reconDetails && (
              <div>
                <p className="text-sm font-medium text-gray-500">Reconditioning Details</p>
                <p className="text-sm">{vehicle.reconDetails}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleInformation;
