import { createContext, useState, useEffect } from "react";
import { databases, ID, Permission, Role } from "../lib/appwrite";
import { useUser } from "../hooks/useUser";
import { Query } from "appwrite";
import Constants from "expo-constants";

const {
  appwriteDatabaseId,
  workoutProgress: WORKOUT_COLLECTION,
  nutritionProgress: NUTRITION_COLLECTION,
} = Constants.expoConfig.extra;

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  const { user } = useUser();

  const [workoutProgressData, setWorkoutProgressData] = useState([]);
  const [nutritionProgressData, setNutritionProgressData] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load progress data and compute weekly progress
  async function loadProgressData() {
    if (!user) return;
    setLoading(true);

    try {
      // Workout Progress
      const workoutRes = await databases.listDocuments(
        appwriteDatabaseId,
        WORKOUT_COLLECTION,
        [Query.equal("userId", user.$id)]
      );
      const allWorkouts = workoutRes.documents;
      setWorkoutProgressData(allWorkouts);

      // Weekly filter
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const week = allWorkouts.filter((doc) => {
        const d = new Date(doc.date);
        return d >= startOfWeek;
      });
      setWeeklyProgress(week);

      // Nutrition Progress
      const nutritionRes = await databases.listDocuments(
        appwriteDatabaseId,
        NUTRITION_COLLECTION,
        [Query.equal("userId", user.$id)]
      );
      setNutritionProgressData(nutritionRes.documents);
    } catch (err) {
      console.error("Progress loading error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Create workout progress
  async function createWorkoutProgress(data) {
    try {
      const res = await databases.createDocument(
        appwriteDatabaseId,
        WORKOUT_COLLECTION,
        ID.unique(),
        { ...data, userId: user.$id },
        [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id)),
        ]
      );
      setWorkoutProgressData((prev) => [...prev, res]);
    } catch (err) {
      console.error("Error creating workout progress:", err.message);
      setError(err.message);
    }
  }

  // Update workout progress
  async function updateWorkoutProgress(id, updates) {
    try {
      const res = await databases.updateDocument(
        appwriteDatabaseId,
        WORKOUT_COLLECTION,
        id,
        updates
      );
      setWorkoutProgressData((prev) =>
        prev.map((item) => (item.$id === id ? res : item))
      );
    } catch (err) {
      console.error("Error updating workout progress:", err.message);
      setError(err.message);
    }
  }

  // Delete workout progress
  async function deleteWorkoutProgress(id) {
    try {
      await databases.deleteDocument(appwriteDatabaseId, WORKOUT_COLLECTION, id);
      setWorkoutProgressData((prev) => prev.filter((item) => item.$id !== id));
    } catch (err) {
      console.error("Error deleting workout progress:", err.message);
      setError(err.message);
    }
  }

  // Create nutrition progress
  async function createNutritionProgress(data) {
    try {
      const res = await databases.createDocument(
        appwriteDatabaseId,
        NUTRITION_COLLECTION,
        ID.unique(),
        { ...data, userId: user.$id },
        [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id)),
        ]
      );
      setNutritionProgressData((prev) => [...prev, res]);
    } catch (err) {
      console.error("Error creating nutrition progress:", err.message);
      setError(err.message);
    }
  }

  // Update nutrition progress
  async function updateNutritionProgress(id, updates) {
    try {
      const res = await databases.updateDocument(
        appwriteDatabaseId,
        NUTRITION_COLLECTION,
        id,
        updates
      );
      setNutritionProgressData((prev) =>
        prev.map((item) => (item.$id === id ? res : item))
      );
    } catch (err) {
      console.error("Error updating nutrition progress:", err.message);
      setError(err.message);
    }
  }

  // Delete nutrition progress
  async function deleteNutritionProgress(id) {
    try {
      await databases.deleteDocument(appwriteDatabaseId, NUTRITION_COLLECTION, id);
      setNutritionProgressData((prev) =>
        prev.filter((item) => item.$id !== id)
      );
    } catch (err) {
      console.error("Error deleting nutrition progress:", err.message);
      setError(err.message);
    }
  }

  useEffect(() => {
    loadProgressData();
  }, [user]);

  return (
    <ProgressContext.Provider
      value={{
        workoutProgressData,
        nutritionProgressData,
        weeklyProgress,
        loading,
        error,
        loadProgressData,
        createWorkoutProgress,
        updateWorkoutProgress,
        deleteWorkoutProgress,
        createNutritionProgress,
        updateNutritionProgress,
        deleteNutritionProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export default ProgressContext;
