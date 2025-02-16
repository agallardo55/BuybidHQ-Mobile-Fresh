
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

interface CarApiData {
  year?: string | number;
  make?: string;
  model?: string;
  trim?: string;
  engine_size?: string | number;
  engine_cylinders?: string | number;
  forced_induction?: string;
  power_type?: string;
  electric_power?: string | number;
  transmission?: string;
  drive_type?: string;
}

function formatEngineData(engineSize?: string | number, engineCylinders?: string | number, forced?: string, powerType?: string, electricPower?: string | number): string {
  // Handle pure electric vehicles
  if (powerType?.toLowerCase().includes('electric') || powerType?.toLowerCase().includes('ev')) {
    if (electricPower) {
      return `Electric ${electricPower}kW`;
    }
    return 'Electric';
  }

  const parts: string[] = []
  
  // Handle hybrids first
  if (powerType?.toLowerCase().includes('hybrid')) {
    if (engineSize) {
      parts.push(`${engineSize}L`);
    }
    
    // Add cylinder info for hybrids if available
    if (engineCylinders) {
      const cylinderStr = engineCylinders.toString();
      if (cylinderStr.match(/^[IV]\d+$/)) {
        parts.push(cylinderStr);
      } else {
        parts.push(`${cylinderStr}-Cylinder`);
      }
    }
    
    // Add hybrid designation
    if (powerType.toLowerCase().includes('plug-in')) {
      parts.push('PHEV');
    } else {
      parts.push('Hybrid');
    }
    
    return parts.join(' ');
  }
  
  // Handle conventional ICE engines
  if (engineSize) {
    parts.push(`${engineSize}L`);
  }
  
  if (engineCylinders) {
    const cylinderStr = engineCylinders.toString();
    if (cylinderStr.match(/^[IV]\d+$/)) {
      parts.push(cylinderStr);
    } else {
      parts.push(`${cylinderStr}-Cylinder`);
    }
  }
  
  if (forced) {
    parts.push(forced);
  }
  
  return parts.join(' ');
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
}

function mergeVehicleData(nhtsaData: VehicleData, carApiData: CarApiData | null): VehicleData {
  if (!carApiData) return nhtsaData;

  const formattedEngine = formatEngineData(
    carApiData.engine_size,
    carApiData.engine_cylinders,
    carApiData.forced_induction,
    carApiData.power_type,
    carApiData.electric_power
  );

  return {
    year: nhtsaData.year || (carApiData.year?.toString() || ''),
    make: nhtsaData.make || (carApiData.make || ''),
    model: nhtsaData.model || (carApiData.model || ''),
    trim: nhtsaData.trim || (carApiData.trim || ''),
    engineCylinders: nhtsaData.engineCylinders || formattedEngine,
    transmission: nhtsaData.transmission || (carApiData.transmission || ''),
    drivetrain: nhtsaData.drivetrain || (carApiData.drive_type || '')
  };
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

    console.log('Decoding VIN:', vin);

    try {
      // First try NHTSA API
      const nhtsaData = await fetchNHTSAData(vin);

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
        const mergedData = mergeVehicleData(nhtsaData, carApiData);

        // Return data if we have at least the basic information
        if (mergedData.year || mergedData.make || mergedData.model) {
          return new Response(
            JSON.stringify(mergedData),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        // If NHTSA data is complete, return it
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
