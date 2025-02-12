
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
    if (!vin || typeof vin !== 'string' || vin.length !== 17) {
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

    console.log('Making request to CarAPI with VIN:', vin)
    const apiUrl = `https://carapi.app/api/v1/decode/${vin}`
    console.log('API Endpoint:', apiUrl)
    console.log('Using API Key (first 4 chars):', apiKey.substring(0, 4))

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    })

    console.log('CarAPI response status:', response.status)
    console.log('CarAPI response headers:', Object.fromEntries(response.headers.entries()))
    
    // Get the raw response text first
    const responseText = await response.text()
    console.log('CarAPI raw response:', responseText)

    let data
    try {
      // Try to parse the response as JSON
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse CarAPI response as JSON:', parseError)
      console.error('Raw response was:', responseText)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid API response format',
          details: responseText.substring(0, 500) // Limit the response size
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 }
      )
    }
    
    console.log('CarAPI parsed response:', data)

    if (!response.ok) {
      console.error('CarAPI error response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: data
      })
      return new Response(
        JSON.stringify({ 
          error: 'Failed to decode VIN', 
          details: data,
          status: response.status,
          statusText: response.statusText
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      )
    }

    return new Response(
      JSON.stringify(data),
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
