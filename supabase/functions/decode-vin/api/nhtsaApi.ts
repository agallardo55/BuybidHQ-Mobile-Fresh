import { VehicleData, NHTSAEngineData } from "../types.ts";
import { fetchData } from "./fetchData.ts";
import { formatNHTSAEngine } from "../engineUtils.ts";
import { extractTransmissionInfo, formatTransmissionString } from "../utils/transmissionUtils.ts";

export async function fetchNHTSAData(vin: string): Promise<VehicleData> {
  const nhtsaUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;
  console.log('Calling NHTSA API:', nhtsaUrl);
  
  const nhtsaData = await fetchData(nhtsaUrl);
  console.log('NHTSA API response:', JSON.stringify(nhtsaData));

  const vehicleData: VehicleData = {
    year: '',
    make: '',
    model: '',
    trim: '',
    engineCylinders: '',
    transmission: '',
    drivetrain: ''
  };

  // Collect engine data as we process the results
  const engineData: NHTSAEngineData = {
    displacement: '',
    cylinders: '',
    configuration: '',
    turbo: false
  };

  if (nhtsaData?.Results) {
    // Log all fields for debugging
    console.log('All NHTSA fields:');
    nhtsaData.Results.forEach(result => {
      if (result?.Value && result.Value !== "Not Applicable") {
        console.log(`${result.Variable}: ${result.Value}`);
      }
    });

    // Extract transmission data
    const transmissionInfo = extractTransmissionInfo(nhtsaData.Results);
    
    // Process all other fields
    for (const result of nhtsaData.Results) {
      if (result?.Value && result.Value !== "Not Applicable") {
        const value = result.Value;
        console.log(`Processing NHTSA field: ${result.Variable} = ${value}`);
        
        switch (result.Variable) {
          case 'Model Year':
            vehicleData.year = value;
            break;
          case 'Make':
            vehicleData.make = value;
            break;
          case 'Model':
            vehicleData.model = value;
            break;
          case 'Trim':
          case 'Trim2':
          case 'Series':
            if (!vehicleData.trim || vehicleData.trim.length < value.length) {
              console.log(`Using ${result.Variable} for trim: ${value}`);
              vehicleData.trim = value;
            }
            break;
          case 'Engine Number of Cylinders':
            engineData.cylinders = value;
            break;
          case 'Engine Configuration':
            engineData.configuration = value;
            break;
          case 'Displacement (L)':
            engineData.displacement = value;
            break;
          case 'Turbo':
            engineData.turbo = value === 'Yes';
            break;
          case 'Drive Type':
            vehicleData.drivetrain = value;
            break;
        }
      }
    }

    // Format transmission string
    vehicleData.transmission = formatTransmissionString(transmissionInfo);
  }

  // Format engine data
  vehicleData.engineCylinders = formatNHTSAEngine(engineData);
  console.log('Final NHTSA vehicle data:', vehicleData);

  return vehicleData;
}
