import { TrimOption } from "../types";

/**
 * Removes duplicate trims from the available trims array
 * Keeps variants with different wheelbase (LWB/SWB), seating (7 Seats), or body style
 */
export const deduplicateTrims = (trims: TrimOption[]): TrimOption[] => {
  // Guard against null/undefined input
  if (!trims || !Array.isArray(trims)) {
    return [];
  }

  return trims.reduce((acc: TrimOption[], current) => {
    const isDuplicate = acc.some(item => {
      // Names must match to even be considered duplicates
      if (item.name !== current.name) {
        return false;
      }

      // If names match, check if descriptions differ meaningfully
      // Keep both if one has LWB/SWB distinction
      const itemDesc = item.description?.toLowerCase() || '';
      const currentDesc = current.description?.toLowerCase() || '';

      // Wheelbase variants (Land Rover, etc.)
      const itemHasLWB = itemDesc.includes('long wheelbase');
      const currentHasLWB = currentDesc.includes('long wheelbase');
      const itemHasSWB = itemDesc.includes('standard wheelbase') || itemDesc.includes('short wheelbase');
      const currentHasSWB = currentDesc.includes('standard wheelbase') || currentDesc.includes('short wheelbase');

      if ((itemHasLWB !== currentHasLWB) || (itemHasSWB !== currentHasSWB)) {
        return false; // Different wheelbase = not duplicate
      }

      // Seating variants (7 Seats vs 5 Seats)
      const itemHas7Seats = itemDesc.includes('7 seat');
      const currentHas7Seats = currentDesc.includes('7 seat');
      if (itemHas7Seats !== currentHas7Seats) {
        return false; // Different seating = not duplicate
      }

      // Body style variants (Coupe vs Convertible vs Targa)
      const bodyStyles = ['coupe', 'convertible', 'cabriolet', 'targa', 'sedan', 'wagon'];
      const itemBodyStyle = bodyStyles.find(style => itemDesc.includes(style));
      const currentBodyStyle = bodyStyles.find(style => currentDesc.includes(style));
      if (itemBodyStyle && currentBodyStyle && itemBodyStyle !== currentBodyStyle) {
        return false; // Different body style = not duplicate
      }

      // Same name and no meaningful description difference = duplicate
      return true;
    });

    if (!isDuplicate) {
      acc.push(current);
    }
    return acc;
  }, []);
};

/**
 * Cleans a trim description by removing engine specs and unnecessary info
 */
export const cleanTrimDescription = (description: string): string => {
  if (!description) return '';

  // First remove the engine specs within parentheses
  let cleaned = description.replace(/\s*\([^)]*\)/g, '');

  // If the description starts with the trim name, keep it
  // Otherwise use the entire cleaned description
  const parts = cleaned.split(' ');
  if (parts.length > 1) {
    // Keep everything except engine displacement at the end
    cleaned = parts
      .filter(part => !part.match(/^\d+\.?\d*L$/)) // Remove engine displacement
      .join(' ')
      .trim();
  }

  return cleaned;
};

/**
 * Creates a display value for a trim by combining name and description
 */
export const getDisplayValue = (trim: TrimOption): string => {
  // If there's no name or description, return an empty string
  if (!trim.name && !trim.description) return '';
  
  // If we only have a name, return it
  if (trim.name && !trim.description) return trim.name;
  
  // If we only have a description, clean and return it
  if (!trim.name && trim.description) return cleanTrimDescription(trim.description);
  
  // For meaningful trim names (like Autobiography, AMG, GT3 RS, etc.), prioritize the name
  const meaningfulTrimNames = [
    'Autobiography', 'Autobiography Edition', 'AMG', 'GT3 RS', 'GT2 RS', 
    'GTS', 'Turbo', 'Turbo S', 'Sport', 'Luxury', 'Premium', 'Base'
  ];
  
  const isMeaningfulTrim = meaningfulTrimNames.some(meaningfulName => 
    trim.name?.toLowerCase().includes(meaningfulName.toLowerCase())
  );
  
  if (isMeaningfulTrim) {
    return trim.name;
  }
  
  // If the description already contains the trim name, don't duplicate it
  if (trim.description && trim.description.includes(trim.name)) {
    return cleanTrimDescription(trim.description);
  }

  // If the name is "GT3 RS" and the description contains "GT3 RS",
  // just return the cleaned description to avoid duplication
  if (trim.name === 'GT3 RS' && trim.description && trim.description.includes('GT3 RS')) {
    return cleanTrimDescription(trim.description);
  }
  
  // Otherwise combine the name with the cleaned description
  return `${trim.name} ${cleanTrimDescription(trim.description)}`;
};
