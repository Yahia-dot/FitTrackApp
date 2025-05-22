import { createContext, useState, useEffect } from "react"
import { databases } from "../lib/appwrite";
import { ID, Permission, Role } from "appwrite"; // ✅ import these from appwrite directly
import { useUser } from "../hooks/useUser"
import Constants from "expo-constants"
import { Query } from "appwrite"

const {
  appwriteDatabaseId,
  nutritionPlans,
  mealSchedules,
  meals,
  nutritionApiUrl,
} = Constants.expoConfig.extra

const NutritionPlanContext = createContext()

export const NutritionPlanProvider = ({ children }) => {
  const { user } = useUser()

  const [plan, setPlan] = useState(null)
  const [mealsLibrary, setMealsLibrary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load user's nutrition plan from Appwrite
  const fetchPlan = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await databases.listDocuments(
        appwriteDatabaseId,
        nutritionPlans,
        [Query.equal("userId", user.$id)]
      )
      setPlan(res.documents[0] || null)
    } catch (err) {
      console.error("Error loading nutrition plan:", err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Create a new nutrition plan
  const createPlan = async (data) => {
    try {
      const res = await databases.createDocument(
        appwriteDatabaseId,
        nutritionPlans,
        ID.unique(),
        { ...data, userId: user.$id, createdAt: new Date().toISOString() , updatedAt: new Date().toISOString()},
        [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id)),
        ]
      )
      setPlan(res)
      return res
    } catch (err) {
      console.error("Error creating nutrition plan:", err.message)
      setError(err.message)
    }
  }

  // Delete the current plan
  const deletePlan = async () => {
    if (!plan) return
    try {
      await databases.deleteDocument(appwriteDatabaseId, nutritionPlans, plan.$id)
      setPlan(null)
    } catch (err) {
      console.error("Error deleting nutrition plan:", err.message)
      setError(err.message)
    }
  }

  // Fetch meal library from external JSON
  const fetchMealLibrary = async () => {
    setLoading(true)
    try {
      const res = await fetch(nutritionApiUrl)
      const data = await res.json()
      setMealsLibrary(data)
    } catch (err) {
      console.error("Error fetching meals library:", err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Load data on user login
  useEffect(() => {
    if (user) {
      fetchPlan()
      fetchMealLibrary()
    }
  }, [user])

  console.log("ID test", ID.unique()); // ✅ should now print a value!


  return (
    <NutritionPlanContext.Provider
      value={{
        plan,
        mealsLibrary,
        loading,
        error,
        fetchPlan,
        createPlan,
        deletePlan,
      }}
    >
      {children}
    </NutritionPlanContext.Provider>
  )
}

export default NutritionPlanContext
