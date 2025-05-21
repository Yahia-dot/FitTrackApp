import { useContext } from "react";
import { WorkoutPlansContext } from "../contexts/WorkoutPlansContext";

export function useWorkoutPlans() {
  const context = useContext(WorkoutPlansContext);
  
  if (!context) {
    throw new Error("useWorkoutPlans must be used within a WorkoutPlansProvider");
  }
  
  return context;
}