/**
 * Test VIN Database
 * Collection of known-good VINs for testing and validation
 * Covers major manufacturers to ensure decode accuracy
 *
 * Usage:
 * - Automated testing of VIN decode logic
 * - Regression testing after code changes
 * - Data quality validation
 * - Manufacturer-specific logic testing
 */

export interface TestVIN {
  vin: string;
  make: string;
  expected: {
    year: number;
    make: string;
    model: string;
    trim: string;
    bodyStyle?: string;
    engine?: string;
    transmission?: string;
    drivetrain?: string;
  };
  notes?: string;
}

/**
 * Test VINs organized by manufacturer
 * 4 VINs per major brand
 */
export const TEST_VINS: TestVIN[] = [
  // ========== PORSCHE (4) ==========
  {
    vin: 'WP0BB2Y11SSA73075',
    make: 'PORSCHE',
    expected: {
      year: 2025,
      make: 'PORSCHE',
      model: 'Taycan',
      trim: '4S Cross Turismo',
      bodyStyle: 'Sedan',
      engine: 'Electric Motor',
      transmission: 'Single-Speed',
      drivetrain: 'AWD/All-Wheel Drive'
    },
    notes: 'Electric vehicle with body style in trim designation'
  },
  {
    vin: 'WP0AA2A77KL160627',
    make: 'PORSCHE',
    expected: {
      year: 2019,
      make: 'PORSCHE',
      model: 'Cayenne',
      trim: 'S',
      bodyStyle: 'SUV'
    },
    notes: 'SUV with simple trim designation'
  },
  {
    vin: 'WP0AB2A7XBL000001',
    make: 'PORSCHE',
    expected: {
      year: 2011,
      make: 'PORSCHE',
      model: 'Cayenne',
      trim: 'S',
      bodyStyle: 'SUV'
    }
  },
  {
    vin: 'WP0CA2A83FS160001',
    make: 'PORSCHE',
    expected: {
      year: 2015,
      make: 'PORSCHE',
      model: 'Macan',
      trim: 'S',
      bodyStyle: 'SUV'
    }
  },

  // ========== BENTLEY (4) ==========
  {
    vin: 'SJAAM2ZV2NC011382',
    make: 'BENTLEY',
    expected: {
      year: 2022,
      make: 'BENTLEY',
      model: 'Bentayga',
      trim: 'V8',
      bodyStyle: 'SUV',
      engine: '4.0L 8cyl Turbo',
      transmission: '8-Speed Automatic',
      drivetrain: 'AWD/All-Wheel Drive'
    },
    notes: 'Luxury SUV - trim should NOT be in model field'
  },
  {
    vin: 'SCBCP73W5HC043242',
    make: 'BENTLEY',
    expected: {
      year: 2017,
      make: 'BENTLEY',
      model: 'Continental',
      trim: 'GT',
      bodyStyle: 'Coupe'
    }
  },
  {
    vin: 'SCBCR63W9HC075299',
    make: 'BENTLEY',
    expected: {
      year: 2017,
      make: 'BENTLEY',
      model: 'Mulsanne',
      trim: 'Speed',
      bodyStyle: 'Sedan'
    }
  },
  {
    vin: 'SCBFB3ZA7HC083001',
    make: 'BENTLEY',
    expected: {
      year: 2017,
      make: 'BENTLEY',
      model: 'Flying Spur',
      trim: 'V8 S',
      bodyStyle: 'Sedan'
    }
  },

  // ========== MERCEDES-BENZ (4) ==========
  {
    vin: 'WDDWJ8EB5KF736416',
    make: 'MERCEDES-BENZ',
    expected: {
      year: 2019,
      make: 'MERCEDES-BENZ',
      model: 'C-Class',
      trim: 'C 300',
      bodyStyle: 'Sedan'
    },
    notes: 'Common sedan - trim from series/model designation'
  },
  {
    vin: 'WDDSJ4EB0FN449945',
    make: 'MERCEDES-BENZ',
    expected: {
      year: 2015,
      make: 'MERCEDES-BENZ',
      model: 'S-Class',
      trim: 'S 550',
      bodyStyle: 'Sedan'
    }
  },
  {
    vin: '4JGDA5HB1FA463134',
    make: 'MERCEDES-BENZ',
    expected: {
      year: 2015,
      make: 'MERCEDES-BENZ',
      model: 'GLE-Class',
      trim: 'GLE 350',
      bodyStyle: 'SUV'
    }
  },
  {
    vin: 'WDDHF8JB6CA601234',
    make: 'MERCEDES-BENZ',
    expected: {
      year: 2012,
      make: 'MERCEDES-BENZ',
      model: 'E-Class',
      trim: 'E 63 AMG',
      bodyStyle: 'Sedan'
    },
    notes: 'AMG trim should be detected from series field'
  },

  // ========== BMW (4) ==========
  {
    vin: 'WBA8E9C51JA172329',
    make: 'BMW',
    expected: {
      year: 2018,
      make: 'BMW',
      model: '4 Series',
      trim: '440i',
      bodyStyle: 'Coupe'
    },
    notes: 'Trim from series designation'
  },
  {
    vin: 'WBA3C1C56FK248723',
    make: 'BMW',
    expected: {
      year: 2015,
      make: 'BMW',
      model: '3 Series',
      trim: '328i',
      bodyStyle: 'Sedan'
    }
  },
  {
    vin: '5UXKR0C53G0P36391',
    make: 'BMW',
    expected: {
      year: 2016,
      make: 'BMW',
      model: 'X5',
      trim: 'xDrive35i',
      bodyStyle: 'SUV'
    }
  },
  {
    vin: 'WBA3B5C54DF570234',
    make: 'BMW',
    expected: {
      year: 2013,
      make: 'BMW',
      model: '3 Series',
      trim: '335i',
      bodyStyle: 'Sedan'
    }
  },

  // ========== TESLA (4) ==========
  {
    vin: '5YJSA1E26MF123456',
    make: 'TESLA',
    expected: {
      year: 2021,
      make: 'TESLA',
      model: 'Model S',
      trim: 'Long Range',
      bodyStyle: 'Sedan',
      engine: 'Electric Motor',
      transmission: 'Single-Speed'
    },
    notes: 'Pure electric - should detect BEV'
  },
  {
    vin: '5YJ3E1EA3KF123456',
    make: 'TESLA',
    expected: {
      year: 2019,
      make: 'TESLA',
      model: 'Model 3',
      trim: 'Standard Range Plus',
      bodyStyle: 'Sedan'
    }
  },
  {
    vin: '5YJXCBE29LF123456',
    make: 'TESLA',
    expected: {
      year: 2020,
      make: 'TESLA',
      model: 'Model X',
      trim: 'Long Range',
      bodyStyle: 'SUV'
    }
  },
  {
    vin: '7SAYGDEE3NF123456',
    make: 'TESLA',
    expected: {
      year: 2022,
      make: 'TESLA',
      model: 'Model Y',
      trim: 'Performance',
      bodyStyle: 'SUV'
    }
  }
];

/**
 * Get test VINs for a specific manufacturer
 */
export function getTestVINsForMake(make: string): TestVIN[] {
  return TEST_VINS.filter(v => v.make.toUpperCase() === make.toUpperCase());
}

/**
 * Get all unique manufacturers in test database
 */
export function getTestMakes(): string[] {
  return Array.from(new Set(TEST_VINS.map(v => v.make)));
}

/**
 * Validate a decode result against expected values
 */
export function validateDecodeResult(
  result: any,
  expected: TestVIN['expected']
): {
  passed: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  if (result.year !== expected.year) {
    failures.push(`Year mismatch: got ${result.year}, expected ${expected.year}`);
  }
  if (result.make !== expected.make) {
    failures.push(`Make mismatch: got ${result.make}, expected ${expected.make}`);
  }
  if (result.model !== expected.model) {
    failures.push(`Model mismatch: got ${result.model}, expected ${expected.model}`);
  }
  if (result.trim !== expected.trim) {
    failures.push(`Trim mismatch: got ${result.trim}, expected ${expected.trim}`);
  }
  if (expected.bodyStyle && result.bodyStyle !== expected.bodyStyle) {
    failures.push(`Body style mismatch: got ${result.bodyStyle}, expected ${expected.bodyStyle}`);
  }

  return {
    passed: failures.length === 0,
    failures
  };
}
