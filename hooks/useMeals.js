import { useContext } from "react";
import { MealsContext } from "../contexts/MealsContext";

export function useMeals() {
  const context = useContext(MealsContext);
  
  if (!context) {
    throw new Error("useMeals must be used within a MealsProvider");
  }
  
  return context;
}