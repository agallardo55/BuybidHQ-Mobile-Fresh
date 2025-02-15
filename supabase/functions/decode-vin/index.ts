import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuration for exotic cars
const exoticCarConfigs = {
  'porsche': {
    '911': {
      'turbo': {
        engineDescription: '3.7L H6 Twin-Turbo',
        transmission: '8-speed PDK',
        drivetrain: 'AWD',
      },
      'carrera': {
        engineDescription: '3.0L H6 Twin-Turbo',
        transmission: '8-speed PDK',
        drivetrain: 'RWD',
      },
      'carrera_4': {
        engineDescription: '3.0L H6 Twin-Turbo',
        transmission: '8-speed PDK',
        drivetrain: 'AWD',
      },
      'gt3': {
        engineDescription: '4.0L H6',
        transmission: '7-speed PDK',
        drivetrain: 'RWD',
      }
    },
    'taycan': {
      engineDescription: 'All-Electric',
      type: 'BEV',
      transmission: '2-speed automatic',
      drivetrain: 'AWD',
    },
    'cayman': {
      engineDescription: '2.0L H4 Turbo',
      transmission: '7-speed PDK',
      drivetrain: 'RWD',
    },
    'boxster': {
      engineDescription: '2.0L H4 Turbo',
      transmission: '7-speed PDK',
      drivetrain: 'RWD',
    },
    'macan': {
      engineDescription: '2.0L I4 Turbo',
      transmission: '7-speed PDK',
      drivetrain: 'AWD',
    },
    'cayenne': {
      engineDescription: '3.0L V6 Turbo',
      transmission: '8-speed Tiptronic S',
      drivetrain: 'AWD',
    },
    'panamera': {
      engineDescription: '2.9L V6 Twin-Turbo',
      transmission: '8-speed PDK',
      drivetrain: 'RWD',
    }
  },
  'lamborghini': {
    'huracan': {
      engineDescription: '5.2L V10',
      transmission: '7-speed LDF dual-clutch',
      drivetrain: 'AWD',
    },
    'urus': {
      engineDescription: '4.0L V8 Twin-Turbo',
      transmission: '8-speed automatic',
      drivetrain: 'AWD',
    },
    'aventador': {
      engineDescription: '6.5L V12',
      transmission: '7-speed ISR',
      drivetrain: 'AWD',
    }
  }
};

// Configuration for electric vehicles
const electricVehicleConfigs = {
  'tesla': {
    'model_3': {
      engineDescription: 'All-Electric',
      type: 'BEV',
      transmission: 'Single-speed automatic',
      drivetrain: 'RWD/AWD',
    },
    'model_s': {
      engineDescription: 'All-Electric',
      type: 'BEV',
      transmission: 'Single-speed automatic',
      drivetrain: 'AWD',
    },
    'model_x': {
      engineDescription: 'All-Electric',
      type: 'BEV',
      transmission: 'Single-speed automatic',
      drivetrain: 'AWD',
    },
    'model_y': {
      engineDescription: 'All-Electric',
      type: 'BEV',
      transmission: 'Single-speed automatic',
      drivetrain: 'AWD',
    }
  },
  'porsche': {
    'taycan': {
      engineDescription: 'All-Electric',
      type: 'BEV',
      transmission: '2-speed automatic',
      drivetrain: 'AWD',
    }
  },
  'rivian': {
    'r1t': {
      engineDescription: 'Quad-Motor Electric',
      type: 'BEV',
      transmission: 'Single-speed automatic',
      drivetrain: 'AWD',
    },
    'r1s': {
      engineDescription: 'Quad-Motor Electric',
      type: 'BEV',
      transmission: 'Single-speed automatic',
      drivetrain: 'AWD',
    }
  }
};

// Configuration for hybrid vehicles with manufacturer-specific patterns
const hybridConfigs = {
  'phev': {
    engineSuffix: 'Plug-in Hybrid',
    type: 'PHEV',
    transmissionDefault: 'CVT',
    patterns: {
      model: ['30e', '45e', 'te', 'e-hybrid', 'phev'],
      description: ['plug-in hybrid', 'plug in hybrid', 'plugin hybrid', 'phev', 'e-drive', 'edrive']
    }
  },
  'hev': {
    engineSuffix: 'Hybrid',
    type: 'HEV',
    transmissionDefault: 'CVT',
    patterns: {
      model: ['hybrid', 'h'],
      description: ['hybrid', 'hev']
    }
  },
  'mhev': {
    engineSuffix: 'Mild Hybrid',
    type: 'MHEV',
    transmissionDefault: 'Automatic',
    patterns: {
      model: ['mhev'],
      description: ['mild hybrid', 'mhev', 'mild-hybrid']
    }
  }
};

// Helper function to check if a string matches any pattern from an array
const matchesAnyPattern = (text: string, patterns: string[]): boolean => {
  if (!text) return false;
  const normalizedText = text.toLowerCase();
  return patterns.some(pattern => normalizedText.includes(pattern.toLowerCase()));
};

// Helper function to detect hybrid type from model name
const detectHybridFromModel = (model: string): { type: 'PHEV' | 'HEV' | 'MHEV' | null, config: typeof hybridConfigs[keyof typeof hybridConfigs] | null } => {
  if (!model) return { type: null, config: null };
  
  const modelLower = model.toLowerCase();
  
  // Check for PHEV first (most specific)
  if (hybridConfigs.phev.patterns.model.some(pattern => modelLower.includes(pattern))) {
    return { type: 'PHEV', config: hybridConfigs.phev };
  }

  // Check for MHEV
  if (hybridConfigs.mhev.patterns.model.some(pattern => modelLower.includes(pattern))) {
    return { type: 'MHEV', config: hybridConfigs.mhev };
  }

  // Check for regular HEV
  if (hybridConfigs.hev.patterns.model.some(pattern => modelLower.includes(pattern))) {
    return { type: 'HEV', config: hybridConfigs.hev };
  }

  return { type: null, config: null };
};

// Helper function to detect hybrid type
const detectHybridType = (specs: any): { type: 'PHEV' | 'HEV' | 'MHEV' | null, config: typeof hybridConfigs[keyof typeof hybridConfigs] | null } => {
  if (!specs) return { type: null, config: null };

  console.log('Analyzing specs for hybrid detection:', {
    make: specs.make,
    model: specs.model,
    trim: specs.trim,
    specs: specs.specs
  });

  // First check if it's a pure EV
  if (specs?.model?.toLowerCase().includes('taycan') ||
      specs?.make?.toLowerCase() === 'tesla' ||
      specs?.model?.toLowerCase().includes(' ev ')) {
    console.log('Pure EV detected, skipping hybrid classification');
    return { type: null, config: null };
  }

  // Check model name first for hybrid indicators
  const modelResult = detectHybridFromModel(specs.model);
  if (modelResult.type) {
    console.log('Hybrid detected from model name:', modelResult.type);
    return modelResult;
  }

  // Collect all relevant descriptions
  const descriptions = [
    specs?.description,
    specs?.specs?.engine_description,
    specs?.specs?.electrification_level,
    specs?.specs?.other_engine_info,
    ...((specs?.trims || []).map(trim => trim.description))
  ].filter(Boolean).map(desc => desc.toLowerCase());

  console.log('Analyzing descriptions for hybrid indicators:', descriptions);

  // Check for BMW specific patterns
  if (specs.make?.toLowerCase() === 'bmw' && 
      (specs.model?.toLowerCase().includes('e') || 
       descriptions.some(desc => desc.includes('edrive')))) {
    console.log('BMW PHEV detected via model suffix or eDrive');
    return { type: 'PHEV', config: hybridConfigs.phev };
  }

  // Check specifications for electrification level
  if (specs.specs?.electrification_level) {
    const electrification = specs.specs.electrification_level.toLowerCase();
    if (electrification.includes('phev') || electrification.includes('plug-in')) {
      console.log('PHEV detected via electrification level');
      return { type: 'PHEV', config: hybridConfigs.phev };
    }
    if (electrification.includes('mhev') || electrification.includes('mild')) {
      console.log('MHEV detected via electrification level');
      return { type: 'MHEV', config: hybridConfigs.mhev };
    }
    if (electrification.includes('hev') || electrification.includes('hybrid')) {
      console.log('HEV detected via electrification level');
      return { type: 'HEV', config: hybridConfigs.hev };
    }
  }

  // Check descriptions against patterns
  for (const desc of descriptions) {
    // Check PHEV first (most specific)
    if (matchesAnyPattern(desc, hybridConfigs.phev.patterns.description)) {
      console.log('PHEV detected via description patterns');
      return { type: 'PHEV', config: hybridConfigs.phev };
    }
    
    // Check MHEV
    if (matchesAnyPattern(desc, hybridConfigs.mhev.patterns.description)) {
      console.log('MHEV detected via description patterns');
      return { type: 'MHEV', config: hybridConfigs.mhev };
    }
    
    // Check regular HEV
    if (matchesAnyPattern(desc, hybridConfigs.hev.patterns.description)) {
      console.log('HEV detected via description patterns');
      return { type: 'HEV', config: hybridConfigs.hev };
    }
  }

  console.log('No hybrid type detected');
  return { type: null, config: null };
};

// Helper function to identify electric vehicles by VIN
const getElectricVehicleConfig = (vin: string, make: string, model: string) => {
  // Common EV VIN patterns
  if (vin.startsWith('5YJ')) { // Tesla
    make = 'tesla';
    // Map Tesla model codes to names
    const modelMap: { [key: string]: string } = {
      'S': 'model_s',
      'X': 'model_x',
      '3': 'model_3',
      'Y': 'model_y'
    };
    // Extract model code from VIN position 4
    const modelCode = vin.charAt(3);
    model = modelMap[modelCode] || model.toLowerCase().replace(' ', '_');
  } else if (vin.startsWith('WP0')) { // Porsche
    make = 'porsche';
    if (model.toLowerCase().includes('taycan')) {
      model = 'taycan';
    }
  }

  if (electricVehicleConfigs[make.toLowerCase()]?.[model.toLowerCase()]) {
    return electricVehicleConfigs[make.toLowerCase()][model.toLowerCase()];
  }

  // Check if it's an EV by description even if not in our configs
  if (model.toLowerCase().includes('electric') || 
      make.toLowerCase() === 'tesla' || 
      model.toLowerCase().includes('ev')) {
    return {
      engineDescription: 'All-Electric',
      type: 'BEV',
      transmission: 'Single-speed automatic',
      drivetrain: 'AWD'
    };
  }

  return null;
};

// Helper function to identify exotic cars by VIN
const getExoticCarConfig = (vin: string, make: string, model: string) => {
  // Porsche VIN patterns
  if (vin.startsWith('WP0')) {
    make = 'porsche';
    const porscheInfo = decodePorscheVin(vin);
    model = porscheInfo.model;
    
    if (model === 'unknown') {
      return null;
    }

    const baseConfig = exoticCarConfigs[make.toLowerCase()]?.[model.toLowerCase()];
    
    // If it's a 911, check for specific variant
    if (model === '911' && porscheInfo.variant) {
      return exoticCarConfigs[make.toLowerCase()][model.toLowerCase()][porscheInfo.variant];
    }
    
    return baseConfig;
  }

  // Lamborghini VIN patterns
  if (vin.startsWith('ZHW')) {
    make = 'lamborghini';
    // Specific Lamborghini model identification
    if (vin.includes('UF5')) { // Huracán pattern
      model = 'huracan';
    } else if (vin.includes('UF1')) { // Aventador pattern
      model = 'aventador';
    } else if (vin.includes('UR2')) { // Urus pattern
      model = 'urus';
    }
  }

  if (exoticCarConfigs[make.toLowerCase()]?.[model.toLowerCase()]) {
    return exoticCarConfigs[make.toLowerCase()][model.toLowerCase()];
  }
  return null;
};

// Helper function to detect hybrid vehicles
const isHybridVehicle = (specs: any): boolean => {
  // First check if it's a pure EV
  if (specs?.model?.toLowerCase().includes('taycan') ||
      specs?.make?.toLowerCase() === 'tesla' ||
      specs?.model?.toLowerCase().includes('ev')) {
    return false;
  }
  
  const hybridKeywords = ['hybrid', 'phev', 'plug-in'];
  
  // Check various fields for hybrid indicators
  const descriptions = [
    specs?.description,
    specs?.specs?.engine_description,
    ...((specs?.trims || []).map(trim => trim.description))
  ].filter(Boolean).map(desc => desc.toLowerCase());

  return descriptions.some(desc => 
    hybridKeywords.some(keyword => desc.includes(keyword))
  );
};

// Helper function to format displacement
const formatDisplacement = (displacement: string | null): string => {
  if (!displacement) return '';
  const value = parseFloat(displacement);
  if (isNaN(value)) return '';
  return `${value.toFixed(1)}L`;
}

// Helper function to determine engine configuration
const determineEngineConfiguration = (specs: any): string => {
  console.log('Raw engine specs:', JSON.stringify(specs, null, 2));
  
  // First try to get engine info from trim descriptions
  if (specs.trims && specs.trims.length > 0) {
    console.log('Checking trim descriptions for engine info');
    
    // Sort trims by name to prioritize "Base" trim first as it's typically most accurate
    const sortedTrims = [...specs.trims].sort((a, b) => {
      if (a.name === "Base") return -1;
      if (b.name === "Base") return 1;
      return 0;
    });

    for (const trim of sortedTrims) {
      if (trim.description) {
        console.log('Analyzing trim description:', trim.description);
        const desc = trim.description.toLowerCase();
        
        // Look for specific engine configurations in trim description
        if (desc.includes('2.0l 4cyl') || desc.includes('2.0l i4') || desc.includes('2.0 i4')) {
          console.log('Found 2.0L 4-cylinder configuration in trim');
          return 'I';
        }
        
        if (desc.includes('inline') || desc.includes(' i4') || desc.includes('i-4')) {
          console.log('Found inline-4 indicator in trim');
          return 'I';
        }
        
        if (desc.includes(' v6') || desc.includes('v-6')) {
          console.log('Found V6 indicator in trim');
          return 'V';
        }
        
        if (desc.includes(' v8') || desc.includes('v-8')) {
          console.log('Found V8 indicator in trim');
          return 'V';
        }
      }
    }
  }

  // If we couldn't determine from trims, check engine specs
  console.log('Checking engine specifications');
  
  const engineData = {
    configuration: specs.specs?.engine_configuration,
    cylinders: specs.specs?.engine_number_of_cylinders,
    displacement: specs.specs?.displacement_l,
    description: specs.specs?.description,
    engineDescription: specs.specs?.engine_description,
  };
  
  console.log('Engine data:', engineData);

  // Check explicit configuration first
  if (engineData.configuration) {
    const config = engineData.configuration.toLowerCase();
    if (config.includes('inline')) return 'I';
    if (config.includes('v')) return 'V';
  }

  // Common engine configurations based on displacement and cylinders
  const displacement = parseFloat(engineData.displacement || '0');
  const cylinders = parseInt(engineData.cylinders || '0');

  console.log('Analyzing displacement and cylinders:', { displacement, cylinders });

  // 2.0L engines are typically inline-4
  if (displacement === 2.0 || (displacement > 1.9 && displacement < 2.1)) {
    console.log('2.0L engine detected, likely inline-4');
    return 'I';
  }

  // Most 4-cylinder engines are inline
  if (cylinders === 4) {
    console.log('4-cylinder engine, using inline configuration');
    return 'I';
  }

  // Most 6+ cylinder engines are V configuration
  if (cylinders >= 6) {
    console.log('6+ cylinder engine, using V configuration');
    return 'V';
  }

  // Default to inline for 4 or fewer cylinders, V for more
  console.log('Using fallback configuration logic');
  return cylinders <= 4 ? 'I' : 'V';
}

// Helper function to detect turbo
const isTurboEngine = (specs: any): boolean => {
  if (!specs) return false;
  
  // Check trims first for turbo information
  if (specs.trims && specs.trims.length > 0) {
    for (const trim of specs.trims) {
      if (trim.description && 
          trim.description.toLowerCase().includes('turbo')) {
        return true;
      }
    }
  }
  
  if (specs.specs?.turbo === true) return true;
  
  const descriptions = [
    specs.specs?.engine_description,
    specs.specs?.description,
    specs.specs?.trim_description
  ].filter(Boolean);
  
  for (const desc of descriptions) {
    if (desc.toLowerCase().includes('turbo') || 
        desc.toLowerCase().includes('turbocharged')) {
      return true;
    }
  }
  
  return false;
}

// Helper function to format engine description
const formatEngineDescription = (specs: any): string => {
  console.log('Starting engine description formatting for:', specs?.make, specs?.model);

  // Check for electric vehicle configuration
  const evConfig = getElectricVehicleConfig(specs.vin, specs.make, specs.model);
  if (evConfig) {
    console.log('Found electric vehicle configuration:', evConfig);
    return evConfig.engineDescription;
  }

  // Check for exotic car configuration
  const exoticConfig = getExoticCarConfig(specs.vin, specs.make, specs.model);
  if (exoticConfig) {
    console.log('Found exotic car configuration:', exoticConfig);
    return exoticConfig.engineDescription;
  }

  // Check for hybrid
  const { type, config } = detectHybridType(specs);
  if (type && config) {
    console.log(`Detected ${type} vehicle`);
    const baseEngine = formatBaseEngineDescription(specs);
    return baseEngine ? `${baseEngine} ${config.engineSuffix}` : config.engineSuffix;
  }

  return formatBaseEngineDescription(specs);
};

// Helper function to format base engine description
const formatBaseEngineDescription = (specs: any): string => {
  if (!specs) {
    console.log('No specs provided to formatBaseEngineDescription');
    return "Engine information not available";
  }

  // Try to get cylinder count from trim description first
  let cylinders = null;
  if (specs.trims && specs.trims.length > 0) {
    const baseTrims = specs.trims.filter(trim => 
      trim.description && trim.description.toLowerCase().includes('2.0l 4cyl'));
    if (baseTrims.length > 0) {
      cylinders = 4;
    }
  }

  // Fallback to specs data if needed
  if (!cylinders && specs.specs?.engine_number_of_cylinders) {
    cylinders = parseInt(specs.specs.engine_number_of_cylinders);
  }

  if (!cylinders) {
    console.log('No valid cylinder count found');
    return "Engine information not available";
  }

  const configuration = determineEngineConfiguration(specs);
  const displacementStr = formatDisplacement(specs.specs?.displacement_l);
  const isTurbo = isTurboEngine(specs);

  let baseDescription = '';
  if (displacementStr) {
    baseDescription = `${displacementStr} ${configuration}${cylinders}`;
  } else {
    baseDescription = `${configuration}${cylinders}`;
  }

  return isTurbo ? `${baseDescription} Turbo` : baseDescription;
};

// Helper function to clean up drivetrain value
const cleanDrivetrain = (driveType: string | null, make?: string, model?: string, vin?: string): string => {
  // Check for electric or exotic vehicle configurations first
  const evConfig = vin && make && model ? getElectricVehicleConfig(vin, make, model) : null;
  if (evConfig) {
    return evConfig.drivetrain;
  }

  const exoticConfig = vin && make && model ? getExoticCarConfig(vin, make, model) : null;
  if (exoticConfig) {
    return exoticConfig.drivetrain;
  }

  if (!driveType) return "";
  
  // Common mappings for drive types
  const driveTypeMap: { [key: string]: string } = {
    'AWD/All-Wheel Drive': 'AWD',
    'FWD/Front-Wheel Drive': 'FWD',
    'RWD/Rear-Wheel Drive': 'RWD',
    '4WD/Four-Wheel Drive': '4WD'
  };

  // Check if we have a direct mapping
  for (const [key, value] of Object.entries(driveTypeMap)) {
    if (driveType.includes(key)) {
      return value;
    }
  }

  // If no direct mapping, try to extract common abbreviations
  const driveTypeLC = driveType.toUpperCase();
  if (driveTypeLC.includes('AWD')) return 'AWD';
  if (driveTypeLC.includes('FWD')) return 'FWD';
  if (driveTypeLC.includes('RWD')) return 'RWD';
  if (driveTypeLC.includes('4WD')) return '4WD';

  // Return the original value if no matches found
  return driveType;
};

// Helper function to clean up transmission value
const cleanTransmission = (transmission: string | null, make?: string, model?: string, vin?: string): string => {
  // Check for electric or exotic vehicle configurations first
  const evConfig = vin && make && model ? getElectricVehicleConfig(vin, make, model) : null;
  if (evConfig) {
    return evConfig.transmission;
  }

  const exoticConfig = vin && make && model ? getExoticCarConfig(vin, make, model) : null;
  if (exoticConfig) {
    return exoticConfig.transmission;
  }

  if (!transmission) return "";
  return transmission;
};

// Helper function to decode Porsche VIN
const decodePorscheVin = (vin: string): { model: string; variant?: string } => {
  // Position 4-6 contains model series information
  const modelCode = vin.substring(3, 6);
  
  // Common Porsche model codes
  const modelMap: { [key: string]: { model: string; variant?: string } } = {
    'AD2': { model: '911', variant: 'turbo' },  // 911 Turbo
    'AD1': { model: '911', variant: 'carrera' }, // 911 Carrera
    'AD3': { model: '911', variant: 'gt3' },    // 911 GT3
    'AX1': { model: 'taycan' },
    'AC2': { model: 'cayman' },
    'AC1': { model: 'boxster' },
    'AY1': { model: 'cayenne' },
    'AA1': { model: 'panamera' },
    'AX2': { model: 'macan' }
  };

  return modelMap[modelCode] || { model: 'unknown' };
};

// Helper function to decode VIN with NHTSA
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
    console.log('NHTSA API Response:', JSON.stringify(data, null, 2));

    if (!data.Results || data.Results.length === 0) {
      return null;
    }

    const results = data.Results.reduce((acc: { [key: string]: string }, item: any) => {
      if (item.Value && item.Value !== "Not Applicable") {
        acc[item.Variable] = item.Value;
      }
      return acc;
    }, {});

    console.log('Processed NHTSA Results:', results);

    return {
      year: results.ModelYear || "",
      make: results.Make || "",
      model: results.Model || "",
      trim: results.Trim || "",
      engineCylinders: formatEngineInfo(results),
      transmission: formatTransmission(results),
      drivetrain: formatDrivetrain(results),
      isExotic: isExoticVehicle(results.Make, results.Model)
    };
  } catch (error) {
    console.error('Error fetching from NHTSA:', error);
    return null;
  }
}

function formatEngineInfo(results: any): string {
  const displacement = results.DisplacementL ? `${results.DisplacementL}L` : '';
  const cylinders = results.EngineCylinders ? `${results.EngineCylinders}` : '';
  const configuration = results.EngineConfiguration || '';
  const turbo = results.Turbo === 'Yes' ? 'Turbo' : '';
  
  const parts = [displacement, configuration, cylinders].filter(Boolean);
  const base = parts.join(' ').trim();
  
  return base ? (turbo ? `${base} ${turbo}` : base) : '';
}

function formatTransmission(results: any): string {
  const speed = results.TransmissionSpeeds || '';
  const type = results.TransmissionStyle || '';
  return `${speed} ${type}`.trim();
}

function formatDrivetrain(results: any): string {
  const driveType = results.DriveType;
  if (!driveType) return '';
  
  const driveTypeMap: { [key: string]: string } = {
    'Front-Wheel Drive': 'FWD',
    'Rear-Wheel Drive': 'RWD',
    'All-Wheel Drive': 'AWD',
    '4-Wheel Drive': '4WD'
  };

  return driveTypeMap[driveType] || driveType;
}

function isExoticVehicle(make: string, model: string): boolean {
  const exoticMakes = ['Porsche', 'Ferrari', 'Lamborghini', 'McLaren', 'Aston Martin'];
  return exoticMakes.includes(make);
}

// Enhanced vehicle data by combining NHTSA and exotic car data
function enhanceVehicleData(nhtsaData: any, vin: string) {
  if (!nhtsaData) return null;

  // For exotic vehicles, enhance with our detailed configurations
  if (nhtsaData.isExotic) {
    const exoticConfig = getExoticCarConfig(vin, nhtsaData.make, nhtsaData.model);
    if (exoticConfig) {
      return {
        ...nhtsaData,
        engineCylinders: exoticConfig.engineDescription || nhtsaData.engineCylinders,
        transmission: exoticConfig.transmission || nhtsaData.transmission,
        drivetrain: exoticConfig.drivetrain || nhtsaData.drivetrain
      };
    }
  }

  // Check for electric vehicles
  const evConfig = getElectricVehicleConfig(vin, nhtsaData.make, nhtsaData.model);
  if (evConfig) {
    return {
      ...nhtsaData,
      engineCylinders: evConfig.engineDescription,
      transmission: evConfig.transmission,
      drivetrain: evConfig.drivetrain
    };
  }

  return nhtsaData;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vin } = await req.json();
    console.log('Processing VIN:', vin);

    if (!vin || typeof vin !== 'string' || vin.length !== 17) {
      console.error('Invalid VIN format:', vin);
      return new Response(
        JSON.stringify({ error: 'Invalid VIN provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // First, try NHTSA decoder
    let vehicleData = await decodeVinWithNHTSA(vin);
    console.log('Initial NHTSA decode result:', vehicleData);

    if (!vehicleData) {
      console.log('NHTSA decode failed, falling back to CarAPI');
      // Fallback to existing CarAPI implementation
      const apiKey = Deno.env.get('CARAPI_KEY');
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'API configuration error' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      const apiUrl = `https://carapi.app/api/vin/${vin}?api_token=${apiKey}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (response.status === 404) {
        return new Response(
          JSON.stringify({ 
            error: 'VIN not found',
            message: 'Vehicle information not found in any database. Please enter details manually.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      if (!response.ok) {
        throw new Error(`CarAPI error: ${response.status}`);
      }

      // Format CarAPI data using existing logic
      vehicleData = {
        year: data.year?.toString() || "",
        make: data.make || "",
        model: data.model || "",
        trim: data.trims?.[0]?.name || "",
        engineCylinders: formatEngineDescription(data),
        transmission: cleanTransmission(data.specs?.transmission_style),
        drivetrain: cleanDrivetrain(data.specs?.drive_type)
      };
    }

    // Enhance the data with exotic/special vehicle information
    const enhancedData = enhanceVehicleData(vehicleData, vin);
    console.log('Final enhanced vehicle data:', enhancedData);

    return new Response(
      JSON.stringify(enhancedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
