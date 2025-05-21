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
  workoutProgress,
} = Constants.expoConfig.extra;

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const { user } = useUser();
  const [caloriesToday, setCaloriesToday] = useState(0);
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [userName, setUserName] = useState("");

  const todayDate = new Date().toISOString().split("T")[0];
  const todayDayOfWeek = new Date().getDay();

  useEffect(() => {
    if (!user) return;

    async function loadDashboardData() {
      try {
        // 1. Load user's name from UserProfiles
        const profileRes = await databases.listDocuments(
          appwriteDatabaseId,
          userProfiles,
          [Query.equal("userId", user.$id)]
        );
        if (profileRes.documents.length > 0) {
          setUserName(profileRes.documents[0].name);
        }

        // 2. Load calories for today
        const nutritionRes = await databases.listDocuments(
          appwriteDatabaseId,
          nutritionProgress,
          [Query.equal("userId", user.$id), Query.equal("date", todayDate)]
        );
        if (nutritionRes.documents.length > 0) {
          setCaloriesToday(nutritionRes.documents[0].caloriesConsumed);
        }

        // 3. Load today’s workout schedule
        const workoutRes = await databases.listDocuments(
          appwriteDatabaseId,
          workoutSchedules,
          [Query.equal("dayOfWeek", todayDayOfWeek)]
        );
        if (workoutRes.documents.length > 0) {
          setTodayWorkout(workoutRes.documents[0]);
        }

        // 4. Weekly workout progress
        const progressRes = await databases.listDocuments(
          appwriteDatabaseId,
          workoutProgress,
          [Query.equal("userId", user.$id)]
        );
        const week = progressRes.documents.filter(doc => {
          const d = new Date(doc.date);
          const now = new Date();
          const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          return d >= startOfWeek;
        });

        setWeeklyProgress(week);
      } catch (err) {
        console.error("Dashboard data error:", err.message);
      }
    }

    loadDashboardData();
  }, [user]);

  return (
    <DashboardContext.Provider value={{ userName, caloriesToday, todayWorkout, weeklyProgress }}>
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardContext;
