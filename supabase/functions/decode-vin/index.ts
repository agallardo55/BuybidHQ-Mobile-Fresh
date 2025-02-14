
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
      console.log('Parsed CarAPI response:', JSON.stringify(data, null, 2))
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

    // Log raw engine, transmission, and drivetrain data
    console.log('Raw engine data:', data.engine)
    console.log('Raw transmission data:', data.transmission)
    console.log('Raw drive type data:', {
      drive_type: data.drive_type,
      drivetrain: data.drivetrain
    })

    // Transform the response to match our expected structure
    const transformedData = {
      year: data.year?.toString() || "",
      make: data.make || "",
      model: data.model || "",
      trim: data.trim || "",
      engineCylinders: data.engine?.configuration || data.engine?.cylinders?.toString() || "",
      transmission: data.transmission?.type || data.transmission?.name || "",
      drivetrain: data.drive_type || data.drivetrain || "",
    }

    console.log('Transformed response data:', transformedData)

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
