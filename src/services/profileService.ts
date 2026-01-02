import { UserData } from "@/hooks/useCurrentUser";

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
    (field) => field.value && field.value.trim() !== ''
  );

  const missingFields = requiredFields.filter(
    (field) => !field.value || field.value.trim() === ''
  );

  const percentage = Math.round((completedFields.length / requiredFields.length) * 100);

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

  // Messages based on completion percentage
  if (percentage >= 90) {
    const messages = [
      `${greeting}you're almost there! Just one more step to unlock all features.`,
      `${greeting}finish up your profile to get full access to BuybidHQ.`,
      `So close! Complete your profile to start receiving bids nationwide.`,
      `${greeting}one final detail and you're ready to go!`,
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  if (percentage >= 70) {
    const messages = [
      `${greeting}great progress! Just ${missingFieldsCount} more ${missingFieldsCount === 1 ? 'field' : 'fields'} to complete.`,
      `${greeting}you're ${percentage}% there! Finish your profile to unlock full features.`,
      `Nice work! Add a few more details to access all dealer tools.`,
      `${greeting}almost done! Complete your profile to start bidding.`,
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  if (percentage >= 50) {
    const messages = [
      `${greeting}you're halfway there! Keep going to unlock all features.`,
      `${greeting}finish your dealership details to connect with buyers nationwide.`,
      `Great start! Complete your profile to access full functionality.`,
      `${greeting}add your business details to get started with BuybidHQ.`,
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  if (percentage >= 30) {
    const messages = [
      `${greeting}complete your profile to start receiving competitive bids.`,
      `Get started by adding your dealership details today.`,
      `${greeting}finish setup to unlock access to our buyer network.`,
      `Complete your account to connect with dealers nationwide.`,
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Less than 30% complete
  const messages = [
    `${greeting}let's get your profile set up! Add your dealership details to begin.`,
    `Welcome! Complete your account to start bidding on vehicles.`,
    `${greeting}finish your profile to unlock all BuybidHQ features.`,
    `Get started by completing your dealership information.`,
  ];
  return messages[Math.floor(Math.random() * messages.length)];
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
