
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to determine engine configuration
const determineEngineConfiguration = (
  configuration: string | null, 
  cylinders: number | null
): string => {
  if (configuration) {
    return configuration.toLowerCase() === 'inline' ? 'I' : 'V';
  }
  // Infer configuration based on number of cylinders
  if (cylinders) {
    return cylinders <= 4 ? 'I' : 'V';
  }
  return '';
}

// Helper function to format engine description
const formatEngineDescription = (specs: any): string => {
  if (!specs) return "Engine information not available";

  const cylinders = specs.engine_number_of_cylinders ? 
    parseInt(specs.engine_number_of_cylinders) : null;
  
  if (!cylinders) return "Engine information not available";

  const configuration = determineEngineConfiguration(
    specs.engine_configuration,
    cylinders
  );

  // Get displacement value
  const displacement = specs.displacement_l || '';
  const displacementStr = displacement ? `${displacement}L ` : '';

  // Check if engine is turbocharged
  const isTurbo = specs.turbo || 
    (specs.description?.toLowerCase().includes('turbo'));

  // Build the engine description with displacement
  const baseDescription = `${displacementStr}${configuration}-${cylinders}`;
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
        trim: data.trim,
        specs: {
          engine_number_of_: data.specs?.engine_number_of_,
          transmission_style: data.specs?.transmission_style,
          drive_type: data.specs?.drive_type,
          engine_configuration: data.specs?.engine_configuration,
          turbo: data.specs?.turbo,
          description: data.specs?.description,
          displacement_l: data.specs?.displacement_l
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

    // Transform the response to match our expected structure
    const transformedData = {
      year: data.year?.toString() || "",
      make: data.make || "",
      model: data.model || "",
      trim: data.trim || "",
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
