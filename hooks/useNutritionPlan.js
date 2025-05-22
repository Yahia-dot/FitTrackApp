import { useContext } from "react"
import NutritionPlanContext from "../contexts/NutritionPlanContext"

export const useNutritionPlan = () => {
  const context = useContext(NutritionPlanContext)

  if (!context) {
    throw new Error("useNutritionPlan must be used within a NutritionPlanProvider")
  }

  return context
}
