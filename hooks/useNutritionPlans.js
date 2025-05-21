import { useContext } from "react";
import { NutritionPlansContext } from "../contexts/NutritionPlansContext";

export function useNutritionPlans() {
  const context = useContext(NutritionPlansContext);
  
  if (!context) {
    throw new Error("useNutritionPlans must be used within a NutritionPlansProvider");
  }
  
  return context;
}