
import { useState } from "react";

export type FormStep = "basic-info" | "appearance" | "condition" | "buyers";

export const useFormNavigation = () => {
  const [currentStep, setCurrentStep] = useState<FormStep>("basic-info");
  const [isAddBuyerOpen, setIsAddBuyerOpen] = useState(false);
  
  const progressMap = {
    "basic-info": 25,
    "appearance": 50,
    "condition": 75,
    "buyers": 100
  };

  const handleNext = () => {
    switch (currentStep) {
      case "basic-info":
        setCurrentStep("appearance");
        break;
      case "appearance":
        setCurrentStep("condition");
        break;
      case "condition":
        setCurrentStep("buyers");
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case "appearance":
        setCurrentStep("basic-info");
        break;
      case "condition":
        setCurrentStep("appearance");
        break;
      case "buyers":
        setCurrentStep("condition");
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
