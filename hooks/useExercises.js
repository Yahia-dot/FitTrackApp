import { useContext } from "react";
import { ExercisesContext } from "../contexts/ExercisesContext";

export function useExercises() {
  const context = useContext(ExercisesContext);
  
  if (!context) {
    throw new Error("useExercises must be used within a ExercisesProvider");
  }
  
  return context;
}