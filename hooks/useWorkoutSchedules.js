import { useContext } from "react";
import { WorkoutSchedulesContext } from "../contexts/WorkoutSchedulesContext";

export function useWorkoutSchedules() {
  const context = useContext(WorkoutSchedulesContext);
  
  if (!context) {
    throw new Error("useWorkoutSchedules must be used within a WorkoutSchedulesProvider");
  }
  
  return context;
}