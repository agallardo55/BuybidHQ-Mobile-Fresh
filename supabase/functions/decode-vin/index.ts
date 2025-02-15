
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

async function decodeVinWithNHTSA(vin: string) {
  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
    );
    
    if (!response.ok) {
      console.error('NHTSA API error:', response.status);
      return null;
    }

    const data = await response.json();
    console.log('NHTSA response:', data);

    if (!data.Results || data.Results.length === 0) {
      return null;
    }

    const results = data.Results.reduce((acc: { [key: string]: string }, item: any) => {
      if (item.Value && item.Value !== "Not Applicable") {
        acc[item.Variable] = item.Value;
      }
      return acc;
    }, {});

    return {
      year: results.ModelYear || "",
      make: results.Make || "",
      model: results.Model || "",
      trim: results.Trim || "",
      engineCylinders: results.EngineCylinders ? `${results.DisplacementL || ''}L ${results.EngineCylinders}` : "",
      transmission: `${results.TransmissionSpeeds || ''} ${results.TransmissionStyle || ''}`.trim(),
      drivetrain: results.DriveType || ""
    };
  } catch (error) {
    console.error('Error fetching from NHTSA:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const { vin } = await req.json();
    console.log('Processing VIN:', vin);

    if (!vin || typeof vin !== 'string' || vin.length !== 17) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid VIN format',
          message: 'Please provide a valid 17-character VIN'
        }),
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    let vehicleData = await decodeVinWithNHTSA(vin);
    console.log('NHTSA decode result:', vehicleData);

    if (!vehicleData) {
      // Fallback to CarAPI
      const apiKey = Deno.env.get('CARAPI_KEY');
      if (!apiKey) {
        throw new Error('CarAPI key not configured');
      }

      const response = await fetch(
        `https://carapi.app/api/vin/${vin}?api_token=${apiKey}`
      );
      
      if (response.status === 404) {
        return new Response(
          JSON.stringify({
            error: 'VIN not found',
            message: 'Vehicle information not found. Please enter details manually.'
          }),
          { 
            status: 404,
            headers: corsHeaders
          }
        );
      }

      if (!response.ok) {
        throw new Error(`CarAPI error: ${response.status}`);
      }

      const data = await response.json();
      vehicleData = {
        year: data.year?.toString() || "",
        make: data.make || "",
        model: data.model || "",
        trim: data.trim || "",
        engineCylinders: data.specs?.engine_cylinders || "",
        transmission: data.specs?.transmission || "",
        drivetrain: data.specs?.drive_type || ""
      };
    }

    return new Response(
      JSON.stringify(vehicleData),
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to decode VIN',
        message: error.message
      }),
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
});
