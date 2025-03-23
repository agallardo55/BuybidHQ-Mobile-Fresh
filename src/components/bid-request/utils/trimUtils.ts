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
  // If we have both name and description, combine them appropriately
  if (trim.name && trim.description) {
    // If the description already starts with the name, just clean the description
    if (trim.description.startsWith(trim.name)) {
      return cleanTrimDescription(trim.description);
    }
    // Otherwise, combine name with cleaned description
    const cleanedDesc = cleanTrimDescription(trim.description);
    // Avoid duplication if the name is already part of the cleaned description
    if (!cleanedDesc.includes(trim.name)) {
      return `${trim.name} ${cleanedDesc}`;
    }
    return cleanedDesc;
  }
  // Fallback to whatever we have
  return cleanTrimDescription(trim.name || trim.description || '');
};
