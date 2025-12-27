
import { Card } from "@/components/ui/card";
import { QuickBidDetails } from "./types";

interface VehicleSummaryProps {
  vehicle: QuickBidDetails;
}

const VehicleSummary = ({ vehicle }: VehicleSummaryProps) => {
  const getConditionColor = (condition: string | undefined) => {
    switch (condition?.toLowerCase()) {
      case 'excellent':
        return 'bg-status-success-alt text-white';
      case 'good':
        return 'bg-status-success-alt text-white';
      case 'fair':
        return 'bg-status-caution text-white';
      case 'poor':
        return 'bg-status-alert text-white';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <Card className="p-4 rounded-xl shadow-md">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-bold text-gray-500">Year</p>
          <p className="text-lg font-black text-gray-900">{vehicle.vehicle_year}</p>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-500">Mileage</p>
          <p className="text-lg font-black text-gray-900">{Number(vehicle.vehicle_mileage).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-500">Condition</p>
          <div className={`px-3 py-1 rounded-full text-lg font-black ${getConditionColor(vehicle.book_values_condition)}`}>
            {vehicle.book_values_condition || 'N/A'}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VehicleSummary;
