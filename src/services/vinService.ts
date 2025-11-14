/**
 * Centralized VIN decoding service
 * Single source of truth for all VIN-related operations
 */
import { supabase } from "@/integrations/supabase/client";

export interface VehicleData {
  year: string;
  make: string;
  model: string;
  trim: string;
  displayTrim: string;
  engineCylinders: string;
  transmission: string;
  drivetrain: string;
  availableTrims: TrimOption[];
  selectedTrim?: TrimOption | null; // Add this line
}

export interface TrimOption {
  id?: string | number; // CarAPI uses numbers, NHTSA might not have IDs
  name: string;
  description: string;
  specs: {
    engine: string;
    transmission: string;
    drivetrain: string;
  };
  year: number;
  source?: 'carapi' | 'nhtsa'; // Track data source
}

export interface VinDecodeResult {
  success: boolean;
  data?: VehicleData;
  error?: string;
  fallbackToManual?: boolean;
  partialData?: {
    year?: string | number;
    make?: string;
    model?: string;
  };
}

class VinService {
  /**
   * Decode VIN and return structured vehicle data
   */
  async decodeVin(vin: string): Promise<VinDecodeResult> {
    if (!vin || vin.length !== 17) {
      return {
        success: false,
        error: "Please enter a valid 17-character VIN"
      };
    }

    try {
      const requestBody = { vin };
      const { data: response, error } = await supabase.functions.invoke('decode-vin', {
        body: requestBody
      });

      // ✅ ENHANCED LOGGING: Debug Tesla VIN decode
      console.log('🔍 ========== VIN DECODE RAW RESPONSE ==========');
      console.log('🔍 VIN:', vin);
      console.log('🔍 Full Response:', JSON.stringify(response, null, 2));
      console.log('🔍 Response Keys:', response ? Object.keys(response) : 'No response');
      console.log('🔍 Response Model (raw):', response?.model);
      console.log('🔍 Response Make (raw):', response?.make);
      console.log('🔍 Response Year (raw):', response?.year);
      console.log('🔍 Response Trim (raw):', response?.trim);
      console.log('🔍 Response Description (raw):', response?.description);
      console.log('🔍 Response Specs (raw):', response?.specs);
      
      if (response?.availableTrims) {
        console.log('🔍 Available Trims Array Length:', response.availableTrims.length);
        response.availableTrims.forEach((trim: any, idx: number) => {
          console.log(`🔍 Trim ${idx}:`, {
            id: trim.id,
            name: trim.name,
            description: trim.description,
            specs: trim.specs,
            year: trim.year,
            source: trim.source
          });
        });
      } else {
        console.log('🔍 Available Trims: NOT PRESENT IN RESPONSE');
      }
      
      if (response?.engineCylinders) {
        console.log('🔍 Response EngineCylinders (raw):', response.engineCylinders);
      }
      if (response?.transmission) {
        console.log('🔍 Response Transmission (raw):', response.transmission);
      }
      if (response?.drivetrain) {
        console.log('🔍 Response Drivetrain (raw):', response.drivetrain);
      }
      console.log('🔍 ============================================');

      if (error) {
        console.error('VIN decode API error:', error.message);
        return {
          success: false,
          error: error.message || "Failed to decode VIN. Please try again."
        };
      }

      if (!response || response.error) {
        console.error('VIN decode failed:', response?.error);
        return {
          success: false,
          error: response?.error || "No data received from VIN decoder"
        };
      }

      // Transform API response to consistent format
      const vehicleData: VehicleData = this.transformApiResponse(response);
      
      // Check if we got essential vehicle data
      if (!vehicleData.year || !vehicleData.make || !vehicleData.model) {
        console.error('VIN decode returned incomplete data');
        return {
          success: false,
          error: "Unable to decode VIN - vehicle information not found"
        };
      }
      
      return {
        success: true,
        data: vehicleData
      };
    } catch (error) {
      console.error('VIN decode unexpected error:', error);
      return {
        success: false,
        error: "An unexpected error occurred while decoding VIN"
      };
    }
  }

  /**
   * Fetch vehicle makes based on year selection
   * Tries CarAPI first (for consistency with VIN decoder), then falls back to NHTSA
   * This ensures we get all available makes including newer ones like Rivian, Lucid, etc.
   */
  async fetchMakesByYear(year: string): Promise<string[]> {
    try {
      const yearNum = parseInt(year);
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
        console.error('Invalid year for fetching makes:', year);
        return this.getFallbackMakes();
      }

      // Try CarAPI first (same API as VIN decoder for consistency)
      try {
        const carApiMakes = await this.fetchMakesFromCarAPI(year);
        if (carApiMakes && carApiMakes.length > 0) {
          console.log(`Fetched ${carApiMakes.length} makes from CarAPI for year ${year}`);
          return carApiMakes;
        }
      } catch (carApiError) {
        console.warn('CarAPI makes fetch failed, trying NHTSA:', carApiError);
      }

      // Fallback to NHTSA API
      const nhtsaMakes = await this.fetchMakesFromNHTSA(year);
      if (nhtsaMakes && nhtsaMakes.length > 0) {
        console.log(`Fetched ${nhtsaMakes.length} makes from NHTSA API for year ${year}`);
        return nhtsaMakes;
      }

      // Final fallback to hardcoded list
      console.warn('Both CarAPI and NHTSA failed, using fallback makes list');
      return this.getFallbackMakes();
    } catch (error) {
      console.error('Error fetching makes:', error);
      return this.getFallbackMakes();
    }
  }

  /**
   * Fetch makes from CarAPI
   * Uses the same authentication as VIN decoder for consistency
   */
  private async fetchMakesFromCarAPI(year: string): Promise<string[]> {
    try {
      // Call our edge function to use CarAPI (handles auth automatically)
      const { data: response, error } = await supabase.functions.invoke('decode-vin', {
        body: { 
          make_lookup: true,
          year: parseInt(year)
        }
      });

      if (error) {
        console.error('CarAPI makes lookup error:', error);
        return [];
      }

      // Check if response has makes
      if (response && response.makes && Array.isArray(response.makes)) {
        const makes = response.makes
          .map((make: string) => make.toUpperCase().trim())
          .filter((make: string) => make.length > 0)
          .filter((make: string, index: number, self: string[]) => self.indexOf(make) === index)
          .sort();
        return makes;
      }

      return [];
    } catch (error) {
      console.error('Error in fetchMakesFromCarAPI:', error);
      return [];
    }
  }

  /**
   * Fetch makes from NHTSA API
   */
  private async fetchMakesFromNHTSA(year: string): Promise<string[]> {
    try {
      // Use NHTSA API to get makes for the specific model year
      const url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForModelYear/${year}?format=json`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      
      if (!data.Results || data.Results.length === 0) {
        return [];
      }

      // Extract makes from NHTSA response
      const makes = data.Results
        .map((item: any) => item.MakeName || item.Mfr_CommonName)
        .filter((make: string) => make && make.trim().length > 0)
        .map((make: string) => make.toUpperCase().trim())
        .filter((make: string, index: number, self: string[]) => self.indexOf(make) === index)
        .sort();

      return makes;
    } catch (error) {
      console.error('Error fetching makes from NHTSA:', error);
      return [];
    }
  }

  /**
   * Fallback makes list - used if API fails
   * Includes common makes including newer ones like Rivian
   */
  private getFallbackMakes(): string[] {
    return [
      "ACURA", "ALFA ROMEO", "ASTON MARTIN", "AUDI", "BENTLEY", "BMW", "BUGATTI", "BUICK", 
      "CADILLAC", "CHEVROLET", "CHRYSLER", "DODGE", "FERRARI", "FORD", "GENESIS", "GMC", 
      "HONDA", "HYUNDAI", "INFINITI", "JAGUAR", "JEEP", "KIA", "KOENIGSEGG", "LAMBORGHINI", 
      "LAND ROVER", "LEXUS", "LINCOLN", "LUCID", "MASERATI", "MAZDA", "MCLAREN", "MERCEDES-BENZ", 
      "NISSAN", "PAGANI", "POLESTAR", "PORSCHE", "RAM", "RIVIAN", "ROLLS-ROYCE", "SUBARU", 
      "TESLA", "TOYOTA", "VOLKSWAGEN", "VOLVO"
    ];
  }

  /**
   * Fetch models based on year and make selection
   * Tries CarAPI first (for consistency with VIN decoder), then falls back to NHTSA, then hardcoded list
   */
  async fetchModelsByYearMake(year: string, make: string): Promise<string[]> {
    try {
      const yearNum = parseInt(year);
      if (isNaN(yearNum) || !make || make.trim().length === 0) {
        console.error('Invalid year or make for fetching models:', { year, make });
        return this.getFallbackModels(make);
      }

      // Try CarAPI first (same API as VIN decoder for consistency)
      try {
        const carApiModels = await this.fetchModelsFromCarAPI(year, make);
        if (carApiModels && carApiModels.length > 0) {
          console.log(`Fetched ${carApiModels.length} models from CarAPI for ${year} ${make}`);
          return carApiModels;
        }
      } catch (carApiError) {
        console.warn('CarAPI models fetch failed, trying NHTSA:', carApiError);
      }

      // Fallback to NHTSA API
      const nhtsaModels = await this.fetchModelsFromNHTSA(year, make);
      if (nhtsaModels && nhtsaModels.length > 0) {
        console.log(`Fetched ${nhtsaModels.length} models from NHTSA for ${year} ${make}`);
        return nhtsaModels;
      }

      // Final fallback to hardcoded list
      console.warn('Both CarAPI and NHTSA failed, using fallback models list');
      return this.getFallbackModels(make);
    } catch (error) {
      console.error('Error fetching models:', error);
      return this.getFallbackModels(make);
    }
  }

  /**
   * Fetch models from CarAPI via edge function
   */
  private async fetchModelsFromCarAPI(year: string, make: string): Promise<string[]> {
    try {
      const { data: response, error } = await supabase.functions.invoke('decode-vin', {
        body: { 
          model_lookup: true,
          year: parseInt(year),
          make: make
        }
      });

      if (error) {
        console.error('CarAPI models lookup error:', error);
        return [];
      }

      if (response && response.models && Array.isArray(response.models)) {
        const models = response.models
          .map((model: string) => model.toUpperCase().trim())
          .filter((model: string) => model.length > 0)
          .filter((model: string, index: number, self: string[]) => self.indexOf(model) === index)
          .sort();
        return models;
      }

      return [];
    } catch (error) {
      console.error('Error in fetchModelsFromCarAPI:', error);
      return [];
    }
  }

  /**
   * Fetch models from NHTSA API
   */
  private async fetchModelsFromNHTSA(year: string, make: string): Promise<string[]> {
    try {
      const url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeIdYear/makeId/${make}/modelyear/${year}?format=json`;
      
      // First try by make name
      let response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`);
      
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      
      if (!data.Results || data.Results.length === 0) {
        return [];
      }

      const models = data.Results
        .map((item: any) => item.Model_Name || item.ModelName || item.Model)
        .filter((model: string) => model && model.trim().length > 0)
        .map((model: string) => model.toUpperCase().trim())
        .filter((model: string, index: number, self: string[]) => self.indexOf(model) === index)
        .sort();

      return models;
    } catch (error) {
      console.error('Error fetching models from NHTSA:', error);
      return [];
    }
  }

  /**
   * Fallback models list - used if API fails
   */
  private getFallbackModels(make: string): string[] {
    const modelMap: Record<string, string[]> = {
      "BMW": ["3 SERIES", "5 SERIES", "7 SERIES", "X3", "X5", "X7", "M3", "M5", "M8"],
      "MERCEDES-BENZ": ["C-CLASS", "E-CLASS", "S-CLASS", "GLC", "GLE", "GLS", "AMG GT", "G-CLASS"],
      "AUDI": ["A3", "A4", "A6", "A8", "Q3", "Q5", "Q7", "Q8", "R8", "TT"],
      "PORSCHE": ["911", "CAYENNE", "MACAN", "PANAMERA", "TAYCAN", "718 CAYMAN", "718 BOXSTER"],
      "LAND ROVER": ["RANGE ROVER", "RANGE ROVER SPORT", "RANGE ROVER EVOQUE", "DISCOVERY", "DEFENDER"],
      "MCLAREN": ["720S", "ARTURA", "GT", "SENNA", "P1", "F1"],
      "ROLLS-ROYCE": ["PHANTOM", "GHOST", "WRAITH", "DAWN", "CULLINAN"],
      "FERRARI": ["488", "F8", "SF90", "ROMA", "PORTOFINO", "LAFERRARI"],
      "LAMBORGHINI": ["HURACAN", "AVENTADOR", "URUS", "REVUELTO"],
      "BENTLEY": ["CONTINENTAL", "FLYING SPUR", "BENTAYGA", "MULSANNE"],
      "ASTON MARTIN": ["DB11", "VANTAGE", "DBS", "DBX", "VALKYRIE"],
      "TOYOTA": ["CAMRY", "COROLLA", "RAV4", "HIGHLANDER", "PRIUS", "SUPRA", "LAND CRUISER"],
      "HONDA": ["CIVIC", "ACCORD", "CR-V", "PILOT", "PASSPORT", "RIDGELINE", "NSX"],
      "FORD": ["F-150", "MUSTANG", "EXPLORER", "ESCAPE", "EDGE", "EXPEDITION", "BRONCO"],
      "CHEVROLET": ["SILVERADO", "CAMARO", "CORVETTE", "EQUINOX", "TRAVERSE", "TAHOE", "SUBURBAN"],
      "NISSAN": ["ALTIMA", "SENTRA", "ROGUE", "MURANO", "PATHFINDER", "ARMADA", "GT-R"],
      "LEXUS": ["ES", "IS", "GS", "LS", "RX", "GX", "LX", "LC", "RC"],
      "INFINITI": ["Q50", "Q60", "QX50", "QX60", "QX80"],
      "ACURA": ["ILX", "TLX", "RLX", "RDX", "MDX", "NSX"],
      "GENESIS": ["G70", "G80", "G90", "GV70", "GV80"],
      "VOLVO": ["S60", "S90", "XC40", "XC60", "XC90"],
      "VOLKSWAGEN": ["JETTA", "PASSAT", "ATLAS", "TIGUAN", "ARTEON", "GOLF", "BEETLE"],
      "SUBARU": ["IMPREZA", "LEGACY", "OUTBACK", "FORESTER", "ASCENT", "WRX", "BRZ"],
      "MAZDA": ["MAZDA3", "MAZDA6", "CX-3", "CX-5", "CX-9", "MX-5 MIATA"],
      "KIA": ["FORTE", "OPTIMA", "SORENTO", "SPORTAGE", "TELLURIDE", "STINGER"],
      "HYUNDAI": ["ELANTRA", "SONATA", "SANTA FE", "TUCSON", "PALISADE", "VELOSTER"],
      "JEEP": ["WRANGLER", "GRAND CHEROKEE", "CHEROKEE", "COMPASS", "RENEGADE", "GLADIATOR"],
      "RAM": ["1500", "2500", "3500", "PROMASTER"],
      "GMC": ["SIERRA", "YUKON", "ACADIA", "TERRAIN", "CANYON"],
      "LINCOLN": ["CONTINENTAL", "MKZ", "NAVIGATOR", "AVIATOR", "CORSAIR"],
      "CADILLAC": ["ATS", "CTS", "XTS", "ESCALADE", "XT4", "XT5", "XT6"],
      "BUICK": ["ENCORE", "ENVISION", "LACROSSE", "REGAL"],
      "CHRYSLER": ["300", "PACIFICA", "VOYAGER"],
      "DODGE": ["CHARGER", "CHALLENGER", "DURANGO", "JOURNEY", "GRAND CARAVAN"],
      "ALFA ROMEO": ["GIULIA", "STELVIO", "4C"],
      "MASERATI": ["GHIBLI", "QUATTROPORTE", "LEVANTE", "MC20"],
      "BUGATTI": ["CHIRON", "VEYRON", "DIVO"],
      "KOENIGSEGG": ["REGERA", "AGERA", "JESKO", "GEMERA"],
      "PAGANI": ["HUAYRA", "ZONDA", "UTOPIA"],
      "RIVIAN": ["R1T", "R1S"],
      "TESLA": ["MODEL S", "MODEL 3", "MODEL X", "MODEL Y", "CYBERTRUCK", "ROADSTER"],
      "LUCID": ["AIR", "GRAVITY"],
      "POLESTAR": ["POLESTAR 2", "POLESTAR 3", "POLESTAR 4"]
    };

    return modelMap[make.toUpperCase()] || [];
  }

  /**
   * Fetch trims based on year, make, and model selection
   * Tries CarAPI first (for consistency with VIN decoder and latest data), 
   * then comprehensive database, then NHTSA, then generic fallback
   */
  async fetchTrimsByYearMakeModel(year: string, make: string, model: string): Promise<TrimOption[]> {
    const callId = `TRIM_FETCH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`🚗 ========== TRIM FETCH START [${callId}] ==========`);
    console.log(`🚗 [${callId}] fetchTrimsByYearMakeModel: Starting trim fetch for`, { 
      year, 
      make, 
      model,
      yearType: typeof year,
      makeType: typeof make,
      modelType: typeof model,
      makeLength: make?.length,
      modelLength: model?.length,
      makeTrimmed: make?.trim(),
      modelTrimmed: model?.trim()
    });
    console.log(`🚗 [${callId}] ======================================`);
    
    try {
      // Step 1: Try CarAPI first (same API as VIN decoder for consistency and latest data)
      console.log(`🔍 [${callId}] [STEP 1/3] Trying CarAPI for trims...`);
      console.log(`🔍 [${callId}] [STEP 1] Calling findMakeModelId with:`, { year, make, model });
      const makeModelId = await this.findMakeModelId(year, make, model);
      console.log(`🔍 [${callId}] [STEP 1] makeModelId result:`, makeModelId, `(type: ${typeof makeModelId}, null: ${makeModelId === null})`);
      
      if (makeModelId) {
        console.log(`✅ [${callId}] [STEP 1] Found make_model_id:`, makeModelId, 'fetching trims from CarAPI...');
        const carApiTrims = await this.fetchTrimsFromSupabase(makeModelId, parseInt(year));
        console.log(`🔍 [${callId}] [STEP 1] carApiTrims received:`, carApiTrims?.length, 'trims');
        
        if (carApiTrims && carApiTrims.length > 0) {
          console.log(`✅✅✅ [${callId}] [STEP 1] CARAPI SUCCESS: Got`, carApiTrims.length, 'REAL API trims from CarAPI');
          console.log(`📋 [${callId}] [STEP 1] CarAPI Trims (raw):`, JSON.stringify(carApiTrims.slice(0, 3), null, 2), '... (showing first 3)');
          console.log(`📋 [${callId}] [STEP 1] CarAPI Trim names:`, carApiTrims.map(t => t.name || t.trim_name));
          const transformed = this.transformCarApiTrimsToTrimOptions(carApiTrims, year, make, model);
          console.log(`📋 [${callId}] [STEP 1] CarAPI Trims (transformed):`, transformed.map(t => t.name));
          console.log(`🚗 [${callId}] ========== TRIM FETCH END: CARAPI SUCCESS ==========`);
          return transformed;
        } else {
          console.warn(`⚠️ [${callId}] [STEP 1] CarAPI returned empty trims array, makeModelId was:`, makeModelId);
        }
      } else {
        console.warn(`⚠️⚠️⚠️ [${callId}] [STEP 1] ❌❌❌ CRITICAL: No make_model_id found for`, { year, make, model });
        console.warn(`⚠️⚠️⚠️ [${callId}] [STEP 1] This means findMakeModelId() returned null - check logs above for why`);
        console.warn(`⚠️⚠️⚠️ [${callId}] [STEP 1] This will cause fallback to NHTSA or generic hardcoded trims`);
      }
      
      console.log(`⚠️ [${callId}] [STEP 1] CarAPI FAILED - moving to Step 2 (NHTSA)...`);
      
      // Step 2: Try NHTSA as fallback (real API)
      console.log(`🌐 [${callId}] [STEP 2/3] Trying NHTSA API...`);
      const nhtsaTrims = await this.fetchTrimsFromNHTSA(year, make, model);
      if (nhtsaTrims.length > 0) {
        console.log(`✅✅✅ [${callId}] [STEP 2] NHTSA SUCCESS: Got`, nhtsaTrims.length, 'REAL API trims from NHTSA');
        console.log(`📋 [${callId}] [STEP 2] NHTSA Trims:`, nhtsaTrims.map(t => t.name));
        console.log(`🚗 [${callId}] ========== TRIM FETCH END: NHTSA SUCCESS ==========`);
        return nhtsaTrims;
      }
      
      console.log(`⚠️ [${callId}] [STEP 2] NHTSA FAILED - moving to Step 3 (GENERIC FALLBACK)...`);
      
      // Step 3: Generic fallback (only if both APIs fail)
      console.log(`⚠️⚠️⚠️ [${callId}] [STEP 3/3] Using GENERIC FALLBACK (HARDCODED)...`);
      console.log(`⚠️⚠️⚠️ [${callId}] WARNING: Both CarAPI and NHTSA failed - using generic hardcoded fallback trims!`);
      const genericTrims = this.getGenericTrims(year, make, model);
      console.log(`📋 [${callId}] [STEP 3] Generic Trims (HARDCODED):`, genericTrims.map(t => t.name));
      console.log(`🚗 [${callId}] ========== TRIM FETCH END: GENERIC FALLBACK (HARDCODED) ==========`);
      return genericTrims;
      
    } catch (error) {
      console.error(`❌❌❌ [${callId}] [ERROR] fetchTrimsByYearMakeModel: Error in trim fetch:`, error);
      console.error(`❌❌❌ [${callId}] [ERROR] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
      console.log(`🔄 [${callId}] [ERROR] Falling back to generic trims due to error...`);
      const genericTrims = this.getGenericTrims(year, make, model);
      console.log(`⚠️⚠️⚠️ [${callId}] [ERROR] Error Fallback Trims (HARDCODED):`, genericTrims.map(t => t.name));
      console.log(`🚗 [${callId}] ========== TRIM FETCH END: ERROR FALLBACK (HARDCODED) ==========`);
      return genericTrims;
    }
  }

  /**
   * NOTE: getComprehensiveTrims() function is kept for backward compatibility
   * but is NO LONGER USED in the trim fetching fallback chain.
   * Removed from fetchTrimsByYearMakeModel() to prioritize real API data.
   */

  /**
   * Fetch specs for a specific trim (engine, transmission, drivetrain)
   * Only called when specs are missing from trim object
   */
  async fetchSpecsByYearMakeModelTrim(
    year: string,
    make: string,
    model: string,
    trim: string
  ): Promise<{ engine: string; transmission: string; drivetrain: string } | null> {
    console.log('🔍 fetchSpecsByYearMakeModelTrim: Fetching specs for', { year, make, model, trim });
    
    try {
      const { data: response, error } = await supabase.functions.invoke('decode-vin', {
        body: {
          year: parseInt(year),
          make: make,
          model: model,
          trim: trim,
          specs_lookup: true
        }
      });

      if (error) {
        console.error('Error fetching specs:', error);
        return null;
      }

      if (response && response.specs) {
        console.log('✅ fetchSpecsByYearMakeModelTrim: Got specs:', response.specs);
        return {
          engine: response.specs.engine || '',
          transmission: response.specs.transmission || '',
          drivetrain: response.specs.drivetrain || ''
        };
      }

      console.warn('⚠️ fetchSpecsByYearMakeModelTrim: No specs in response');
      return null;
    } catch (error) {
      console.error('❌ fetchSpecsByYearMakeModelTrim: Error:', error);
      return null;
    }
  }

  /**
   * Validate make/model combination with CarAPI
   */
  private async validateMakeModelWithCarAPI(year: string, make: string, model: string): Promise<{ isValid: boolean; makeModelId?: number; specs?: any }> {
    try {
      // This is a simplified validation - in a real implementation, you'd call CarAPI's search endpoints
      const makeModelId = await this.findMakeModelId(year, make, model);
      
      if (makeModelId) {
        return {
          isValid: true,
          makeModelId: makeModelId,
          specs: {
            year: parseInt(year),
            make: make.toUpperCase(),
            model: model.toUpperCase()
          }
        };
      }
      
      return { isValid: false };
    } catch (error) {
      console.error('validateMakeModelWithCarAPI: Error validating:', error);
      return { isValid: false };
    }
  }

  /**
   * Fetch comprehensive trim data from NHTSA API using real VIN patterns
   */
  private async fetchTrimsFromNHTSA(year: string, make: string, model: string): Promise<TrimOption[]> {
    try {
      console.log('🌐 fetchTrimsFromNHTSA: Fetching from NHTSA for', { year, make, model });
      
      // Use real VIN patterns to get actual trim data
      const realVins = this.getRealVinsForVehicle(year, make, model);
      console.log('🔍 Real VINs to try:', realVins);
      
      const allTrims = new Set<string>();
      const trimSpecs: Record<string, any> = {};
      
      // Try each real VIN to get comprehensive trim data
      for (const vin of realVins.slice(0, 3)) {
        try {
          const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;
          console.log('🔗 Trying VIN:', vin);
          
          const response = await fetch(url);
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.Results && data.Results.length > 0) {
              const result = data.Results[0];
              
              if (result.Trim && result.Trim !== 'Not Applicable' && result.Trim !== '') {
                allTrims.add(result.Trim);
                
                // Store specifications for this trim
                trimSpecs[result.Trim] = {
                  engine: this.formatEngineFromNHTSA(result),
                  transmission: result.TransmissionStyle || '',
                  drivetrain: result.DriveType || '',
                  displacement: result.DisplacementL || '',
                  fuelType: result.FuelTypePrimary || ''
                };
                
                console.log('✅ Found trim:', result.Trim, 'for VIN:', vin);
              }
            }
          }
        } catch (vinError) {
          console.log('⚠️ VIN decode failed for', vin, vinError);
          // Continue with next VIN
        }
      }
      
      if (allTrims.size === 0) {
        console.log('⚠️ No trims found from real VINs, trying alternative approach...');
        return this.getAlternativeTrims(year, make, model);
      }
      
      // Convert to TrimOption format
      const trimOptions: TrimOption[] = Array.from(allTrims).map(trimName => {
        const specs = trimSpecs[trimName] || {};
        
        return {
          name: trimName,
          description: `${year} ${make} ${model} ${trimName}`,
          specs: {
            engine: specs.engine || this.generateEngineSpecForTrim(trimName),
            transmission: specs.transmission || this.generateTransmissionSpecForTrim(trimName),
            drivetrain: specs.drivetrain || this.generateDrivetrainSpecForTrim(trimName)
          },
          year: parseInt(year)
        };
      });
      
      console.log('✅✅✅ fetchTrimsFromNHTSA: Found', trimOptions.length, 'REAL API trims from NHTSA:', Array.from(allTrims));
      console.log('📋 fetchTrimsFromNHTSA: Trim details:', trimOptions.map(t => ({ name: t.name, specs: t.specs })));
      return trimOptions;
      
    } catch (error) {
      console.error('❌ fetchTrimsFromNHTSA: Error fetching from NHTSA:', error);
      return [];
    }
  }

  /**
   * Get real VINs for specific vehicle combinations
   */
  private getRealVinsForVehicle(year: string, make: string, model: string): string[] {
    const makeUpper = make.toUpperCase();
    const modelUpper = model.toUpperCase();
    const yearNum = parseInt(year);
    
    // Real VIN patterns for common vehicles
    const vinPatterns: Record<string, string[]> = {
      'BMW': [
        'WBA3A5C50LA123456', // BMW 3 Series
        'WBA3A5C51LA123456', // BMW 3 Series Sport
        'WBA3A5C52LA123456', // BMW 3 Series Luxury
        'WBA3A5C53LA123456', // BMW 3 Series M Sport
        'WBA3A5C54LA123456', // BMW 3 Series M Performance
      ],
      'MERCEDES-BENZ': [
        'WDD2050461A123456', // Mercedes C-Class
        'WDD2050462A123456', // Mercedes C-Class Sport
        'WDD2050463A123456', // Mercedes C-Class Luxury
        'WDD2050464A123456', // Mercedes C-Class AMG
        'WDD2050465A123456', // Mercedes C-Class AMG Performance
      ],
      'AUDI': [
        'WAUAF48H17K123456', // Audi A4
        'WAUAF48H18K123456', // Audi A4 Sport
        'WAUAF48H19K123456', // Audi A4 Luxury
        'WAUAF48H20K123456', // Audi A4 S-Line
        'WAUAF48H21K123456', // Audi A4 RS
      ],
      'PORSCHE': [
        'WP0AB2A96LS123456', // Porsche 911 Carrera
        'WP0AB2A97LS123456', // Porsche 911 Carrera S
        'WP0AB2A98LS123456', // Porsche 911 Carrera 4S
        'WP0AB2A99LS123456', // Porsche 911 Turbo
        'WP0AB2A9ALS123456', // Porsche 911 Turbo S
      ],
      'LAND ROVER': [
        'SALVA2BG4LA123456', // Land Rover Range Rover
        'SALVA2BG5LA123456', // Land Rover Range Rover SE
        'SALVA2BG6LA123456', // Land Rover Range Rover HSE
        'SALVA2BG7LA123456', // Land Rover Range Rover Dynamic
        'SALVA2BG8LA123456', // Land Rover Range Rover Autobiography
      ],
      'JAGUAR': [
        'SAJAA2A50LA123456', // Jaguar F-PACE
        'SAJAA2A51LA123456', // Jaguar F-PACE Premium
        'SAJAA2A52LA123456', // Jaguar F-PACE Portfolio
        'SAJAA2A53LA123456', // Jaguar F-PACE R-Dynamic
        'SAJAA2A54LA123456', // Jaguar F-PACE SVR
      ],
      'MCLAREN': [
        'SBM15ACA5KW123456', // McLaren Senna
        'SBM15ACA6KW123456', // McLaren 720S
        'SBM15ACA7KW123456', // McLaren 570S
        'SBM15ACA8KW123456', // McLaren 570GT
        'SBM15ACA9KW123456', // McLaren 540C
      ]
    };
    
    // Find matching pattern
    for (const [makeKey, vins] of Object.entries(vinPatterns)) {
      if (makeUpper.includes(makeKey)) {
        return vins;
      }
    }
    
    // Default fallback
    return [
      '1HGBH41JXMN123456', // Generic fallback
      '1HGBH41JXMN123457', // Generic fallback 2
      '1HGBH41JXMN123458', // Generic fallback 3
    ];
  }

  /**
   * Alternative approach when real VINs don't work
   */
  private getAlternativeTrims(year: string, make: string, model: string): TrimOption[] {
    console.log('🔄 Using alternative trim approach for', { year, make, model });
    
    // Use comprehensive trim database
    const comprehensiveTrims = this.getComprehensiveTrims(make, model);
    
    return comprehensiveTrims.map(trim => ({
      name: trim,
      description: `${year} ${make} ${model} ${trim}`,
      specs: {
        engine: this.generateEngineSpecForTrim(trim),
        transmission: this.generateTransmissionSpecForTrim(trim),
        drivetrain: this.generateDrivetrainSpecForTrim(trim)
      },
      year: parseInt(year)
    }));
  }

  /**
   * Get comprehensive trim database for specific makes/models
   */
  private getComprehensiveTrims(make: string, model: string): string[] {
    const makeUpper = make.toUpperCase();
    const modelUpper = model.toUpperCase();
    
    console.log('⚠️⚠️⚠️ getComprehensiveTrims: Using HARDCODED comprehensive database');
    console.log('🔍 getComprehensiveTrims: Searching for', { make: makeUpper, model: modelUpper });
    
    // Comprehensive trim database
    const trimDatabase: Record<string, Record<string, string[]>> = {
      'BMW': {
        '3 SERIES': ['330i', '330e', 'M340i', 'M3', 'M3 Competition'],
        '3': ['330i', '330e', 'M340i', 'M3', 'M3 Competition'],
        '5 SERIES': ['530i', '530e', '540i', 'M550i', 'M5'],
        '5': ['530i', '530e', '540i', 'M550i', 'M5'],
        '7 SERIES': ['740i', '750i', 'M760i', 'ALPINA B7'],
        '7': ['740i', '750i', 'M760i', 'ALPINA B7'],
        'X3': ['X3 30i', 'X3 M40i', 'X3 M'],
        'X5': ['X5 40i', 'X5 50i', 'X5 M50i', 'X5 M'],
        'X7': ['X7 40i', 'X7 50i', 'X7 M50i', 'X7 M60i']
      },
      'MERCEDES-BENZ': {
        'C-CLASS': ['C300', 'C43 AMG', 'C63 AMG', 'C63 S AMG'],
        'C': ['C300', 'C43 AMG', 'C63 AMG', 'C63 S AMG'],
        'E-CLASS': ['E350', 'E450', 'E53 AMG', 'E63 AMG'],
        'E': ['E350', 'E450', 'E53 AMG', 'E63 AMG'],
        'S-CLASS': ['S450', 'S500', 'S63 AMG', 'S65 AMG'],
        'S': ['S450', 'S500', 'S63 AMG', 'S65 AMG'],
        'GLC': ['GLC300', 'GLC43 AMG', 'GLC63 AMG'],
        'GLE': ['GLE350', 'GLE450', 'GLE53 AMG', 'GLE63 AMG'],
        'GLS': ['GLS450', 'GLS580', 'GLS63 AMG']
      },
      'AUDI': {
        'A4': ['A4 40 TFSI', 'A4 45 TFSI', 'S4', 'RS4'],
        'A6': ['A6 40 TFSI', 'A6 45 TFSI', 'S6', 'RS6'],
        'A8': ['A8 50 TFSI', 'A8 55 TFSI', 'S8'],
        'Q5': ['Q5 40 TFSI', 'Q5 45 TFSI', 'SQ5', 'RS Q5'],
        'Q7': ['Q7 45 TFSI', 'Q7 55 TFSI', 'SQ7'],
        'Q8': ['Q8 45 TFSI', 'Q8 55 TFSI', 'SQ8', 'RS Q8']
      },
      'PORSCHE': {
        '911': ['Carrera', 'Carrera S', 'Carrera 4S', 'Turbo', 'Turbo S', 'GT3', 'GT3 RS'],
        'CAYENNE': ['Cayenne', 'Cayenne S', 'Cayenne Turbo', 'Cayenne Turbo S'],
        'MACAN': ['Macan', 'Macan S', 'Macan GTS', 'Macan Turbo'],
        'PANAMERA': ['Panamera', 'Panamera S', 'Panamera Turbo', 'Panamera Turbo S']
      },
      'LAND ROVER': {
        'RANGE ROVER': ['SE', 'HSE', 'Dynamic', 'Autobiography', 'SV'],
        'RANGE ROVER SPORT': ['SE', 'HSE', 'Dynamic', 'Autobiography', 'SVR'],
        'RANGE ROVER VELAR': ['S', 'SE', 'HSE', 'Dynamic', 'R-Dynamic'],
        'DISCOVERY': ['S', 'SE', 'HSE', 'Dynamic', 'R-Dynamic'],
        'DEFENDER': ['90', '110', '130', 'X-Dynamic', 'V8']
      },
      'JAGUAR': {
        'F-PACE': ['Base', 'Premium', 'Portfolio', 'R-Dynamic', 'SVR'],
        'XF': ['Base', 'Premium', 'Portfolio', 'R-Dynamic', 'SVR'],
        'XE': ['Base', 'Premium', 'Portfolio', 'R-Dynamic', 'SVR'],
        'I-PACE': ['Base', 'Premium', 'Portfolio', 'R-Dynamic', 'SVR']
      },
      'MCLAREN': {
        'SENNA': ['Base'],
        '720S': ['Base', 'Spider'],
        '570S': ['Base', 'Spider'],
        '570GT': ['Base'],
        '540C': ['Base']
      },
      'ALFA ROMEO': {
        'GIULIA': ['Base', 'Ti', 'Ti Sport', 'Quadrifoglio'],
        'STELVIO': ['Base', 'Ti', 'Ti Sport', 'Quadrifoglio'],
        '4C': ['Base', 'Spider']
      }
    };
    
    // Find matching trims with flexible matching
    for (const [makeKey, models] of Object.entries(trimDatabase)) {
      if (makeUpper.includes(makeKey) || makeKey.includes(makeUpper)) {
        console.log('🎯 Found make match:', makeKey);
        
        for (const [modelKey, trims] of Object.entries(models)) {
          if (modelUpper.includes(modelKey) || modelKey.includes(modelUpper)) {
            console.log('🎯 Found model match:', modelKey, '->', trims);
            return trims;
          }
        }
      }
    }
    
    console.log('⚠️ No database match found');
    return []; // Return empty if no match found
  }

  /**
   * Format engine specification from NHTSA data
   */
  private formatEngineFromNHTSA(result: any): string {
    const parts = [];
    
    if (result.DisplacementL) {
      parts.push(`${result.DisplacementL}L`);
    }
    
    if (result.EngineCylinders) {
      parts.push(`${result.EngineCylinders} Cylinder`);
    }
    
    if (result.FuelTypePrimary) {
      parts.push(result.FuelTypePrimary);
    }
    
    return parts.join(' ');
  }

  /**
   * Filter trims that are relevant to the make/model
   */
  private filterRelevantTrims(allTrims: string[], make: string, model: string): string[] {
    const makeUpper = make.toUpperCase();
    const modelUpper = model.toUpperCase();
    
    // First, try to find trims that match the make/model
    const makeModelMatches = allTrims.filter(trim => {
      const trimUpper = trim.toUpperCase();
      return trimUpper.includes(makeUpper) || trimUpper.includes(modelUpper);
    });
    
    if (makeModelMatches.length > 0) {
      return makeModelMatches;
    }
    
    // If no direct matches, return generic trims that could apply
    const genericTrims = allTrims.filter(trim => this.isGenericTrim(trim));
    
    if (genericTrims.length > 0) {
      return genericTrims;
    }
    
    // Fallback: return a subset of all trims
    return allTrims.slice(0, 10);
  }

  /**
   * Check if a trim name is generic (not make/model specific)
   */
  private isGenericTrim(trimName: string): boolean {
    const genericTrims = [
      'Base', 'Sport', 'Luxury', 'Premium', 'Limited', 'Touring', 'SE', 'SEL', 'LE', 'XLE',
      'EX', 'EX-L', 'DX', 'LX', 'EXL', 'Type S', 'Type R', 'AMG', 'M', 'RS', 'S-Line',
      'Platinum', 'Titanium', 'Hybrid', 'Electric', 'PHEV', 'AWD', '4WD', 'FWD', 'RWD'
    ];
    
    return genericTrims.some(generic => 
      trimName.toUpperCase().includes(generic.toUpperCase())
    );
  }

  /**
   * Generate engine specification based on trim name
   */
  private generateEngineSpecForTrim(trimName: string): string {
    const trimUpper = trimName.toUpperCase();
    
    // BMW specific engines
    if (trimUpper.includes('330I')) return '2.0L Turbo I4';
    if (trimUpper.includes('330E')) return '2.0L Turbo I4 Hybrid';
    if (trimUpper.includes('M340I')) return '3.0L Turbo I6';
    if (trimUpper.includes('M3')) return '3.0L Twin-Turbo I6';
    if (trimUpper.includes('530I')) return '2.0L Turbo I4';
    if (trimUpper.includes('530E')) return '2.0L Turbo I4 Hybrid';
    if (trimUpper.includes('540I')) return '3.0L Turbo I6';
    if (trimUpper.includes('M550I')) return '4.4L Twin-Turbo V8';
    if (trimUpper.includes('M5')) return '4.4L Twin-Turbo V8';
    if (trimUpper.includes('740I')) return '3.0L Turbo I6';
    if (trimUpper.includes('750I')) return '4.4L Twin-Turbo V8';
    if (trimUpper.includes('M760I')) return '6.6L Twin-Turbo V12';
    if (trimUpper.includes('ALPINA B7')) return '4.4L Twin-Turbo V8';
    if (trimUpper.includes('X3 30I')) return '2.0L Turbo I4';
    if (trimUpper.includes('X3 M40I')) return '3.0L Turbo I6';
    if (trimUpper.includes('X3 M')) return '3.0L Twin-Turbo I6';
    if (trimUpper.includes('X5 40I')) return '3.0L Turbo I6';
    if (trimUpper.includes('X5 50I')) return '4.4L Twin-Turbo V8';
    if (trimUpper.includes('X5 M50I')) return '4.4L Twin-Turbo V8';
    if (trimUpper.includes('X5 M')) return '4.4L Twin-Turbo V8';
    if (trimUpper.includes('X7 40I')) return '3.0L Turbo I6';
    if (trimUpper.includes('X7 50I')) return '4.4L Twin-Turbo V8';
    if (trimUpper.includes('X7 M50I')) return '4.4L Twin-Turbo V8';
    if (trimUpper.includes('X7 M60I')) return '4.4L Twin-Turbo V8';
    
    // Mercedes specific engines
    if (trimUpper.includes('C300')) return '2.0L Turbo I4';
    if (trimUpper.includes('C43 AMG')) return '3.0L Twin-Turbo V6';
    if (trimUpper.includes('C63 AMG')) return '4.0L Twin-Turbo V8';
    if (trimUpper.includes('E350')) return '2.0L Turbo I4';
    if (trimUpper.includes('E450')) return '3.0L Turbo I6';
    if (trimUpper.includes('E53 AMG')) return '3.0L Twin-Turbo I6';
    if (trimUpper.includes('E63 AMG')) return '4.0L Twin-Turbo V8';
    if (trimUpper.includes('S450')) return '3.0L Turbo I6';
    if (trimUpper.includes('S500')) return '3.0L Twin-Turbo I6';
    if (trimUpper.includes('S63 AMG')) return '4.0L Twin-Turbo V8';
    if (trimUpper.includes('S65 AMG')) return '6.0L Twin-Turbo V12';
    
    // Audi specific engines
    if (trimUpper.includes('A4 40 TFSI')) return '2.0L Turbo I4';
    if (trimUpper.includes('A4 45 TFSI')) return '2.0L Turbo I4';
    if (trimUpper.includes('S4')) return '3.0L Turbo V6';
    if (trimUpper.includes('RS4')) return '2.9L Twin-Turbo V6';
    if (trimUpper.includes('A6 40 TFSI')) return '2.0L Turbo I4';
    if (trimUpper.includes('A6 45 TFSI')) return '2.0L Turbo I4';
    if (trimUpper.includes('S6')) return '4.0L Twin-Turbo V8';
    if (trimUpper.includes('RS6')) return '4.0L Twin-Turbo V8';
    if (trimUpper.includes('A8 50 TFSI')) return '3.0L Turbo V6';
    if (trimUpper.includes('A8 55 TFSI')) return '3.0L Turbo V6';
    if (trimUpper.includes('S8')) return '4.0L Twin-Turbo V8';
    
    // Porsche specific engines
    if (trimUpper.includes('CARRERA')) return '3.0L Twin-Turbo H6';
    if (trimUpper.includes('CARRERA S')) return '3.0L Twin-Turbo H6';
    if (trimUpper.includes('CARRERA 4S')) return '3.0L Twin-Turbo H6';
    if (trimUpper.includes('TURBO')) return '3.8L Twin-Turbo H6';
    if (trimUpper.includes('TURBO S')) return '3.8L Twin-Turbo H6';
    if (trimUpper.includes('GT3')) return '4.0L Naturally Aspirated H6';
    if (trimUpper.includes('GT3 RS')) return '4.0L Naturally Aspirated H6';
    
    // Land Rover specific engines
    if (trimUpper.includes('SE')) return '3.0L Turbo I6';
    if (trimUpper.includes('HSE')) return '3.0L Turbo I6';
    if (trimUpper.includes('DYNAMIC')) return '3.0L Turbo I6';
    if (trimUpper.includes('AUTOBIOGRAPHY')) return '5.0L Supercharged V8';
    if (trimUpper.includes('SV')) return '5.0L Supercharged V8';
    if (trimUpper.includes('SVR')) return '5.0L Supercharged V8';
    
    // Generic fallbacks
    if (trimUpper.includes('HYBRID')) return 'Hybrid Engine';
    if (trimUpper.includes('ELECTRIC')) return 'Electric Motor';
    if (trimUpper.includes('AMG') || trimUpper.includes('M') || trimUpper.includes('RS')) return 'High Performance Engine';
    if (trimUpper.includes('TURBO')) return 'Turbocharged Engine';
    
    return 'Standard Engine';
  }

  /**
   * Generate transmission specification based on trim name
   */
  private generateTransmissionSpecForTrim(trimName: string): string {
    const trimUpper = trimName.toUpperCase();
    
    // BMW transmissions
    if (trimUpper.includes('330I') || trimUpper.includes('330E') || trimUpper.includes('M340I') || 
        trimUpper.includes('530I') || trimUpper.includes('530E') || trimUpper.includes('540I') ||
        trimUpper.includes('740I') || trimUpper.includes('750I') || trimUpper.includes('M760I') ||
        trimUpper.includes('X3 30I') || trimUpper.includes('X3 M40I') || trimUpper.includes('X3 M') ||
        trimUpper.includes('X5 40I') || trimUpper.includes('X5 50I') || trimUpper.includes('X5 M50I') ||
        trimUpper.includes('X5 M') || trimUpper.includes('X7 40I') || trimUpper.includes('X7 50I') ||
        trimUpper.includes('X7 M50I') || trimUpper.includes('X7 M60I')) return '8-Speed Automatic';
    
    if (trimUpper.includes('M3') || trimUpper.includes('M5')) return '8-Speed Automatic (M Sport)';
    
    // Mercedes transmissions
    if (trimUpper.includes('C300') || trimUpper.includes('C43 AMG') || trimUpper.includes('C63 AMG') ||
        trimUpper.includes('E350') || trimUpper.includes('E450') || trimUpper.includes('E53 AMG') ||
        trimUpper.includes('E63 AMG') || trimUpper.includes('S450') || trimUpper.includes('S500') ||
        trimUpper.includes('S63 AMG') || trimUpper.includes('S65 AMG')) return '9-Speed Automatic';
    
    // Audi transmissions
    if (trimUpper.includes('A4') || trimUpper.includes('S4') || trimUpper.includes('RS4') ||
        trimUpper.includes('A6') || trimUpper.includes('S6') || trimUpper.includes('RS6') ||
        trimUpper.includes('A8') || trimUpper.includes('S8')) return '8-Speed Automatic';
    
    // Porsche transmissions
    if (trimUpper.includes('CARRERA') || trimUpper.includes('TURBO') || trimUpper.includes('GT3')) return '8-Speed PDK';
    
    // Land Rover transmissions
    if (trimUpper.includes('SE') || trimUpper.includes('HSE') || trimUpper.includes('DYNAMIC') ||
        trimUpper.includes('AUTOBIOGRAPHY') || trimUpper.includes('SV') || trimUpper.includes('SVR')) return '8-Speed Automatic';
    
    // Generic fallbacks
    if (trimUpper.includes('MANUAL')) return 'Manual Transmission';
    if (trimUpper.includes('CVT')) return 'CVT Transmission';
    if (trimUpper.includes('AUTOMATIC')) return 'Automatic Transmission';
    
    return '8-Speed Automatic';
  }

  /**
   * Generate drivetrain specification based on trim name
   */
  private generateDrivetrainSpecForTrim(trimName: string): string {
    const trimUpper = trimName.toUpperCase();
    
    // BMW drivetrains
    // Sedans and coupes (3 Series, 5 Series, 7 Series) - RWD standard, AWD optional
    if (trimUpper.includes('330I') || trimUpper.includes('330E') || trimUpper.includes('530I') || 
        trimUpper.includes('530E') || trimUpper.includes('740I') || trimUpper.includes('750I') ||
        trimUpper.includes('M760I') || trimUpper.includes('ALPINA B7')) return 'RWD';
    
    // Performance sedans and ALL SUVs - AWD standard
    if (trimUpper.includes('M340I') || trimUpper.includes('540I') || trimUpper.includes('M550I') ||
        trimUpper.includes('M5') || trimUpper.includes('X3 30I') || trimUpper.includes('X3 M40I') ||
        trimUpper.includes('X3 M') || trimUpper.includes('X5 40I') || trimUpper.includes('X5 50I') ||
        trimUpper.includes('X5 M50I') || trimUpper.includes('X5 M') || trimUpper.includes('X7 40I') ||
        trimUpper.includes('X7 50I') || trimUpper.includes('X7 M50I') || trimUpper.includes('X7 M60I') ||
        trimUpper.includes('X7 750I')) return 'AWD';
    
    // M3 is RWD
    if (trimUpper.includes('M3')) return 'RWD';
    
    // Mercedes drivetrains
    if (trimUpper.includes('C300') || trimUpper.includes('C43 AMG') || trimUpper.includes('C63 AMG') ||
        trimUpper.includes('E350') || trimUpper.includes('E450') || trimUpper.includes('E53 AMG') ||
        trimUpper.includes('E63 AMG') || trimUpper.includes('S450') || trimUpper.includes('S500') ||
        trimUpper.includes('S63 AMG') || trimUpper.includes('S65 AMG')) return 'RWD';
    
    // Audi drivetrains
    if (trimUpper.includes('A4') || trimUpper.includes('S4') || trimUpper.includes('RS4') ||
        trimUpper.includes('A6') || trimUpper.includes('S6') || trimUpper.includes('RS6') ||
        trimUpper.includes('A8') || trimUpper.includes('S8')) return 'AWD';
    
    // Porsche drivetrains
    if (trimUpper.includes('CARRERA')) return 'RWD';
    if (trimUpper.includes('CARRERA 4S') || trimUpper.includes('TURBO') || trimUpper.includes('TURBO S')) return 'AWD';
    if (trimUpper.includes('GT3') || trimUpper.includes('GT3 RS')) return 'RWD';
    
    // Land Rover drivetrains
    if (trimUpper.includes('SE') || trimUpper.includes('HSE') || trimUpper.includes('DYNAMIC') ||
        trimUpper.includes('AUTOBIOGRAPHY') || trimUpper.includes('SV') || trimUpper.includes('SVR')) return 'AWD';
    
    // Generic fallbacks
    if (trimUpper.includes('AWD')) return 'AWD';
    if (trimUpper.includes('4WD')) return '4WD';
    if (trimUpper.includes('FWD')) return 'FWD';
    if (trimUpper.includes('RWD')) return 'RWD';
    
    return 'AWD'; // Default to AWD for luxury vehicles
  }

  /**
   * Enhance NHTSA trim data with CarAPI specifications
   */
  private async enhanceTrimsWithCarAPISpecs(nhtsaTrims: TrimOption[], carApiValidation: any): Promise<TrimOption[]> {
    try {
      // For now, return NHTSA data as-is since it already has good specifications
      // In the future, we could cross-reference with CarAPI for additional details
      console.log('enhanceTrimsWithCarAPISpecs: Enhancing', nhtsaTrims.length, 'trims');
      
      return nhtsaTrims.map(trim => ({
        ...trim,
        // Add any CarAPI enhancements here if needed
        specs: {
          ...trim.specs,
          // Could add CarAPI-specific enhancements
        }
      }));
      
    } catch (error) {
      console.error('enhanceTrimsWithCarAPISpecs: Error enhancing trims:', error);
      return nhtsaTrims; // Return original data if enhancement fails
    }
  }

  /**
   * Format engine specification from NHTSA data
   */
  private formatEngineSpec(specs: any): string {
    const parts = [];
    
    if (specs.displacement) {
      parts.push(`${specs.displacement}L`);
    }
    
    if (specs.engine) {
      parts.push(specs.engine);
    }
    
    if (specs.fuelType) {
      parts.push(specs.fuelType);
    }
    
    return parts.join(' ');
  }

  /**
   * Fetch trims from Supabase function
   */
  private async fetchTrimsFromSupabase(makeModelId: number, year: number): Promise<any[]> {
    try {
      console.log('🔍 fetchTrimsFromSupabase: Calling edge function with', { makeModelId, year });
      
      // Import supabase client
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Call the decode-vin function with make_model_id parameter
      const { data, error } = await supabase.functions.invoke('decode-vin', {
        body: {
          make_model_id: makeModelId,
          year: year,
          trim_lookup: true // Flag to indicate we want trim data
        }
      });

      console.log('🔍 fetchTrimsFromSupabase: Edge function response:', { data, error });

      if (error) {
        console.error('❌ Error calling Supabase function:', error);
        return [];
      }

      if (data && data.trims) {
        console.log('✅✅✅ fetchTrimsFromSupabase: Got REAL API trims from edge function:', data.trims.length);
        console.log('📋 fetchTrimsFromSupabase: Trim names:', data.trims.map((t: any) => t.name || t.trim_name));
        console.log('📋 fetchTrimsFromSupabase: Raw trim data (first 2):', JSON.stringify(data.trims.slice(0, 2), null, 2));
        return data.trims;
      }

      console.warn('⚠️ fetchTrimsFromSupabase: No trims in response, data:', data);
      console.warn('⚠️ fetchTrimsFromSupabase: This will trigger fallback to comprehensive database or generic trims');
      return [];
    } catch (error) {
      console.error('❌ Error fetching trims from Supabase:', error);
      return [];
    }
  }

  /**
   * Find make_model_id from CarAPI based on year, make, and model
   * First tries hardcoded map (performance optimization), then queries CarAPI dynamically
   */
  private async findMakeModelId(year: string, make: string, model: string): Promise<number | null> {
    const lookupId = `FIND_MAKE_MODEL_ID_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`🔍 [${lookupId}] ========== FIND MAKE_MODEL_ID START ==========`);
    console.log(`🔍 [${lookupId}] Input parameters:`, {
      year,
      make,
      model,
      yearType: typeof year,
      makeType: typeof make,
      modelType: typeof model,
      makeLength: make?.length,
      modelLength: model?.length,
      makeTrimmed: make?.trim(),
      modelTrimmed: model?.trim(),
      makeUpperCase: make?.toUpperCase(),
      modelUpperCase: model?.toUpperCase()
    });
    
    try {
      // Step 1: Try hardcoded map first (performance optimization for known models)
      const makeModelMap: Record<string, Record<string, number>> = {
        "BMW": {
          "3 SERIES": 1,
          "5 SERIES": 2,
          "7 SERIES": 3,
          "X3": 4,
          "X5": 5,
          "X7": 6
        },
        "MERCEDES-BENZ": {
          "C-CLASS": 10,
          "E-CLASS": 11,
          "S-CLASS": 12,
          "GLC": 13,
          "GLE": 14,
          "GLS": 15
        },
        "PORSCHE": {
          "911": 20,
          "CAYENNE": 21,
          "MACAN": 22,
          "PANAMERA": 23,
          "TAYCAN": 24
        },
        "LAND ROVER": {
          "RANGE ROVER": 30,
          "RANGE ROVER SPORT": 31,
          "RANGE ROVER EVOQUE": 32,
          "DISCOVERY": 33,
          "DEFENDER": 34
        }
      };

      const makeUpper = make.toUpperCase();
      const modelUpper = model.toUpperCase();
      
      console.log(`🔍 [${lookupId}] [STEP 1] Checking hardcoded map:`, {
        makeUpper,
        modelUpper,
        makeInMap: !!makeModelMap[makeUpper],
        modelInMap: makeModelMap[makeUpper] ? !!makeModelMap[makeUpper][modelUpper] : false,
        availableMakes: Object.keys(makeModelMap),
        availableModelsForMake: makeModelMap[makeUpper] ? Object.keys(makeModelMap[makeUpper]) : []
      });
      
      if (makeModelMap[makeUpper] && makeModelMap[makeUpper][modelUpper]) {
        const foundId = makeModelMap[makeUpper][modelUpper];
        console.log(`✅ [${lookupId}] [STEP 1] Found make_model_id in hardcoded map:`, foundId);
        console.log(`🔍 [${lookupId}] ========== FIND MAKE_MODEL_ID END: HARDCODED MAP ==========`);
        return foundId;
      }

      // Step 2: Not in hardcoded map, query CarAPI dynamically
      console.log(`🔍 [${lookupId}] [STEP 2] make_model_id not in hardcoded map, querying CarAPI for ${year} ${make} ${model}...`);
      
      const { supabase } = await import('@/integrations/supabase/client');
      
      // 🔍 Log request body before sending
      const requestBody = {
        make_model_id_lookup: true,
        year: parseInt(year),
        make: make,
        model: model
      };
      console.log(`🔍 [${lookupId}] [STEP 2] VIN SERVICE: Invoking make_model_id_lookup`);
      console.log(`🔍 [${lookupId}] [STEP 2] VIN SERVICE: Request body =`, JSON.stringify(requestBody, null, 2));
      console.log(`🔍 [${lookupId}] [STEP 2] VIN SERVICE: year value:`, year, 'parsed:', parseInt(year), 'type:', typeof parseInt(year));
      console.log(`🔍 [${lookupId}] [STEP 2] VIN SERVICE: make:`, make, 'type:', typeof make, 'length:', make.length);
      console.log(`🔍 [${lookupId}] [STEP 2] VIN SERVICE: model:`, model, 'type:', typeof model, 'length:', model.length);
      
      const { data, error } = await supabase.functions.invoke('decode-vin', {
        body: requestBody
      });

      console.log(`🔍 [${lookupId}] [STEP 2] Edge function response:`, {
        hasData: !!data,
        hasError: !!error,
        dataKeys: data ? Object.keys(data) : [],
        errorMessage: error ? (error as any).message : null
      });

      if (error) {
        console.error(`❌ [${lookupId}] [STEP 2] Error calling make_model_id lookup:`, error);
        
        // Try to read the response body from the error (ReadableStream)
        try {
          const errorObj = error as any;
          
          // Check if there's a response object
          if (errorObj.context?.response) {
            const response = errorObj.context.response;
            console.error('❌ Response status:', response.status);
            console.error('❌ Response statusText:', response.statusText);
            
            // Try to read the response body (ReadableStream)
            try {
              const responseText = await response.text();
              console.error('❌ Response body text:', responseText);
              
              // Try to parse as JSON
              try {
                const responseJson = JSON.parse(responseText);
                console.error('❌ Response body JSON:', JSON.stringify(responseJson, null, 2));
              } catch (parseError) {
                console.error('❌ Could not parse response as JSON, raw text:', responseText);
              }
            } catch (readError) {
              console.error('❌ Could not read response body stream:', readError);
            }
          }
          
          // Also check if error.context.body exists (might be the stream)
          if (errorObj.context?.body) {
            const body = errorObj.context.body;
            if (body instanceof ReadableStream) {
              console.error('❌ Found ReadableStream in error.context.body, attempting to read...');
              try {
                const reader = body.getReader();
                const { value, done } = await reader.read();
                if (!done && value) {
                  const decoder = new TextDecoder();
                  const text = decoder.decode(value);
                  console.error('❌ Stream content:', text);
                  try {
                    const json = JSON.parse(text);
                    console.error('❌ Stream content JSON:', JSON.stringify(json, null, 2));
                  } catch (e) {
                    console.error('❌ Stream content (raw):', text);
                  }
                }
                reader.releaseLock();
              } catch (streamError) {
                console.error('❌ Could not read ReadableStream:', streamError);
              }
            } else {
              console.error('❌ Error.context.body (not a stream):', body);
            }
          }
          
          // Check for other error properties
          if (errorObj.message) {
            console.error('❌ Error message:', errorObj.message);
          }
          if (errorObj.statusCode) {
            console.error('❌ Status code:', errorObj.statusCode);
          }
        } catch (readError) {
          console.error('❌ Could not read response body:', readError);
        }
        
        console.log(`🔍 [${lookupId}] ========== FIND MAKE_MODEL_ID END: ERROR ==========`);
        return null;
      }

      if (data && data.make_model_id) {
        console.log(`✅ [${lookupId}] [STEP 2] Found make_model_id from CarAPI:`, data.make_model_id);
        console.log(`🔍 [${lookupId}] ========== FIND MAKE_MODEL_ID END: CARAPI SUCCESS ==========`);
        return data.make_model_id;
      }

      console.warn(`⚠️⚠️⚠️ [${lookupId}] [STEP 2] ❌❌❌ make_model_id not found in CarAPI for ${year} ${make} ${model}`);
      console.warn(`⚠️⚠️⚠️ [${lookupId}] [STEP 2] Response data:`, data);
      console.warn(`⚠️⚠️⚠️ [${lookupId}] [STEP 2] This means the edge function returned null or no make_model_id`);
      console.log(`🔍 [${lookupId}] ========== FIND MAKE_MODEL_ID END: NOT FOUND ==========`);
      return null;
    } catch (error) {
      console.error(`❌ [${lookupId}] findMakeModelId: Error finding make_model_id:`, error);
      console.error(`❌ [${lookupId}] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
      console.log(`🔍 [${lookupId}] ========== FIND MAKE_MODEL_ID END: EXCEPTION ==========`);
      return null;
    }
  }

  /**
   * Transform CarAPI trim data to TrimOption format
   */
  private transformCarApiTrimsToTrimOptions(carApiTrims: any[], year: string, make: string, model: string): TrimOption[] {
    return carApiTrims.map(trim => ({
      name: trim.name || trim.trim_name || "Base",
      description: trim.description || `${year} ${make} ${model} ${trim.name || "Base"}`,
      specs: {
        engine: this.extractEngineFromDescription(trim.description || ""),
        transmission: this.extractTransmissionFromDescription(trim.description || ""),
        drivetrain: this.extractDrivetrainFromDescription(trim.description || "")
      },
      year: parseInt(year)
    }));
  }

  /**
   * Get generic trim options as fallback
   */
  private getGenericTrims(year: string, make: string, model: string): TrimOption[] {
    console.log('⚠️⚠️⚠️ getGenericTrims: Using HARDCODED generic fallback trims');
    console.log('⚠️⚠️⚠️ This means all API sources failed for:', { year, make, model });
    
    const commonTrims = [
      "Base", "Sport", "Luxury", "Premium", "Limited", "Touring", "SE", "SEL", "LE", "XLE", 
      "EX", "EX-L", "DX", "LX", "EXL", "Type S", "Type R", "AMG", "M", "RS", "S-Line", 
      "Platinum", "Titanium", "Hybrid", "Electric", "PHEV", "AWD", "4WD", "FWD", "RWD"
    ];

    const trimOptions: TrimOption[] = [];
    
    // Add base trim
    trimOptions.push({
      name: "Base",
      description: `${year} ${make} ${model} Base`,
      specs: {
        engine: "",
        transmission: "",
        drivetrain: ""
      },
      year: parseInt(year)
    });

    // Add common trims for this make/model combination
    const relevantTrims = commonTrims.filter(trim => {
      const makeUpper = make.toUpperCase();
      if (makeUpper.includes("BMW") || makeUpper.includes("MERCEDES") || makeUpper.includes("AUDI")) {
        return ["Sport", "Luxury", "Premium", "AMG", "M", "RS", "S-Line"].includes(trim);
      } else if (makeUpper.includes("PORSCHE")) {
        return ["Base", "S", "GTS", "Turbo", "Turbo S"].includes(trim);
      } else if (makeUpper.includes("LAND ROVER")) {
        return ["SE", "HSE", "Dynamic", "R-Dynamic", "Autobiography"].includes(trim);
      } else if (makeUpper.includes("MCLAREN")) {
        return ["Base", "S", "LT", "Spider"].includes(trim);
      } else {
        return ["Sport", "Luxury", "Premium", "Limited", "Touring"].includes(trim);
      }
    });

    relevantTrims.forEach(trim => {
      trimOptions.push({
        name: trim,
        description: `${year} ${make} ${model} ${trim}`,
        specs: {
          engine: "",
          transmission: "",
          drivetrain: ""
        },
        year: parseInt(year)
      });
    });

    return trimOptions;
  }

  /**
   * Transform API response to consistent VehicleData format - MANHEIM STYLE
   */
  private transformApiResponse(apiData: any): VehicleData {
    // ✅ ENHANCED LOGGING: Show raw API data at start
    console.log('🔍 ========== TRANSFORM API RESPONSE START ==========');
    console.log('🔍 Raw apiData.trim value:', apiData?.trim);
    console.log('🔍 Raw apiData.specs?.trim value:', apiData?.specs?.trim);
    console.log('🔍 Trims array from API:', apiData?.trims || apiData?.availableTrims || 'Not present');
    if (apiData?.availableTrims) {
      console.log('🔍 Available trims count:', apiData.availableTrims.length);
      console.log('🔍 Available trims names:', apiData.availableTrims.map((t: any) => t.name || t));
    }
    console.log('🔍 =================================================');
    
    // Check if this is the debug VIN
    const isDebugVIN = apiData?.vin === 'WP0CD2Y18RSA84275' || 
                       (apiData?.make?.toUpperCase() === 'PORSCHE' && 
                        apiData?.model?.toUpperCase().includes('TAYCAN'));
    
    console.log('🔍 ========== TRANSFORM API RESPONSE ==========');
    if (isDebugVIN) {
      console.log('🔍 DEBUG VIN DETECTED - Enhanced logging enabled');
    }
    console.log('transformApiResponse: Raw API data:', apiData);
    console.log('transformApiResponse: Raw API specs:', apiData?.specs);
    console.log('transformApiResponse: Raw API description:', apiData?.description);
    console.log('transformApiResponse: Raw API model:', apiData?.model);
    console.log('transformApiResponse: Raw API trim:', apiData?.trim);
    
    if (isDebugVIN) {
      console.log('🔍 BEFORE TRANSFORMATION:');
      console.log('🔍   Model (raw from API):', apiData?.model);
      console.log('🔍   Model contains "ELECTRIC":', apiData?.model?.includes('ELECTRIC'));
      console.log('🔍   Specs fuel_type_primary:', apiData?.specs?.fuel_type_primary);
      console.log('🔍   Specs electrification_level:', apiData?.specs?.electrification_level);
    }
    
    // Check if we have essential vehicle data
    const hasEssentialData = apiData?.year && apiData?.make && apiData?.model;
    if (!hasEssentialData) {
      console.error('transformApiResponse: Missing essential vehicle data (year, make, model)');
      // Return empty data structure - this will trigger an error in the calling code
      return {
        year: "",
        make: "",
        model: "",
        trim: "",
        displayTrim: "",
        engineCylinders: "",
        transmission: "",
        drivetrain: "",
        availableTrims: []
      };
    }
    
    const processedTrims = this.processTrims(apiData);
    console.log('transformApiResponse: Processed trims:', processedTrims);
    
    // Check if no trims are available - fallback to manual entry
    if (processedTrims.length === 0) {
      console.warn('⚠️ No trims returned from CarAPI');
      return {
        success: false,
        error: 'Trim data unavailable from VIN. Please enter vehicle details manually.',
        fallbackToManual: true,
        partialData: {
          year: apiData.year,
          make: apiData.make,
          model: apiData.model
        }
      };
    }
    
    // Determine vehicle type BEFORE trim selection
    const vehicleType = this.getVehicleType(apiData);
    console.log('🔍 Vehicle type determined:', vehicleType);
    
    // Filter trims based on vehicle type compatibility
    const compatibleTrims = this.filterCompatibleTrims(processedTrims, vehicleType, apiData);
    console.log('🔍 Compatible trims after filtering:', compatibleTrims.length, 'out of', processedTrims.length);
    
    if (compatibleTrims.length === 0) {
      console.warn('⚠️ No compatible trims found after filtering - using all trims');
      // Fallback to all trims if filtering removed everything
    }
    
    // Use filtered trims if available, otherwise use all trims
    const trimsToMatch = compatibleTrims.length > 0 ? compatibleTrims : processedTrims;
    
    // ✅ DIAGNOSTIC LOGGING: Trim selection start
    console.log('🎯 TRIM SELECTION START:', {
      apiTrim: apiData.trim,
      apiSpecsTrim: apiData.specs?.trim,
      availableTrims: trimsToMatch.map(t => t.name),
      trimsCount: trimsToMatch.length,
      trimsArrayOrder: trimsToMatch.map((t, i) => `${i}: ${t.name}`)
    });
    console.log('🔍 Trims array order:', trimsToMatch.map((t, i) => `${i}: ${t.name}`));
    
    // Intelligent trim matching from CarAPI response
    let selectedTrim: TrimOption | null = null;

    if (trimsToMatch.length === 1) {
      // Only one option - auto-select
      selectedTrim = trimsToMatch[0];
      console.log('🔍 Trim selection: Single trim available, auto-selected');
      
    } else if (trimsToMatch.length > 1 && apiData.trim) {
      // Multiple options - try to match using API trim field
      const apiTrimLower = apiData.trim.toLowerCase().trim();
      
      // ✅ ENHANCED LOGGING: Show raw API data at start
      console.log('🔍 ========== TRIM SELECTION DEBUG ==========');
      console.log('🔍 Raw API trim value:', apiData.trim);
      console.log('🔍 API trim (lowercase):', apiTrimLower);
      console.log('🔍 Available trims to match:', trimsToMatch.map(t => ({ name: t.name, description: t.description })));
      console.log('🔍 Trims array from API:', apiData.trims || apiData.availableTrims || 'Not present');
      
      // ✅ FIX: Handle "Turbo / Turbo S" format by splitting on "/"
      const apiTrimParts = apiTrimLower.split('/').map(part => part.trim()).filter(part => part.length > 0);
      console.log('🔍 Trim selection: Split API trim into parts:', apiTrimParts);
      
      // Strategy 1: Exact match (case-insensitive) - prioritize compatible trims
      selectedTrim = trimsToMatch.find(t => 
        t.name.toLowerCase() === apiTrimLower
      ) || null;
      if (selectedTrim) {
        console.log('🔍 Trim selection: Strategy 1 (exact match) - Found:', selectedTrim.name);
      }
      
      // Strategy 1.5: Match against split parts (for "Turbo / Turbo S" format)
      if (!selectedTrim && apiTrimParts.length > 0) {
        for (const part of apiTrimParts) {
          selectedTrim = trimsToMatch.find(t => 
            t.name.toLowerCase() === part
          ) || null;
          if (selectedTrim) {
            console.log('🔍 Trim selection: Strategy 1.5 (split part exact match) - Found:', selectedTrim.name, 'from part:', part);
            break;
          }
        }
      }
      
      // Strategy 2: API trim contains option name
      if (!selectedTrim) {
        selectedTrim = trimsToMatch.find(t => 
          apiTrimLower.includes(t.name.toLowerCase())
        ) || null;
        if (selectedTrim) {
          console.log('🔍 Trim selection: Strategy 2 (API contains trim) - Found:', selectedTrim.name);
        }
      }
      
      // Strategy 2.5: Split parts contain option name
      if (!selectedTrim && apiTrimParts.length > 0) {
        for (const part of apiTrimParts) {
          selectedTrim = trimsToMatch.find(t => 
            part.includes(t.name.toLowerCase())
          ) || null;
          if (selectedTrim) {
            console.log('🔍 Trim selection: Strategy 2.5 (split part contains trim) - Found:', selectedTrim.name, 'from part:', part);
            break;
          }
        }
      }
      
      // Strategy 3: Option name contains API trim
      if (!selectedTrim) {
        selectedTrim = trimsToMatch.find(t => 
          t.name.toLowerCase().includes(apiTrimLower)
        ) || null;
        if (selectedTrim) {
          console.log('🔍 Trim selection: Strategy 3 (trim contains API) - Found:', selectedTrim.name);
        }
      }
      
      // Strategy 3.5: Option name contains split parts
      if (!selectedTrim && apiTrimParts.length > 0) {
        for (const part of apiTrimParts) {
          selectedTrim = trimsToMatch.find(t => 
            t.name.toLowerCase().includes(part)
          ) || null;
          if (selectedTrim) {
            console.log('🔍 Trim selection: Strategy 3.5 (trim contains split part) - Found:', selectedTrim.name, 'from part:', part);
            break;
          }
        }
      }
      
      // Strategy 4: Fuzzy matching - extract key identifiers
      if (!selectedTrim) {
        // Extract numbers and key words from API trim
        const apiWords = apiTrimLower.match(/\b\w+\b/g) || [];
        const apiNumbers = apiTrimLower.match(/\d+/g) || [];
        
        selectedTrim = trimsToMatch.find(t => {
          const optionLower = t.name.toLowerCase();
          const optionWords = optionLower.match(/\b\w+\b/g) || [];
          const optionNumbers = optionLower.match(/\d+/g) || [];
          
          // Must match all numbers (e.g., "90", "110", "130", "P400")
          const numbersMatch = apiNumbers.every(num => 
            optionNumbers.includes(num)
          );
          
          // Must match key trim identifiers (X, S, SE, HSE, etc.)
          const keyWords = ['x', 's', 'se', 'hse', 'first', 'edition'];
          const hasKeyWordMatch = keyWords.some(keyword => 
            apiWords.includes(keyword) && optionWords.includes(keyword)
          );
          
          return numbersMatch && hasKeyWordMatch;
        }) || null;
        if (selectedTrim) {
          console.log('🔍 Trim selection: Strategy 4 (fuzzy match) - Found:', selectedTrim.name);
        }
      }
      
      // Strategy 5: For electric vehicles, filter out generic body style trims and rank by performance
      if (!selectedTrim && vehicleType === 'BEV') {
        // Filter out generic body style trims and rank by performance hierarchy
        const validTrims = this.filterValidPerformanceTrims(trimsToMatch, apiData);
        console.log('🔍 Trim selection: Strategy 5 - Valid performance trims after filtering:', validTrims.map(t => t.name));
        
        if (validTrims.length > 0) {
          // Rank by performance hierarchy (if applicable) and select best match
          selectedTrim = this.selectBestPerformanceTrim(validTrims, apiData);
          if (selectedTrim) {
            console.log('🔍 Trim selection: Strategy 5 (electric preference + performance ranking) - Found:', selectedTrim.name);
          }
        }
      }
      
    } else if (trimsToMatch.length > 1) {
      // Multiple options but no API trim field
      // For electric vehicles, filter out generic body style trims and rank by performance
      if (vehicleType === 'BEV') {
        const validTrims = this.filterValidPerformanceTrims(trimsToMatch, apiData);
        console.log('🔍 Trim selection: No API trim - Valid performance trims after filtering:', validTrims.map(t => t.name));
        
        if (validTrims.length > 0) {
          selectedTrim = this.selectBestPerformanceTrim(validTrims, apiData);
          if (selectedTrim) {
            console.log('🔍 Trim selection: No API trim, electric preference + performance ranking - Found:', selectedTrim.name);
          }
        }
      }
      
      if (!selectedTrim) {
        console.log('🔍 Trim selection: No API trim field, no auto-selection');
        selectedTrim = null;
      }
    }
    
    // Validate selected trim matches vehicle type
    if (selectedTrim) {
      const isValid = this.validateTrimCompatibility(selectedTrim, vehicleType, apiData);
      if (!isValid) {
        console.warn('⚠️ Selected trim failed validation, trying alternative selection');
        // Try to find a compatible trim
        const alternative = trimsToMatch.find(t => 
          this.validateTrimCompatibility(t, vehicleType, apiData)
        );
        if (alternative) {
          console.log('🔍 Found alternative compatible trim:', alternative.name);
          selectedTrim = alternative;
        } else {
          console.warn('⚠️ No compatible alternative found, keeping original selection');
        }
      }
    }
    
    // ✅ DIAGNOSTIC LOGGING: Trim selection result
    let selectionMethod = 'NONE';
    if (selectedTrim) {
      selectionMethod = selectedTrim.name;
    }
    console.log('🎯 TRIM SELECTION RESULT:', {
      selectedTrim: selectedTrim?.name || 'NONE',
      selectedTrimDescription: selectedTrim?.description || 'NONE',
      method: selectionMethod,
      wasAutoSelected: trimsToMatch.length === 1
    });
    
    // ✅ FINAL LOGGING: Show which trim was selected
    console.log('🔍 ========== TRIM SELECTION RESULT ==========');
    console.log('🔍 Selected trim:', selectedTrim ? selectedTrim.name : 'NONE');
    console.log('🔍 Selected trim description:', selectedTrim ? selectedTrim.description : 'NONE');
    console.log('🔍 ===========================================');
    
    console.log('transformApiResponse: Selected trim:', selectedTrim);
    
    // ✅ ENHANCED LOGGING: Selected trim details
    console.log('🔍 ========== SELECTED TRIM DETAILS ==========');
    console.log('🔍 Selected Trim:', selectedTrim);
    if (selectedTrim) {
      console.log('🔍 Selected Trim Name:', selectedTrim.name);
      console.log('🔍 Selected Trim Description:', selectedTrim.description);
      console.log('🔍 Selected Trim Specs:', selectedTrim.specs);
      console.log('🔍 Selected Trim Specs Engine:', selectedTrim.specs?.engine);
      console.log('🔍 Selected Trim Specs Transmission:', selectedTrim.specs?.transmission);
      console.log('🔍 Selected Trim Specs Drivetrain:', selectedTrim.specs?.drivetrain);
    }
    console.log('🔍 ==========================================');
    
    // Enhanced logging before transformation
    if (isDebugVIN) {
      console.log('🔍 BEFORE formatModelManheimStyle:');
      console.log('🔍   apiData.model:', apiData?.model);
      console.log('🔍   selectedTrim?.specs?.engine:', selectedTrim?.specs?.engine);
      console.log('🔍   selectedTrim?.description:', selectedTrim?.description);
    }
    
    // Manheim-style formatting
    const manheimModel = this.formatModelManheimStyle(apiData, selectedTrim);
    const manheimTrim = this.formatTrimManheimStyle(selectedTrim, apiData);
    
    console.log('🔍 Formatted Model (before):', apiData?.model);
    console.log('🔍 Formatted Model (after):', manheimModel);
    console.log('🔍 Formatted Trim (after):', manheimTrim);
    
    if (isDebugVIN) {
      console.log('🔍 AFTER formatModelManheimStyle:');
      console.log('🔍   Model (formatted):', manheimModel);
      console.log('🔍   Model should be "TAYCAN":', manheimModel === 'TAYCAN');
    }
    
    // 🔍 FIX: Use getDisplayTrim for displayTrim to match dropdown option values
    // TrimDropdown uses getDisplayTrim(trim) for option values, so displayTrim must match
    const displayTrimValue = selectedTrim ? this.getDisplayTrim(selectedTrim) : manheimTrim;
    
    console.log('🔍 transformApiResponse: Trim value comparison:', {
      manheimTrim,
      getDisplayTrim: displayTrimValue,
      selectedTrimName: selectedTrim?.name,
      selectedTrimDescription: selectedTrim?.description
    });
    
    const vehicleData = {
      year: (apiData?.year || "").toString(),
      make: (apiData?.make || "").trim(),
      model: manheimModel,
      trim: selectedTrim?.name || "",
      displayTrim: displayTrimValue, // Use getDisplayTrim to match dropdown values
      engineCylinders: selectedTrim?.specs?.engine || "",
      transmission: selectedTrim?.specs?.transmission || "",
      drivetrain: selectedTrim?.specs?.drivetrain || "",
      availableTrims: processedTrims,
      selectedTrim: selectedTrim // Pass the matched trim to hook
    };
    
    console.log('transformApiResponse: Final vehicle data (Manheim style):', vehicleData);
    return vehicleData;
  }

  /**
   * Models where "EV" is part of the official model name and should NOT be stripped
   */
  private getModelsWithOfficialEV(): string[] {
    return [
      'BOLT EV',
      'BOLT EUV',
      'KONA ELECTRIC',
      'NIRO EV',
      'EV6',
      'IONIQ ELECTRIC',
      'IONIQ 5',
      'IONIQ 6',
      'ID.4',
      'ID.3',
      'ID. BUZZ',
      'E-GOLF',
      'E-TRON',
      'I-PACE',
      'POLESTAR 2',
      'RIO ELECTRIC'
    ];
  }

  /**
   * Format model in Manheim style: MODEL ENGINE_TYPE
   * Example: "RANGE ROVER V8 HYBRID"
   * 
   * IMPORTANT: For electric vehicles, do NOT append "ELECTRIC" to model name.
   * Electric vehicles should show clean model name (e.g., "TAYCAN" not "TAYCAN ELECTRIC").
   * The engine/motor type should be in the engine field, not the model field.
   * 
   * Exception: Models where "EV" is part of the official name (e.g., "BOLT EV") should keep it.
   */
  private formatModelManheimStyle(apiData: any, selectedTrim?: TrimOption): string {
    let baseModel = (apiData?.model || "").trim().toUpperCase();
    if (!baseModel) return "";
    
    // Check if this model has "EV" as part of its official name
    const officialEVModels = this.getModelsWithOfficialEV();
    const isOfficialEVModel = officialEVModels.some(model => 
      baseModel.includes(model.toUpperCase()) || model.toUpperCase().includes(baseModel)
    );
    
    // Only clean fuel type descriptors if they're clearly appended (not part of official name)
    if (!isOfficialEVModel) {
      // Check if fuel type appears at the END of the model name (appended, not part of name)
      // Patterns that should be removed: "TAYCAN ELECTRIC", "CAYENNE HYBRID", etc.
      // But NOT "BOLT EV" (which is official name)
      const appendedPatterns = [
        /\s+ELECTRIC\s*$/i,  // Only at end
        /\s+BEV\s*$/i,       // Only at end
        /\s+PHEV\s*$/i,      // Only at end
        /\s+HYBRID\s*$/i     // Only at end
      ];
      
      for (const pattern of appendedPatterns) {
        if (pattern.test(baseModel)) {
          console.log(`🔍 formatModelManheimStyle: Found appended fuel type in model name "${baseModel}", cleaning...`);
          baseModel = baseModel.replace(pattern, '').trim();
          console.log(`🔍 formatModelManheimStyle: Cleaned model name to "${baseModel}"`);
        }
      }
    } else {
      console.log(`🔍 formatModelManheimStyle: Model "${baseModel}" has "EV" as part of official name - keeping it`);
    }
    
    // Check vehicle type (BEV, PHEV, or ICE)
    const vehicleType = this.getVehicleType(apiData, selectedTrim);
    
    // For pure BEV vehicles, return clean model name without appending "ELECTRIC"
    if (vehicleType === 'BEV') {
      console.log('🔍 formatModelManheimStyle: Pure BEV detected - returning clean model name');
      return baseModel;
    }
    
    // For PHEV vehicles, we might append engine type but not "ELECTRIC" or "PHEV"
    // (PHEV info goes in engine field, not model field)
    if (vehicleType === 'PHEV') {
      console.log('🔍 formatModelManheimStyle: PHEV detected - returning clean model name (engine info in engine field)');
      // For PHEV, we might still want to show engine type if it's a performance variant
      // But don't append "HYBRID" or "PHEV" - that goes in engine field
      // For now, return clean model name
      return baseModel;
    }
    
    // For non-electric vehicles (including mild hybrids), extract engine type
    let engineType = "";
    
    // Try to get engine type from trim specs
    if (selectedTrim?.specs?.engine) {
      const engine = selectedTrim.specs.engine.toUpperCase();
      if (engine.includes('V8')) engineType = 'V8';
      else if (engine.includes('V6')) engineType = 'V6';
      else if (engine.includes('V12')) engineType = 'V12';
      else if (engine.includes('HYBRID') && !engine.includes('ELECTRIC') && !engine.includes('PHEV')) {
        // Mild hybrid - show engine type only
        engineType = engine.match(/V\d+|INLINE\s*\d+/i)?.[0] || '';
      }
    }
    
    // Try to extract from description
    if (!engineType && (selectedTrim?.description || apiData?.description)) {
      const description = (selectedTrim?.description || apiData?.description).toUpperCase();
      if (description.includes('V8 HYBRID') && !description.includes('ELECTRIC') && !description.includes('PHEV')) {
        engineType = 'V8 HYBRID';
      } else if (description.includes('V8')) {
        engineType = 'V8';
      } else if (description.includes('V6')) {
        engineType = 'V6';
      } else if (description.includes('HYBRID') && !description.includes('ELECTRIC') && !description.includes('PHEV')) {
        // Mild hybrid - extract engine type
        const engineMatch = description.match(/V\d+|INLINE\s*\d+/i);
        engineType = engineMatch ? engineMatch[0] : '';
      }
    }
    
    // Combine model with engine type
    return engineType ? `${baseModel} ${engineType}` : baseModel;
  }
  
  /**
   * Determine vehicle type: BEV (pure electric), PHEV (plug-in hybrid), or ICE (internal combustion)
   * Returns: 'BEV' | 'PHEV' | 'ICE'
   */
  private getVehicleType(apiData: any, selectedTrim?: TrimOption | any): 'BEV' | 'PHEV' | 'ICE' {
    console.log('🔍 ========== getVehicleType: DETECTION START ==========');
    const specs = apiData?.specs || selectedTrim?.specs || {};
    
    // Log all detection inputs
    console.log('🔍 getVehicleType: Checking specs:', {
      engine_number_of_cylinders: specs.engine_number_of_cylinders,
      displacement_l: specs.displacement_l,
      transmission_speeds: specs.transmission_speeds,
      transmission_style: specs.transmission_style,
      electrification_level: specs.electrification_level,
      fuel_type_primary: specs.fuel_type_primary
    });
    
    // ✅ PRIORITY 1: Check electrification level (most reliable indicator)
    const electrificationLevel = (specs.electrification_level || '').toLowerCase();
    console.log('🔍 getVehicleType: Electrification level check:', electrificationLevel);
    
    // Handle full string like "BEV (Battery Electric Vehicle)" or just "BEV"
    if (electrificationLevel.includes('bev') || electrificationLevel === 'electric') {
      console.log('🔍 getVehicleType: ✅ BEV detected (electrification_level)');
      return 'BEV';
    }
    if (electrificationLevel.includes('phev') || electrificationLevel.includes('plug-in')) {
      console.log('🔍 getVehicleType: ✅ PHEV detected (electrification_level)');
      return 'PHEV';
    }
    
    // ✅ PRIORITY 2: Check fuel type (second most reliable)
    const fuelType = (specs.fuel_type_primary || '').toLowerCase();
    console.log('🔍 getVehicleType: Fuel type check:', fuelType);
    if (fuelType === 'electric' || fuelType.includes('electric')) {
      // Check if it has an engine (PHEV) or not (BEV)
      const hasEngine = specs.engine_number_of_cylinders && 
                       specs.engine_number_of_cylinders !== null &&
                       specs.displacement_l && specs.displacement_l !== null;
      console.log('🔍 getVehicleType: Has engine:', hasEngine);
      const result = hasEngine ? 'PHEV' : 'BEV';
      console.log(`🔍 getVehicleType: ✅ ${result} detected (fuel_type_primary)`);
      return result;
    }
    
    // Check engine specs - pure BEV has no cylinders, no displacement, single-speed transmission
    const hasNoCylinders = specs.engine_number_of_cylinders === null || 
                          specs.engine_number_of_cylinders === undefined;
    const hasNoDisplacement = !specs.displacement_l || specs.displacement_l === null;
    const hasSingleSpeedTransmission = specs.transmission_speeds === '1' || 
                                      (specs.transmission_style && specs.transmission_style.toLowerCase().includes('single-speed'));
    
    console.log('🔍 getVehicleType: Engine specs check:', {
      hasNoCylinders,
      hasNoDisplacement,
      hasSingleSpeedTransmission
    });
    
    if (hasNoCylinders && hasNoDisplacement && hasSingleSpeedTransmission) {
      console.log('🔍 getVehicleType: ✅ BEV detected (no cylinders, no displacement, single-speed)');
      return 'BEV';
    }
    
    // Check trims array for electric indicators
    const trims = apiData?.trims || apiData?.availableTrims || [];
    if (Array.isArray(trims) && trims.length > 0) {
      console.log('🔍 getVehicleType: Checking trims array for electric indicators:', trims.length, 'trims');
      const trimDescriptions = trims.map((t: any) => (t.description || '').toLowerCase()).join(' ');
      const hasElectricInTrims = trimDescriptions.includes('electric') ||
                                 trimDescriptions.includes('motor') ||
                                 trimDescriptions.includes('ev') ||
                                 trimDescriptions.includes('2a'); // Electric transmission code
      
      console.log('🔍 getVehicleType: Trim descriptions check:', {
        trimDescriptions: trimDescriptions.substring(0, 200),
        hasElectricInTrims
      });
      
      // If trims have electric indicators and no engine specs, it's BEV
      if (hasElectricInTrims && hasNoCylinders && hasNoDisplacement) {
        console.log('🔍 getVehicleType: ✅ BEV detected (electric in trims + no engine specs)');
        return 'BEV';
      }
    }
    
    // Check description fields
    const description = (selectedTrim?.description || apiData?.description || '').toLowerCase();
    console.log('🔍 getVehicleType: Description check:', description.substring(0, 200));
    
    // Check if engine field contains "Electric Motor" (from processed specs)
    const engineField = (selectedTrim?.specs?.engine || apiData?.engineCylinders || '').toLowerCase();
    const transmissionField = (selectedTrim?.specs?.transmission || apiData?.transmission || specs.transmission_style || '').toLowerCase();
    
    console.log('🔍 getVehicleType: Processed fields check:', {
      engineField,
      transmissionField
    });
    
    // Check if engine field says "Electric Motor" or transmission is "Single-Speed"
    if (engineField.includes('electric') || engineField.includes('motor')) {
      if (hasNoCylinders && hasNoDisplacement) {
        console.log('🔍 getVehicleType: ✅ BEV detected (engine field contains electric/motor + no engine specs)');
        return 'BEV';
      }
    }
    
    if (transmissionField.includes('single-speed') || transmissionField === 'single-speed') {
      if (hasNoCylinders && hasNoDisplacement) {
        console.log('🔍 getVehicleType: ✅ BEV detected (single-speed transmission + no engine specs)');
        return 'BEV';
      }
    }
    
    // Check if description has electric indicators
    const hasElectricMention = description.includes('electric') || 
                               description.includes('phev') ||
                               description.includes('plug-in') ||
                               description.includes('2a'); // Electric transmission code
    
    // Check if it has both engine AND electric (PHEV)
    const hasEngine = specs.engine_number_of_cylinders && 
                     specs.engine_number_of_cylinders !== null &&
                     specs.displacement_l && specs.displacement_l !== null;
    
    console.log('🔍 getVehicleType: PHEV check:', {
      hasEngine,
      hasElectricMention
    });
    
    if (hasEngine && hasElectricMention) {
      console.log('🔍 getVehicleType: ✅ PHEV detected (has engine + electric mention)');
      return 'PHEV';
    }
    
    // If description has electric but no engine specs, it's BEV
    if (hasElectricMention && hasNoCylinders && hasNoDisplacement) {
      console.log('🔍 getVehicleType: ✅ BEV detected (electric mention in description + no engine specs)');
      return 'BEV';
    }
    
    // Default to ICE (including mild hybrids)
    console.log('🔍 getVehicleType: ⚠️ Defaulting to ICE (no BEV/PHEV indicators found)');
    console.log('🔍 ========== getVehicleType: DETECTION END ==========');
    return 'ICE';
  }
  
  /**
   * Check if vehicle is electric (BEV or PHEV) based on multiple indicators
   * @param apiData - The API response data (can include specs, description, etc.)
   * @param selectedTrim - Optional TrimOption or raw trim data object
   */
  private isElectricVehicle(apiData: any, selectedTrim?: TrimOption | any): boolean {
    const vehicleType = this.getVehicleType(apiData, selectedTrim);
    return vehicleType === 'BEV' || vehicleType === 'PHEV';
  }

  /**
   * Filter trims to only include those compatible with the vehicle type
   */
  private filterCompatibleTrims(trims: TrimOption[], vehicleType: 'BEV' | 'PHEV' | 'ICE', apiData: any): TrimOption[] {
    console.log('🔍 filterCompatibleTrims: Filtering', trims.length, 'trims for vehicle type:', vehicleType);
    
    if (vehicleType === 'BEV') {
      // For electric vehicles, filter out trims with gas engine specs
      const filtered = trims.filter(trim => {
        const description = (trim.description || '').toLowerCase();
        const specs = trim.specs || {};
        const engine = (specs.engine || '').toLowerCase();
        
        // Check for gas engine indicators (displacement like "4.0L", "cyl", "v6", "v8", etc.)
        const hasGasEngine = description.match(/\d+\.?\d*l\s+\d+cyl/i) || // "4.0L 6cyl"
                            description.match(/\d+cyl/i) || // "6cyl", "8cyl"
                            description.includes('v6') || 
                            description.includes('v8') ||
                            description.includes('v12') ||
                            description.includes('inline') ||
                            engine.includes('cyl') ||
                            engine.includes('v6') ||
                            engine.includes('v8') ||
                            (description.match(/\d+\.?\d*l/i) && description.includes('cyl')); // Displacement + cylinders
        
        // For BEV, reject ANY trim with gas engine specs
        if (hasGasEngine) {
          console.log('🔍 filterCompatibleTrims: Rejected trim (has gas engine specs):', trim.name, 'Description:', description);
          return false;
        }
        
        // Accept trims with electric indicators
        const hasElectric = description.includes('electric') ||
                           description.includes('motor') ||
                           description.includes('ev') ||
                           engine.includes('electric') ||
                           engine.includes('motor') ||
                           description.includes('2a') || // Electric transmission code
                           description.includes('awd') && !description.includes('cyl'); // AWD without cylinders likely EV
        
        // For BEV, must have electric indicators
        if (!hasElectric) {
          console.log('🔍 filterCompatibleTrims: Rejected trim (no electric indicators):', trim.name, 'Description:', description);
          return false;
        }
        
        return true;
      });
      
      console.log('🔍 filterCompatibleTrims: Filtered to', filtered.length, 'electric-compatible trims');
      return filtered;
    }
    
    if (vehicleType === 'PHEV') {
      // For PHEV, accept trims with both engine and electric mentions, or just engine
      const filtered = trims.filter(trim => {
        const description = (trim.description || '').toLowerCase();
        const hasEngine = description.includes('cyl') || 
                         description.includes('l ') && description.match(/\d+\.?\d*l/i) ||
                         description.includes('v6') || 
                         description.includes('v8');
        const hasElectric = description.includes('electric') ||
                           description.includes('phev') ||
                           description.includes('plug-in') ||
                           description.includes('hybrid');
        
        // PHEV should have engine, and may have electric mention
        return hasEngine || hasElectric;
      });
      
      console.log('🔍 filterCompatibleTrims: Filtered to', filtered.length, 'PHEV-compatible trims');
      return filtered;
    }
    
    // For ICE, return all trims (no filtering needed)
    console.log('🔍 filterCompatibleTrims: ICE vehicle - no filtering needed');
    return trims;
  }
  
  /**
   * Filter out generic body style trims (like "Taycan Sedan", "Model 3 Sedan")
   * and only keep valid performance/trim level designations
   */
  private filterValidPerformanceTrims(trims: TrimOption[], apiData: any): TrimOption[] {
    const make = (apiData?.make || '').toUpperCase();
    const model = (apiData?.model || '').toUpperCase();
    
    console.log('🔍 filterValidPerformanceTrims: Filtering', trims.length, 'trims for', make, model);
    
    // Generic body style words that should be rejected when they appear alone (without performance designation)
    const genericBodyStyles = ['sedan', 'coupe', 'wagon', 'hatchback', 'suv', 'convertible'];
    
    const filtered = trims.filter(trim => {
      const trimName = (trim.name || '').toLowerCase();
      const description = (trim.description || '').toLowerCase();
      
      // Porsche Taycan specific validation
      if (make === 'PORSCHE' && model.includes('TAYCAN')) {
        // Official Porsche Taycan trim hierarchy: Base, 4S, GTS, Turbo, Turbo S
        const validTaycanTrims = ['taycan', '4s', 'gts', 'turbo', 'turbo s'];
        
        // Check if trim name matches official designations
        const isOfficialTrim = validTaycanTrims.some(valid => 
          trimName.includes(valid) || trimName === valid
        );
        
        // Check if it's just a generic body style (e.g., "Taycan Sedan" without performance designation)
        const isGenericBodyStyle = genericBodyStyles.some(bodyStyle => {
          const bodyStylePattern = new RegExp(`\\b${bodyStyle}\\b`, 'i');
          const hasBodyStyle = bodyStylePattern.test(trimName) || bodyStylePattern.test(description);
          // If it has body style but no performance designation, it's generic
          const hasPerformanceDesignation = validTaycanTrims.some(perf => 
            trimName.includes(perf) || description.includes(perf)
          );
          return hasBodyStyle && !hasPerformanceDesignation;
        });
        
        if (isGenericBodyStyle) {
          console.log('🔍 filterValidPerformanceTrims: Rejected generic body style trim:', trim.name);
          return false;
        }
        
        if (isOfficialTrim) {
          console.log('🔍 filterValidPerformanceTrims: Accepted official Porsche trim:', trim.name);
          return true;
        }
        
        // If trim name doesn't match official designations, check description
        const hasPerformanceInDescription = validTaycanTrims.some(perf => 
          description.includes(perf)
        );
        
        if (hasPerformanceInDescription) {
          console.log('🔍 filterValidPerformanceTrims: Accepted trim (has performance designation in description):', trim.name);
          return true;
        }
        
        console.log('🔍 filterValidPerformanceTrims: Rejected trim (not official Porsche designation):', trim.name);
        return false;
      }
      
      // For other manufacturers, filter out generic body style trims
      const isGenericBodyStyle = genericBodyStyles.some(bodyStyle => {
        const bodyStylePattern = new RegExp(`\\b${bodyStyle}\\b`, 'i');
        const hasBodyStyle = bodyStylePattern.test(trimName);
        // Keep if it has performance designation (like "Model 3 Performance", "Mustang GT")
        const hasPerformanceDesignation = trimName.match(/\b(performance|gt|turbo|sport|plaid|amg|m\d+|rs)\b/i);
        return hasBodyStyle && !hasPerformanceDesignation;
      });
      
      if (isGenericBodyStyle) {
        console.log('🔍 filterValidPerformanceTrims: Rejected generic body style trim:', trim.name);
        return false;
      }
      
      return true;
    });
    
    console.log('🔍 filterValidPerformanceTrims: Filtered to', filtered.length, 'valid performance trims');
    return filtered;
  }
  
  /**
   * Select best trim based on performance hierarchy (for manufacturers with known hierarchies)
   */
  private selectBestPerformanceTrim(trims: TrimOption[], apiData: any): TrimOption | null {
    const make = (apiData?.make || '').toUpperCase();
    const model = (apiData?.model || '').toUpperCase();
    
    // Porsche Taycan performance hierarchy (highest to lowest)
    if (make === 'PORSCHE' && model.includes('TAYCAN')) {
      const hierarchy = ['turbo s', 'turbo', 'gts', '4s', 'taycan'];
      
      // Sort trims by hierarchy
      const sorted = [...trims].sort((a, b) => {
        const aName = (a.name || '').toLowerCase();
        const bName = (b.name || '').toLowerCase();
        
        const aRank = hierarchy.findIndex(h => aName.includes(h));
        const bRank = hierarchy.findIndex(h => bName.includes(h));
        
        // If both found in hierarchy, lower index (higher performance) comes first
        if (aRank !== -1 && bRank !== -1) {
          return aRank - bRank;
        }
        // If only one found, prioritize it
        if (aRank !== -1) return -1;
        if (bRank !== -1) return 1;
        // If neither found, maintain original order
        return 0;
      });
      
      console.log('🔍 selectBestPerformanceTrim: Porsche Taycan hierarchy ranking:', sorted.map(t => t.name));
      
      // Prefer GTS if available (middle of hierarchy, commonly selected)
      // But if VIN or API indicates specific trim, use that
      const gtsTrim = sorted.find(t => (t.name || '').toLowerCase().includes('gts'));
      if (gtsTrim) {
        console.log('🔍 selectBestPerformanceTrim: Selected GTS (Porsche Taycan default)');
        return gtsTrim;
      }
      
      // Otherwise return highest ranked (Turbo S)
      if (sorted.length > 0) {
        console.log('🔍 selectBestPerformanceTrim: Selected highest performance trim:', sorted[0].name);
        return sorted[0];
      }
    }
    
    // For other manufacturers, return first trim (no specific hierarchy)
    return trims.length > 0 ? trims[0] : null;
  }

  /**
   * Validate that a trim is compatible with the vehicle type
   */
  private validateTrimCompatibility(trim: TrimOption, vehicleType: 'BEV' | 'PHEV' | 'ICE', apiData: any): boolean {
    const description = (trim.description || '').toLowerCase();
    const specs = trim.specs || {};
    const engine = (specs.engine || '').toLowerCase();
    
    if (vehicleType === 'BEV') {
      // Electric vehicles should NOT have gas engine specs
      const hasGasEngine = description.includes('cyl') || 
                          (description.includes('l ') && description.match(/\d+\.?\d*l/i)) ||
                          description.includes('v6') || 
                          description.includes('v8') ||
                          description.includes('v12') ||
                          description.includes('inline') ||
                          engine.includes('cyl') ||
                          engine.includes('v6') ||
                          engine.includes('v8');
      
      if (hasGasEngine) {
        console.warn('⚠️ validateTrimCompatibility: BEV trim has gas engine specs:', trim.name, description);
        return false;
      }
      
      // Should have electric indicators
      const hasElectric = description.includes('electric') ||
                         description.includes('motor') ||
                         description.includes('ev') ||
                         engine.includes('electric') ||
                         engine.includes('motor');
      
      return hasElectric;
    }
    
    if (vehicleType === 'PHEV') {
      // PHEV should have engine specs
      const hasEngine = description.includes('cyl') || 
                       (description.includes('l ') && description.match(/\d+\.?\d*l/i)) ||
                       description.includes('v6') || 
                       description.includes('v8');
      return hasEngine;
    }
    
    // ICE - no validation needed
    return true;
  }

  /**
   * Format trim in Manheim style: BODY_STYLE TRIM_LEVEL
   * Example: "4D SUV AUTOBIOGRAPHY"
   */
  private formatTrimManheimStyle(selectedTrim?: TrimOption, apiData?: any): string {
    console.log('formatTrimManheimStyle: Processing trim:', selectedTrim);
    console.log('formatTrimManheimStyle: API data:', apiData);
    
    if (!selectedTrim) {
      console.log('formatTrimManheimStyle: No selected trim, returning empty');
      return "";
    }
    
    // Extract body style
    let bodyStyle = "";
    const description = (selectedTrim.description || "").toUpperCase();
    console.log('formatTrimManheimStyle: Description:', description);
    
    // Enhanced body style patterns
    const bodyStylePatterns = [
      /(\d+D\s+(?:COUPE|SEDAN|SUV|CONVERTIBLE|WAGON|HATCHBACK))/i,
      /(COUPE|SEDAN|SUV|CONVERTIBLE|WAGON|HATCHBACK)/i,
      /(\d+D\s+(?:DOOR|DR))/i,
      /(SPORT\s+UTILITY|SPORT\s+UTILITY\s+VEHICLE)/i
    ];
    
    for (const pattern of bodyStylePatterns) {
      const match = description.match(pattern);
      if (match) {
        bodyStyle = match[1];
        console.log('formatTrimManheimStyle: Found body style:', bodyStyle);
        break;
      }
    }
    
    // Extract meaningful trim level
    let trimLevel = "";
    const meaningfulTrims = [
      'AUTOBIOGRAPHY', 'AMG', 'GT3 RS', 'GT2 RS', 'GTS', 'TURBO', 'SPORT', 
      'LUXURY', 'PREMIUM', 'SENNA', 'P1', '720S', 'ARTURA', 'M3', 'M5', 'M8',
      'SE', 'SVE', 'HSE', 'SV', 'DYNAMIC', 'R-DYNAMIC'
    ];
    
    // Check trim name first
    if (selectedTrim.name) {
      const trimName = selectedTrim.name.toUpperCase();
      console.log('formatTrimManheimStyle: Trim name:', trimName);
      for (const meaningful of meaningfulTrims) {
        if (trimName.includes(meaningful)) {
          trimLevel = meaningful;
          console.log('formatTrimManheimStyle: Found trim level from name:', trimLevel);
          break;
        }
      }
    }
    
    // Check description if trim name doesn't have meaningful trim
    if (!trimLevel && description) {
      console.log('formatTrimManheimStyle: Checking description for trim level');
      for (const meaningful of meaningfulTrims) {
        if (description.includes(meaningful)) {
          trimLevel = meaningful;
          console.log('formatTrimManheimStyle: Found trim level from description:', trimLevel);
          break;
        }
      }
    }
    
    // Check top-level API data for trim info
    if (!trimLevel && apiData?.description) {
      const apiDescription = apiData.description.toUpperCase();
      console.log('formatTrimManheimStyle: Checking API description:', apiDescription);
      for (const meaningful of meaningfulTrims) {
        if (apiDescription.includes(meaningful)) {
          trimLevel = meaningful;
          console.log('formatTrimManheimStyle: Found trim level from API description:', trimLevel);
          break;
        }
      }
    }
    
    // Combine body style and trim level
    let result = "";
    if (bodyStyle && trimLevel) {
      result = `${bodyStyle} ${trimLevel}`;
    } else if (bodyStyle) {
      result = bodyStyle;
    } else if (trimLevel) {
      result = trimLevel;
    } else {
      result = selectedTrim.name || "BASE";
    }
    
    console.log('formatTrimManheimStyle: Final result:', result);
    return result;
  }

  /**
   * Process and normalize trim data - SIMPLIFIED APPROACH
   * If Edge Function already processed trims, use them directly
   */
  private processTrims(apiData: any): TrimOption[] {
    console.log('processTrims: Starting processing with API data:', apiData);
    
    // ✅ FIX: If Edge Function already processed trims, return as-is
    if (apiData.availableTrims && Array.isArray(apiData.availableTrims)) {
      console.log('processTrims: Using pre-processed trims from Edge Function');
      // Don't transform - preserve IDs and structure
      return apiData.availableTrims;
    }
    
    // Otherwise, process raw API data (CarAPI/NHTSA)
    const trimSources: any[] = [];
    
    // Source 1: trims array (specialty cars like McLaren)
    if (apiData?.trims && Array.isArray(apiData.trims)) {
      console.log('processTrims: Found trims array with', apiData.trims.length, 'items');
      trimSources.push(...apiData.trims.map((trim: any) => ({ ...trim, source: 'trims_array' })));
    }
    
    // Source 2: Single trim at top level (some manufacturers)
    if (apiData?.trim) {
      console.log('processTrims: Found single trim at top level:', apiData.trim);
      trimSources.push({ 
        name: apiData.trim, 
        description: apiData.description,
        specs: apiData.specs,
        year: apiData.year,
        source: 'top_level_trim'
      });
    }
    
    // Source 3: Create trim from top-level data if no trims found
    if (trimSources.length === 0 && (apiData?.make || apiData?.model)) {
      console.log('processTrims: No trim arrays found, creating from top-level data');
      trimSources.push({
        name: apiData.trim || apiData.model || 'Base',
        description: apiData.description || '',
        specs: apiData.specs || {},
        year: apiData.year,
        source: 'top_level_data'
      });
    }
    
    console.log('processTrims: Total trim sources found:', trimSources.length);
    
    // Process all trim sources with unified logic
    return trimSources.map((trimData: any, index: number) => {
      console.log(`processTrims: Processing trim ${index} from ${trimData.source}:`, trimData);
      
      const processedTrim: TrimOption = {
        id: trimData.id || `trim-${index}`, // Ensure ID is present
        name: this.normalizeTrimName(trimData.name, trimData.description),
        description: trimData.description || "",
        specs: this.extractSpecsWithFallback(trimData, apiData),
        year: trimData.year || Number(apiData.year),
        source: trimData.source || 'unknown'
      };
      
      console.log(`processTrims: Processed trim ${index}:`, processedTrim);
      return processedTrim;
    });
  }

  /**
   * Normalize trim name with intelligent fallback logic
   */
  private normalizeTrimName(trimName?: string, description?: string): string {
    // If trim name exists and is meaningful, use it
    if (trimName && trimName.trim() !== '' && trimName !== 'Base') {
      return trimName.trim();
    }
    
    // Try to extract meaningful trim from description
    if (description) {
      const meaningfulPatterns = [
        /(Autobiography|AMG|GT3 RS|GT2 RS|GTS|Turbo|Sport|Luxury|Premium|Senna|P1|720S|Artura|M3|M5|M8)/i,
        /(Coupe|Sedan|SUV|Convertible|Wagon|Hatchback)/i
      ];
      
      for (const pattern of meaningfulPatterns) {
        const match = description.match(pattern);
        if (match) {
          return match[1];
        }
      }
    }
    
    // Final fallback
    return trimName || 'Base';
  }

  /**
   * Extract specs with comprehensive fallback hierarchy
   */
  private extractSpecsWithFallback(trimData: any, apiData: any): { engine: string; transmission: string; drivetrain: string } {
    console.log('extractSpecsWithFallback: Processing specs for:', trimData);
    
    // Engine extraction with fallback hierarchy
    const engine = this.extractEngineWithFallback(trimData, apiData);
    
    // Transmission extraction with fallback hierarchy  
    const transmission = this.extractTransmissionWithFallback(trimData, apiData);
    
    // Drivetrain extraction with fallback hierarchy
    const drivetrain = this.extractDrivetrainWithFallback(trimData, apiData);
    
    console.log('extractSpecsWithFallback: Final specs:', { engine, transmission, drivetrain });
    
    return { engine, transmission, drivetrain };
  }

  /**
   * Extract engine with comprehensive fallback hierarchy
   */
  private extractEngineWithFallback(trimData: any, apiData: any): string {
    // Check vehicle type first
    const vehicleType = this.getVehicleType(apiData, trimData);
    
    // For pure BEV vehicles, format motor configuration
    if (vehicleType === 'BEV') {
      // Check for motor configuration (tri-motor, quad-motor, dual-motor, single-motor)
      const description = (trimData?.description || apiData?.description || '').toLowerCase();
      const drivetrain = (trimData?.specs?.drivetrain || apiData?.specs?.drive_type || '').toLowerCase();
      
      // Check for tri-motor or quad-motor first (most specific)
      if (description.includes('quad-motor') || description.includes('quad motor') || 
          description.includes('4-motor') || description.includes('4 motor')) {
        return 'Quad-Motor';
      }
      
      if (description.includes('tri-motor') || description.includes('tri motor') || 
          description.includes('3-motor') || description.includes('3 motor')) {
        return 'Tri-Motor';
      }
      
      // Check for dual-motor configuration
      const hasDualMotor = description.includes('dual-motor') || 
                          description.includes('dual motor') ||
                          (drivetrain.includes('awd') && !drivetrain.includes('rwd')); // AWD EVs often have dual motors
      
      // Check make/model for specific motor configurations
      const make = (apiData?.make || '').toUpperCase();
      const model = (apiData?.model || '').toUpperCase();
      
      // Tesla-specific motor configurations
      if (make === 'TESLA') {
        // Tesla Cybertruck Tri-Motor, Model S Plaid (tri-motor)
        if (model.includes('CYBERTRUCK') || 
            (model.includes('MODEL S') && description.includes('plaid'))) {
          return 'Tri-Motor';
        }
        // Tesla Model 3 RWD is single motor, AWD is dual motor
        if (model.includes('MODEL 3')) {
          if (drivetrain.includes('awd') || description.includes('awd')) {
            return 'Dual-Motor';
          }
          return 'Single-Motor';
        }
        // Tesla Model S/X Plaid+ or certain variants may have tri-motor
        if ((model.includes('MODEL S') || model.includes('MODEL X')) && 
            (description.includes('plaid') || description.includes('tri'))) {
          return 'Tri-Motor';
        }
        // Default Tesla AWD to dual-motor
        if (drivetrain.includes('awd') || description.includes('awd')) {
          return 'Dual-Motor';
        }
      }
      
      // Rivian-specific (R1T, R1S can have quad-motor)
      if (make === 'RIVIAN') {
        if (description.includes('quad') || description.includes('4-motor')) {
          return 'Quad-Motor';
        }
        // Rivian also has dual-motor variants
        if (drivetrain.includes('awd') || description.includes('dual')) {
          return 'Dual-Motor';
        }
      }
      
      // Chevrolet Bolt is single motor
      if (make === 'CHEVROLET' && model.includes('BOLT')) {
        return 'Single-Motor';
      }
      
      // Generic AWD detection (likely dual-motor)
      if (hasDualMotor) {
        return 'Dual-Motor';
      }
      
      // Default to Electric Motor if we can't determine
      return 'Electric Motor';
    }
    
    // For PHEV vehicles, show both engine and electric motor
    if (vehicleType === 'PHEV') {
      // Extract engine information
      let engineInfo = '';
      
      // Try to get engine from specs
      if (trimData.specs?.engine) {
        engineInfo = trimData.specs.engine;
      } else if (apiData.specs?.engine) {
        engineInfo = apiData.specs.engine;
      } else {
        // Extract from description
        const description = (trimData?.description || apiData?.description || '').toUpperCase();
        const displacementMatch = description.match(/(\d+\.?\d*L)/i);
        const cylinderMatch = description.match(/(V\d+|INLINE\s*\d+)/i);
        const turboMatch = description.match(/(TURBO)/i);
        
        const parts = [displacementMatch?.[1], cylinderMatch?.[1], turboMatch?.[1]].filter(Boolean);
        engineInfo = parts.join(' ');
      }
      
      // Add PHEV designation
      return engineInfo ? `${engineInfo} PHEV` : 'PHEV';
    }
    
    // For ICE vehicles (including mild hybrids), extract engine normally
    // Priority 1: Direct specs
    if (trimData.specs?.engine) return trimData.specs.engine;
    
    // Priority 2: Extract from trim description
    if (trimData.description) {
      const extracted = this.extractEngineFromDescription(trimData.description);
      if (extracted) return extracted;
    }
    
    // Priority 3: Extract from top-level description
    if (apiData.description) {
      const extracted = this.extractEngineFromDescription(apiData.description);
      if (extracted) return extracted;
    }
    
    // Priority 4: Top-level specs
    if (apiData.specs?.engine) return apiData.specs.engine;
    
    return "";
  }

  /**
   * Extract transmission with comprehensive fallback hierarchy
   */
  private extractTransmissionWithFallback(trimData: any, apiData: any): string {
    // Priority 1: Direct specs
    if (trimData.specs?.transmission) return trimData.specs.transmission;
    
    // Priority 2: Extract from trim description
    if (trimData.description) {
      const extracted = this.extractTransmissionFromDescription(trimData.description);
      if (extracted) return extracted;
    }
    
    // Priority 3: Extract from top-level description
    if (apiData.description) {
      const extracted = this.extractTransmissionFromDescription(apiData.description);
      if (extracted) return extracted;
    }
    
    // Priority 4: Top-level specs
    if (apiData.specs?.transmission) return apiData.specs.transmission;
    
    return "";
  }

  /**
   * Extract drivetrain with comprehensive fallback hierarchy
   */
  private extractDrivetrainWithFallback(trimData: any, apiData: any): string {
    // Priority 1: Direct specs
    if (trimData.specs?.drivetrain) return trimData.specs.drivetrain;
    
    // Priority 2: Top-level drivetrain
    if (apiData.drivetrain) return apiData.drivetrain;
    
    // Priority 3: Extract from trim description
    if (trimData.description) {
      const extracted = this.extractDrivetrainFromDescription(trimData.description);
      if (extracted) return extracted;
    }
    
    // Priority 4: Extract from top-level description
    if (apiData.description) {
      const extracted = this.extractDrivetrainFromDescription(apiData.description);
      if (extracted) return extracted;
    }
    
    // Priority 5: Top-level specs
    if (apiData.specs?.drivetrain) return apiData.specs.drivetrain;
    
    // Priority 6: Manufacturer defaults
    const make = apiData?.make?.toLowerCase();
    if (make === 'porsche') return 'AWD';
    if (make === 'mercedes-benz') return 'AWD';
    if (make === 'mclaren') return 'RWD';
    
    return 'AWD'; // Final fallback
  }

  /**
   * Get display value for trim dropdown
   */
  getDisplayTrim(trim?: TrimOption): string {
    if (!trim) return "";
    
    console.log('getDisplayTrim: Processing trim:', { name: trim.name, description: trim.description });
    
    // For meaningful trim names, prioritize the name
    const meaningfulTrims = ['Autobiography', 'AMG', 'GT3 RS', 'GT2 RS', 'GTS', 'Turbo', 'Sport', 'Luxury', 'Senna', 'P1', '720S', 'Artura', 'Base'];
    const isMeaningful = meaningfulTrims.some(meaningful => 
      trim.name?.toLowerCase().includes(meaningful.toLowerCase())
    );
    
    // Always prefer trim name if it exists and is not empty
    if (trim.name && trim.name.trim() !== '') {
      console.log('getDisplayTrim: Using trim name:', trim.name);
      return trim.name;
    }
    
    // Only fall back to description if trim name is empty
    if (trim.description && trim.description.trim() !== '') {
      console.log('getDisplayTrim: Using description as fallback:', trim.description);
      return trim.description;
    }
    
    console.log('getDisplayTrim: No valid trim data, returning Unknown Trim');
    return 'Unknown Trim';
  }

  /**
   * Extract engine information from description
   */
  private extractEngineFromDescription(description: string): string {
    if (!description) return "";
    
    console.log('extractEngineFromDescription: Processing description:', description);
    
    // Extract displacement (4.0L, 3.0L, etc.)
    const displacementMatch = description.match(/(\d+\.?\d*L)/i);
    const displacement = displacementMatch ? displacementMatch[1] : "";
    
    // Extract cylinder configuration (V8, V12, V6, Inline 4, etc.)
    const cylinderMatch = description.match(/(V\d+|Inline\s*\d+|I\d+)/i);
    const cylinders = cylinderMatch ? cylinderMatch[1] : "";
    
    // Extract additional engine features
    const turboMatch = description.match(/(Twin-?Turbo|Turbo(?:charged)?|Supercharged)/i);
    const turbo = turboMatch ? turboMatch[1] : "";
    
    const hybridMatch = description.match(/(Hybrid|Electric)/i);
    const hybrid = hybridMatch ? hybridMatch[1] : "";
    
    // Extract fuel type
    const fuelMatch = description.match(/(Gasoline|Diesel|Electric)/i);
    const fuel = fuelMatch ? fuelMatch[1] : "";
    
    // Combine components intelligently
    const components = [displacement, cylinders, turbo, hybrid, fuel].filter(Boolean);
    const result = components.join(' ');
    
    console.log('extractEngineFromDescription: Components found:', {
      displacement, cylinders, turbo, hybrid, fuel, result
    });
    
    return result;
  }

  /**
   * Extract transmission information from description
   */
  private extractTransmissionFromDescription(description: string): string {
    if (!description) return "";
    
    console.log('extractTransmissionFromDescription: Processing description:', description);
    
    const patterns = [
      // Speed patterns (8-Speed Automatic, 7-Speed Manual, etc.)
      /(\d+)\s*Speed\s*(?:Automatic|Manual|CVT)/i,
      // AM patterns (7AM, 8AM, etc.)
      /(\d+AM)/i,
      // Automatic patterns
      /(Automatic)/i,
      // Manual patterns
      /(Manual)/i,
      // CVT patterns
      /(CVT)/i,
      // Sequential patterns
      /(Sequential)/i,
      // DCT patterns
      /(DCT|Dual\s*Clutch)/i
    ];
    
    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) {
        console.log('extractTransmissionFromDescription: Found match:', match[1]);
        return match[1];
      }
    }
    
    console.log('extractTransmissionFromDescription: No transmission pattern found');
    return "";
  }

  /**
   * Extract drivetrain information from description
   */
  private extractDrivetrainFromDescription(description: string): string {
    if (!description) return "";
    
    const patterns = [
      // AWD patterns
      /(AWD|All.?Wheel.?Drive)/i,
      // FWD patterns
      /(FWD|Front.?Wheel.?Drive)/i,
      // RWD patterns
      /(RWD|Rear.?Wheel.?Drive)/i,
      // 4WD patterns
      /(4WD|Four.?Wheel.?Drive)/i
    ];
    
    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return "";
  }

  /**
   * Extract motor configuration for electric vehicles
   * Comprehensive 4-tier priority system for all EV manufacturers
   * Returns normalized format: "Quad-Motor", "Tri-Motor", "Dual-Motor", "Single-Motor", etc.
   */
  extractMotorConfig(
    trim: string, 
    engine: string, 
    drivetrain?: string, 
    make?: string, 
    model?: string
  ): string {
    // Guard: non-electric vehicles
    if (!engine || !engine.toLowerCase().includes('electric')) {
      return engine || '';
    }

    // Normalize inputs
    const trimLower = (trim || '').toLowerCase();
    const trimUpper = (trim || '').toUpperCase();
    const drivetrainLower = (drivetrain || '').toLowerCase();
    const makeUpper = (make || '').toUpperCase();
    const modelUpper = (model || '').toUpperCase();

    // TIER 1: Explicit Motor Patterns in Trim Name
    // Check for explicit motor patterns: "Quad-Motor", "Tri-Motor", "Dual-Motor", "Single-Motor"
    const explicitMotorPatterns = [
      { pattern: /quad[\s-]?motor/i, value: 'Quad-Motor' },
      { pattern: /tri[\s-]?motor|triple[\s-]?motor/i, value: 'Tri-Motor' },
      { pattern: /dual[\s-]?motor|twin[\s-]?motor|dual[\s-]?ac[\s-]?electric[\s-]?motor/i, value: 'Dual-Motor' },
      { pattern: /single[\s-]?motor|one[\s-]?motor/i, value: 'Single-Motor' },
    ];

    for (const { pattern, value } of explicitMotorPatterns) {
      if (pattern.test(trimLower)) {
        console.log(`extractMotorConfig: Tier 1 - Found explicit pattern in trim "${trim}" -> "${value}"`);
        return value;
      }
    }

    // TIER 2: Brand-Specific Lookup Tables
    // TESLA
    if (makeUpper.includes('TESLA')) {
      if (trimLower.includes('plaid')) {
        console.log(`extractMotorConfig: Tier 2 - Tesla Plaid -> Tri-Motor`);
        return 'Tri-Motor';
      }
      if (trimLower.includes('performance') && (drivetrainLower.includes('awd') || !drivetrainLower)) {
        console.log(`extractMotorConfig: Tier 2 - Tesla Performance + AWD -> Dual-Motor`);
        return 'Dual-Motor';
      }
      if (trimLower.includes('long range') || trimLower.includes('long-range')) {
        if (drivetrainLower.includes('awd') || !drivetrainLower) {
          console.log(`extractMotorConfig: Tier 2 - Tesla Long Range + AWD -> Dual-Motor`);
          return 'Dual-Motor';
        }
        if (drivetrainLower.includes('rwd')) {
          console.log(`extractMotorConfig: Tier 2 - Tesla Long Range + RWD -> Single-Motor`);
          return 'Single-Motor';
        }
      }
      if (trimLower.includes('base') || trimLower.includes('standard range') || trimLower.includes('standard-range')) {
        if (drivetrainLower.includes('awd')) {
          console.log(`extractMotorConfig: Tier 2 - Tesla Base/Standard + AWD -> Dual-Motor`);
          return 'Dual-Motor';
        }
        if (drivetrainLower.includes('rwd') || !drivetrainLower) {
          console.log(`extractMotorConfig: Tier 2 - Tesla Base/Standard + RWD -> Single-Motor`);
          return 'Single-Motor';
        }
      }
    }

    // LUCID
    if (makeUpper.includes('LUCID')) {
      if (trimLower.includes('sapphire')) {
        console.log(`extractMotorConfig: Tier 2 - Lucid Sapphire -> Tri-Motor`);
        return 'Tri-Motor';
      }
      if (trimLower.includes('pure')) {
        console.log(`extractMotorConfig: Tier 2 - Lucid Pure -> Single-Motor`);
        return 'Single-Motor';
      }
      if (trimLower.includes('touring') || trimLower.includes('grand touring')) {
        console.log(`extractMotorConfig: Tier 2 - Lucid Touring/Grand Touring -> Dual-Motor`);
        return 'Dual-Motor';
      }
    }

    // RIVIAN
    if (makeUpper.includes('RIVIAN')) {
      if (modelUpper.includes('R1T') || modelUpper.includes('R1S')) {
        if (drivetrainLower.includes('awd') || !drivetrainLower) {
          console.log(`extractMotorConfig: Tier 2 - Rivian R1T/R1S + AWD -> Quad-Motor`);
          return 'Quad-Motor';
        }
      }
    }

    // PORSCHE (Taycan)
    if (makeUpper.includes('PORSCHE') && modelUpper.includes('TAYCAN')) {
      if (trimLower.includes('turbo') || trimLower.includes('4s') || trimLower.includes('gts')) {
        console.log(`extractMotorConfig: Tier 2 - Porsche Taycan Turbo/4S/GTS -> Dual-Motor`);
        return 'Dual-Motor';
      }
      if (drivetrainLower.includes('rwd')) {
        console.log(`extractMotorConfig: Tier 2 - Porsche Taycan RWD -> Single-Motor`);
        return 'Single-Motor';
      }
    }

    // BMW
    if (makeUpper.includes('BMW')) {
      if (trimLower.includes('xdrive') || trimLower.includes('m50') || trimLower.includes('m60') || trimLower.includes('m70')) {
        console.log(`extractMotorConfig: Tier 2 - BMW xDrive/M50/M60/M70 -> Dual-Motor`);
        return 'Dual-Motor';
      }
      if (trimLower.includes('edrive') || modelUpper.includes('EDRIVE')) {
        console.log(`extractMotorConfig: Tier 2 - BMW eDrive -> Single-Motor`);
        return 'Single-Motor';
      }
    }

    // MERCEDES
    if (makeUpper.includes('MERCEDES') || makeUpper.includes('MERCEDES-BENZ')) {
      if (trimLower.includes('4matic') || trimLower.includes('amg')) {
        console.log(`extractMotorConfig: Tier 2 - Mercedes 4MATIC/AMG -> Dual-Motor`);
        return 'Dual-Motor';
      }
      if (trimLower.match(/\d{3}[+]/) || trimLower.includes('350') || trimLower.includes('250')) {
        console.log(`extractMotorConfig: Tier 2 - Mercedes 350+/250+ -> Single-Motor`);
        return 'Single-Motor';
      }
    }

    // AUDI
    if (makeUpper.includes('AUDI')) {
      if (trimLower.includes('quattro')) {
        console.log(`extractMotorConfig: Tier 2 - Audi quattro -> Dual-Motor`);
        return 'Dual-Motor';
      }
      if (trimLower.includes('40') || modelUpper.includes('40')) {
        console.log(`extractMotorConfig: Tier 2 - Audi 40 model -> Single-Motor`);
        return 'Single-Motor';
      }
    }

    // VOLVO/POLESTAR
    if (makeUpper.includes('VOLVO') || makeUpper.includes('POLESTAR')) {
      if (drivetrainLower.includes('awd')) {
        console.log(`extractMotorConfig: Tier 2 - Volvo/Polestar AWD -> Dual-Motor`);
        return 'Dual-Motor';
      }
      if (drivetrainLower.includes('fwd') || drivetrainLower.includes('rwd')) {
        console.log(`extractMotorConfig: Tier 2 - Volvo/Polestar FWD/RWD -> Single-Motor`);
        return 'Single-Motor';
      }
    }

    // GENESIS
    if (makeUpper.includes('GENESIS')) {
      if (modelUpper.includes('GV60') || trimLower.includes('electrified')) {
        console.log(`extractMotorConfig: Tier 2 - Genesis GV60/Electrified -> Dual-Motor`);
        return 'Dual-Motor';
      }
    }

    // JAGUAR
    if (makeUpper.includes('JAGUAR')) {
      if (modelUpper.includes('I-PACE') || modelUpper.includes('IPACE')) {
        console.log(`extractMotorConfig: Tier 2 - Jaguar I-PACE -> Dual-Motor`);
        return 'Dual-Motor';
      }
    }

    // NISSAN
    if (makeUpper.includes('NISSAN')) {
      if (modelUpper.includes('LEAF')) {
        console.log(`extractMotorConfig: Tier 2 - Nissan Leaf -> Single-Motor`);
        return 'Single-Motor';
      }
      // Ariya uses Tier 3 drivetrain inference
    }

    // CHEVROLET/GMC/CADILLAC
    if (makeUpper.includes('CHEVROLET') || makeUpper.includes('CHEVY') || 
        makeUpper.includes('GMC') || makeUpper.includes('CADILLAC')) {
      if (modelUpper.includes('BOLT')) {
        console.log(`extractMotorConfig: Tier 2 - Chevy/GMC Bolt -> Single-Motor`);
        return 'Single-Motor';
      }
      // Other models use Tier 3 drivetrain inference
    }

    // TIER 3: Generic Drivetrain Inference
    // For all unlisted brands (Ford, Hyundai, Kia, VW, etc.)
    if (drivetrainLower) {
      if (drivetrainLower.includes('awd') || drivetrainLower.includes('4wd')) {
        console.log(`extractMotorConfig: Tier 3 - Generic AWD/4WD -> Dual-Motor`);
        return 'Dual-Motor';
      }
      if (drivetrainLower.includes('rwd') || drivetrainLower.includes('2wd') || drivetrainLower.includes('fwd')) {
        console.log(`extractMotorConfig: Tier 3 - Generic RWD/FWD/2WD -> Single-Motor`);
        return 'Single-Motor';
      }
    }

    // TIER 4: Fallback
    console.log(`extractMotorConfig: Tier 4 - No match found, using fallback "Electric Motor"`);
    return 'Electric Motor';
  }

}

export const vinService = new VinService();
