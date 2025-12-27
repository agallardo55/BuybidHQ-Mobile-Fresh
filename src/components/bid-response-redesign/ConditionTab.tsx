
import { QuickBidDetails } from "./types";
import { Card } from "@/components/ui/card";
import { FileText, ThumbsUp, Wind, AlertTriangle, ShieldCheck } from "lucide-react";

interface ConditionTabProps {
  vehicle: QuickBidDetails;
}

const ConditionTab = ({ vehicle }: ConditionTabProps) => {
  const brakes = vehicle.brakes?.split(',').map(s => s.trim()) || [];
  const tires = vehicle.tire?.split(',').map(s => s.trim()) || [];

  const getBrakeColor = (value: string | undefined) => {
    const num = parseInt(value || '0');
    if (num >= 8) return 'bg-green-100 text-green-800';
    if (num >= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getTireColor = (value: string | undefined) => {
    const num = parseInt(value || '0');
    if (num >= 7) return 'bg-green-100 text-green-800';
    if (num >= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* History Report */}
      <Card className="p-4 sm:p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">History Report</h3>

        <div className="space-y-4">
          {/* Report Provider */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-brand" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Report Provider</p>
              <div className="flex items-center gap-2">
                <p className="text-base sm:text-lg font-black text-brand">AutoCheck</p>
                <div className="w-5 h-5 bg-brand rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Report Finding */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <ThumbsUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Report Finding</p>
              <p className="text-base sm:text-lg font-black text-gray-900">No Accidents</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Condition Details */}
      <Card className="p-4 sm:p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Condition Details</h3>

        <div className="space-y-4">
          {/* Windshield */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Wind className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Windshield</p>
              <p className="text-base sm:text-lg font-black text-gray-900">{vehicle.windshield || 'Clear'}</p>
            </div>
          </div>

          {/* Warning Lights */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Warning Lights</p>
              <p className="text-base sm:text-lg font-black text-gray-900">{vehicle.engine_lights || 'None'}</p>
            </div>
          </div>

          {/* Maintenance */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Maintenance</p>
              <p className="text-base sm:text-lg font-black text-gray-900">{vehicle.maintenance || 'Up to date'}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Brakes Condition */}
      <Card className="p-4 sm:p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Brakes Condition</h3>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl text-center">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2 sm:mb-3">Front Left</p>
            <span className={`inline-block px-3 sm:px-4 py-2 rounded-lg text-lg sm:text-xl font-black ${getBrakeColor(brakes[0])}`}>
              {brakes[0] ? `${brakes[0]}MM` : 'N/A'}
            </span>
          </div>
          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl text-center">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2 sm:mb-3">Front Right</p>
            <span className={`inline-block px-3 sm:px-4 py-2 rounded-lg text-lg sm:text-xl font-black ${getBrakeColor(brakes[1])}`}>
              {brakes[1] ? `${brakes[1]}MM` : 'N/A'}
            </span>
          </div>
          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl text-center">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2 sm:mb-3">Rear Left</p>
            <span className={`inline-block px-3 sm:px-4 py-2 rounded-lg text-lg sm:text-xl font-black ${getBrakeColor(brakes[2])}`}>
              {brakes[2] ? `${brakes[2]}MM` : 'N/A'}
            </span>
          </div>
          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl text-center">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2 sm:mb-3">Rear Right</p>
            <span className={`inline-block px-3 sm:px-4 py-2 rounded-lg text-lg sm:text-xl font-black ${getBrakeColor(brakes[3])}`}>
              {brakes[3] ? `${brakes[3]}MM` : 'N/A'}
            </span>
          </div>
        </div>
      </Card>

      {/* Tires Condition */}
      <Card className="p-4 sm:p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Tires Condition</h3>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl text-center">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2 sm:mb-3">Front Left</p>
            <span className={`inline-block px-3 sm:px-4 py-2 rounded-lg text-lg sm:text-xl font-black ${getTireColor(tires[0])}`}>
              {tires[0] ? `${tires[0]}/32"` : 'N/A'}
            </span>
          </div>
          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl text-center">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2 sm:mb-3">Front Right</p>
            <span className={`inline-block px-3 sm:px-4 py-2 rounded-lg text-lg sm:text-xl font-black ${getTireColor(tires[1])}`}>
              {tires[1] ? `${tires[1]}/32"` : 'N/A'}
            </span>
          </div>
          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl text-center">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2 sm:mb-3">Rear Left</p>
            <span className={`inline-block px-3 sm:px-4 py-2 rounded-lg text-lg sm:text-xl font-black ${getTireColor(tires[2])}`}>
              {tires[2] ? `${tires[2]}/32"` : 'N/A'}
            </span>
          </div>
          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl text-center">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2 sm:mb-3">Rear Right</p>
            <span className={`inline-block px-3 sm:px-4 py-2 rounded-lg text-lg sm:text-xl font-black ${getTireColor(tires[3])}`}>
              {tires[3] ? `${tires[3]}/32"` : 'N/A'}
            </span>
          </div>
        </div>
      </Card>

      {/* Reconditioning Details */}
      <Card className="p-4 sm:p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Reconditioning Details</h3>

        {/* Estimated Recon Cost */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 sm:p-6 mb-6">
          <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide mb-2">Estimated Recon Cost</p>
          <p className="text-3xl sm:text-4xl font-black text-yellow-900">${vehicle.recon_estimate || 0}</p>
        </div>

        {/* Inspector Notes */}
        {vehicle.recon_details && (
          <div>
            <p className="text-base text-gray-700 leading-relaxed">
              {vehicle.recon_details}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ConditionTab;
