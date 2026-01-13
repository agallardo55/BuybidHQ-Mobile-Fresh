import { useCallback } from "react";

export interface QuadrantData {
  FL: string;
  FR: string;
  RL: string;
  RR: string;
}

/**
 * Parse a "position:value,..." string into quadrant data object
 */
export function parseQuadrantString(value: string): QuadrantData {
  const result: QuadrantData = { FL: "", FR: "", RL: "", RR: "" };

  if (!value) return result;

  const parts = value.split(",");
  parts.forEach((part) => {
    const [position, val] = part.split(":");
    if (position && val && position in result) {
      result[position as keyof QuadrantData] = val;
    }
  });

  return result;
}

/**
 * Convert a quadrant data object back to string format
 */
export function quadrantDataToString(data: QuadrantData): string {
  return Object.entries(data)
    .filter(([_, val]) => val)
    .map(([pos, val]) => `${pos}:${val}`)
    .join(",");
}

interface UseQuadrantDataProps {
  brakesValue: string;
  tiresValue: string;
  onSelectChange: (value: string, name: string) => void;
}

interface UseQuadrantDataResult {
  brakesData: QuadrantData;
  tiresData: QuadrantData;
  handleBrakesChange: (position: keyof QuadrantData, value: string) => void;
  handleTiresChange: (position: keyof QuadrantData, value: string) => void;
}

/**
 * Hook for managing brakes and tires quadrant measurements
 */
export function useQuadrantData({
  brakesValue,
  tiresValue,
  onSelectChange,
}: UseQuadrantDataProps): UseQuadrantDataResult {
  const brakesData = parseQuadrantString(brakesValue);
  const tiresData = parseQuadrantString(tiresValue);

  const handleBrakesChange = useCallback(
    (position: keyof QuadrantData, value: string) => {
      const newData = { ...brakesData, [position]: value };
      onSelectChange(quadrantDataToString(newData), "brakes");
    },
    [brakesData, onSelectChange]
  );

  const handleTiresChange = useCallback(
    (position: keyof QuadrantData, value: string) => {
      const newData = { ...tiresData, [position]: value };
      onSelectChange(quadrantDataToString(newData), "tire");
    },
    [tiresData, onSelectChange]
  );

  return {
    brakesData,
    tiresData,
    handleBrakesChange,
    handleTiresChange,
  };
}
