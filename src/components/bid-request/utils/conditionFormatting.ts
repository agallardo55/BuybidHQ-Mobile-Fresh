
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

  return (map as Record<string, string>)[value] || value;
};
