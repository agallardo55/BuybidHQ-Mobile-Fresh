
import { cleanTrimValue, findBestTrimMatch, cleanEngineDescription } from "./utils/trimUtils.ts";
import { fetchCarApiData, fetchAllTrimsForModel, fetchNHTSAData, fetchMakesFromCarAPI, fetchModelsFromCarAPI } from "./api/carApi.ts";
import { getValidJWTToken } from "./api/carApi.ts";
import { fetchData } from "./api/fetchData.ts";
import { CarApiResult } from "./types.ts";
import { corsHeaders } from "./config.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    console.log('🔍 EDGE FUNCTION: Request received - method:', req.method);
    console.log('🔍 EDGE FUNCTION: Request URL:', req.url);
    
    let body: { 
      vin?: string; 
      make_model_id?: number; 
      year?: number; 
      make?: string;
      model?: string;
      trim?: string;
      trim_lookup?: boolean; 
      make_lookup?: boolean;
      model_lookup?: boolean;
      specs_lookup?: boolean;
      make_model_id_lookup?: boolean;
    };
    
    try {
      body = await req.json();
      console.log('🔍 EDGE FUNCTION: Successfully parsed JSON body');
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
    // 🔍 Enhanced logging for debugging 400 errors
    console.log('🔍 EDGE FUNCTION: Checking make_model_id_lookup condition');
    console.log('🔍 EDGE FUNCTION: body =', JSON.stringify(body, null, 2));
    console.log('🔍 EDGE FUNCTION: make_model_id_lookup =', body.make_model_id_lookup, '(type:', typeof body.make_model_id_lookup, ')');
    console.log('🔍 EDGE FUNCTION: year =', body.year, '(type:', typeof body.year, ')');
    console.log('🔍 EDGE FUNCTION: make =', body.make, '(type:', typeof body.make, ')');
    console.log('🔍 EDGE FUNCTION: model =', body.model, '(type:', typeof body.model, ')');
    console.log('🔍 EDGE FUNCTION: Condition check:', {
      'make_model_id_lookup truthy': !!body.make_model_id_lookup,
      'year truthy': !!body.year,
      'make truthy': !!body.make,
      'model truthy': !!body.model,
      'all conditions met': !!(body.make_model_id_lookup && body.year && body.make && body.model)
    });
    
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
      console.log(`🔍 [${lookupId}] Request details:`, {
        year: body.year,
        make: body.make,
        model: body.model,
        yearType: typeof body.year,
        makeType: typeof body.make,
        modelType: typeof body.model,
        makeLength: body.make?.length,
        modelLength: body.model?.length,
        makeTrimmed: body.make?.trim(),
        modelTrimmed: body.model?.trim()
      });
      
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
        console.log(`🔍 [${lookupId}] Calling CarAPI with normalized make:`, carApiUrl);
        const modelsResponse = await fetchData<any>(carApiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
          }
        });

        console.log(`🔍 [${lookupId}] CarAPI response type:`, typeof modelsResponse);
        console.log(`🔍 [${lookupId}] CarAPI response is array:`, Array.isArray(modelsResponse));
        console.log(`🔍 [${lookupId}] CarAPI response keys:`, modelsResponse && typeof modelsResponse === 'object' ? Object.keys(modelsResponse) : 'N/A');

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

        console.log(`🔍 [${lookupId}] Available models from CarAPI (first 10):`, modelsArray.slice(0, 10).map((m: any) => ({
          name: m.name || m.model || m.ModelName,
          make_model_id: m.make_model_id,
          id: m.id
        })));
        console.log(`🔍 [${lookupId}] All available model names from CarAPI:`, modelsArray.map((m: any) => m.name || m.model || m.ModelName));
        console.log(`🔍 [${lookupId}] Searching for model:`, {
          original: body.model,
          normalized: normalizedModel,
          normalizedUppercase: normalizedModel.toUpperCase()
        });

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

    // Handle trim lookup request (for manual dropdown selection)
    if (body.trim_lookup && body.make_model_id && body.year) {
      console.log(`🔍 Edge Function: Received trim lookup request: make_model_id=${body.make_model_id}, year=${body.year}`);
      
      const allTrims = await fetchAllTrimsForModel(body.make_model_id, body.year);
      
      console.log(`🔍 Edge Function: fetchAllTrimsForModel returned:`, {
        count: allTrims?.length || 0,
        trims: allTrims?.map((t: any) => ({ 
          id: t.id, 
          name: t.name || t.trim_name, 
          description: t.description?.substring(0, 50) 
        }))
      });
      
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

        const specs = {
          engine: engine.trim() || '',
          transmission: transmission.trim() || '',
          drivetrain: drivetrain.trim() || ''
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

    // Detailed logging for troubleshooting
    console.log('=== RAW API RESULT ===');
    console.log(JSON.stringify(apiResult, null, 2));
    console.log('=== VEHICLE DATA SPECS ===');
    console.log(JSON.stringify(vehicleData.specs, null, 2));

    // Detect Electric Vehicles (EV) using granular checks and then combine
    const fuelCheck = (vehicleData.specs?.fuel_type_primary?.toLowerCase?.() || '').includes('electric');
    const bevCheck = (vehicleData.specs?.electrification_level?.toLowerCase?.() || '').includes('bev');
    const electricCheck = (vehicleData.specs?.electrification_level?.toLowerCase?.() || '').includes('electric');
    const cylinderCheck = vehicleData.specs?.engine_number_of_cylinders === null;
    const displacementCheck = vehicleData.specs?.displacement_l === null;
    const transmissionCheck = vehicleData.specs?.transmission_speeds === '1';

    console.log('=== EV DETECTION BREAKDOWN ===', {
      fuelCheck,
      bevCheck,
      electricCheck,
      cylinderCheck,
      displacementCheck,
      transmissionCheck,
      fuel_type_primary: vehicleData.specs?.fuel_type_primary,
      electrification_level: vehicleData.specs?.electrification_level,
      engine_number_of_cylinders: vehicleData.specs?.engine_number_of_cylinders,
      displacement_l: vehicleData.specs?.displacement_l,
      transmission_speeds: vehicleData.specs?.transmission_speeds
    });

    const isElectric = fuelCheck || bevCheck || electricCheck || cylinderCheck || displacementCheck || transmissionCheck;

    // Fetch all available trims for this model if we have make_model_id
    let allTrims = vehicleData.trims || [];
    
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

    // Special handling for Mercedes-Benz ML-Class
    if (vehicleData.make?.toUpperCase() === 'MERCEDES-BENZ' && vehicleData.model?.includes('ML')) {
      // Add default trim if none available
      if (!vehicleData.trims || vehicleData.trims.length === 0) {
        vehicleData.trims = [{
          name: 'ML350',
          description: 'ML350 4dr SUV AWD (3.5L 6cyl 7A)',
          year: Number(vehicleData.year)
        }];
      }

      // Set default transmission if missing
      if (!vehicleData.specs?.transmission_speeds || !vehicleData.specs?.transmission_style) {
        vehicleData.specs = {
          ...vehicleData.specs,
          transmission_speeds: '7',
          transmission_style: 'Automatic'
        };
      }

      // Set default drive type if missing
      if (!vehicleData.specs?.drive_type) {
        vehicleData.specs.drive_type = 'AWD';
      }
    }

    // First deduplicate trims
    const seenTrims = new Set();
    const uniqueTrims = vehicleData.trims?.filter(trim => {
      const key = `${trim.name}|${trim.description}`;
      if (seenTrims.has(key)) {
        return false;
      }
      seenTrims.add(key);
      return true;
    }) || [];

    // Universal fallback: If no trims available but we have trim data in specs, create fallback trim
    let finalTrims = [...uniqueTrims];
    if (finalTrims.length === 0 && vehicleData.specs?.trim) {
      console.log('No trims available, creating fallback from specs.trim:', vehicleData.specs.trim);
      
      // Create fallback trim from available specs
      const fallbackTrimName = vehicleData.specs.trim;
      const seriesInfo = vehicleData.specs.series ? ` ${vehicleData.specs.series}` : '';
      const engineInfo = vehicleData.specs.displacement_l && vehicleData.specs.engine_number_of_cylinders 
        ? `(${vehicleData.specs.displacement_l}L ${vehicleData.specs.engine_number_of_cylinders}cyl${vehicleData.specs.turbo ? ' Turbo' : ''})`
        : '';
      
      const fallbackDescription = `${fallbackTrimName}${seriesInfo} ${engineInfo}`.trim();
      
      finalTrims = [{
        name: fallbackTrimName,
        description: fallbackDescription,
        year: Number(vehicleData.year)
      }];
      
      console.log('Created fallback trim:', finalTrims[0]);
    }

    // Special handling for manufacturer-specific trims AFTER deduplication and fallback
    let processedTrims = [...finalTrims];
    
    // Mercedes-Benz AMG handling
    if (vehicleData.make?.toLowerCase() === 'mercedes-benz') {
      console.log('Checking Mercedes-Benz AMG specs:', {
        series: vehicleData.specs?.series,
        trim: vehicleData.specs?.trim,
        driveType: vehicleData.specs?.drive_type,
        availableTrims: processedTrims.map(t => t.name)
      });

      // Check if we have an AMG series designation
      const amgSeries = vehicleData.specs?.series;
      if (amgSeries && amgSeries.toLowerCase().includes('amg')) {
        console.log('Detected AMG series:', amgSeries);
        
        // Create AMG trim name from series
        let amgTrimName = amgSeries;
        
        // Add drivetrain suffix if available (4MATIC for AWD Mercedes)
        if (vehicleData.specs?.drive_type === 'AWD' || vehicleData.specs?.drive_type === '4WD') {
          amgTrimName += ' 4MATIC';
        }
        
        // Create engine description
        const isTurbo = vehicleData.specs?.turbo === true || vehicleData.specs?.turbo === 'Yes';
        const engineInfo = vehicleData.specs?.displacement_l && vehicleData.specs?.engine_number_of_cylinders 
          ? `(${vehicleData.specs.displacement_l}L ${vehicleData.specs.engine_number_of_cylinders}cyl${isTurbo ? ' Turbo' : ''})`
          : '';
        
        const amgDescription = `${amgTrimName} 4dr SUV ${engineInfo}`.trim();
        
        // Check if AMG trim already exists in processed trims
        const hasAMGTrim = processedTrims.some(trim => {
          const name = (trim.name || '').toLowerCase();
          return name.includes('amg') || name.includes(amgSeries.toLowerCase().replace('amg ', ''));
        });
        
        if (!hasAMGTrim) {
          console.log('Adding AMG trim to list:', amgTrimName);
          processedTrims = [
            {
              name: amgTrimName,
              description: amgDescription,
              year: Number(vehicleData.year)
            },
            ...processedTrims
          ];
        } else {
          console.log('AMG trim already exists in trims');
        }
      }
    }
    
    // Porsche handling
    if (vehicleData.make?.toLowerCase() === 'porsche') {
      // Log all relevant specs for GT3 RS detection
      console.log('Checking Porsche GT3 RS specs:', {
        displacement: vehicleData.specs?.displacement_l,
        cylinders: vehicleData.specs?.engine_number_of_cylinders,
        bodyClass: vehicleData.specs?.body_class,
        doors: vehicleData.specs?.doors,
        series: vehicleData.specs?.series,
        trim: vehicleData.specs?.trim
      });

      // More lenient GT3 RS detection
      const isGT3RS = (
        // Engine specs (4.0L, 6cyl)
        (vehicleData.specs?.displacement_l === "4" || vehicleData.specs?.displacement_l === "4.0") &&
        vehicleData.specs?.engine_number_of_cylinders === "6" &&
        // Body type checks (coupe/2-door)
        (vehicleData.specs?.body_class?.toLowerCase().includes('coupe') || 
         vehicleData.specs?.doors === "2") ||
        // Additional checks for series or trim indicators
        vehicleData.specs?.series?.toLowerCase().includes('gt3') ||
        vehicleData.specs?.trim?.toLowerCase().includes('gt3')
      );

      // Check if GT3 RS is already in the trims
      const hasGT3RS = processedTrims.some(trim => {
        const name = (trim.name || '').toLowerCase();
        const desc = (trim.description || '').toLowerCase();
        const isGT3RS = name.includes('gt3') && name.includes('rs') ||
                       desc.includes('gt3') && desc.includes('rs');
        if (isGT3RS) {
          console.log('Found existing GT3 RS trim:', trim);
        }
        return isGT3RS;
      });

      console.log('GT3 RS detection results:', { isGT3RS, hasGT3RS });
    }

    console.log('Final trims after processing:', processedTrims);

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

      const transmission = isElectric
        ? 'Single-Speed'
        : (
          vehicleData.specs?.transmission_speeds ? 
            `${vehicleData.specs.transmission_speeds}-Speed ${vehicleData.specs.transmission_style}` :
            vehicleData.specs?.transmission_style || '7-Speed Automatic'
        );

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

    console.log('🔍 ========== EDGE FUNCTION: FULL SPECS OBJECT ==========');
    console.log('🔍 Full specs being returned:', JSON.stringify(fullSpecs, null, 2));
    console.log('🔍 Electrification level:', fullSpecs.electrification_level);
    console.log('🔍 Fuel type primary:', fullSpecs.fuel_type_primary);
    console.log('🔍 Engine cylinders:', fullSpecs.engine_number_of_cylinders);
    console.log('🔍 Displacement:', fullSpecs.displacement_l);
    console.log('🔍 ======================================================');

    const responseData = {
      year: vehicleData.year,
      make: vehicleData.make,
      model: vehicleData.model,
      trim: bestTrim || (processedTrims[0]?.name || ''),
      engineCylinders: availableTrims[0]?.specs?.engine || (isElectric ? 'Electric Motor' : `${baseEngineInfo.displacement}L ${baseEngineInfo.cylinders}cyl${baseEngineInfo.turbo ? ' Turbo' : ''}`),
      transmission: availableTrims[0]?.specs?.transmission || (isElectric ? 'Single-Speed' : "7-Speed Automatic"),
      drivetrain: availableTrims[0]?.specs?.drivetrain || "AWD",
      availableTrims: availableTrims,
      // ✅ CRITICAL: Include full specs object for frontend vehicle type detection
      specs: fullSpecs,
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
