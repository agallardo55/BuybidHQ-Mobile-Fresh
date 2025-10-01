
type ConditionType = 'windshield' | 'engineLights' | 'brakesTires' | 'maintenance';

const displayMaps = {
  windshield: {
    unknown: "Unknown",
    clear: "Clear",
    chips: "Chips",
    smallCracks: "Small cracks",
    largeCracks: "Large cracks"
  },
  engineLights: {
    unknown: "Unknown",
    none: "None",
    engine: "Engine Light",
    maintenance: "Maintenance Required",
    multiple: "Multiple"
  },
  brakesTires: {
    unknown: "Unknown",
    acceptable: "Acceptable",
    replaceFront: "Replace front",
    replaceRear: "Replace rear",
    replaceAll: "Replace all"
  },
  maintenance: {
    unknown: "Unknown",
    upToDate: "Up to date",
    basicService: "Basic service needed",
    minorService: "Minor service needed",
    majorService: "Major service needed"
  }
};

export const getConditionDisplay = (value: string | undefined, type: ConditionType): string => {
  if (!value) {
    return "Unknown";
  }

  const map = type === 'brakesTires' ? displayMaps.brakesTires :
              type === 'maintenance' ? displayMaps.maintenance :
              type === 'engineLights' ? displayMaps.engineLights :
              displayMaps.windshield;

  return (map as Record<string, string>)[value] || value;
};
