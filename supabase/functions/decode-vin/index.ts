
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to format displacement
const formatDisplacement = (displacement: string | null): string => {
  if (!displacement) return '';
  const value = parseFloat(displacement);
  if (isNaN(value)) return '';
  return `${value.toFixed(1)}L`;
}

// Helper function to determine engine configuration
const determineEngineConfiguration = (specs: any): string => {
  console.log('Determining engine configuration from specs:', {
    configuration: specs.engine_configuration,
    cylinders: specs.engine_number_of_cylinders,
    displacement: specs.displacement_l,
    description: specs.description,
    engineDescription: specs.engine_description,
    trimDescription: specs.trim_description
  });

  // Direct configuration check
  if (specs.engine_configuration) {
    const config = specs.engine_configuration.toLowerCase();
    console.log('Found explicit engine configuration:', config);
    if (config.includes('inline')) return 'I';
    if (config.includes('v')) return 'V';
  }

  // Check descriptions for configuration hints
  const descriptions = [
    specs.engine_description,
    specs.description,
    specs.trim_description
  ].filter(Boolean);

  for (const desc of descriptions) {
    const lowerDesc = desc.toLowerCase();
    if (lowerDesc.includes('inline') || lowerDesc.includes('i-')) {
      console.log('Found inline configuration in description:', desc);
      return 'I';
    }
    if (lowerDesc.includes('v-') || lowerDesc.includes(' v6') || lowerDesc.includes(' v8')) {
      console.log('Found V configuration in description:', desc);
      return 'V';
    }
  }

  // Infer from displacement and cylinders
  const displacement = parseFloat(specs.displacement_l || '0');
  const cylinders = parseInt(specs.engine_number_of_cylinders || '0');

  console.log('Inferring from displacement and cylinders:', { displacement, cylinders });

  // Common engine configurations
  if (cylinders === 4) {
    console.log('4-cylinder engine, likely inline configuration');
    return 'I';
  }
  
  if (displacement <= 2.5 && cylinders === 4) {
    console.log('Small displacement 4-cylinder, assuming inline configuration');
    return 'I';
  }

  if (cylinders >= 6) {
    console.log('6+ cylinders, likely V configuration');
    return 'V';
  }

  console.log('Unable to determine configuration, defaulting to Inline for 4 or fewer cylinders');
  return cylinders <= 4 ? 'I' : 'V';
}

// Helper function to detect turbo
const isTurboEngine = (specs: any): boolean => {
  if (!specs) return false;
  
  // Check in order of precedence
  if (specs.turbo === true) return true;
  
  const descriptions = [
    specs.engine_description,
    specs.description,
    specs.trim_description
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
  if (!specs) return "Engine information not available";
  console.log('Processing engine specs:', JSON.stringify(specs, null, 2));

  const cylinders = specs.engine_number_of_cylinders ? 
    parseInt(specs.engine_number_of_cylinders) : null;
  
  if (!cylinders) return "Engine information not available";

  const configuration = determineEngineConfiguration(specs);
  console.log('Determined engine configuration:', configuration);

  const displacementStr = formatDisplacement(specs.displacement_l);
  console.log('Formatted displacement:', displacementStr);

  const isTurbo = isTurboEngine(specs);
  console.log('Is turbo engine:', isTurbo);

  let baseDescription = '';
  if (displacementStr) {
    baseDescription = `${displacementStr} ${configuration}${cylinders}`;
  } else {
    baseDescription = `${configuration}${cylinders}`;
  }
  
  console.log('Final engine description:', isTurbo ? `${baseDescription} Turbo` : baseDescription);
  return isTurbo ? `${baseDescription} Turbo` : baseDescription;
}

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
      // Log the exact structure we're trying to access
      console.log('API Response Fields:', {
        year: data.year,
        make: data.make,
        model: data.model,
        trims: data.trims,
        specs: {
          engine_number_of_cylinders: data.specs?.engine_number_of_cylinders,
          transmission_style: data.specs?.transmission_style,
          drive_type: data.specs?.drive_type,
          engine_configuration: data.specs?.engine_configuration,
          turbo: data.specs?.turbo,
          description: data.specs?.description,
          displacement_l: data.specs?.displacement_l,
          engine_description: data.specs?.engine_description,
          trim_description: data.specs?.trim_description
        }
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

    // Format engine description
    const engineDescription = formatEngineDescription(data.specs);
    console.log('Formatted engine description:', engineDescription);

    const transmissionStyle = data.specs?.transmission_style || "";
    const driveType = data.specs?.drive_type || "";
    
    // Get trim from trims array if available
    const trimName = data.trims && data.trims.length > 0 ? data.trims[0].name : "";

    // Transform the response to match our expected structure
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
    console.log('Raw specs data for debugging:', data.specs)

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
