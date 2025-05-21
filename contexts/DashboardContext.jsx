import { createContext, useState, useEffect } from "react"
import { databases } from "../lib/appwrite"
import { useUser } from "../hooks/useUser"
import { Query } from "appwrite"

const DATABASE_ID = "YOUR_DATABASE_ID"
const DashboardContext = createContext()

export const DashboardProvider = ({ children }) => {
  const { user } = useUser()
  const [caloriesToday, setCaloriesToday] = useState(0)
  const [todayWorkout, setTodayWorkout] = useState(null)
  const [weeklyProgress, setWeeklyProgress] = useState([])

  const todayDate = new Date().toISOString().split("T")[0] // e.g., 2025-05-21
  const todayDayOfWeek = new Date().getDay() // Sunday = 0

  useEffect(() => {
    if (!user) return

    async function loadDashboardData() {
      try {
        // 1. Load calories for today
        const nutritionRes = await databases.listDocuments(
          DATABASE_ID,
          "NutritionProgress",
          [Query.equal("userId", user.$id), Query.equal("date", todayDate)]
        )
        if (nutritionRes.documents.length > 0) {
          setCaloriesToday(nutritionRes.documents[0].caloriesConsumed)
        }

        // 2. Load today’s workout schedule
        const workoutRes = await databases.listDocuments(
          DATABASE_ID,
          "WorkoutSchedules",
          [Query.equal("dayOfWeek", todayDayOfWeek)]
        )
        if (workoutRes.documents.length > 0) {
          setTodayWorkout(workoutRes.documents[0])
        }

        // 3. Weekly workout progress
        const progressRes = await databases.listDocuments(
          DATABASE_ID,
          "WorkoutProgress",
          [Query.equal("userId", user.$id)]
        )

        // Filter current week only (simplified logic)
        const week = progressRes.documents.filter(doc => {
          const d = new Date(doc.date)
          const now = new Date()
          return d >= new Date(now.setDate(now.getDate() - now.getDay())) // start of week
        })

        setWeeklyProgress(week)
      } catch (err) {
        console.error(err.message)
      }
    }

    loadDashboardData()
  }, [user])

  return (
    <DashboardContext.Provider value={{ caloriesToday, todayWorkout, weeklyProgress }}>
      {children}
    </DashboardContext.Provider>
  )
}

export default DashboardContext
