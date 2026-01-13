import { UserData } from "@/hooks/useCurrentUser";
import { logger } from "@/utils/logger";

export interface ProfileCompletion {
  percentage: number;
  missingFields: string[];
  completedFields: string[];
}

/**
 * Calculate profile completion percentage based on required fields
 */
export const calculateProfileCompletion = (user: UserData | null): ProfileCompletion => {
  if (!user) {
    return {
      percentage: 0,
      missingFields: [],
      completedFields: [],
    };
  }

  // Define required fields for complete profile
  const requiredFields = [
    { key: 'role', label: 'Role', value: user.role },
    { key: 'full_name', label: 'Full Name', value: user.full_name },
    { key: 'email', label: 'Email', value: user.email },
    { key: 'mobile_number', label: 'Mobile Number', value: user.mobile_number },
    { key: 'dealer_name', label: 'Dealership Name', value: user.dealer_name },
    { key: 'license_number', label: 'License Number', value: user.license_number },
    { key: 'address', label: 'Address', value: user.address },
    { key: 'city', label: 'City', value: user.city },
    { key: 'state', label: 'State', value: user.state },
    { key: 'zip_code', label: 'ZIP Code', value: user.zip_code },
  ];

  const completedFields = requiredFields.filter(
    (field) => field.value && typeof field.value === 'string' && field.value.trim() !== ''
  );

  const missingFields = requiredFields.filter(
    (field) => !field.value || typeof field.value !== 'string' || field.value.trim() === ''
  );

  const percentage = Math.round((completedFields.length / requiredFields.length) * 100);

  // Debug logging - only in development mode
  if (import.meta.env.DEV) {
    logger.debug('📊 Profile Completion Calculation:', {
      userId: user.id, // Don't log email for privacy
      totalFields: requiredFields.length,
      completedCount: completedFields.length,
      missingCount: missingFields.length,
      percentage,
      completed: completedFields.map((f) => f.label),
      missing: missingFields.map((f) => `${f.label} (${f.value === null ? 'null' : f.value === undefined ? 'undefined' : `"${f.value}"`})`),
      allFieldValues: requiredFields.map((f) => ({
        field: f.label,
        key: f.key,
        value: f.value,
        type: typeof f.value,
        isEmpty: !f.value || typeof f.value !== 'string' || f.value.trim() === ''
      }))
    });
  }

  return {
    percentage,
    missingFields: missingFields.map((f) => f.label),
    completedFields: completedFields.map((f) => f.label),
  };
};

/**
 * Generate a personalized motivational message based on completion and user name
 */
export const generateMotivationalMessage = (
  userName: string | null,
  percentage: number,
  missingFieldsCount: number
): string => {
  const firstName = userName?.split(' ')[0] || null;
  const greeting = firstName ? `${firstName}, ` : '';

  // Single consistent message for all completion levels
  return `${greeting}complete your profile to start sending complete bid requests to your buyers.`;
};

/**
 * Get a specific category message (optional - for more targeted messaging)
 */
export const getCategorySpecificMessage = (
  missingFields: string[],
  userName: string | null
): string | null => {
  const firstName = userName?.split(' ')[0] || null;
  const greeting = firstName ? `${firstName}, ` : '';

  // Check which category has the most missing fields
  const personalFields = ['Full Name', 'Email', 'Mobile Number', 'Role'];
  const businessFields = ['Dealership Name', 'License Number', 'Address', 'City', 'State', 'ZIP Code'];

  const missingPersonal = missingFields.filter(f => personalFields.includes(f));
  const missingBusiness = missingFields.filter(f => businessFields.includes(f));

  if (missingPersonal.length > missingBusiness.length) {
    return `${greeting}complete your personal information to continue setup.`;
  }

  if (missingBusiness.length > 0) {
    return `${greeting}add your dealership details to connect with buyers.`;
  }

  return null;
};
