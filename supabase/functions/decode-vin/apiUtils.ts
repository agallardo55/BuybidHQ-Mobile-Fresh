
import { VehicleData, CarApiData, NHTSAEngineData } from "./types.ts";
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
    for (const result of nhtsaData.Results) {
      if (result?.Value && result.Value !== "Not Applicable") {
        switch (result.Variable) {
          case 'Model Year':
            vehicleData.year = result.Value;
            break;
          case 'Make':
            vehicleData.make = result.Value;
            break;
          case 'Model':
            vehicleData.model = result.Value;
            break;
          case 'Trim':
            console.log('NHTSA Trim value:', result.Value);
            vehicleData.trim = result.Value;
            break;
          case 'Engine Number of Cylinders':
            engineData.cylinders = result.Value;
            break;
          case 'Engine Configuration':
            engineData.configuration = result.Value;
            break;
          case 'Displacement (L)':
            engineData.displacement = result.Value;
            break;
          case 'Turbo':
            engineData.turbo = result.Value === 'Yes';
            break;
          case 'Transmission Style':
            vehicleData.transmission = result.Value;
            break;
          case 'Drive Type':
            vehicleData.drivetrain = result.Value;
            break;
        }
      }
    }
  }

  // Format engine data
  vehicleData.engineCylinders = formatNHTSAEngine(engineData);
  console.log('Formatted engine data:', vehicleData.engineCylinders);

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
