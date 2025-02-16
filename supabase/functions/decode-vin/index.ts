
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
      console.error('Invalid VIN format:', vin)
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
      const nhtsaUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
      console.log('Calling NHTSA API:', nhtsaUrl)
      
      const nhtsaResponse = await fetch(nhtsaUrl)
      if (!nhtsaResponse.ok) {
        console.error('NHTSA API error:', {
          status: nhtsaResponse.status,
          statusText: nhtsaResponse.statusText
        })
        throw new Error('NHTSA API request failed')
      }

      const nhtsaData = await nhtsaResponse.json()
      console.log('NHTSA API response:', JSON.stringify(nhtsaData))

      let vehicleData = {
        year: '',
        make: '',
        model: '',
        trim: '',
        engineCylinders: '',
        transmission: '',
        drivetrain: ''
      }

      if (nhtsaData?.Results) {
        for (const result of nhtsaData.Results) {
          if (result?.Value && result.Value !== "Not Applicable") {
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
      } else {
        console.warn('No Results array in NHTSA response')
      }

      // If NHTSA data is incomplete, try CarAPI
      const missingData = Object.values(vehicleData).some(value => !value)
      if (missingData) {
        console.log('NHTSA data incomplete, trying CarAPI')
        const CARAPI_KEY = Deno.env.get('CARAPI_KEY')
        if (!CARAPI_KEY) {
          console.error('CarAPI key not found in environment')
          throw new Error('CarAPI key not configured')
        }

        try {
          const carApiUrl = `https://api.carapi.app/vin/${vin}`
          console.log('Calling CarAPI:', carApiUrl)

          const carApiResponse = await fetch(carApiUrl, {
            headers: { 
              'Authorization': `Bearer ${CARAPI_KEY}`,
              'Accept': 'application/json'
            }
          })

          const responseText = await carApiResponse.text()
          console.log('CarAPI raw response:', responseText)

          if (!carApiResponse.ok) {
            console.error('CarAPI error:', {
              status: carApiResponse.status,
              statusText: carApiResponse.statusText,
              response: responseText
            })
            // Don't throw here - just log and continue with NHTSA data
            console.log('Continuing with NHTSA data only')
          } else {
            try {
              const carApiData = JSON.parse(responseText)
              console.log('CarAPI parsed response:', JSON.stringify(carApiData))

              if (carApiData?.data) {
                const data = carApiData.data
                vehicleData = {
                  year: vehicleData.year || (data.year?.toString() || ''),
                  make: vehicleData.make || (data.make || ''),
                  model: vehicleData.model || (data.model || ''),
                  trim: vehicleData.trim || (data.trim || ''),
                  engineCylinders: vehicleData.engineCylinders || 
                    `${data.engine_size || ''} ${data.engine_cylinders || ''}`.trim() || '',
                  transmission: vehicleData.transmission || (data.transmission || ''),
                  drivetrain: vehicleData.drivetrain || (data.drive_type || '')
                }
              } else {
                console.warn('No data object in CarAPI response')
              }
            } catch (parseError) {
              console.error('Error parsing CarAPI response:', parseError)
              // Continue with NHTSA data
              console.log('Continuing with NHTSA data due to parse error')
            }
          }
        } catch (carApiError) {
          console.error('CarAPI request error:', carApiError)
          // Continue with NHTSA data
          console.log('Continuing with NHTSA data due to request error')
        }
      }

      console.log('Final vehicle data:', JSON.stringify(vehicleData))
      
      // Return data if we have at least the basic information
      if (vehicleData.year || vehicleData.make || vehicleData.model) {
        return new Response(
          JSON.stringify(vehicleData),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      } else {
        throw new Error('Could not decode VIN with either API')
      }

    } catch (apiError) {
      console.error('API Error:', apiError?.message || apiError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to decode VIN. Please try again.',
          details: apiError?.message || 'Unknown API error'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('General Error:', error?.message || error)
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Failed to decode VIN',
        details: 'Unexpected error occurred'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
