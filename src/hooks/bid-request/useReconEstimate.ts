import { useState, useEffect, useCallback } from "react";
import { logger } from "@/utils/logger";

interface UseReconEstimateProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface UseReconEstimateResult {
  displayValue: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Format a numeric value as a dollar amount
 */
export function formatDollarAmount(value: string | undefined | null): string {
  logger.debug("formatDollarAmount called with:", { value, type: typeof value });

  // Handle undefined, null, or empty cases
  if (value === undefined || value === null || value === "") {
    logger.debug("formatDollarAmount returning $0 for empty/null/undefined");
    return "$0";
  }

  const numericValue = String(value).replace(/\D/g, "");
  logger.debug("formatDollarAmount numeric extraction:", {
    original: value,
    numeric: numericValue,
  });

  if (!numericValue || numericValue === "0") {
    logger.debug("formatDollarAmount returning $0 for zero/empty numeric");
    return "$0";
  }

  const parsedValue = Number(numericValue);
  logger.debug("formatDollarAmount parsed number:", {
    numeric: numericValue,
    parsed: parsedValue,
    isNaN: isNaN(parsedValue),
  });

  if (isNaN(parsedValue)) {
    logger.debug("formatDollarAmount returning $0 for NaN");
    return "$0";
  }

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parsedValue);

  logger.debug("formatDollarAmount final result:", formatted);
  return formatted;
}

/**
 * Hook for managing reconditioning estimate input with currency formatting
 */
export function useReconEstimate({
  value,
  onChange,
}: UseReconEstimateProps): UseReconEstimateResult {
  const [displayValue, setDisplayValue] = useState("$0");

  // Update display value whenever value changes
  useEffect(() => {
    logger.debug("useReconEstimate effect triggered:", {
      value,
      type: typeof value,
    });
    const formatted = formatDollarAmount(value);
    logger.debug("useReconEstimate setting displayValue to:", formatted);
    setDisplayValue(formatted);
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Extract numeric value only
      const rawValue = e.target.value.replace(/[^0-9]/g, "");

      // Create a proper synthetic event that matches the expected format
      const syntheticEvent = {
        target: {
          name: "reconEstimate",
          value: rawValue,
          type: "text",
          id: "reconEstimate",
        },
      } as React.ChangeEvent<HTMLInputElement>;

      // Update form state with raw numeric value
      onChange(syntheticEvent);

      logger.debug("Recon estimate change:", {
        rawValue,
        formattedValue: formatDollarAmount(rawValue),
      });
    },
    [onChange]
  );

  return {
    displayValue,
    handleChange,
  };
}
