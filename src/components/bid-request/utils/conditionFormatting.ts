
type ConditionType = 'windshield' | 'engineLights' | 'brakesTires' | 'maintenance';

const displayMaps = {
  windshield: {
    notSpecified: "Not Specified",
    clear: "Clear",
    chips: "Chips",
    smallCracks: "Small cracks",
    largeCracks: "Large cracks"
  },
  engineLights: {
    notSpecified: "Not Specified",
    none: "None",
    engine: "Engine Light",
    maintenance: "Maintenance Required",
    multiple: "Multiple"
  },
  brakesTires: {
    notSpecified: "Not Specified",
    acceptable: "Acceptable",
    replaceFront: "Replace front",
    replaceRear: "Replace rear",
    replaceAll: "Replace all"
  },
  maintenance: {
    notSpecified: "Not Specified",
    upToDate: "Up to date",
    basicService: "Basic service needed",
    minorService: "Minor service needed",
    majorService: "Major service needed"
  }
};

export const getConditionDisplay = (value: string | undefined, type: ConditionType): string => {
  if (!value || value === '') {
    return "Not Specified";
  }

  const map = type === 'brakesTires' ? displayMaps.brakesTires :
              type === 'maintenance' ? displayMaps.maintenance :
              type === 'engineLights' ? displayMaps.engineLights :
              displayMaps.windshield;

  // Handle comma-separated values (multiple selections)
  if (value.includes(',')) {
    const values = value.split(',').map(v => v.trim()).filter(Boolean);
    const displays = values.map(v => (map as Record<string, string>)[v] || v);
    return displays.join(', ');
  }

  // Single value
  return (map as Record<string, string>)[value] || value;
};
