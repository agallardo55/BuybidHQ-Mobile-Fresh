
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type VehicleData = {
  year: string;
  make: string;
  model: string;
  trim: string;
  engineCylinders: string;
  transmission: string;
  drivetrain: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { vin } = await req.json()
    console.log('Decoding VIN:', vin)

    if (!vin || vin.length !== 17) {
      throw new Error('Invalid VIN format')
    }

    // First try NHTSA API
    const nhtsaResponse = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`)
    const nhtsaData = await nhtsaResponse.json()
    console.log('NHTSA API response:', nhtsaData)

    let vehicleData: VehicleData = {
      year: '',
      make: '',
      model: '',
      trim: '',
      engineCylinders: '',
      transmission: '',
      drivetrain: ''
    }

    if (nhtsaData.Results) {
      const processNHTSAValue = (value: string | null): string => {
        if (!value || value === 'Not Applicable' || value === 'null') return ''
        return value
      }

      // Extract NHTSA data
      for (const result of nhtsaData.Results) {
        switch (result.Variable) {
          case 'Model Year':
            vehicleData.year = processNHTSAValue(result.Value)
            break
          case 'Make':
            vehicleData.make = processNHTSAValue(result.Value)
            break
          case 'Model':
            vehicleData.model = processNHTSAValue(result.Value)
            break
          case 'Trim':
            vehicleData.trim = processNHTSAValue(result.Value)
            break
          case 'Engine Number of Cylinders':
            vehicleData.engineCylinders = processNHTSAValue(result.Value)
            break
          case 'Transmission Style':
            vehicleData.transmission = processNHTSAValue(result.Value)
            break
          case 'Drive Type':
            vehicleData.drivetrain = processNHTSAValue(result.Value)
            break
        }
      }
    }

    // If NHTSA data is incomplete, try CarAPI
    const missingData = Object.entries(vehicleData).some(([_, value]) => !value)
    if (missingData) {
      console.log('NHTSA data incomplete, trying CarAPI')
      const CARAPI_KEY = Deno.env.get('CARAPI_KEY')
      if (!CARAPI_KEY) {
        throw new Error('CarAPI key not configured')
      }

      const carApiResponse = await fetch(`https://api.carapi.app/vin/${vin}`, {
        headers: { 'Authorization': `Bearer ${CARAPI_KEY}` }
      })
      const carApiData = await carApiResponse.json()
      console.log('CarAPI response:', carApiData)

      if (carApiData.data) {
        const data = carApiData.data
        vehicleData = {
          year: vehicleData.year || data.year?.toString() || '',
          make: vehicleData.make || data.make || '',
          model: vehicleData.model || data.model || '',
          trim: vehicleData.trim || data.trim || '',
          engineCylinders: vehicleData.engineCylinders || `${data.engine_size}L ${data.engine_cylinders}-Cylinder` || '',
          transmission: vehicleData.transmission || data.transmission || '',
          drivetrain: vehicleData.drivetrain || data.drive_type || ''
        }
      }
    }

    // Final validation and cleanup
    Object.keys(vehicleData).forEach(key => {
      if (typeof vehicleData[key] !== 'string') {
        vehicleData[key] = ''
      }
    })

    console.log('Final vehicle data:', vehicleData)
    return new Response(
      JSON.stringify(vehicleData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

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
