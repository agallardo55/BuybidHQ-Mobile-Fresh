
import { fetchData } from "./fetchData.ts";
import { CarApiResult } from "../types.ts";

// JWT token cache
let cachedJWT: { token: string; expiresAt: number } | null = null;

async function generateJWTToken(): Promise<string | null> {
  try {
    const apiToken = Deno.env.get('VIN_API_TOKEN') || Deno.env.get('VIN_API_KEY');
    const apiSecret = Deno.env.get('VIN_API_SECRET');
    
    if (!apiToken || !apiSecret) {
      console.error('VIN_API_TOKEN and VIN_API_SECRET are required for JWT authentication');
      return null;
    }

    console.log('Generating JWT token with CarAPI auth endpoint');

    // CarAPI returns a plain JWT token as text, not JSON
    const response = await fetch('https://carapi.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_token: apiToken,
        api_secret: apiSecret
      })
    });

    if (!response.ok) {
      console.error(`CarAPI auth failed with status ${response.status}`);
      return null;
    }

    // Get the JWT token as plain text
    const jwtToken = await response.text();
    console.log('CarAPI auth response received:', jwtToken.substring(0, 20) + '...');

    if (!jwtToken || jwtToken.length < 10) {
      console.error('Invalid JWT token received from CarAPI');
      return null;
    }

    // Cache the token with expiration (set to 1 hour, subtract 5 minutes for safety)
    const expiresAt = Date.now() + (55 * 60 * 1000); // 55 minutes
    cachedJWT = {
      token: jwtToken.trim(),
      expiresAt
    };

    console.log('JWT token generated successfully, expires at:', new Date(expiresAt));
    return jwtToken.trim();
  } catch (error) {
    console.error('Error generating JWT token:', error);
    return null;
  }
}

async function getValidJWTToken(): Promise<string | null> {
  // Check if we have a valid cached token
  if (cachedJWT && Date.now() < cachedJWT.expiresAt) {
    console.log('Using cached JWT token');
    return cachedJWT.token;
  }

  // Generate new token
  console.log('Generating new JWT token (cache expired or empty)');
  return await generateJWTToken();
}

export async function fetchCarApiData(vin: string): Promise<CarApiResult | null> {
  try {
    // First, validate input
    if (!vin || vin.length !== 17) {
      console.error('Invalid VIN provided:', vin);
      return null;
    }

    // Get JWT token
    const jwtToken = await getValidJWTToken();
    if (!jwtToken) {
      console.error('Failed to obtain JWT token for CarAPI authentication');
      return null;
    }

    const API_URL = `https://carapi.app/api/vin/${vin}`;

    // Log the request details (using JWT authentication)
    console.log('Making authenticated CarAPI request:', {
      url: API_URL,
      vin,
      hasJWTToken: !!jwtToken
    });

    // Make the API request with JWT authentication
    const response = await fetchData<any>(API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      }
    });

    // Log the raw response for debugging
    console.log('CarAPI raw response:', JSON.stringify(response, null, 2));

    if (!response) {
      console.error('No response from CarAPI');
      return null;
    }

    // For direct API access, the data is the response itself
    const vehicle = response;
    if (!vehicle) {
      console.error('No vehicle data in response:', response);
      return null;
    }

    // Log the trims specifically
    console.log('CarAPI trims data:', JSON.stringify(vehicle.trims, null, 2));

    const processedData = {
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      specs: {
        engine_number_of_cylinders: vehicle.specs?.engine_number_of_cylinders,
        displacement_l: vehicle.specs?.displacement_l,
        transmission_speeds: vehicle.specs?.transmission_speeds,
        transmission_style: vehicle.specs?.transmission_style,
        drive_type: vehicle.specs?.drive_type,
        turbo: vehicle.specs?.turbo,
        trim: vehicle.specs?.trim,
        series: vehicle.specs?.series
      },
      trims: Array.isArray(vehicle.trims) ? vehicle.trims : []
    };

    console.log('Processed CarAPI data:', JSON.stringify(processedData, null, 2));
    return processedData;
  } catch (error) {
    console.error('CarAPI error:', error);
    return null;
  }
}

export async function fetchNHTSAData(vin: string): Promise<any> {
  try {
    console.log(`Fetching NHTSA data for VIN: ${vin}`);
    
    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;
    console.log('NHTSA URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`NHTSA API request failed with status ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log('NHTSA raw response:', JSON.stringify(data, null, 2));
    
    if (!data.Results || data.Results.length === 0) {
      console.error('No results from NHTSA API');
      return null;
    }
    
    const result = data.Results[0];
    
    // Extract basic vehicle information
    const vehicleData = {
      year: result.ModelYear || '',
      make: result.Make || '',
      model: result.Model || '',
      specs: {
        engine_number_of_cylinders: result.EngineCylinders || '',
        displacement_l: result.DisplacementL || '',
        transmission_speeds: result.TransmissionSpeeds || '',
        transmission_style: result.TransmissionStyle || '',
        drive_type: result.DriveType || '',
        turbo: result.Turbo || false,
        trim: result.Trim || '',
        series: result.Series || '',
        body_class: result.BodyClass || '',
        doors: result.Doors || ''
      },
      trims: result.Trim ? [{
        name: result.Trim,
        description: `${result.ModelYear} ${result.Make} ${result.Model} ${result.Trim}`,
        year: parseInt(result.ModelYear) || 0
      }] : []
    };
    
    console.log('Processed NHTSA data:', JSON.stringify(vehicleData, null, 2));
    return vehicleData;
  } catch (error) {
    console.error('NHTSA API error:', error);
    return null;
  }
}

export async function fetchAllTrimsForModel(makeModelId: number, year: number): Promise<any[]> {
  try {
    // Get JWT token using existing auth function
    const jwtToken = await getValidJWTToken();
    if (!jwtToken) {
      console.error('Failed to obtain JWT token for trims API');
      return [];
    }

    const API_URL = `https://carapi.app/api/trims?make_model_id=${makeModelId}&year=${year}`;
    
    console.log('Fetching all trims for model:', {
      url: API_URL,
      makeModelId,
      year
    });

    // Make the API request with JWT authentication
    const response = await fetchData<any>(API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      }
    });

    console.log('Trims API raw response:', JSON.stringify(response, null, 2));

    // The API can return either an array directly or an object with data property
    let trimsArray = [];
    if (Array.isArray(response)) {
      trimsArray = response;
    } else if (response && Array.isArray(response.data)) {
      trimsArray = response.data;
    } else if (response && response.collection && Array.isArray(response.collection)) {
      trimsArray = response.collection;
    }

    if (!trimsArray || trimsArray.length === 0) {
      console.log('No trims data returned from API');
      return [];
    }

    console.log(`Found ${trimsArray.length} total trims for make_model_id ${makeModelId}, year ${year}`);
    return trimsArray;
  } catch (error) {
    console.error('Error fetching all trims:', error);
    return [];
  }
}
