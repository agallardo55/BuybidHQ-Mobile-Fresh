
import { VehicleData, CarApiData, NHTSAEngineData, NHTSATransmissionData } from "./types.ts";
import { formatNHTSAEngine } from "./engineUtils.ts";

export async function fetchData<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, options);
    const responseText = await response.text();
    console.log(`API Response [${url}]:`, responseText);

    if (!response.ok) {
      console.error('API error:', {
        url,
        status: response.status,
        statusText: response.statusText,
        response: responseText
      });
      return null;
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      return null;
    }
  } catch (fetchError) {
    console.error('Error fetching data:', fetchError);
    return null;
  }
}

function extractTransmissionInfo(results: any[]): NHTSATransmissionData {
  const transmissionInfo: NHTSATransmissionData = {};
  
  for (const result of results) {
    if (result?.Value && result.Value !== "Not Applicable") {
      switch (result.Variable) {
        case 'Transmission Style':
          transmissionInfo.style = result.Value;
          break;
        case 'Number of Forward Gears':
          transmissionInfo.speeds = result.Value;
          break;
        case 'Transmission Control Type':
          transmissionInfo.type = result.Value;
          break;
      }
    }
  }
  
  return transmissionInfo;
}

function formatTransmissionString(nhtsaData: NHTSATransmissionData): string {
  const parts = [];
  
  if (nhtsaData.speeds) {
    parts.push(`${nhtsaData.speeds}-Speed`);
  }
  
  if (nhtsaData.style) {
    parts.push(nhtsaData.style);
  }
  
  if (nhtsaData.type) {
    parts.push(`(${nhtsaData.type})`);
  }
  
  return parts.join(' ') || '';
}

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
    // Extract transmission data
    const transmissionInfo = extractTransmissionInfo(nhtsaData.Results);
    
    // Process all other fields
    for (const result of nhtsaData.Results) {
      if (result?.Value) {
        const value = result.Value;
        console.log(`Processing NHTSA field: ${result.Variable} = ${value}`);
        
        if (value !== "Not Applicable") {
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
    }

    // Format transmission string
    vehicleData.transmission = formatTransmissionString(transmissionInfo);
  }

  // Format engine data
  vehicleData.engineCylinders = formatNHTSAEngine(engineData);
  console.log('Formatted NHTSA data:', vehicleData);

  return vehicleData;
}

export async function fetchCarApiData(vin: string, CARAPI_KEY: string): Promise<CarApiData | null> {
  const carApiUrl = `https://api.carapi.app/vin/${vin}`;
  console.log('Calling CarAPI:', carApiUrl);

  const carApiResponse = await fetchData<any>(carApiUrl, {
    headers: { 
      'Authorization': `Bearer ${CARAPI_KEY}`,
      'Accept': 'application/json'
    }
  });

  return carApiResponse?.data || null;
}

