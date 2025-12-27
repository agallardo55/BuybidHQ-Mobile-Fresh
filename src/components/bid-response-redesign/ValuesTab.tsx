
import { QuickBidDetails } from "./types";
import { Card } from "@/components/ui/card";

interface ValuesTabProps {
  vehicle: QuickBidDetails;
}

const getConditionColor = (condition: string | undefined) => {
  switch (condition?.toLowerCase()) {
    case 'excellent':
      return 'bg-brand text-white';
    case 'good':
      return 'bg-green-600 text-white';
    case 'fair':
      return 'bg-yellow-600 text-white';
    case 'poor':
      return 'bg-red-600 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
};

const ValuesTab = ({ vehicle }: ValuesTabProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Book Values</h3>

      {/* Overall Condition */}
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Overall</p>
            <p className="text-2xl font-black text-gray-900">Condition</p>
          </div>
          <span className={`px-6 py-3 rounded-xl text-sm font-black uppercase ${getConditionColor(vehicle.book_values_condition)}`}>
            {vehicle.book_values_condition || 'N/A'}
          </span>
        </div>
      </Card>

      {/* Values Table */}
      <Card className="p-6 rounded-2xl">
        <div className="space-y-4">
          {/* Table Header */}
          <div className="grid grid-cols-3 gap-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Source</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center">Wholesale</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide text-right">Retail</p>
          </div>

          {/* Table Rows */}
          <div className="space-y-6">
            {/* Manheim */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <p className="text-lg font-black text-gray-900">Manheim</p>
              <p className="text-xl font-black text-brand text-center">${(vehicle.mmr_wholesale || 0).toLocaleString()}</p>
              <p className="text-xl font-black text-gray-900 text-right">${(vehicle.mmr_retail || 0).toLocaleString()}</p>
            </div>

            {/* KBB */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <p className="text-lg font-black text-gray-900">KBB</p>
              <p className="text-xl font-black text-brand text-center">${(vehicle.kbb_wholesale || 0).toLocaleString()}</p>
              <p className="text-xl font-black text-gray-900 text-right">${(vehicle.kbb_retail || 0).toLocaleString()}</p>
            </div>

            {/* JD Power */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <p className="text-lg font-black text-gray-900">JD Power</p>
              <p className="text-xl font-black text-brand text-center">${(vehicle.jd_power_wholesale || 0).toLocaleString()}</p>
              <p className="text-xl font-black text-gray-900 text-right">${(vehicle.jd_power_retail || 0).toLocaleString()}</p>
            </div>

            {/* Auction */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <p className="text-lg font-black text-gray-900">Auction</p>
              <p className="text-xl font-black text-brand text-center">${(vehicle.auction_wholesale || 0).toLocaleString()}</p>
              <p className="text-xl font-black text-gray-900 text-right">${(vehicle.auction_retail || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ValuesTab;
