/**
 * Utility functions for formatting vehicle history display on bid response page
 */

const historyDisplayMap: Record<string, string> = {
  noAccidents: 'No Accidents',
  minorAccident: 'Minor Accident',
  odomError: 'Odometer Discrepancy',
  majorAccident: 'Major Accident',
  brandedIssue: 'Branded Title',
  unknown: 'Unknown'
};

/**
 * Get display text for a history status value
 */
export const getHistoryDisplay = (value: string | undefined): string => {
  if (!value || value === '') return 'Not Specified';
  return historyDisplayMap[value] || value;
};

/**
 * Get the severity color class for a history status
 */
export const getHistorySeverityColor = (value: string | undefined): string => {
  if (!value) return 'text-gray-500';
  
  switch (value) {
    case 'noAccidents':
      return 'text-green-600';
    case 'minorAccident':
    case 'odomError':
      return 'text-yellow-600';
    case 'majorAccident':
    case 'brandedIssue':
      return 'text-red-600';
    default:
      return 'text-gray-500';
  }
};
