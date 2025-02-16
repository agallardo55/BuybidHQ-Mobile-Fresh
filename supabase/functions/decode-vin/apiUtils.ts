
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
  const transmissionFields = new Set([
    'Transmission Style',
    'Number of Forward Gears',
    'Transmission Control Type',
    'Transmission Type',
    'Transmission Manufacturer',
    'Transmission Short Name'
  ]);
  
  console.log('Extracting transmission data from NHTSA results');
  
  // Log all transmission-related fields for debugging
  results.forEach(result => {
    if (transmissionFields.has(result.Variable)) {
      console.log(`Found transmission field: ${result.Variable} = ${result.Value}`);
    }
  });
  
  for (const result of results) {
    if (result?.Value) {
      // Accept any non-empty value, even if it's "Not Applicable"
      switch (result.Variable) {
        case 'Transmission Style':
          transmissionInfo.style = result.Value;
          console.log('Found transmission style:', result.Value);
          break;
        case 'Number of Forward Gears':
          transmissionInfo.speeds = result.Value;
          console.log('Found transmission speeds:', result.Value);
          break;
        case 'Transmission Control Type':
          transmissionInfo.type = result.Value;
          console.log('Found transmission control type:', result.Value);
          break;
        case 'Transmission Type':
          // If we don't have a style yet, use this as backup
          if (!transmissionInfo.style) {
            transmissionInfo.style = result.Value;
            console.log('Using transmission type as style:', result.Value);
          }
          break;
        case 'Transmission Short Name':
          // Use this if we don't have enough info yet
          if (!transmissionInfo.style && !transmissionInfo.type) {
            transmissionInfo.style = result.Value;
            console.log('Using transmission short name:', result.Value);
          }
          break;
      }
    }
  }
  
  console.log('Final transmission info:', transmissionInfo);
  return transmissionInfo;
}

function formatTransmissionString(nhtsaData: NHTSATransmissionData): string {
  const parts = [];
  
  if (nhtsaData.speeds) {
    parts.push(`${nhtsaData.speeds}-Speed`);
  }
  
  if (nhtsaData.style) {
    // Clean up common transmission terms
    const style = nhtsaData.style
      .replace('Transmission', '')
      .replace('TRANSMISSION', '')
      .trim();
    if (style) {
      parts.push(style);
    }
  }
  
  if (nhtsaData.type && !parts.some(part => part.toLowerCase().includes(nhtsaData.type!.toLowerCase()))) {
    parts.push(`(${nhtsaData.type})`);
  }
  
  const transmissionString = parts.join(' ').trim();
  console.log('Formatted transmission string:', transmissionString);
  return transmissionString;
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

export async function fetchCarApiData(vin: string, CARAPI_KEY: string): Promise<CarApiData | null> {
  const carApiUrl = `https://api.carapi.app/vin/${vin}`;
  console.log('Calling CarAPI:', carApiUrl);

  const carApiResponse = await fetchData<any>(carApiUrl, {
    headers: { 
      'Authorization': `Bearer ${CARAPI_KEY}`,
      'Accept': 'application/json'
    }
  });

  if (carApiResponse?.data) {
    console.log('CarAPI transmission data:', carApiResponse.data.specs?.transmission);
  }

  return carApiResponse?.data || null;
}

