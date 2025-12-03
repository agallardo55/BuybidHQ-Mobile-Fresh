import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getRangeFromMeasurement } from "@/components/bid-request/utils/measurementUtils";

interface QuadrantData {
  frontLeft: number | null;
  frontRight: number | null;
  rearLeft: number | null;
  rearRight: number | null;
}

interface BrakesAndTiresDisplayProps {
  brakes: string;
  tires: string;
}

/**
 * Parse quadrant string format: "frontLeft:8,frontRight:8,rearLeft:6,rearRight:6"
 */
const parseQuadrantString = (value: string): QuadrantData => {
  const defaultData: QuadrantData = { 
    frontLeft: null, 
    frontRight: null, 
    rearLeft: null, 
    rearRight: null 
  };
  
  if (!value || value === 'notSpecified' || value === '') return defaultData;
  
  // Handle old format values like "acceptable", "replaceFront", etc.
  if (!value.includes(':')) {
    return defaultData;
  }
  
  value.split(',').forEach(part => {
    const [position, val] = part.split(':');
    if (position && val && position in defaultData) {
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) {
        (defaultData as Record<string, number | null>)[position] = parsed;
      }
    }
  });
  
  return defaultData;
};

/**
 * Color chip component for displaying brake/tire status
 */
const StatusChip = ({ value, type }: { value: number | null; type: 'brake' | 'tire' }) => {
  const range = getRangeFromMeasurement(value, type);
  
  if (!range) {
    return (
      <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-400 text-sm font-medium">
        N/A
      </span>
    );
  }

  const colorClasses: Record<string, string> = {
    green: "bg-green-100 text-green-700 border-green-300",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-300",
    orange: "bg-orange-100 text-orange-700 border-orange-300",
    red: "bg-red-100 text-red-700 border-red-300",
  };

  const unit = type === 'brake' ? 'mm' : '/32"';
  
  return (
    <span className={cn(
      "px-4 py-2 rounded-full border text-sm font-medium",
      colorClasses[range.color || 'green']
    )}>
      {range.displayText}{unit}
    </span>
  );
};

/**
 * 2x2 Grid component for a measurement type (Brakes or Tires)
 */
const MeasurementGrid = ({ 
  title, 
  data, 
  type 
}: { 
  title: string; 
  data: QuadrantData; 
  type: 'brake' | 'tire';
}) => (
  <div className="space-y-2">
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Top row: Front Left | Front Right */}
      <div className="grid grid-cols-2 divide-x divide-gray-200">
        <div className="p-4 flex flex-col items-center justify-center gap-2 bg-gray-50">
          <StatusChip value={data.frontLeft} type={type} />
          <span className="text-xs text-gray-500">Front Left</span>
        </div>
        <div className="p-4 flex flex-col items-center justify-center gap-2 bg-gray-50">
          <StatusChip value={data.frontRight} type={type} />
          <span className="text-xs text-gray-500">Front Right</span>
        </div>
      </div>
      {/* Horizontal divider */}
      <div className="border-t border-gray-200" />
      {/* Bottom row: Rear Left | Rear Right */}
      <div className="grid grid-cols-2 divide-x divide-gray-200">
        <div className="p-4 flex flex-col items-center justify-center gap-2 bg-gray-50">
          <StatusChip value={data.rearLeft} type={type} />
          <span className="text-xs text-gray-500">Rear Left</span>
        </div>
        <div className="p-4 flex flex-col items-center justify-center gap-2 bg-gray-50">
          <StatusChip value={data.rearRight} type={type} />
          <span className="text-xs text-gray-500">Rear Right</span>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Main component for displaying Brakes & Tires in a visual 2x2 grid format
 */
const BrakesAndTiresDisplay = ({ brakes, tires }: BrakesAndTiresDisplayProps) => {
  const brakesData = parseQuadrantString(brakes);
  const tiresData = parseQuadrantString(tires);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">Brakes & Tires</CardTitle>
      </CardHeader>
      <Separator className="mb-6" />
      <CardContent className="space-y-6">
        <MeasurementGrid title="Brakes" data={brakesData} type="brake" />
        <MeasurementGrid title="Tires" data={tiresData} type="tire" />
      </CardContent>
    </Card>
  );
};

export default BrakesAndTiresDisplay;
