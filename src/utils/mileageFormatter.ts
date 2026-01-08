/**
 * Formats mileage for display, intelligently handling both storage formats:
 * - Values < 1000 are assumed to be stored in thousands (e.g., 25 = 25,000 miles)
 * - Values >= 1000 are assumed to be stored as actual mileage (e.g., 4873 = 4,873 miles)
 *
 * @param mileage - The mileage value (can be string or number)
 * @returns Formatted mileage string with commas (e.g., "25,000")
 */
export const formatMileage = (mileage: string | number | undefined | null): string => {
  if (mileage === undefined || mileage === null || mileage === '') {
    return 'N/A';
  }

  // Convert to number, removing any non-numeric characters
  const mileageStr = typeof mileage === 'string' ? mileage : String(mileage);
  const mileageNum = parseInt(mileageStr.replace(/[^0-9]/g, ''));

  if (isNaN(mileageNum)) {
    return 'N/A';
  }

  // If value is less than 1000, it's stored in thousands - multiply by 1000
  // If value is 1000 or more, it's already the actual mileage
  const actualMileage = mileageNum < 1000 ? mileageNum * 1000 : mileageNum;

  return actualMileage.toLocaleString('en-US');
};
