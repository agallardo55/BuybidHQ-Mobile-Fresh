
type ConditionType = 'windshield' | 'engineLights' | 'brakesTires' | 'maintenance';

const displayMaps = {
  windshield: {
    clear: "Clear",
    chips: "Chips",
    smallCracks: "Small cracks",
    largeCracks: "Large cracks"
  },
  engineLights: {
    none: "None",
    engine: "Engine Light",
    maintenance: "Maintenance Required",
    multiple: "Multiple"
  },
  brakesTires: {
    acceptable: "Acceptable",
    replaceFront: "Replace front",
    replaceRear: "Replace rear",
    replaceAll: "Replace all"
  },
  maintenance: {
    upToDate: "Up to date",
    basicService: "Basic service needed",
    minorService: "Minor service needed",
    majorService: "Major service needed"
  }
};

export const getConditionDisplay = (value: string | undefined, type: ConditionType): string => {
  if (!value) {
    return type === 'windshield' ? "Clear" :
           type === 'engineLights' ? "None" :
           type === 'brakesTires' ? "Acceptable" :
           "Up to date";
  }

  const map = type === 'brakesTires' ? displayMaps.brakesTires :
              type === 'maintenance' ? displayMaps.maintenance :
              type === 'engineLights' ? displayMaps.engineLights :
              displayMaps.windshield;

  return (map as Record<string, string>)[value] || value;
};
