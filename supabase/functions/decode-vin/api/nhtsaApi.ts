
import { fetchData } from "./fetchData.ts";
import { cleanTrimValue } from "../utils/trimUtils.ts";
import { VehicleData } from "../types.ts";

interface NHTSAResult {
  Value: string;
  ValueId: string;
  Variable: string;
  VariableId: number;
}

interface NHTSAResponse {
  Count: number;
  Message: string;
  SearchCriteria: string;
  Results: NHTSAResult[];
}

export async function fetchNHTSAData(vin: string): Promise<VehicleData | null> {
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;
  const data = await fetchData<NHTSAResponse>(url);

  if (!data?.Results) {
    console.error('No results from NHTSA API');
    return null;
  }

  const vehicleData: VehicleData = {
    year: "",
    make: "",
    model: "",
    trim: "",
    engineCylinders: "",
    transmission: "",
    drivetrain: "",
  };

  const trimData = {
    trim: "",
    trim2: "",
    series: "",
  };

  for (const result of data.Results) {
    const { Variable, Value } = result;
    if (!Value || Value === "null") continue;

    switch (Variable) {
      case "Model Year":
        vehicleData.year = Value;
        break;
      case "Make":
        vehicleData.make = Value;
        break;
      case "Model":
        vehicleData.model = Value;
        break;
      case "Trim":
        trimData.trim = Value;
        break;
      case "Trim2":
        trimData.trim2 = Value;
        break;
      case "Series":
        trimData.series = Value;
        break;
      case "Engine Number of Cylinders":
        vehicleData.engineCylinders = `${Value} Cylinder`;
        break;
      case "Transmission Style":
        vehicleData.transmission = Value;
        break;
      case "Drive Type":
        vehicleData.drivetrain = Value;
        break;
    }
  }

  // Process trim data based on priority and manufacturer-specific rules
  vehicleData.trim = determineTrim(trimData, vehicleData.make);

  console.log('Processed NHTSA data:', vehicleData);
  return vehicleData;
}

function determineTrim(
  trimData: { trim: string; trim2: string; series: string },
  make: string
): string {
  // Clean all trim values
  const cleanedTrim = cleanTrimValue(trimData.trim);
  const cleanedTrim2 = cleanTrimValue(trimData.trim2);
  const cleanedSeries = cleanTrimValue(trimData.series);

  console.log('Cleaned trim values:', {
    trim: cleanedTrim,
    trim2: cleanedTrim2,
    series: cleanedSeries
  });

  // Handle manufacturer-specific cases
  if (make.toLowerCase() === 'porsche') {
    return handlePorscheTrim(cleanedTrim, cleanedTrim2, cleanedSeries);
  }

  // Default trim determination logic
  if (cleanedTrim) return cleanedTrim;
  if (cleanedTrim2) return cleanedTrim2;
  if (cleanedSeries) return cleanedSeries;

  return "";
}

function handlePorscheTrim(trim: string, trim2: string, series: string): string {
  // Porsche-specific trim handling
  if (trim.includes('GTS') || trim2.includes('GTS')) {
    return 'GTS';
  }

  if (trim.includes('Turbo')) {
    return trim.includes('S') ? 'Turbo S' : 'Turbo';
  }

  // Use series information for Porsche when relevant
  if (series.includes('Cayenne') || series.includes('Macan')) {
    const baseTrim = trim || trim2;
    if (baseTrim) {
      return `${baseTrim}`;
    }
    return series.split(' ')[1] || series; // Extract model variant
  }

  return trim || trim2 || series;
}
