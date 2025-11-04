/**
 * Test VIN transformation logic with mock CarAPI responses
 * This tests the model cleaning and engine formatting logic
 */

// Mock transformApiResponse function (simplified version)
function getVehicleType(apiData, selectedTrim) {
  const specs = apiData?.specs || selectedTrim?.specs || {};
  
  const electrificationLevel = (specs.electrification_level || '').toLowerCase();
  if (electrificationLevel.includes('bev') || electrificationLevel === 'electric') {
    return 'BEV';
  }
  if (electrificationLevel.includes('phev') || electrificationLevel.includes('plug-in')) {
    return 'PHEV';
  }
  
  const fuelType = (specs.fuel_type_primary || '').toLowerCase();
  if (fuelType === 'electric' || fuelType.includes('electric')) {
    const hasEngine = specs.engine_number_of_cylinders && 
                     specs.engine_number_of_cylinders !== null &&
                     specs.displacement_l && specs.displacement_l !== null;
    return hasEngine ? 'PHEV' : 'BEV';
  }
  
  const hasNoCylinders = specs.engine_number_of_cylinders === null || 
                         specs.engine_number_of_cylinders === undefined;
  const hasNoDisplacement = !specs.displacement_l || specs.displacement_l === null;
  const hasSingleSpeedTransmission = specs.transmission_speeds === '1';
  
  if (hasNoCylinders && hasNoDisplacement && hasSingleSpeedTransmission) {
    return 'BEV';
  }
  
  const hasEngine = specs.engine_number_of_cylinders && 
                   specs.engine_number_of_cylinders !== null &&
                   specs.displacement_l && specs.displacement_l !== null;
  
  const description = (selectedTrim?.description || apiData?.description || '').toLowerCase();
  const hasElectricMention = description.includes('electric') || 
                             description.includes('phev') ||
                             description.includes('plug-in');
  
  if (hasEngine && hasElectricMention) {
    return 'PHEV';
  }
  
  return 'ICE';
}

function formatModelName(apiData, selectedTrim) {
  let baseModel = (apiData?.model || "").trim().toUpperCase();
  if (!baseModel) return "";
  
  const officialEVModels = [
    'BOLT EV', 'BOLT EUV', 'KONA ELECTRIC', 'NIRO EV', 'EV6',
    'IONIQ ELECTRIC', 'IONIQ 5', 'IONIQ 6', 'ID.4', 'ID.3',
    'ID. BUZZ', 'E-GOLF', 'E-TRON', 'I-PACE', 'POLESTAR 2', 'RIO ELECTRIC'
  ];
  
  const isOfficialEVModel = officialEVModels.some(model => 
    baseModel.includes(model.toUpperCase()) || model.toUpperCase().includes(baseModel)
  );
  
  if (!isOfficialEVModel) {
    const appendedPatterns = [
      /\s+ELECTRIC\s*$/i,
      /\s+BEV\s*$/i,
      /\s+PHEV\s*$/i,
      /\s+HYBRID\s*$/i
    ];
    
    for (const pattern of appendedPatterns) {
      if (pattern.test(baseModel)) {
        baseModel = baseModel.replace(pattern, '').trim();
      }
    }
  }
  
  const vehicleType = getVehicleType(apiData, selectedTrim);
  
  if (vehicleType === 'BEV' || vehicleType === 'PHEV') {
    return baseModel;
  }
  
  // For ICE, might append engine type but simplified here
  return baseModel;
}

function formatEngine(apiData, selectedTrim) {
  const vehicleType = getVehicleType(apiData, selectedTrim);
  
  if (vehicleType === 'BEV') {
    const description = (selectedTrim?.description || apiData?.description || '').toLowerCase();
    const drivetrain = (selectedTrim?.specs?.drivetrain || apiData?.specs?.drive_type || '').toLowerCase();
    
    if (description.includes('quad-motor') || description.includes('quad motor') || 
        description.includes('4-motor') || description.includes('4 motor')) {
      return 'Quad-Motor';
    }
    
    if (description.includes('tri-motor') || description.includes('tri motor') || 
        description.includes('3-motor') || description.includes('3 motor')) {
      return 'Tri-Motor';
    }
    
    const make = (apiData?.make || '').toUpperCase();
    const model = (apiData?.model || '').toUpperCase();
    
    if (make === 'TESLA') {
      if (model.includes('CYBERTRUCK') || 
          (model.includes('MODEL S') && description.includes('plaid'))) {
        return 'Tri-Motor';
      }
      if (model.includes('MODEL 3')) {
        return drivetrain.includes('awd') || description.includes('awd') ? 'Dual-Motor' : 'Single-Motor';
      }
    }
    
    if (make === 'CHEVROLET' && model.includes('BOLT')) {
      return 'Single-Motor';
    }
    
    if (drivetrain.includes('awd') || description.includes('dual-motor')) {
      return 'Dual-Motor';
    }
    
    return 'Electric Motor';
  }
  
  if (vehicleType === 'PHEV') {
    const specs = apiData?.specs || selectedTrim?.specs || {};
    const description = (selectedTrim?.description || apiData?.description || '').toUpperCase();
    
    const displacementMatch = description.match(/(\d+\.?\d*L)/i);
    const cylinderMatch = description.match(/(V\d+|I\d+|INLINE\s*\d+)/i);
    const turboMatch = description.match(/(TURBO)/i);
    
    const parts = [displacementMatch?.[1], cylinderMatch?.[1], turboMatch?.[1]].filter(Boolean);
    const engineInfo = parts.join(' ');
    
    return engineInfo ? `${engineInfo} PHEV` : 'PHEV';
  }
  
  return 'ICE Engine';
}

// Mock CarAPI responses for testing
const mockResponses = [
  {
    name: 'Porsche Taycan (BEV)',
    vin: 'WP0CD2Y18RSA84275',
    apiResponse: {
      year: '2024',
      make: 'PORSCHE',
      model: 'TAYCAN ELECTRIC', // CarAPI might return this
      specs: {
        engine_number_of_cylinders: null,
        displacement_l: null,
        transmission_speeds: '1',
        electrification_level: 'BEV',
        fuel_type_primary: 'Electric'
      },
      description: '2024 Porsche Taycan AWD 4D Hatchback GTS Sport Turismo'
    },
    expected: {
      model: 'TAYCAN',
      engine: 'Dual-Motor',
      type: 'BEV'
    }
  },
  {
    name: 'Chevrolet Bolt EV',
    vin: '1G1FZ6S07L4114449',
    apiResponse: {
      year: '2020',
      make: 'CHEVROLET',
      model: 'BOLT EV', // Official name - should be preserved
      specs: {
        engine_number_of_cylinders: null,
        displacement_l: null,
        transmission_speeds: '1',
        electrification_level: 'BEV',
        fuel_type_primary: 'Electric'
      },
      description: '2020 Chevrolet Bolt EV FWD'
    },
    expected: {
      model: 'BOLT EV',
      engine: 'Single-Motor',
      type: 'BEV'
    }
  },
  {
    name: 'Porsche Cayenne E-Hybrid (PHEV)',
    vin: 'WP1AE2A27LLA12345',
    apiResponse: {
      year: '2023',
      make: 'PORSCHE',
      model: 'CAYENNE',
      specs: {
        engine_number_of_cylinders: '6',
        displacement_l: '3.0',
        transmission_speeds: '8',
        electrification_level: 'PHEV',
        fuel_type_primary: 'Gasoline'
      },
      description: '2023 Porsche Cayenne E-Hybrid 3.0L V6 Turbo AWD'
    },
    expected: {
      model: 'CAYENNE',
      engine: '3.0L V6 Turbo PHEV',
      type: 'PHEV'
    }
  }
];

console.log('🧪 Testing VIN Transformation Logic\n');
console.log('='.repeat(60));

mockResponses.forEach((test, index) => {
  console.log(`\n${index + 1}. ${test.name}`);
  console.log(`   VIN: ${test.vin}`);
  console.log(`   Raw Model: ${test.apiResponse.model}`);
  
  const transformedModel = formatModelName(test.apiResponse, null);
  const engine = formatEngine(test.apiResponse, null);
  const vehicleType = getVehicleType(test.apiResponse, null);
  
  console.log(`   Transformed Model: ${transformedModel}`);
  console.log(`   Engine: ${engine}`);
  console.log(`   Vehicle Type: ${vehicleType}`);
  
  const modelPass = transformedModel === test.expected.model;
  const enginePass = engine.includes(test.expected.engine.split(' ')[0]) || engine === test.expected.engine;
  const typePass = vehicleType === test.expected.type;
  
  console.log(`   Model: ${modelPass ? '✅ PASS' : '❌ FAIL'} (expected: ${test.expected.model})`);
  console.log(`   Engine: ${enginePass ? '✅ PASS' : '❌ FAIL'} (expected: ${test.expected.engine})`);
  console.log(`   Type: ${typePass ? '✅ PASS' : '❌ FAIL'} (expected: ${test.expected.type})`);
  
  const allPass = modelPass && enginePass && typePass;
  console.log(`   Overall: ${allPass ? '✅ PASS' : '❌ FAIL'}`);
});

console.log('\n' + '='.repeat(60));
console.log('\nNote: This tests transformation logic with mock data.');
console.log('To test with actual VINs, decode them in the app and check console logs.');

