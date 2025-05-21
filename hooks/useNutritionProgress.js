import { useContext } from "react";
import { NutritionProgressContext } from "../contexts/NutritionProgressContext";

export function useNutritionProgress() {
  const context = useContext(NutritionProgressContext);
  
  if (!context) {
    throw new Error("useNutritionProgress must be used within a NutritionProgressProvider");
  }
  
  return context;
}