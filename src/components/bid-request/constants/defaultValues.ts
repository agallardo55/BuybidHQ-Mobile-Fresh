/**
 * Default optimal values for vehicle condition measurements
 */

export const DEFAULT_BRAKES = "frontLeft:8,frontRight:8,rearLeft:8,rearRight:8";
export const DEFAULT_TIRES = "frontLeft:9,frontRight:9,rearLeft:9,rearRight:9";

// Human-readable explanation for documentation
export const DEFAULT_VALUES_INFO = {
  brakes: {
    value: DEFAULT_BRAKES,
    description: "All brake pads ≥8mm (optimal condition)",
    representativeValue: 8
  },
  tires: {
    value: DEFAULT_TIRES,
    description: "All tire treads 8-10/32\" (optimal condition)",
    representativeValue: 9
  }
} as const;

