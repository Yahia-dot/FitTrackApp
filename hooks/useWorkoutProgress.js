import { useContext } from "react";
import { WorkoutProgressContext } from "../contexts/WorkoutProgressContext";

export function useWorkoutProgress() {
  const context = useContext(WorkoutProgressContext);
  
  if (!context) {
    throw new Error("useWorkoutProgress must be used within a WorkoutProgressProvider");
  }
  
  return context;
}