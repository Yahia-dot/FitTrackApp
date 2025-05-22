import { createContext, useState, useEffect } from "react";
import { databases } from "../lib/appwrite";
import { useUser } from "../hooks/useUser";
import { Query } from "appwrite";
import Constants from "expo-constants";

const {
  appwriteDatabaseId,
  userProfiles,
  nutritionProgress,
  workoutSchedules,
} = Constants.expoConfig.extra;

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const { user } = useUser();
  const [caloriesToday, setCaloriesToday] = useState(0);
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const todayDate = new Date().toISOString().split("T")[0];
  const todayDayOfWeek = new Date().getDay(); // Sunday = 0

  useEffect(() => {
    if (!user) return;

    async function loadDashboardData() {
      setLoading(true);
      try {
        // 1. Load user's name
        const profileRes = await databases.listDocuments(
          appwriteDatabaseId,
          userProfiles,
          [Query.equal("userId", user.$id)]
        );
        if (profileRes.documents.length > 0) {
          setUserName(profileRes.documents[0].name);
        }

        // 2. Load today's calorie progress
        const nutritionRes = await databases.listDocuments(
          appwriteDatabaseId,
          nutritionProgress,
          [
            Query.equal("userId", user.$id),
            Query.equal("date", todayDate),
          ]
        );
        if (nutritionRes.documents.length > 0) {
          setCaloriesToday(nutritionRes.documents[0].caloriesConsumed || 0);
        } else {
          setCaloriesToday(0);
        }

        // 3. Load today’s scheduled workout (based on dayOfWeek)
        const workoutRes = await databases.listDocuments(
          appwriteDatabaseId,
          workoutSchedules,
          [Query.equal("dayOfWeek", todayDayOfWeek)]
        );
        if (workoutRes.documents.length > 0) {
          setTodayWorkout(workoutRes.documents[0]);
        } else {
          setTodayWorkout(null);
        }
      } catch (err) {
        console.error("Dashboard data error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  return (
    <DashboardContext.Provider
      value={{
        userName,
        caloriesToday,
        todayWorkout,
        loading,
        error,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardContext;
