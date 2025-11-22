/**
 * Measurement utility functions for tires and brakes condition reporting
 */

export type MeasurementStatus = "green" | "yellow" | "orange" | "red" | null;

export interface MeasurementRange {
  color: MeasurementStatus;
  label: string;
  min: number;
  max: number | null; // null means >= min
  representativeValue: number; // Value to store when this range is selected
  displayText: string; // Text to show on badge
}

/**
 * Get tire measurement ranges
 */
export const getTireRanges = (): MeasurementRange[] => [
  {
    color: "green",
    label: "Good",
    min: 8,
    max: 10,
    representativeValue: 9,
    displayText: "8-10"
  },
  {
    color: "yellow",
    label: "Fair",
    min: 5,
    max: 7,
    representativeValue: 6,
    displayText: "5-7"
  },
  {
    color: "orange",
    label: "Poor",
    min: 3,
    max: 4,
    representativeValue: 3.5,
    displayText: "3-4"
  },
  {
    color: "red",
    label: "Critical",
    min: 0,
    max: 2,
    representativeValue: 1,
    displayText: "0-2"
  }
];

/**
 * Get brake measurement ranges
 */
export const getBrakeRanges = (): MeasurementRange[] => [
  {
    color: "green",
    label: "Good",
    min: 8,
    max: null, // ≥8mm
    representativeValue: 8,
    displayText: "≥8"
  },
  {
    color: "yellow",
    label: "Fair",
    min: 5,
    max: 7,
    representativeValue: 6,
    displayText: "5-7"
  },
  {
    color: "orange",
    label: "Poor",
    min: 3,
    max: 4,
    representativeValue: 3.5,
    displayText: "3-4"
  },
  {
    color: "red",
    label: "Critical",
    min: 0,
    max: 2,
    representativeValue: 1,
    displayText: "0-2"
  }
];

/**
 * Get tire tread depth status based on measurement in 32nds of an inch
 * @param treadDepth - Tread depth in 32nds (e.g., 8.5 for 8.5/32")
 * @returns Status color or null if no measurement
 */
export const getTireStatus = (treadDepth: number | null | undefined): MeasurementStatus => {
  if (treadDepth === null || treadDepth === undefined) {
    return null;
  }

  if (treadDepth >= 8 && treadDepth <= 10) {
    return "green";
  } else if (treadDepth >= 5 && treadDepth <= 7) {
    return "yellow";
  } else if (treadDepth >= 3 && treadDepth <= 4) {
    return "orange";
  } else if (treadDepth >= 0 && treadDepth <= 2) {
    return "red";
  }

  return null;
};

/**
 * Get brake pad thickness status based on measurement in mm
 * @param padThickness - Pad thickness in millimeters
 * @returns Status color or null if no measurement
 */
export const getBrakeStatus = (padThickness: number | null | undefined): MeasurementStatus => {
  if (padThickness === null || padThickness === undefined) {
    return null;
  }

  if (padThickness >= 8) {
    return "green";
  } else if (padThickness >= 5 && padThickness <= 7) {
    return "yellow";
  } else if (padThickness >= 3 && padThickness <= 4) {
    return "orange";
  } else if (padThickness >= 0 && padThickness <= 2) {
    return "red";
  }

  return null;
};

/**
 * Get which range a measurement value falls into
 */
export const getRangeFromMeasurement = (measurement: number | null, measurementType: "tire" | "brake"): MeasurementRange | null => {
  if (measurement === null) {
    return null;
  }

  const ranges = measurementType === "tire" ? getTireRanges() : getBrakeRanges();
  
  for (const range of ranges) {
    if (range.max === null) {
      // For "≥" ranges (brakes green)
      if (measurement >= range.min) {
        return range;
      }
    } else {
      if (measurement >= range.min && measurement <= range.max) {
        return range;
      }
    }
  }

  return null;
};

/**
 * Format tire measurement for display
 * @param value - Measurement value
 * @returns Formatted string (e.g., "8.5/32"")
 */
export const formatTireMeasurement = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "";
  }
  return `${value}/32"`;
};

/**
 * Format brake measurement for display
 * @param value - Measurement value
 * @returns Formatted string (e.g., "7 mm")
 */
export const formatBrakeMeasurement = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "";
  }
  return `${value} mm`;
};

/**
 * Parse measurement value from string input
 * @param input - User input string
 * @param allowDecimals - Whether to allow decimal values (true for tires, false for brakes)
 * @returns Parsed number or null
 */
export const parseMeasurement = (input: string, allowDecimals: boolean = true): number | null => {
  if (!input || input.trim() === "") {
    return null;
  }

  const cleaned = input.replace(/[^0-9.]/g, "");
  if (!cleaned) {
    return null;
  }

  const value = allowDecimals ? parseFloat(cleaned) : parseInt(cleaned, 10);
  
  if (isNaN(value) || value < 0) {
    return null;
  }

  return value;
};

