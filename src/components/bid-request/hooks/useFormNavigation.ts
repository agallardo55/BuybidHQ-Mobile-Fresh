
import { useState } from "react";

export type FormStep = "basic-info" | "appearance" | "condition" | "book-values" | "buyers";

export const useFormNavigation = () => {
  const [currentStep, setCurrentStep] = useState<FormStep>("basic-info");
  const [isAddBuyerOpen, setIsAddBuyerOpen] = useState(false);
  
  const progressMap = {
    "basic-info": 20,
    "appearance": 40,
    "condition": 60,
    "book-values": 80,
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
      case "appearance":
        setCurrentStep("basic-info");
        break;
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
