
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

  // Try to extract information from specs first
  let engineInfo = {
    displacement: specs.displacement_l || '',
    cylinders: specs.engine_number_of_cylinders || '',
    forced: specs.turbo ? 'Turbo' : ''
  };

  // Try to extract from description if specs are incomplete
  if (description) {
    console.log('Attempting to parse engine info from description');
    const patterns = [
      /\(([\d.]+)L\s+(\d+)cyl\s*(Turbo)?\s/i,
      /([\d.]+)L\s+(\d+)[\s-]*(cylinder|cyl)\s*(Turbo|Twin[-\s]Turbo|Bi[-\s]Turbo)?/i,
      /(\d+)\s*(?:cylinder|cyl)\s*([\d.]+)L\s*(Turbo|Twin[-\s]Turbo|Bi[-\s]Turbo)?/i
    ];

    for (const pattern of patterns) {
      const matches = description.match(pattern);
      if (matches) {
        console.log('Found engine matches in description:', matches);
        engineInfo = {
          displacement: matches[1] || engineInfo.displacement,
          cylinders: matches[2] || engineInfo.cylinders,
          forced: (matches[3] || matches[4] || engineInfo.forced)
        };
        break;
      }
    }
  }

  // Format the engine string
  const parts: string[] = [];
  
  if (engineInfo.displacement) {
    parts.push(`${engineInfo.displacement}L`);
  }

  if (engineInfo.cylinders) {
    const cylinderCount = parseInt(engineInfo.cylinders);
    if (!isNaN(cylinderCount)) {
      const configuration = cylinderCount > 4 ? 'V' : 'I';
      parts.push(`${configuration}${cylinderCount}`);
    }
  }

  if (engineInfo.forced) {
    parts.push(engineInfo.forced);
  }

  const result = parts.join(' ');
  console.log('Final engine format:', result);
  return result;
}

async function fetchData<T>(url: string, options?: RequestInit): Promise<T | null> {
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

async function fetchNHTSAData(vin: string): Promise<VehicleData> {
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

  const carApiResponse = await fetchData<any>(carApiUrl, {
    headers: { 
      'Authorization': `Bearer ${CARAPI_KEY}`,
      'Accept': 'application/json'
    }
  });

  return carApiResponse?.data || null;
}

function mergeVehicleData(nhtsaData: VehicleData, carApiData: CarApiData | null): VehicleData {
  console.log('Merging vehicle data:');
  console.log('NHTSA data:', nhtsaData);
  console.log('CarAPI data:', carApiData);

  const essentialFields = ['year', 'make', 'model'];
  const hasEssentialNHTSA = essentialFields.every(field => nhtsaData[field as keyof VehicleData]);

  // If CarAPI data is available, use it as primary source
  if (carApiData) {
    // Get the best matching trim
    const year = parseInt(carApiData.year?.toString() || nhtsaData.year || '');
    const bestTrim = carApiData.trims ? findBestTrimMatch(carApiData.trims, year) : '';

    // Get trim description for engine details
    const trimData = carApiData.trims?.find(t => t.name === bestTrim);
    const engineFormat = parseEngineFormat(carApiData.specs, trimData?.description);

    return {
      year: carApiData.year?.toString() || nhtsaData.year || '',
      make: carApiData.make || nhtsaData.make || '',
      model: carApiData.model || nhtsaData.model || '',
      trim: bestTrim || nhtsaData.trim || '',
      engineCylinders: engineFormat || nhtsaData.engineCylinders || '',
      transmission: carApiData.specs?.transmission || nhtsaData.transmission || '',
      drivetrain: carApiData.specs?.drive_type || nhtsaData.drivetrain || ''
    };
  }

  // If no CarAPI data but NHTSA has essential fields, use NHTSA data
  if (hasEssentialNHTSA) {
    return nhtsaData;
  }

  // If neither source has complete data, return what we have from NHTSA
  return nhtsaData;
}

serve(async (req) => {
  // Handle CORS preflight
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
      // Get CARAPI key
      const CARAPI_KEY = Deno.env.get('CARAPI_KEY');
      if (!CARAPI_KEY) {
        console.error('CarAPI key not found in environment');
        throw new Error('CarAPI key not configured');
      }

      // Fetch data from both APIs in parallel
      const [nhtsaData, carApiData] = await Promise.all([
        fetchNHTSAData(vin),
        fetchCarApiData(vin, CARAPI_KEY)
      ]);

      console.log('API responses received:');
      console.log('NHTSA:', nhtsaData);
      console.log('CarAPI:', carApiData);

      // Merge data from both sources
      const mergedData = mergeVehicleData(nhtsaData, carApiData);

      // Check if we have at least some basic vehicle information
      if (mergedData.year || mergedData.make || mergedData.model) {
        console.log('Returning merged data:', mergedData);
        return new Response(
          JSON.stringify(mergedData),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error('Could not decode VIN with either API');

    } catch (apiError: any) {
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

  } catch (error: any) {
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
