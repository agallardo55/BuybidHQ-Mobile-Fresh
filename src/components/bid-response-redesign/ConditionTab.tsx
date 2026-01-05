
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
              <p className="text-base sm:text-lg font-black text-brand">
                {vehicle.history_service || 'Not Specified'}
              </p>
            </div>
          </div>

          {/* Report Finding */}
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              vehicle.history === 'noAccidents' ? 'bg-green-100' :
              vehicle.history === 'minorAccident' || vehicle.history === 'odomError' ? 'bg-yellow-100' :
              vehicle.history === 'majorAccident' || vehicle.history === 'brandedIssue' ? 'bg-red-100' :
              'bg-gray-100'
            }`}>
              <ThumbsUp className={`h-6 w-6 ${
                vehicle.history === 'noAccidents' ? 'text-green-600' :
                vehicle.history === 'minorAccident' || vehicle.history === 'odomError' ? 'text-yellow-600' :
                vehicle.history === 'majorAccident' || vehicle.history === 'brandedIssue' ? 'text-red-600' :
                'text-gray-600'
              }`} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Report Finding</p>
              <p className="text-base sm:text-lg font-black text-gray-900">
                {vehicle.history === 'noAccidents' ? 'No Accidents' :
                 vehicle.history === 'minorAccident' ? 'Minor Accident' :
                 vehicle.history === 'odomError' ? 'Odometer Error' :
                 vehicle.history === 'majorAccident' ? 'Major Accident' :
                 vehicle.history === 'brandedIssue' ? 'Branded Title' :
                 vehicle.history === 'unknown' ? 'Unknown' :
                 'Not Specified'}
              </p>
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
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              vehicle.windshield === 'clear' || !vehicle.windshield ? 'bg-green-100' :
              vehicle.windshield === 'chips' ? 'bg-yellow-100' :
              vehicle.windshield === 'smallCracks' ? 'bg-orange-100' :
              'bg-red-100'
            }`}>
              <Wind className={`h-6 w-6 ${
                vehicle.windshield === 'clear' || !vehicle.windshield ? 'text-green-600' :
                vehicle.windshield === 'chips' ? 'text-yellow-600' :
                vehicle.windshield === 'smallCracks' ? 'text-orange-600' :
                'text-red-600'
              }`} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Windshield</p>
              <p className="text-base sm:text-lg font-black text-gray-900">
                {vehicle.windshield === 'clear' ? 'Clear' :
                 vehicle.windshield === 'chips' ? 'Stars' :
                 vehicle.windshield === 'smallCracks' ? 'Cracks' :
                 vehicle.windshield === 'largeCracks' ? 'Replace' :
                 vehicle.windshield || 'Not Specified'}
              </p>
            </div>
          </div>

          {/* Warning Lights */}
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              !vehicle.engine_lights || vehicle.engine_lights === 'none' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <AlertTriangle className={`h-6 w-6 ${
                !vehicle.engine_lights || vehicle.engine_lights === 'none' ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Warning Lights</p>
              {(() => {
                const lights = vehicle.engine_lights?.split(',').map(l => l.trim()).filter(Boolean) || [];
                const displayLights = lights.map(light => {
                  switch(light) {
                    case 'none': return 'None';
                    case 'engine': return 'Engine';
                    case 'maintenance': return 'Transmission';
                    case 'drivetrain': return 'Drivetrain';
                    case 'airbag': return 'Airbags';
                    case 'multiple': return 'Others';
                    default: return light;
                  }
                });
                return (
                  <p className="text-base sm:text-lg font-black text-gray-900">
                    {displayLights.length > 0 ? displayLights.join(', ') : 'Not Specified'}
                  </p>
                );
              })()}
            </div>
          </div>

          {/* Maintenance */}
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              vehicle.maintenance === 'upToDate' || !vehicle.maintenance ? 'bg-green-100' :
              vehicle.maintenance === 'basicService' ? 'bg-yellow-100' :
              vehicle.maintenance === 'minorService' ? 'bg-orange-100' :
              'bg-red-100'
            }`}>
              <ShieldCheck className={`h-6 w-6 ${
                vehicle.maintenance === 'upToDate' || !vehicle.maintenance ? 'text-green-600' :
                vehicle.maintenance === 'basicService' ? 'text-yellow-600' :
                vehicle.maintenance === 'minorService' ? 'text-orange-600' :
                'text-red-600'
              }`} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Maintenance</p>
              <p className="text-base sm:text-lg font-black text-gray-900">
                {vehicle.maintenance === 'upToDate' ? 'Up to date' :
                 vehicle.maintenance === 'basicService' ? 'Basic Service' :
                 vehicle.maintenance === 'minorService' ? 'Minor Service' :
                 vehicle.maintenance === 'majorService' ? 'Major Service' :
                 vehicle.maintenance || 'Not Specified'}
              </p>
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
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Details</p>
          <p className="text-base text-gray-700 leading-relaxed">
            {vehicle.recon_details || 'Not Specified'}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ConditionTab;
