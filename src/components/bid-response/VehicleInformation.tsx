
import { VehicleDetails } from "./types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getConditionDisplay } from "../bid-request/utils/conditionFormatting";

interface Props {
  vehicle: VehicleDetails;
}

const VehicleInformation = ({ vehicle }: Props) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl md:text-2xl">Vehicle Details</CardTitle>
        </CardHeader>
        <Separator className="mb-4" />
        <CardContent>
          <div className="grid gap-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-1">
              <p className="text-sm md:text-base font-bold text-gray-500">VIN</p>
              <p className="text-sm md:text-base font-normal">{vehicle.vin}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-1">
              <p className="text-sm md:text-base font-bold text-gray-500">Mileage</p>
              <p className="text-sm md:text-base font-normal">{vehicle.mileage?.toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-1">
              <p className="text-sm md:text-base font-bold text-gray-500">Engine</p>
              <p className="text-sm md:text-base font-normal">{vehicle.engineCylinders}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-1">
              <p className="text-sm md:text-base font-bold text-gray-500">Transmission</p>
              <p className="text-sm md:text-base font-normal">{vehicle.transmission}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-1">
              <p className="text-sm md:text-base font-bold text-gray-500">Drivetrain</p>
              <p className="text-sm md:text-base font-normal">{vehicle.drivetrain}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl md:text-2xl">Colors & Accessories</CardTitle>
        </CardHeader>
        <Separator className="mb-4" />
        <CardContent>
          <div className="grid gap-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-1">
              <p className="text-sm md:text-base font-bold text-gray-500">Exterior Color</p>
              <p className="text-sm md:text-base font-normal">{vehicle.exteriorColor}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-1">
              <p className="text-sm md:text-base font-bold text-gray-500">Interior Color</p>
              <p className="text-sm md:text-base font-normal">{vehicle.interiorColor}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-1">
              <p className="text-sm md:text-base font-bold text-gray-500">Accessories</p>
              <p className="text-sm md:text-base font-normal">{vehicle.accessories}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl md:text-2xl">Vehicle Condition</CardTitle>
        </CardHeader>
        <Separator className="mb-4" />
        <CardContent>
          <div className="grid gap-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-1">
              <p className="text-sm md:text-base font-bold text-gray-500">Windshield</p>
              <p className="text-sm md:text-base font-normal">{getConditionDisplay(vehicle.windshield, 'windshield')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-1">
              <p className="text-sm md:text-base font-bold text-gray-500">Engine Lights</p>
              <p className="text-sm md:text-base font-normal">{getConditionDisplay(vehicle.engineLights, 'engineLights')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-1">
              <p className="text-sm md:text-base font-bold text-gray-500">Brakes</p>
              <p className="text-sm md:text-base font-normal">{getConditionDisplay(vehicle.brakes, 'brakesTires')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-1">
              <p className="text-sm md:text-base font-bold text-gray-500">Tires</p>
              <p className="text-sm md:text-base font-normal">{getConditionDisplay(vehicle.tire, 'brakesTires')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-1">
              <p className="text-sm md:text-base font-bold text-gray-500">Maintenance</p>
              <p className="text-sm md:text-base font-normal">{getConditionDisplay(vehicle.maintenance, 'maintenance')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-1">
              <p className="text-sm md:text-base font-bold text-gray-500">Reconditioning Estimate</p>
              <p className="text-sm md:text-base font-normal">${vehicle.reconEstimate}</p>
            </div>
            {vehicle.reconDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-1">
                <p className="text-sm md:text-base font-bold text-gray-500">Reconditioning Details</p>
                <p className="text-sm md:text-base font-normal">{vehicle.reconDetails}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleInformation;
