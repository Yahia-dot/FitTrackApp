import { useContext } from "react";
import { MealSchedulesContext } from "../contexts/MealSchedulesContext";

export function useMealSchedules() {
  const context = useContext(MealSchedulesContext);
  
  if (!context) {
    throw new Error("useMealSchedules must be used within a MealSchedulesProvider");
  }
  
  return context;
}