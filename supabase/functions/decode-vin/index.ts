
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders
    })
  }

  try {
    const { vin } = await req.json()
    
    if (!vin || vin.length !== 17) {
      return new Response(
        JSON.stringify({ error: 'Invalid VIN format' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Decoding VIN:', vin)

    // First try NHTSA API
    try {
      const nhtsaResponse = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`)
      if (!nhtsaResponse.ok) {
        throw new Error('NHTSA API request failed')
      }
      const nhtsaData = await nhtsaResponse.json()
      console.log('NHTSA API response:', nhtsaData)

      let vehicleData = {
        year: '',
        make: '',
        model: '',
        trim: '',
        engineCylinders: '',
        transmission: '',
        drivetrain: ''
      }

      if (nhtsaData.Results) {
        for (const result of nhtsaData.Results) {
          if (result.Value && result.Value !== "Not Applicable") {
            switch (result.Variable) {
              case 'Model Year':
                vehicleData.year = result.Value
                break
              case 'Make':
                vehicleData.make = result.Value
                break
              case 'Model':
                vehicleData.model = result.Value
                break
              case 'Trim':
                vehicleData.trim = result.Value
                break
              case 'Engine Number of Cylinders':
                vehicleData.engineCylinders = result.Value
                break
              case 'Transmission Style':
                vehicleData.transmission = result.Value
                break
              case 'Drive Type':
                vehicleData.drivetrain = result.Value
                break
            }
          }
        }
      }

      // If NHTSA data is incomplete, try CarAPI
      const missingData = Object.values(vehicleData).some(value => !value)
      if (missingData) {
        console.log('NHTSA data incomplete, trying CarAPI')
        const CARAPI_KEY = Deno.env.get('CARAPI_KEY')
        if (!CARAPI_KEY) {
          throw new Error('CarAPI key not configured')
        }

        const carApiResponse = await fetch(`https://api.carapi.app/vin/${vin}`, {
          headers: { 
            'Authorization': `Bearer ${CARAPI_KEY}`,
            'Accept': 'application/json'
          }
        })

        if (!carApiResponse.ok) {
          throw new Error('CarAPI request failed')
        }

        const carApiData = await carApiResponse.json()
        console.log('CarAPI response:', carApiData)

        if (carApiData.data) {
          const data = carApiData.data
          vehicleData = {
            year: vehicleData.year || data.year?.toString() || '',
            make: vehicleData.make || data.make || '',
            model: vehicleData.model || data.model || '',
            trim: vehicleData.trim || data.trim || '',
            engineCylinders: vehicleData.engineCylinders || `${data.engine_size || ''} ${data.engine_cylinders || ''}`.trim() || '',
            transmission: vehicleData.transmission || data.transmission || '',
            drivetrain: vehicleData.drivetrain || data.drive_type || ''
          }
        }
      }

      console.log('Final vehicle data:', vehicleData)
      return new Response(
        JSON.stringify(vehicleData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } catch (apiError) {
      console.error('API Error:', apiError)
      return new Response(
        JSON.stringify({ error: 'Failed to decode VIN. Please try again.' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('Error decoding VIN:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to decode VIN' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
