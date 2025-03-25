import { TrimOption } from "../types";

/**
 * Removes duplicate trims from the available trims array
 */
export const deduplicateTrims = (trims: TrimOption[]): TrimOption[] => {
  return trims.reduce((acc: TrimOption[], current) => {
    const isDuplicate = acc.some(item => {
      // Consider a trim duplicate if:
      // - Names match exactly OR
      // - Both are "GT3 RS" related
      return item.name === current.name || 
             (item.name === 'GT3 RS' && current.name === 'GT3 RS');
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
  
  // If the description already contains the trim name, don't duplicate it
  if (trim.description.includes(trim.name)) {
    return cleanTrimDescription(trim.description);
  }
  
  // If the name is "GT3 RS" and the description contains "GT3 RS", 
  // just return the cleaned description to avoid duplication
  if (trim.name === 'GT3 RS' && trim.description.includes('GT3 RS')) {
    return cleanTrimDescription(trim.description);
  }
  
  // Otherwise combine the name with the cleaned description
  return `${trim.name} ${cleanTrimDescription(trim.description)}`;
};
