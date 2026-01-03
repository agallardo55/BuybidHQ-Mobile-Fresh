
import { useState } from "react";

export type FormStep = "appearance" | "condition" | "book-values" | "buyers";

export const useFormNavigation = () => {
  const [currentStep, setCurrentStep] = useState<FormStep>("appearance");
  const [isAddBuyerOpen, setIsAddBuyerOpen] = useState(false);

  const progressMap = {
    "appearance": 25,
    "condition": 50,
    "book-values": 75,
    "buyers": 100
  };

  const handleNext = () => {
    switch (currentStep) {
      case "appearance":
        setCurrentStep("condition");
        break;
      case "condition":
        setCurrentStep("book-values");
        break;
      case "book-values":
        setCurrentStep("buyers");
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case "condition":
        setCurrentStep("appearance");
        break;
      case "book-values":
        setCurrentStep("condition");
        break;
      case "buyers":
        setCurrentStep("book-values");
        break;
      default:
        break;
    }
  };

  return {
    currentStep,
    setCurrentStep,
    isAddBuyerOpen,
    setIsAddBuyerOpen,
    progressMap,
    handleNext,
    handleBack
  };
};
