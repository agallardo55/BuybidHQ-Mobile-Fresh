
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
          <CardTitle className="text-2xl">Vehicle Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-2 md:gap-4 p-2">
              <p className="text-base font-bold text-gray-500">VIN</p>
              <p className="text-base font-normal">{vehicle.vin}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-2 md:gap-4 p-2">
              <p className="text-base font-bold text-gray-500">Mileage</p>
              <p className="text-base font-normal">{vehicle.mileage?.toLocaleString()}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-2 md:gap-4 p-2">
              <p className="text-base font-bold text-gray-500">Engine</p>
              <p className="text-base font-normal">{vehicle.engineCylinders}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-2 md:gap-4 p-2">
              <p className="text-base font-bold text-gray-500">Transmission</p>
              <p className="text-base font-normal">{vehicle.transmission}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-2 md:gap-4 p-2">
              <p className="text-base font-bold text-gray-500">Drivetrain</p>
              <p className="text-base font-normal">{vehicle.drivetrain}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Colors & Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-2 md:gap-4 p-2">
              <p className="text-base font-bold text-gray-500">Exterior Color</p>
              <p className="text-base font-normal">{vehicle.exteriorColor}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-2 md:gap-4 p-2">
              <p className="text-base font-bold text-gray-500">Interior Color</p>
              <p className="text-base font-normal">{vehicle.interiorColor}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-2 md:gap-4 p-2">
              <p className="text-base font-bold text-gray-500">Accessories</p>
              <p className="text-base font-normal">{vehicle.accessories}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Vehicle Condition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-2 md:gap-4 p-2">
              <p className="text-base font-bold text-gray-500">Windshield</p>
              <p className="text-base font-normal">{vehicle.windshield}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-2 md:gap-4 p-2">
              <p className="text-base font-bold text-gray-500">Engine Lights</p>
              <p className="text-base font-normal">{vehicle.engineLights}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-2 md:gap-4 p-2">
              <p className="text-base font-bold text-gray-500">Brakes</p>
              <p className="text-base font-normal">{vehicle.brakes}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-2 md:gap-4 p-2">
              <p className="text-base font-bold text-gray-500">Tires</p>
              <p className="text-base font-normal">{vehicle.tire}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-2 md:gap-4 p-2">
              <p className="text-base font-bold text-gray-500">Maintenance</p>
              <p className="text-base font-normal">{vehicle.maintenance}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-2 md:gap-4 p-2">
              <p className="text-base font-bold text-gray-500">Reconditioning Estimate</p>
              <p className="text-base font-normal">{vehicle.reconEstimate}</p>
            </div>
            {vehicle.reconDetails && (
              <div className="grid md:grid-cols-2 gap-2 md:gap-4 p-2">
                <p className="text-base font-bold text-gray-500">Reconditioning Details</p>
                <p className="text-base font-normal">{vehicle.reconDetails}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleInformation;
