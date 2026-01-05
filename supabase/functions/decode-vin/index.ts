
import { cleanTrimValue, findBestTrimMatch, cleanEngineDescription } from "./utils/trimUtils.ts";
import { fetchCarApiData, fetchAllTrimsForModel, fetchNHTSAData, fetchMakesFromCarAPI, fetchModelsFromCarAPI, fetchTrimsByYearMakeModel } from "./api/carApi.ts";
import { getValidJWTToken } from "./api/carApi.ts";
import { fetchData } from "./api/fetchData.ts";
import { CarApiResult } from "./types.ts";
import { corsHeaders } from "./config.ts";
import { isNotPowersports, getPowersportsRejectionMessage } from "./utils/vehicleTypeFilters.ts";
import { applyBrandSpecificHandling, handleAMGTrims, handlePorscheGT3RS } from "./utils/brandHandlers.ts";
import { processTrims } from "./utils/trimProcessor.ts";
import { resolveTrimValue, resolveModelValue, compareDataSources } from "./utils/fieldPriority.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // TEMPORARY DEBUG ENDPOINT: Remove after testing
  if (req.url.includes('/debug-credentials') || req.url.includes('debug-credentials')) {
    const apiToken = Deno.env.get('VIN_API_TOKEN') || Deno.env.get('VIN_API_KEY');
    const apiSecret = Deno.env.get('VIN_API_SECRET');
    
    // Generate JWT to verify it works
    let jwtToken = null;
    let jwtError = null;
    let jwtStatus = null;
    try {
      const loginResponse = await fetch('https://carapi.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_token: apiToken,
          api_secret: apiSecret
        })
      });
      
      jwtStatus = loginResponse.status;
      if (loginResponse.ok) {
        jwtToken = await loginResponse.text();
      } else {
        jwtError = await loginResponse.text();
      }
    } catch (e) {
      jwtError = String(e);
    }
    
    // Test the JWT with a 2023 VIN
    let vinTestResult = null;
    if (jwtToken) {
      try {
        const vinResponse = await fetch('https://carapi.app/api/vin/WAUAUDGYXPA051082', {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Accept': 'application/json'
          }
        });
        const vinData = await vinResponse.json();
        vinTestResult = {
          status: vinResponse.status,
          has2023Data: vinData.year === 2023 || vinData.year === '2023',
          year: vinData.year,
          make: vinData.make,
          model: vinData.model,
          errorMessage: vinData.message || vinData.error || null
        };
      } catch (e) {
        vinTestResult = { error: String(e) };
      }
    }
    
    return new Response(JSON.stringify({
      credentials: {
        api_token: apiToken,
        api_secret: apiSecret,
        token_source: Deno.env.get('VIN_API_TOKEN') ? 'VIN_API_TOKEN' : (Deno.env.get('VIN_API_KEY') ? 'VIN_API_KEY' : 'NONE')
      },
      jwt_test: {
        success: !!jwtToken,
        status: jwtStatus,
        token_preview: jwtToken ? jwtToken.substring(0, 50) + '...' : null,
        token_length: jwtToken ? jwtToken.length : 0,
        error: jwtError
      },
      vin_test_2023: vinTestResult,
      warning: "⚠️ DELETE THIS ENDPOINT AFTER TESTING ⚠️"
    }, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    let body: { 
      vin?: string; 
      make_model_id?: number; 
      year?: number; 
      make?: string;
      model?: string;
      trim?: string;
      trim_lookup?: boolean;
      trims_lookup?: boolean;
      make_lookup?: boolean;
      model_lookup?: boolean;
      specs_lookup?: boolean;
      make_model_id_lookup?: boolean;
    };
    
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('❌ EDGE FUNCTION: Failed to parse JSON body:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body', details: String(parseError) }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle makes lookup request (for dropdown selection)
    if (body.make_lookup && body.year) {
      console.log(`Received makes lookup request for year ${body.year}`);
      
      const makes = await fetchMakesFromCarAPI(body.year);
      
      if (makes && makes.length > 0) {
        console.log(`Successfully fetched ${makes.length} makes for year ${body.year}`);
        return new Response(JSON.stringify({ makes }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        console.log(`No makes found from CarAPI for year ${body.year}`);
        return new Response(JSON.stringify({ makes: [] }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Handle models lookup request (for dropdown selection)
    if (body.model_lookup && body.year && body.make) {
      console.log(`Received models lookup request for year ${body.year}, make ${body.make}`);
      
      const models = await fetchModelsFromCarAPI(body.year, body.make);
      
      if (models && models.length > 0) {
        console.log(`Successfully fetched ${models.length} models for ${body.year} ${body.make}`);
        return new Response(JSON.stringify({ models }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        console.log(`No models found from CarAPI for ${body.year} ${body.make}`);
        return new Response(JSON.stringify({ models: [] }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Handle make_model_id lookup request (for dynamic trim fetching)
    // @deprecated Use trims_lookup with year/make/model instead. This requires an extra API call.

    // Check if this is a make_model_id_lookup request first
    if (body.make_model_id_lookup) {
      // If flag is set but missing required fields, return helpful error
      if (!body.year || !body.make || !body.model) {
        return new Response(JSON.stringify({ 
          error: "make_model_id_lookup requires year, make, and model",
          received: {
            make_model_id_lookup: body.make_model_id_lookup,
            year: body.year,
            make: body.make,
            model: body.model
          }
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // All fields present, proceed with lookup
      const lookupId = `EDGE_LOOKUP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`✅ [${lookupId}] EDGE FUNCTION: Received make_model_id lookup request for: ${body.year} ${body.make} ${body.model}`);
      
      // Case normalization function
      const toTitleCase = (str: string): string => {
        return str
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };
      
      // Normalize make and model for CarAPI (which uses title case)
      const normalizedMake = toTitleCase(body.make);
      const normalizedModel = toTitleCase(body.model);
      
      // Special handling for all-caps brands
      const allCapsBrands = ['BMW', 'GMC', 'MINI'];
      const finalMake = allCapsBrands.includes(body.make.toUpperCase()) ? body.make.toUpperCase() : normalizedMake;
      
      console.log(`🔄 [${lookupId}] Case normalization:`, {
        originalMake: body.make,
        normalizedMake: normalizedMake,
        finalMake: finalMake,
        originalModel: body.model,
        normalizedModel: normalizedModel
      });
      
      try {
        // Get JWT token for CarAPI
        const jwtToken = await getValidJWTToken();
        if (!jwtToken) {
          console.error(`❌ [${lookupId}] Failed to obtain JWT token for make_model_id lookup`);
          return new Response(JSON.stringify({ error: 'Authentication failed' }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Fetch models from CarAPI to get make_model_id (use normalized make)
        const carApiUrl = `https://carapi.app/api/models?year=${body.year}&make=${encodeURIComponent(finalMake)}`;
        const modelsResponse = await fetchData<any>(carApiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
          }
        });


        // Extract models array from response
        let modelsArray: any[] = [];
        if (Array.isArray(modelsResponse)) {
          modelsArray = modelsResponse;
          console.log(`✅ [${lookupId}] Models array extracted directly (array response), count:`, modelsArray.length);
        } else if (modelsResponse && Array.isArray(modelsResponse.data)) {
          modelsArray = modelsResponse.data;
          console.log(`✅ [${lookupId}] Models array extracted from .data property, count:`, modelsArray.length);
        } else if (modelsResponse && Array.isArray(modelsResponse.collection)) {
          modelsArray = modelsResponse.collection;
          console.log(`✅ [${lookupId}] Models array extracted from .collection property, count:`, modelsArray.length);
        } else {
          console.warn(`⚠️ [${lookupId}] Could not extract models array from response:`, JSON.stringify(modelsResponse, null, 2).substring(0, 500));
        }

        // Find matching model by name (case-insensitive, using normalized model)
        const matchingModel = modelsArray.find((m: any) => {
          const carApiModelName = (m.name || m.model || m.ModelName || '').trim();
          const carApiModelNameUpper = carApiModelName.toUpperCase();
          const searchModelUpper = normalizedModel.toUpperCase();
          
          // Try exact match first (case-insensitive)
          const exactMatch = carApiModelNameUpper === searchModelUpper;
          
          // Try includes match (case-insensitive)
          const includesMatch = carApiModelNameUpper.includes(searchModelUpper) || searchModelUpper.includes(carApiModelNameUpper);
          
          if (exactMatch || includesMatch) {
            console.log(`✅ [${lookupId}] MATCH FOUND:`, {
              carApiModelName: carApiModelName,
              searchModelOriginal: body.model,
              searchModelNormalized: normalizedModel,
              exactMatch,
              includesMatch,
              make_model_id: m.make_model_id
            });
          }
          
          return exactMatch || includesMatch;
        });

        if (!matchingModel || !matchingModel.make_model_id) {
          console.warn(`⚠️⚠️⚠️ [${lookupId}] ❌❌❌ make_model_id not found for model:`, {
            original: body.model,
            normalized: normalizedModel,
            normalizedUppercase: normalizedModel.toUpperCase()
          });
          console.warn(`⚠️⚠️⚠️ [${lookupId}] Available model names from CarAPI:`, modelsArray.map((m: any) => m.name || m.model || m.ModelName));
          console.warn(`⚠️⚠️⚠️ [${lookupId}] Available model names (uppercase):`, modelsArray.map((m: any) => (m.name || m.model || m.ModelName || '').toUpperCase()));
          console.warn(`⚠️⚠️⚠️ [${lookupId}] This will cause fallback to NHTSA or generic trims`);
          return new Response(JSON.stringify({ make_model_id: null }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log(`✅ [${lookupId}] Found make_model_id: ${matchingModel.make_model_id} for ${body.year} ${finalMake} ${normalizedModel}`);
        console.log(`✅ [${lookupId}] Matched model details:`, {
          carApiModelName: matchingModel.name || matchingModel.model || matchingModel.ModelName,
          searchModelOriginal: body.model,
          searchModelNormalized: normalizedModel,
          make_model_id: matchingModel.make_model_id
        });
        return new Response(JSON.stringify({ make_model_id: matchingModel.make_model_id }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error('Error in make_model_id lookup:', error);
        return new Response(JSON.stringify({ error: 'Failed to lookup make_model_id' }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Handle direct trims lookup by year/make/model (preferred method for manual dropdown selection)
    if (body.trims_lookup && body.year && body.make && body.model) {
      console.log('Received trims lookup request for:', body.year, body.make, body.model);

      try {
        const allTrims = await fetchTrimsByYearMakeModel(String(body.year), body.make, body.model);
        
        if (allTrims && allTrims.length > 0) {
          console.log(`✅ TRIMS_LOOKUP: Successfully fetched ${allTrims.length} trims for ${body.year} ${body.make} ${body.model}`);
          console.log(`📋 TRIMS_LOOKUP: Trim names:`, allTrims.map((t: any) => t.name || t.trim_name));
          return new Response(JSON.stringify({ trims: allTrims }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else {
          console.log(`⚠️ TRIMS_LOOKUP: No trims found for ${body.year} ${body.make} ${body.model}`);
          return new Response(JSON.stringify({ trims: [] }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (error) {
        console.error(`❌ TRIMS_LOOKUP: Error occurred:`, error);
        console.error(`❌ TRIMS_LOOKUP: Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
        console.error(`❌ TRIMS_LOOKUP: Error details:`, {
          message: error instanceof Error ? error.message : String(error),
          name: error instanceof Error ? error.name : 'Unknown',
          year: body.year,
          make: body.make,
          model: body.model
        });
        
        // Return error response instead of letting it bubble up
        return new Response(JSON.stringify({ 
          error: 'Failed to fetch trims',
          details: error instanceof Error ? error.message : String(error),
          trims: [] 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Handle trim lookup request with make_model_id (deprecated, kept for backward compatibility)
    if (body.trim_lookup && body.make_model_id && body.year) {
      console.log('Received trim lookup request for make_model_id:', body.make_model_id, 'year:', body.year);
      const allTrims = await fetchAllTrimsForModel(body.make_model_id, body.year);
      
      if (allTrims && allTrims.length > 0) {
        console.log(`✅ Edge Function: Successfully fetched ${allTrims.length} trims for make_model_id ${body.make_model_id}, year ${body.year}`);
        console.log(`📋 Edge Function: Trim names:`, allTrims.map((t: any) => t.name || t.trim_name));
        return new Response(JSON.stringify({ trims: allTrims }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        console.log('⚠️ Edge Function: No trims found for the given make_model_id and year');
        return new Response(JSON.stringify({ trims: [] }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Handle specs lookup request (for manual trim selection when specs missing)
    if (body.specs_lookup && body.year && body.make && body.model && body.trim) {
      console.log(`Received specs lookup request for: ${body.year} ${body.make} ${body.model} ${body.trim}`);
      
      try {
        // Get JWT token for CarAPI
        const jwtToken = await getValidJWTToken();
        if (!jwtToken) {
          console.error('Failed to obtain JWT token for specs lookup');
          return new Response(JSON.stringify({ error: 'Authentication failed' }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Fetch models from CarAPI to get make_model_id
        const modelsResponse = await fetchData<any>(`https://carapi.app/api/models?year=${body.year}&make=${encodeURIComponent(body.make)}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
          }
        });

        // Extract models array from response
        let modelsArray: any[] = [];
        if (Array.isArray(modelsResponse)) {
          modelsArray = modelsResponse;
        } else if (modelsResponse && Array.isArray(modelsResponse.data)) {
          modelsArray = modelsResponse.data;
        } else if (modelsResponse && Array.isArray(modelsResponse.collection)) {
          modelsArray = modelsResponse.collection;
        }

        // Find matching model by name
        const matchingModel = modelsArray.find((m: any) => {
          const modelName = (m.name || m.model || m.ModelName || '').toUpperCase();
          return modelName === body.model?.toUpperCase() || modelName.includes(body.model?.toUpperCase() || '');
        });

        if (!matchingModel || !matchingModel.make_model_id) {
          console.log('make_model_id not found for model:', body.model);
          return new Response(JSON.stringify({ error: 'make_model_id not found' }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Fetch all trims for this model
        const allTrims = await fetchAllTrimsForModel(matchingModel.make_model_id, body.year);
        
        if (!allTrims || allTrims.length === 0) {
          console.log('No trims found for specs lookup');
          return new Response(JSON.stringify({ error: 'Trims not found' }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Find matching trim by name (case-insensitive)
        const matchingTrim = allTrims.find((t: any) => {
          const trimName = (t.name || t.trim_name || '').toUpperCase();
          const searchTrim = (body.trim || '').toUpperCase();
          return trimName === searchTrim || trimName.includes(searchTrim) || searchTrim.includes(trimName);
        });

        if (!matchingTrim) {
          console.log('Trim not found:', body.trim);
          return new Response(JSON.stringify({ error: 'Trim not found' }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Extract specs from trim description or use defaults
        const description = matchingTrim.description || '';
        const engine = matchingTrim.specs?.engine || 
          (description.match(/\(([^)]+)\)/i)?.[1]?.match(/([\d.]+L\s+\d+cyl(?:\s+Turbo)?)/i)?.[1] || '');
        const transmission = matchingTrim.specs?.transmission || 
          (description.match(/(\d+)\s*Speed\s*(?:Automatic|Manual)/i)?.[0] || '');
        const drivetrain = matchingTrim.specs?.drivetrain || 
          (description.match(/(AWD|FWD|RWD|4WD)/i)?.[1] || 'AWD');

        // Extract body style from trim specs or description
        const bodyStyle = matchingTrim.specs?.body_class || 
          matchingTrim.body_class || 
          (description.match(/(Sedan|Coupe|SUV|Wagon|Hatchback|Convertible|Truck|Van)/i)?.[1] || '');

        const specs = {
          engine: engine.trim() || '',
          transmission: transmission.trim() || '',
          drivetrain: drivetrain.trim() || '',
          bodyStyle: bodyStyle.trim() || ''
        };

        console.log('Specs found for trim:', specs);
        return new Response(JSON.stringify({ specs }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error('Error in specs lookup:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch specs' }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Handle VIN decoding request (existing functionality)
    const { vin } = body;

    if (!vin) {
      return new Response(JSON.stringify({ error: "VIN is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Decoding VIN: ${vin}`);

    // Try CarAPI first, then fallback to NHTSA
    let apiResult = await fetchCarApiData(vin);

    if (!apiResult) {
      console.log("CarAPI failed, trying NHTSA fallback");
      apiResult = await fetchNHTSAData(vin);
      
      if (!apiResult) {
        console.error("Both CarAPI and NHTSA failed to decode VIN");
        return new Response(
          JSON.stringify({ error: "Failed to decode VIN from available services" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    const vehicleData = apiResult;

    // 🔍 PHASE 1: Compare CarAPI vs NHTSA for data quality analysis
    // Fetch NHTSA data in parallel for comparison (non-blocking)
    const nhtsaDataPromise = fetchNHTSAData(vin);
    nhtsaDataPromise.then(nhtsaData => {
      if (nhtsaData) {
        const comparison = compareDataSources(vehicleData, nhtsaData);
        console.log('📊 DATA SOURCE COMPARISON (CarAPI vs NHTSA):');
        console.table(comparison);

        // Log per-brand insights
        console.log(`📋 BRAND: ${vehicleData.make} - Field quality comparison above`);
      }
    }).catch(err => {
      console.log('⚠️ NHTSA comparison failed (non-critical):', err);
    });

    // Check if vehicle is powersports (motorcycle, ATV, UTV, etc.)
    const vehicleType = vehicleData.specs?.vehicle_type || vehicleData.vehicle_type;
    const bodyClass = vehicleData.specs?.body_class || vehicleData.body_class;
    
    if (!isNotPowersports(vehicleType, bodyClass)) {
      const rejectionMessage = getPowersportsRejectionMessage(vehicleType, bodyClass);
      console.log('🚫 Powersports vehicle detected and rejected:', {
        vehicleType,
        bodyClass,
        message: rejectionMessage
      });
      
      return new Response(JSON.stringify({
        error: rejectionMessage,
        vehicleType: vehicleType || null,
        bodyClass: bodyClass || null
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Detailed logging for troubleshooting
    console.log('Raw API result:', JSON.stringify(apiResult, null, 2));
    console.log('Vehicle data specs:', JSON.stringify(vehicleData.specs, null, 2));

    // Detect Electric Vehicles (EV) using granular checks and then combine
    // NOTE: Only BEVs (pure electric) should be treated as electric
    // PHEVs, mild hybrids, and regular hybrids have traditional engines and should show actual specs
    const electrificationLevel = (vehicleData.specs?.electrification_level?.toLowerCase?.() || '');
    const fuelTypePrimary = (vehicleData.specs?.fuel_type_primary?.toLowerCase?.() || '');

    // Identify hybrid types
    const isMildHybrid = electrificationLevel.includes('mild');
    const isRegularHybrid = electrificationLevel === 'hev' || (electrificationLevel.includes('hybrid') && !electrificationLevel.includes('plug-in') && !electrificationLevel.includes('bev'));
    const isPHEV = electrificationLevel.includes('phev') || electrificationLevel.includes('plug-in');

    // BEV detection (Battery Electric Vehicles only)
    const bevCheck = electrificationLevel.includes('bev');
    const fuelCheck = fuelTypePrimary === 'electric' || fuelTypePrimary === 'electricity';
    const cylinderCheck = vehicleData.specs?.engine_number_of_cylinders === null;
    const displacementCheck = vehicleData.specs?.displacement_l === null;
    const transmissionCheck = vehicleData.specs?.transmission_speeds === '1';

    console.log('EV detection breakdown:', {
      electrificationLevel,
      fuelTypePrimary,
      isMildHybrid,
      isRegularHybrid,
      isPHEV,
      bevCheck,
      fuelCheck,
      cylinderCheck,
      displacementCheck,
      transmissionCheck,
      fuel_type_primary: vehicleData.specs?.fuel_type_primary,
      electrification_level: vehicleData.specs?.electrification_level,
      engine_number_of_cylinders: vehicleData.specs?.engine_number_of_cylinders,
      displacement_l: vehicleData.specs?.displacement_l,
      transmission_speeds: vehicleData.specs?.transmission_speeds
    });

    // Only treat as pure electric if it's a BEV (Battery Electric Vehicle)
    // PHEVs have both engine + electric, so they should show actual engine/transmission
    const isElectric = !isMildHybrid && !isRegularHybrid && !isPHEV && (
      bevCheck ||
      (fuelCheck && cylinderCheck && displacementCheck) || // Electric fuel + no engine = BEV
      (cylinderCheck && displacementCheck && transmissionCheck) // No engine + 1-speed = BEV
    );

    // Fetch all available trims for this model if we have make_model_id
    const allTrims = vehicleData.trims || [];
    
    if (allTrims.length > 0 && allTrims[0].make_model_id && vehicleData.year) {
      const makeModelId = allTrims[0].make_model_id;
      console.log(`Attempting to fetch all trims for make_model_id: ${makeModelId}, year: ${vehicleData.year}`);
      
      const comprehensiveTrims = await fetchAllTrimsForModel(makeModelId, Number(vehicleData.year));
      
      if (comprehensiveTrims.length > 0) {
        console.log(`Successfully replaced ${allTrims.length} VIN-specific trims with ${comprehensiveTrims.length} comprehensive trims`);
        vehicleData.trims = comprehensiveTrims;
      } else {
        console.log('Failed to fetch comprehensive trims, falling back to VIN-specific trims');
      }
    } else {
      console.log('Skipping comprehensive trim fetch - insufficient data:', {
        hasTrims: allTrims.length > 0,
        hasMakeModelId: allTrims.length > 0 && !!allTrims[0]?.make_model_id,
        hasYear: !!vehicleData.year
      });
    }

    // Apply brand-specific handling (Tesla, BMW, Porsche, Mercedes-Benz)
    applyBrandSpecificHandling(vehicleData);

    // Process trims: deduplicate, create fallbacks, validate quality
    let processedTrims = processTrims(vehicleData);
    
    // Handle manufacturer-specific trim additions (AMG, GT3 RS)
    processedTrims = handleAMGTrims(vehicleData, processedTrims);
    processedTrims = handlePorscheGT3RS(vehicleData, processedTrims);

    // Trim quality validation already handled by trimProcessor module

    const bestTrim = findBestTrimMatch(
      processedTrims,
      vehicleData.year,
      {
        make: vehicleData.make,
        displacement_l: vehicleData.specs?.displacement_l,
        engine_number_of_cylinders: vehicleData.specs?.engine_number_of_cylinders,
        body_class: vehicleData.specs?.body_class,
        doors: vehicleData.specs?.doors,
      },
    );

    // Format base engine info
    const baseEngineInfo = {
      displacement: vehicleData.specs?.displacement_l || "3.5",
      cylinders: vehicleData.specs?.engine_number_of_cylinders || "6",
      turbo: vehicleData.specs?.turbo || false
    };

    const availableTrims = processedTrims.map((trim, index) => {
      const engineDesc = isElectric
        ? 'Electric Motor'
        : (
          trim.description?.match(/\(([^)]+)\)/i)?.[1]?.match(/([\d.]+L\s+\d+cyl(?:\s+Turbo)?)/i)?.[1] ||
          `${baseEngineInfo.displacement}L ${baseEngineInfo.cylinders}cyl${baseEngineInfo.turbo ? ' Turbo' : ''}`
        );

      let transmission: string;
      if (isElectric) {
        transmission = 'Single-Speed';
      } else if (vehicleData.specs?.transmission_speeds && vehicleData.specs?.transmission_style) {
        // Both speeds and style available from specs
        transmission = `${vehicleData.specs.transmission_speeds}-Speed ${vehicleData.specs.transmission_style}`;
      } else if (vehicleData.specs?.transmission_speeds) {
        // Only speeds available, no style
        transmission = `${vehicleData.specs.transmission_speeds}-Speed`;
      } else if (vehicleData.specs?.transmission_style) {
        // Only style available, no speeds
        transmission = vehicleData.specs.transmission_style;
      } else {
        // Try to extract from trim description (e.g., "8AM", "7A", "6M", "8-Speed Automatic", "CVT")
        // Match patterns: "8AM", "8A", "7M", "8-Speed Automatic", "CVT"
        const descMatch = trim.description?.match(/(\d+)(AM?|M)\b|(\d+)[-\s]?Speed\s+(Automatic|Manual|CVT)|(^|[^a-z])CVT($|[^a-z])/i);
        if (descMatch) {
          if (descMatch[0].toUpperCase().includes('CVT')) {
            transmission = 'CVT';
          } else if (descMatch[3]) {
            // Matched "8-Speed Automatic" format
            transmission = `${descMatch[3]}-Speed ${descMatch[4]}`;
          } else if (descMatch[1]) {
            // Matched "8AM", "8A", or "7M" format
            const speeds = descMatch[1];
            const code = descMatch[2].toUpperCase();
            let type = 'Automatic';
            if (code === 'M') type = 'Manual';
            else if (code === 'AM') type = 'Automated Manual';
            else if (code === 'A') type = 'Automatic';
            transmission = `${speeds}-Speed ${type}`;
          } else {
            transmission = '7-Speed Automatic';
          }
        } else {
          // Nothing available, use fallback
          transmission = '7-Speed Automatic';
        }
      }

      return {
        // Generate stable IDs using VIN prefix for uniqueness
        id: trim.id || `${vin}-trim-${index}`,
        name: trim.name,
        description: trim.description?.replace(/\.{3,}|\.+$/g, '').trim() || '',
        specs: {
          engine: engineDesc.trim(),
          transmission: transmission.trim(),
          drivetrain: vehicleData.specs?.drive_type || 'AWD',
        },
        year: trim.year,
        source: 'carapi' // Mark source for debugging
      };
    });

    // Include FULL specs object for frontend vehicle type detection
    const fullSpecs = {
      ...vehicleData.specs,
      // Ensure critical fields are present
      electrification_level: vehicleData.specs?.electrification_level || null,
      fuel_type_primary: vehicleData.specs?.fuel_type_primary || null,
      engine_number_of_cylinders: vehicleData.specs?.engine_number_of_cylinders ?? null,
      displacement_l: vehicleData.specs?.displacement_l ?? null,
      transmission_speeds: vehicleData.specs?.transmission_speeds || null,
      transmission_style: vehicleData.specs?.transmission_style || null,
      drive_type: vehicleData.specs?.drive_type || null,
      body_class: vehicleData.specs?.body_class || null,
      doors: vehicleData.specs?.doors || null,
      trim: vehicleData.specs?.trim || null,
      series: vehicleData.specs?.series || null,
      turbo: vehicleData.specs?.turbo || null,
    };


    // Extract body style from multiple possible field names
    const bodyStyle =
      vehicleData.specs?.body_class ||
      vehicleData.specs?.bodyStyle ||
      vehicleData.specs?.body_type ||
      vehicleData.specs?.bodyType ||
      vehicleData.specs?.style ||
      vehicleData?.body_class ||
      vehicleData?.bodyStyle ||
      availableTrims[0]?.specs?.bodyStyle ||
      null;
    
    // 🎯 PHASE 1: Use field priority resolution for trim
    const trimResolution = resolveTrimValue(vehicleData, bestTrim);
    console.log(`🎯 TRIM RESOLUTION RESULT:`, {
      value: trimResolution.value,
      source: trimResolution.source,
      confidence: trimResolution.confidence
    });

    const responseData = {
      year: vehicleData.year,
      make: vehicleData.make,
      model: resolveModelValue(vehicleData),
      trim: trimResolution.value,
      engineCylinders: availableTrims[0]?.specs?.engine || (isElectric ? 'Electric Motor' : `${baseEngineInfo.displacement}L ${baseEngineInfo.cylinders}cyl${baseEngineInfo.turbo ? ' Turbo' : ''}`),
      transmission: availableTrims[0]?.specs?.transmission || (isElectric ? 'Single-Speed' : "7-Speed Automatic"),
      drivetrain: availableTrims[0]?.specs?.drivetrain || "AWD",
      bodyStyle: bodyStyle || "",
      availableTrims: availableTrims,
      // ✅ CRITICAL: Include full specs object for frontend vehicle type detection
      specs: fullSpecs,
      // 🎯 PHASE 1: Add data quality metadata
      dataQuality: {
        trimSource: trimResolution.source,
        trimConfidence: trimResolution.confidence,
      }
    };

    console.log('Returning VIN decode response:', JSON.stringify(responseData, null, 2));

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`Unexpected error: ${error}`);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
