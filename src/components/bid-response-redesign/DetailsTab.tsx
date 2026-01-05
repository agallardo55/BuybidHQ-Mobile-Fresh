
import { QuickBidDetails } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DetailsTabProps {
  vehicle: QuickBidDetails;
}

const DetailItem = ({ label, value }: { label: string; value: string | undefined | null }) => (
  <div className="flex justify-between py-2 border-b">
    <p className="text-sm font-bold text-gray-500">{label}</p>
    <p className="text-sm font-black text-gray-900">{value || 'N/A'}</p>
  </div>
);

const DetailsTab = ({ vehicle }: DetailsTabProps) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailItem label="VIN" value={vehicle.vehicle_vin} />
          <DetailItem label="Year" value={vehicle.vehicle_year} />
          <DetailItem label="Make" value={vehicle.vehicle_make} />
          <DetailItem label="Model" value={vehicle.vehicle_model} />
          <DetailItem label="Trim" value={vehicle.vehicle_trim} />
          <DetailItem label="Body Style" value={vehicle.vehicle_body_style} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailItem label="Exterior Color" value={vehicle.vehicle_exterior_color} />
          <DetailItem label="Interior Color" value={vehicle.vehicle_interior_color} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Powertrain</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailItem label="Engine" value={vehicle.vehicle_engine} />
          <DetailItem label="Transmission" value={vehicle.vehicle_transmission} />
          <DetailItem label="Drivetrain" value={vehicle.vehicle_drivetrain} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 overflow-y-auto bg-gray-100 p-4 rounded-lg">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {vehicle.vehicle_accessories || 'No additional equipment listed.'}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailsTab;
