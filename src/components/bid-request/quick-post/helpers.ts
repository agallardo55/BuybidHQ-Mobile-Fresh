
import React from "react";

// Helper function to format and validate VIN input
export const formatVin = (input: string): string => {
  // Remove any non-alphanumeric characters
  const formattedVin = input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  // Limit to 17 characters
  return formattedVin.slice(0, 17);
};

// Helper function to format mileage input
export const formatMileage = (value: string): string => {
  const numericValue = value.replace(/[^0-9]/g, '');
  
  // Format with commas for thousands
  let formattedValue = numericValue;
  if (numericValue) {
    formattedValue = Number(numericValue).toLocaleString('en-US', {
      maximumFractionDigits: 0,
      useGrouping: true
    });
  }
  
  return formattedValue;
};

// Helper function to create a synthetic event
export const createSyntheticEvent = (
  e: React.ChangeEvent<HTMLInputElement>,
  value: string
): React.ChangeEvent<HTMLInputElement> => {
  return {
    ...e,
    target: {
      ...e.target,
      value
    }
  };
};
