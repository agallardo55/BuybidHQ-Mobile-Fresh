
import { NHTSATransmissionData } from "../types.ts";

export function extractTransmissionInfo(results: any[]): NHTSATransmissionData {
  const transmissionInfo: NHTSATransmissionData = {};
  const transmissionFields = new Set([
    'Transmission Style',
    'Number of Forward Gears',
    'Transmission Control Type',
    'Transmission Type',
    'Transmission Manufacturer',
    'Transmission Short Name'
  ]);
  
  console.log('Extracting transmission data from NHTSA results');
  
  // Log all transmission-related fields for debugging
  results.forEach(result => {
    if (transmissionFields.has(result.Variable)) {
      console.log(`Found transmission field: ${result.Variable} = ${result.Value}`);
    }
  });
  
  for (const result of results) {
    if (result?.Value) {
      // Accept any non-empty value, even if it's "Not Applicable"
      switch (result.Variable) {
        case 'Transmission Style':
          transmissionInfo.style = result.Value;
          console.log('Found transmission style:', result.Value);
          break;
        case 'Number of Forward Gears':
          transmissionInfo.speeds = result.Value;
          console.log('Found transmission speeds:', result.Value);
          break;
        case 'Transmission Control Type':
          transmissionInfo.type = result.Value;
          console.log('Found transmission control type:', result.Value);
          break;
        case 'Transmission Type':
          // If we don't have a style yet, use this as backup
          if (!transmissionInfo.style) {
            transmissionInfo.style = result.Value;
            console.log('Using transmission type as style:', result.Value);
          }
          break;
        case 'Transmission Short Name':
          // Use this if we don't have enough info yet
          if (!transmissionInfo.style && !transmissionInfo.type) {
            transmissionInfo.style = result.Value;
            console.log('Using transmission short name:', result.Value);
          }
          break;
      }
    }
  }
  
  console.log('Final transmission info:', transmissionInfo);
  return transmissionInfo;
}

export function formatTransmissionString(nhtsaData: NHTSATransmissionData): string {
  const parts = [];
  
  if (nhtsaData.speeds) {
    parts.push(`${nhtsaData.speeds}-Speed`);
  }
  
  if (nhtsaData.style) {
    // Clean up common transmission terms
    const style = nhtsaData.style
      .replace('Transmission', '')
      .replace('TRANSMISSION', '')
      .trim();
    if (style) {
      parts.push(style);
    }
  }
  
  if (nhtsaData.type && !parts.some(part => part.toLowerCase().includes(nhtsaData.type!.toLowerCase()))) {
    parts.push(`(${nhtsaData.type})`);
  }
  
  const transmissionString = parts.join(' ').trim();
  console.log('Formatted transmission string:', transmissionString);
  return transmissionString;
}
