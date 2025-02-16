import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Types for better code organization
interface VehicleData {
  year: string;
  make: string;
  model: string;
  trim: string;
  engineCylinders: string;
  transmission: string;
  drivetrain: string;
}

interface CarApiTrim {
  name: string;
  description: string;
  year: number;
}

interface CarApiData {
  year?: string | number;
  make?: string;
  model?: string;
  trim?: string;
  specs?: {
    displacement_l?: string;
    engine_number_of_cylinders?: string;
    turbo?: string | null;
    transmission?: string;
    drive_type?: string;
  };
  trims?: CarApiTrim[];
}

function findBestTrimMatch(trims: CarApiTrim[] | undefined, year: number): string {
  if (!trims || trims.length === 0) {
    console.log('No trims available for matching');
    return '';
  }
  
  // Filter trims for matching year
  const yearMatches = trims.filter(trim => trim.year === year);
  console.log(`Found ${yearMatches.length} trims matching year ${year}:`, yearMatches);

  if (yearMatches.length === 0) {
    console.log('No trims match the vehicle year');
    return '';
  }

  // Prefer performance trims in this order: GTS, Turbo, S, Base
  const preferredOrder = ['GTS', 'Turbo', 'S', 'Base'];
  for (const preferred of preferredOrder) {
    const match = yearMatches.find(trim => trim.name.includes(preferred));
    if (match) {
      console.log(`Selected preferred trim: ${match.name}`);
      return match.name;
    }
  }

  // If no preferred trim found, return the first one
  console.log(`No preferred trim found, using first available: ${yearMatches[0].name}`);
  return yearMatches[0].name;
}

function parseEngineFormat(specs: CarApiData['specs'], description?: string): string {
  console.log('Parsing engine format with specs:', specs);
  console.log('Description:', description);

  if (!specs) {
    console.log('No specs available for engine parsing');
    return '';
  }

  let displacement = specs.displacement_l || '';
  let cylinders = specs.engine_number_of_cylinders || '';
  let forced = specs.turbo ? 'Turbo' : '';

  // Try to extract information from description if available
  if (description) {
    console.log('Attempting to parse engine info from description');
    const engineRegex = /\(([\d.]+)L\s+(\d+)cyl\s*(Turbo)?\s/i;
    const matches = description.match(engineRegex);
    if (matches) {
      console.log('Found engine matches in description:', matches);
      displacement = matches[1];
      cylinders = matches[2];
      forced = matches[3] || '';
    }
  }

  // Format the engine string
  const parts: string[] = [];
  
  if (displacement) {
    parts.push(`${displacement}L`);
  }

  if (cylinders) {
    // Add V or I prefix based on number of cylinders
    const cylinderCount = parseInt(cylinders);
    const configuration = cylinderCount > 4 ? 'V' : 'I';
    parts.push(`${configuration}${cylinderCount}`);
  }

  if (forced) {
    parts.push(forced);
  }

  const result = parts.join(' ');
  console.log('Final engine format:', result);
  return result;
}

async function fetchNHTSAData(vin: string): Promise<VehicleData> {
  const nhtsaUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;
  console.log('Calling NHTSA API:', nhtsaUrl);
  
  const nhtsaResponse = await fetch(nhtsaUrl);
  if (!nhtsaResponse.ok) {
    console.error('NHTSA API error:', {
      status: nhtsaResponse.status,
      statusText: nhtsaResponse.statusText
    });
    throw new Error('NHTSA API request failed');
  }

  const nhtsaData = await nhtsaResponse.json();
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
            vehicleData.engineCylinders = result.Value;
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

  return vehicleData;
}

async function fetchCarApiData(vin: string, CARAPI_KEY: string): Promise<CarApiData | null> {
  const carApiUrl = `https://api.carapi.app/vin/${vin}`;
  console.log('Calling CarAPI:', carApiUrl);

  try {
    const carApiResponse = await fetch(carApiUrl, {
      headers: { 
        'Authorization': `Bearer ${CARAPI_KEY}`,
        'Accept': 'application/json'
      }
    });

    const responseText = await carApiResponse.text();
    console.log('CarAPI raw response:', responseText);

    if (!carApiResponse.ok) {
      console.error('CarAPI error:', {
        status: carApiResponse.status,
        statusText: carApiResponse.statusText,
        response: responseText
      });
      return null;
    }

    try {
      const carApiData = JSON.parse(responseText);
      console.log('CarAPI parsed response:', JSON.stringify(carApiData));
      return carApiData?.data || null;
    } catch (parseError) {
      console.error('Error parsing CarAPI response:', parseError);
      return null;
    }
  } catch (fetchError) {
    console.error('Error fetching from CarAPI:', fetchError);
    return null;
  }
}

function mergeVehicleData(nhtsaData: VehicleData, carApiData: CarApiData | null): VehicleData {
  console.log('Merging vehicle data:');
  console.log('NHTSA data:', nhtsaData);
  console.log('CarAPI data:', carApiData);

  if (!carApiData) {
    console.log('No CarAPI data available, using NHTSA data only');
    return nhtsaData;
  }

  // Find the best matching trim from CarAPI data
  const year = parseInt(nhtsaData.year || carApiData.year?.toString() || '');
  console.log('Looking for trims matching year:', year);
  const bestTrim = carApiData.trims ? findBestTrimMatch(carApiData.trims, year) : '';

  // Get the matching trim's description for engine details
  const trimData = carApiData.trims?.find(t => t.name === bestTrim);
  console.log('Selected trim data:', trimData);
  
  // Parse engine format using both specs and trim description
  const engineFormat = parseEngineFormat(carApiData.specs, trimData?.description);
  console.log('Parsed engine format:', engineFormat);

  const mergedData = {
    year: nhtsaData.year || (carApiData.year?.toString() || ''),
    make: nhtsaData.make || (carApiData.make || ''),
    model: nhtsaData.model || (carApiData.model || ''),
    trim: bestTrim || nhtsaData.trim || (carApiData.trim || ''),
    engineCylinders: engineFormat || nhtsaData.engineCylinders,
    transmission: nhtsaData.transmission || (carApiData.specs?.transmission || ''),
    drivetrain: nhtsaData.drivetrain || (carApiData.specs?.drive_type || '')
  };

  console.log('Final merged data:', mergedData);
  return mergedData;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vin } = await req.json();
    
    if (!vin || vin.length !== 17) {
      console.error('Invalid VIN format:', vin);
      return new Response(
        JSON.stringify({ error: 'Invalid VIN format' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Processing VIN:', vin);

    try {
      // First try NHTSA API
      const nhtsaData = await fetchNHTSAData(vin);
      console.log('NHTSA data received:', nhtsaData);

      // If NHTSA data is incomplete, try CarAPI
      const missingData = Object.values(nhtsaData).some(value => !value);
      if (missingData) {
        console.log('NHTSA data incomplete, trying CarAPI');
        const CARAPI_KEY = Deno.env.get('CARAPI_KEY');
        if (!CARAPI_KEY) {
          console.error('CarAPI key not found in environment');
          throw new Error('CarAPI key not configured');
        }

        const carApiData = await fetchCarApiData(vin, CARAPI_KEY);
        console.log('CarAPI data received:', carApiData);
        
        const mergedData = mergeVehicleData(nhtsaData, carApiData);

        // Return data if we have at least the basic information
        if (mergedData.year || mergedData.make || mergedData.model) {
          console.log('Returning merged data:', mergedData);
          return new Response(
            JSON.stringify(mergedData),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        // If NHTSA data is complete, return it
        console.log('NHTSA data complete, returning:', nhtsaData);
        return new Response(
          JSON.stringify(nhtsaData),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error('Could not decode VIN with either API');

    } catch (apiError) {
      console.error('API Error:', apiError?.message || apiError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to decode VIN. Please try again.',
          details: apiError?.message || 'Unknown API error'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('General Error:', error?.message || error);
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Failed to decode VIN',
        details: 'Unexpected error occurred'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
