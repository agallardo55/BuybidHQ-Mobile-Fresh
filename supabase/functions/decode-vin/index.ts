import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuration for exotic cars
const exoticCarConfigs = {
  'lamborghini': {
    'huracan': {
      engineDescription: '5.2L V10',
      transmission: '7-speed LDF dual-clutch',
      drivetrain: 'AWD',
    },
    'urus': {
      engineDescription: '4.0L V8 Twin-Turbo',
      transmission: '8-speed automatic',
      drivetrain: 'AWD',
    },
    'aventador': {
      engineDescription: '6.5L V12',
      transmission: '7-speed ISR',
      drivetrain: 'AWD',
    }
  }
};

// Configuration for electric vehicles
const electricVehicleConfigs = {
  'tesla': {
    'model_3': {
      engineDescription: 'Electric',
      transmission: 'Single-speed automatic',
      drivetrain: 'RWD/AWD',
    },
    'model_s': {
      engineDescription: 'Electric',
      transmission: 'Single-speed automatic',
      drivetrain: 'AWD',
    },
    'model_x': {
      engineDescription: 'Electric',
      transmission: 'Single-speed automatic',
      drivetrain: 'AWD',
    },
    'model_y': {
      engineDescription: 'Electric',
      transmission: 'Single-speed automatic',
      drivetrain: 'AWD',
    }
  },
  'rivian': {
    'r1t': {
      engineDescription: 'Quad-Motor Electric',
      transmission: 'Single-speed automatic',
      drivetrain: 'AWD',
    },
    'r1s': {
      engineDescription: 'Quad-Motor Electric',
      transmission: 'Single-speed automatic',
      drivetrain: 'AWD',
    }
  }
};

// Helper function to identify electric vehicles by VIN
const getElectricVehicleConfig = (vin: string, make: string, model: string) => {
  // Common EV VIN patterns
  if (vin.startsWith('5YJ')) { // Tesla
    make = 'tesla';
    // Map Tesla model codes to names
    const modelMap: { [key: string]: string } = {
      'S': 'model_s',
      'X': 'model_x',
      '3': 'model_3',
      'Y': 'model_y'
    };
    // Extract model code from VIN position 4
    const modelCode = vin.charAt(3);
    model = modelMap[modelCode] || model.toLowerCase().replace(' ', '_');
  }

  if (electricVehicleConfigs[make.toLowerCase()]?.[model.toLowerCase()]) {
    return electricVehicleConfigs[make.toLowerCase()][model.toLowerCase()];
  }
  return null;
};

// Helper function to identify exotic cars by VIN
const getExoticCarConfig = (vin: string, make: string, model: string) => {
  // Lamborghini VIN patterns
  if (vin.startsWith('ZHW')) {
    make = 'lamborghini';
    // Specific Lamborghini model identification
    if (vin.includes('UF5')) { // Huracán pattern
      model = 'huracan';
    } else if (vin.includes('UF1')) { // Aventador pattern
      model = 'aventador';
    } else if (vin.includes('UR2')) { // Urus pattern
      model = 'urus';
    }
  }

  if (exoticCarConfigs[make.toLowerCase()]?.[model.toLowerCase()]) {
    return exoticCarConfigs[make.toLowerCase()][model.toLowerCase()];
  }
  return null;
};

// Helper function to detect hybrid vehicles
const isHybridVehicle = (specs: any): boolean => {
  const hybridKeywords = ['hybrid', 'phev', 'plug-in', 'electric'];
  
  // Check various fields for hybrid indicators
  const descriptions = [
    specs?.description,
    specs?.engine_description,
    ...((specs?.trims || []).map(trim => trim.description))
  ].filter(Boolean).map(desc => desc.toLowerCase());

  return descriptions.some(desc => 
    hybridKeywords.some(keyword => desc.includes(keyword))
  );
};

// Helper function to format displacement
const formatDisplacement = (displacement: string | null): string => {
  if (!displacement) return '';
  const value = parseFloat(displacement);
  if (isNaN(value)) return '';
  return `${value.toFixed(1)}L`;
}

// Helper function to determine engine configuration
const determineEngineConfiguration = (specs: any): string => {
  console.log('Raw engine specs:', JSON.stringify(specs, null, 2));
  
  // First try to get engine info from trim descriptions
  if (specs.trims && specs.trims.length > 0) {
    console.log('Checking trim descriptions for engine info');
    
    // Sort trims by name to prioritize "Base" trim first as it's typically most accurate
    const sortedTrims = [...specs.trims].sort((a, b) => {
      if (a.name === "Base") return -1;
      if (b.name === "Base") return 1;
      return 0;
    });

    for (const trim of sortedTrims) {
      if (trim.description) {
        console.log('Analyzing trim description:', trim.description);
        const desc = trim.description.toLowerCase();
        
        // Look for specific engine configurations in trim description
        if (desc.includes('2.0l 4cyl') || desc.includes('2.0l i4') || desc.includes('2.0 i4')) {
          console.log('Found 2.0L 4-cylinder configuration in trim');
          return 'I';
        }
        
        if (desc.includes('inline') || desc.includes(' i4') || desc.includes('i-4')) {
          console.log('Found inline-4 indicator in trim');
          return 'I';
        }
        
        if (desc.includes(' v6') || desc.includes('v-6')) {
          console.log('Found V6 indicator in trim');
          return 'V';
        }
        
        if (desc.includes(' v8') || desc.includes('v-8')) {
          console.log('Found V8 indicator in trim');
          return 'V';
        }
      }
    }
  }

  // If we couldn't determine from trims, check engine specs
  console.log('Checking engine specifications');
  
  const engineData = {
    configuration: specs.specs?.engine_configuration,
    cylinders: specs.specs?.engine_number_of_cylinders,
    displacement: specs.specs?.displacement_l,
    description: specs.specs?.description,
    engineDescription: specs.specs?.engine_description,
  };
  
  console.log('Engine data:', engineData);

  // Check explicit configuration first
  if (engineData.configuration) {
    const config = engineData.configuration.toLowerCase();
    if (config.includes('inline')) return 'I';
    if (config.includes('v')) return 'V';
  }

  // Common engine configurations based on displacement and cylinders
  const displacement = parseFloat(engineData.displacement || '0');
  const cylinders = parseInt(engineData.cylinders || '0');

  console.log('Analyzing displacement and cylinders:', { displacement, cylinders });

  // 2.0L engines are typically inline-4
  if (displacement === 2.0 || (displacement > 1.9 && displacement < 2.1)) {
    console.log('2.0L engine detected, likely inline-4');
    return 'I';
  }

  // Most 4-cylinder engines are inline
  if (cylinders === 4) {
    console.log('4-cylinder engine, using inline configuration');
    return 'I';
  }

  // Most 6+ cylinder engines are V configuration
  if (cylinders >= 6) {
    console.log('6+ cylinder engine, using V configuration');
    return 'V';
  }

  // Default to inline for 4 or fewer cylinders, V for more
  console.log('Using fallback configuration logic');
  return cylinders <= 4 ? 'I' : 'V';
}

// Helper function to detect turbo
const isTurboEngine = (specs: any): boolean => {
  if (!specs) return false;
  
  // Check trims first for turbo information
  if (specs.trims && specs.trims.length > 0) {
    for (const trim of specs.trims) {
      if (trim.description && 
          trim.description.toLowerCase().includes('turbo')) {
        return true;
      }
    }
  }
  
  if (specs.specs?.turbo === true) return true;
  
  const descriptions = [
    specs.specs?.engine_description,
    specs.specs?.description,
    specs.specs?.trim_description
  ].filter(Boolean);
  
  for (const desc of descriptions) {
    if (desc.toLowerCase().includes('turbo') || 
        desc.toLowerCase().includes('turbocharged')) {
      return true;
    }
  }
  
  return false;
}

// Helper function to format engine description
const formatEngineDescription = (specs: any): string => {
  console.log('Starting engine description formatting for:', specs?.make, specs?.model);

  // Check for electric vehicle configuration
  const evConfig = getElectricVehicleConfig(specs.vin, specs.make, specs.model);
  if (evConfig) {
    console.log('Found electric vehicle configuration:', evConfig);
    return evConfig.engineDescription;
  }

  // Check for exotic car configuration
  const exoticConfig = getExoticCarConfig(specs.vin, specs.make, specs.model);
  if (exoticConfig) {
    console.log('Found exotic car configuration:', exoticConfig);
    return exoticConfig.engineDescription;
  }

  // Check if it's a hybrid
  if (isHybridVehicle(specs)) {
    console.log('Detected hybrid vehicle');
    const baseEngine = formatBaseEngineDescription(specs);
    return baseEngine ? `${baseEngine} Hybrid` : 'Hybrid';
  }

  return formatBaseEngineDescription(specs);
};

// Helper function to format base engine description
const formatBaseEngineDescription = (specs: any): string => {
  if (!specs) {
    console.log('No specs provided to formatBaseEngineDescription');
    return "Engine information not available";
  }

  // Try to get cylinder count from trim description first
  let cylinders = null;
  if (specs.trims && specs.trims.length > 0) {
    const baseTrims = specs.trims.filter(trim => 
      trim.description && trim.description.toLowerCase().includes('2.0l 4cyl'));
    if (baseTrims.length > 0) {
      cylinders = 4;
    }
  }

  // Fallback to specs data if needed
  if (!cylinders && specs.specs?.engine_number_of_cylinders) {
    cylinders = parseInt(specs.specs.engine_number_of_cylinders);
  }

  if (!cylinders) {
    console.log('No valid cylinder count found');
    return "Engine information not available";
  }

  const configuration = determineEngineConfiguration(specs);
  const displacementStr = formatDisplacement(specs.specs?.displacement_l);
  const isTurbo = isTurboEngine(specs);

  let baseDescription = '';
  if (displacementStr) {
    baseDescription = `${displacementStr} ${configuration}${cylinders}`;
  } else {
    baseDescription = `${configuration}${cylinders}`;
  }

  return isTurbo ? `${baseDescription} Turbo` : baseDescription;
};

// Helper function to clean up drivetrain value
const cleanDrivetrain = (driveType: string | null, make?: string, model?: string, vin?: string): string => {
  // Check for electric or exotic vehicle configurations first
  const evConfig = vin && make && model ? getElectricVehicleConfig(vin, make, model) : null;
  if (evConfig) {
    return evConfig.drivetrain;
  }

  const exoticConfig = vin && make && model ? getExoticCarConfig(vin, make, model) : null;
  if (exoticConfig) {
    return exoticConfig.drivetrain;
  }

  if (!driveType) return "";
  
  // Common mappings for drive types
  const driveTypeMap: { [key: string]: string } = {
    'AWD/All-Wheel Drive': 'AWD',
    'FWD/Front-Wheel Drive': 'FWD',
    'RWD/Rear-Wheel Drive': 'RWD',
    '4WD/Four-Wheel Drive': '4WD'
  };

  // Check if we have a direct mapping
  for (const [key, value] of Object.entries(driveTypeMap)) {
    if (driveType.includes(key)) {
      return value;
    }
  }

  // If no direct mapping, try to extract common abbreviations
  const driveTypeLC = driveType.toUpperCase();
  if (driveTypeLC.includes('AWD')) return 'AWD';
  if (driveTypeLC.includes('FWD')) return 'FWD';
  if (driveTypeLC.includes('RWD')) return 'RWD';
  if (driveTypeLC.includes('4WD')) return '4WD';

  // Return the original value if no matches found
  return driveType;
};

// Helper function to clean up transmission value
const cleanTransmission = (transmission: string | null, make?: string, model?: string, vin?: string): string => {
  // Check for electric or exotic vehicle configurations first
  const evConfig = vin && make && model ? getElectricVehicleConfig(vin, make, model) : null;
  if (evConfig) {
    return evConfig.transmission;
  }

  const exoticConfig = vin && make && model ? getExoticCarConfig(vin, make, model) : null;
  if (exoticConfig) {
    return exoticConfig.transmission;
  }

  if (!transmission) return "";
  return transmission;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { vin } = await req.json()
    console.log('Received VIN request:', vin)

    if (!vin || typeof vin !== 'string' || vin.length !== 17) {
      console.error('Invalid VIN format:', vin)
      return new Response(
        JSON.stringify({ error: 'Invalid VIN provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const apiKey = Deno.env.get('CARAPI_KEY')
    if (!apiKey) {
      console.error('CARAPI_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const apiUrl = `https://carapi.app/api/vin/${vin}?api_token=${apiKey}`
    console.log('Making request to CarAPI for VIN:', vin)

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })

    console.log('CarAPI response status:', response.status)
    
    // Get the raw response text
    const responseText = await response.text()
    console.log('CarAPI raw response:', responseText)

    let data
    try {
      data = JSON.parse(responseText)
      console.log('API Response Fields:', {
        year: data.year,
        make: data.make,
        model: data.model,
        trims: data.trims,
        specs: data.specs
      })
    } catch (parseError) {
      console.error('Failed to parse CarAPI response:', parseError)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid API response format',
          details: responseText.substring(0, 500)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 }
      )
    }

    if (response.status === 404) {
      console.log('VIN not found in CarAPI database')
      return new Response(
        JSON.stringify({ 
          error: 'VIN not found',
          message: 'The provided VIN could not be found in our database. Please verify the VIN or enter the vehicle details manually.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    if (!response.ok) {
      console.error('CarAPI error:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      })
      return new Response(
        JSON.stringify({ 
          error: 'Failed to decode VIN',
          details: data
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      )
    }

    const engineDescription = formatEngineDescription({
      ...data,
      vin: vin
    });
    console.log('Formatted engine description:', engineDescription);

    const transmissionStyle = cleanTransmission(
      data.specs?.transmission_style,
      data.make,
      data.model,
      vin
    );
    const driveType = cleanDrivetrain(
      data.specs?.drive_type,
      data.make,
      data.model,
      vin
    );
    
    const trimName = data.trims && data.trims.length > 0 ? data.trims[0].name : "";

    const transformedData = {
      year: data.year?.toString() || "",
      make: data.make || "",
      model: data.model || "",
      trim: trimName,
      engineCylinders: engineDescription,
      transmission: transmissionStyle,
      drivetrain: driveType,
    }

    console.log('Final transformed data:', transformedData)

    return new Response(
      JSON.stringify(transformedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
