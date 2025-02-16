
import { NHTSAEngineData } from "./types.ts";

export function formatNHTSAEngine(engineData: NHTSAEngineData): string {
  if (!engineData.cylinders) return '';

  const parts = [];

  // Add displacement if available (e.g., "3.5L")
  if (engineData.displacement) {
    parts.push(`${engineData.displacement}L`);
  }

  // Add configuration and cylinders (e.g., "V6")
  const config = engineData.configuration === 'V-Shaped' ? 'V' : 
                 engineData.configuration === 'Inline' ? 'I' : '';
  if (config || engineData.cylinders) {
    parts.push(`${config}${engineData.cylinders}`);
  }

  // Add turbo if present
  if (engineData.turbo) {
    parts.push('Turbo');
  }

  return parts.join(' ');
}
