import { getBrakeStatus, getTireStatus } from "@/components/bid-request/utils/measurementUtils";

interface QuadrantData {
  frontLeft: number | null;
  frontRight: number | null;
  rearLeft: number | null;
  rearRight: number | null;
}

interface MeasurementBadgesProps {
  type: 'brakes' | 'tires';
  measurements: string | undefined;
  className?: string;
}

interface MeasurementBadgeProps {
  label: string;
  value: number | null;
  colorClasses: string;
  unit: string;
}

const parseQuadrantString = (value: string | undefined): QuadrantData => {
  const defaultData: QuadrantData = {
    frontLeft: null,
    frontRight: null,
    rearLeft: null,
    rearRight: null,
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

const getColorClasses = (status: 'green' | 'yellow' | 'red' | 'gray'): string => {
  const colorMap = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
  };
  return colorMap[status];
};

const MeasurementBadge = ({ label, value, colorClasses, unit }: MeasurementBadgeProps) => (
  <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${colorClasses}`}>
    {label}: {value !== null ? `${value}${unit}` : 'N/A'}
  </span>
);

const MeasurementBadges = ({ type, measurements, className = '' }: MeasurementBadgesProps) => {
  // Handle missing or invalid measurements
  if (!measurements || measurements === 'notSpecified' || measurements === '') {
    return <span className="text-base lg:text-base text-lg">Not Specified</span>;
  }

  const data = parseQuadrantString(measurements);

  // Check if we got any valid data
  const hasData = Object.values(data).some(val => val !== null);
  if (!hasData) {
    return <span className="text-base lg:text-base text-lg">Not Available</span>;
  }

  const getStatus = type === 'brakes' ? getBrakeStatus : getTireStatus;
  const unit = type === 'brakes' ? 'mm' : '/32"';

  return (
    <div className={`flex gap-1 ${className}`}>
      <MeasurementBadge
        label="FL"
        value={data.frontLeft}
        colorClasses={getColorClasses(getStatus(data.frontLeft))}
        unit={unit}
      />
      <MeasurementBadge
        label="FR"
        value={data.frontRight}
        colorClasses={getColorClasses(getStatus(data.frontRight))}
        unit={unit}
      />
      <MeasurementBadge
        label="RL"
        value={data.rearLeft}
        colorClasses={getColorClasses(getStatus(data.rearLeft))}
        unit={unit}
      />
      <MeasurementBadge
        label="RR"
        value={data.rearRight}
        colorClasses={getColorClasses(getStatus(data.rearRight))}
        unit={unit}
      />
    </div>
  );
};

export default MeasurementBadges;
