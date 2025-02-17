
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { VehicleData, CarApiData } from "./types.ts";
import { fetchNHTSAData, fetchCarApiData } from "./apiUtils.ts";
import { findBestTrimMatch } from "./trimUtils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function mergeVehicleData(nhtsaData: VehicleData, carApiData: CarApiData | null): VehicleData {
  console.log('Merging vehicle data:');
  console.log('NHTSA data:', nhtsaData);
  console.log('CarAPI data:', carApiData);

  const mergedData: VehicleData = {
    year: '',
    make: '',
    model: '',
    trim: '',
    engineCylinders: '',
    transmission: '',
    drivetrain: ''
  };

  // Start with NHTSA data as base
  Object.assign(mergedData, nhtsaData);

  // Handle Porsche models specifically when CarAPI data isn't available
  if (mergedData.make === 'PORSCHE') {
    console.log('Processing Porsche vehicle data');
    handlePorscheSpecifics(mergedData);
  }

  // Enhance with CarAPI data if available
  if (carApiData) {
    const year = parseInt(carApiData.year?.toString() || nhtsaData.year || '');
    console.log('Processing vehicle data with year:', year);
    
    // Year: Use CarAPI if available
    if (carApiData.year) {
      mergedData.year = carApiData.year.toString();
    }

    // Make: Prefer CarAPI if available
    if (carApiData.make) {
      mergedData.make = carApiData.make;
    }

    // Model: Prefer CarAPI if available
    if (carApiData.model) {
      mergedData.model = carApiData.model;
    }

    // Trim: Use best match from CarAPI trims if available
    if (carApiData.trims && carApiData.trims.length > 0) {
      console.log('Found CarAPI trims:', carApiData.trims);
      const bestTrim = findBestTrimMatch(carApiData.trims, year, carApiData.specs);
      if (bestTrim) {
        console.log('Using CarAPI trim:', bestTrim);
        mergedData.trim = bestTrim;
      } else {
        console.log('Keeping NHTSA trim:', mergedData.trim);
      }
    }

    if (carApiData.specs) {
      // Engine: Build comprehensive engine string
      const engineParts = [];
      
      // Add displacement
      if (carApiData.specs.displacement_l) {
        engineParts.push(`${carApiData.specs.displacement_l}L`);
      }
      
      // Add cylinder count
      if (carApiData.specs.engine_number_of_cylinders) {
        engineParts.push(`${carApiData.specs.engine_number_of_cylinders}-Cylinder`);
      }
      
      // Add turbo information from either source
      const isTurbo = carApiData.specs.turbo === 'Yes' || 
                     (carApiData.trims && carApiData.trims.some(t => 
                       t.description?.toLowerCase().includes('turbo')));
      if (isTurbo) {
        engineParts.push('Turbo');
      }
      
      const engineString = engineParts.join(' ');
      if (engineString) {
        mergedData.engineCylinders = engineString;
        console.log('Set engine string:', engineString);
      }

      // Transmission: Use CarAPI's detailed transmission info
      if (carApiData.specs.transmission_style && carApiData.specs.transmission_speeds) {
        mergedData.transmission = `${carApiData.specs.transmission_speeds}-Speed ${carApiData.specs.transmission_style}`;
        console.log('Set transmission:', mergedData.transmission);
      }

      // Drivetrain: Use CarAPI's drive_type if available
      if (carApiData.specs.drive_type) {
        mergedData.drivetrain = carApiData.specs.drive_type;
        console.log('Set drivetrain:', mergedData.drivetrain);
      }
    }
  }

  // Clean up any remaining empty strings with default values
  Object.keys(mergedData).forEach(key => {
    if (!mergedData[key]) {
      mergedData[key] = 'N/A';
      console.log(`Setting default value for ${key}: N/A`);
    }
  });

  console.log('Final merged data:', mergedData);
  return mergedData;
}

function handlePorscheSpecifics(data: VehicleData) {
  // Macan specific handling
  if (data.model === 'Macan') {
    if (data.trim.toLowerCase().includes('gts')) {
      data.engineCylinders = '2.9L V6 Turbo';
      data.transmission = '7-Speed PDK';
      data.drivetrain = 'AWD';
      console.log('Set Porsche Macan GTS specs');
    } else if (data.trim.toLowerCase().includes('turbo')) {
      data.engineCylinders = '2.9L V6 Turbo';
      data.transmission = '7-Speed PDK';
      data.drivetrain = 'AWD';
      console.log('Set Porsche Macan Turbo specs');
    }
  }
  // 911 specific handling
  else if (data.model === '911') {
    if (data.trim.toLowerCase().includes('turbo')) {
      data.engineCylinders = '3.8L 6-Cylinder Twin-Turbo';
      data.transmission = '8-Speed PDK';
      data.drivetrain = 'AWD';
      console.log('Set Porsche 911 Turbo specs');
    }
  }
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

      // First get NHTSA data to check the year
      const nhtsaData = await fetchNHTSAData(vin);
      console.log('NHTSA data received:', nhtsaData);

      // Then get CarAPI data if year is supported
      const carApiData = await fetchCarApiData(vin, CARAPI_KEY, nhtsaData.year);
      console.log('CarAPI data received:', carApiData);

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
