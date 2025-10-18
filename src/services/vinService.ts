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
}

export interface TrimOption {
  name: string;
  description: string;
  specs: {
    engine: string;
    transmission: string;
    drivetrain: string;
  };
  year: number;
}

export interface VinDecodeResult {
  success: boolean;
  data?: VehicleData;
  error?: string;
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
      const { data: response, error } = await supabase.functions.invoke('decode-vin', {
        body: JSON.stringify({ vin })
      });

      if (error) {
        return {
          success: false,
          error: error.message || "Failed to decode VIN. Please try again."
        };
      }

      if (!response || response.error) {
        return {
          success: false,
          error: response?.error || "No data received from VIN decoder"
        };
      }

      // Transform API response to consistent format
      const vehicleData: VehicleData = this.transformApiResponse(response.data);
      
      return {
        success: true,
        data: vehicleData
      };
    } catch (error) {
      return {
        success: false,
        error: "An unexpected error occurred while decoding VIN"
      };
    }
  }

  /**
   * Transform API response to consistent VehicleData format - MANHEIM STYLE
   */
  private transformApiResponse(apiData: any): VehicleData {
    console.log('transformApiResponse: Raw API data:', apiData);
    console.log('transformApiResponse: Raw API specs:', apiData?.specs);
    console.log('transformApiResponse: Raw API description:', apiData?.description);
    
    const processedTrims = this.processTrims(apiData);
    console.log('transformApiResponse: Processed trims:', processedTrims);
    const selectedTrim = processedTrims[0];
    console.log('transformApiResponse: Selected trim:', selectedTrim);
    
    // Manheim-style formatting
    const manheimModel = this.formatModelManheimStyle(apiData, selectedTrim);
    const manheimTrim = this.formatTrimManheimStyle(selectedTrim, apiData);
    
    const vehicleData = {
      year: (apiData?.year || "").toString(),
      make: (apiData?.make || "").trim(),
      model: manheimModel,
      trim: selectedTrim?.name || "",
      displayTrim: manheimTrim,
      engineCylinders: selectedTrim?.specs?.engine || "",
      transmission: selectedTrim?.specs?.transmission || "",
      drivetrain: selectedTrim?.specs?.drivetrain || "",
      availableTrims: processedTrims
    };
    
    console.log('transformApiResponse: Final vehicle data (Manheim style):', vehicleData);
    return vehicleData;
  }

  /**
   * Format model in Manheim style: MODEL ENGINE_TYPE
   * Example: "RANGE ROVER V8 HYBRID"
   */
  private formatModelManheimStyle(apiData: any, selectedTrim?: TrimOption): string {
    const baseModel = (apiData?.model || "").trim().toUpperCase();
    if (!baseModel) return "";
    
    // Extract engine type from various sources
    let engineType = "";
    
    // Try to get engine type from trim specs
    if (selectedTrim?.specs?.engine) {
      const engine = selectedTrim.specs.engine.toUpperCase();
      if (engine.includes('V8')) engineType = 'V8';
      else if (engine.includes('V6')) engineType = 'V6';
      else if (engine.includes('V12')) engineType = 'V12';
      else if (engine.includes('HYBRID')) engineType = 'HYBRID';
      else if (engine.includes('ELECTRIC')) engineType = 'ELECTRIC';
    }
    
    // Try to extract from description
    if (!engineType && (selectedTrim?.description || apiData?.description)) {
      const description = (selectedTrim?.description || apiData?.description).toUpperCase();
      if (description.includes('V8 HYBRID')) engineType = 'V8 HYBRID';
      else if (description.includes('V8')) engineType = 'V8';
      else if (description.includes('V6')) engineType = 'V6';
      else if (description.includes('HYBRID')) engineType = 'HYBRID';
      else if (description.includes('ELECTRIC')) engineType = 'ELECTRIC';
    }
    
    // Combine model with engine type
    return engineType ? `${baseModel} ${engineType}` : baseModel;
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
   * Process and normalize trim data - UNIFIED APPROACH
   * Handles all vehicle types consistently with comprehensive fallback logic
   */
  private processTrims(apiData: any): TrimOption[] {
    console.log('processTrims: Starting unified processing with API data:', apiData);
    
    // Collect all possible trim sources
    const trimSources: any[] = [];
    
    // Source 1: trims array (specialty cars like McLaren)
    if (apiData?.trims && Array.isArray(apiData.trims)) {
      console.log('processTrims: Found trims array with', apiData.trims.length, 'items');
      trimSources.push(...apiData.trims.map((trim: any) => ({ ...trim, source: 'trims_array' })));
    }
    
    // Source 2: availableTrims array (standard vehicles)
    if (apiData?.availableTrims && Array.isArray(apiData.availableTrims)) {
      console.log('processTrims: Found availableTrims array with', apiData.availableTrims.length, 'items');
      trimSources.push(...apiData.availableTrims.map((trim: any) => ({ ...trim, source: 'available_trims_array' })));
    }
    
    // Source 3: Single trim at top level (some manufacturers)
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
    
    // Source 4: Create trim from top-level data if no trims found
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
        name: this.normalizeTrimName(trimData.name, trimData.description),
        description: trimData.description || "",
        specs: this.extractSpecsWithFallback(trimData, apiData),
        year: trimData.year || Number(apiData.year)
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

}

export const vinService = new VinService();
