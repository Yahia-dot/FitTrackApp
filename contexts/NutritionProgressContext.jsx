import { createContext, useEffect, useState } from "react"
import { databases, client } from "../lib/appwrite"
import { ID, Permission, Query, Role } from "appwrite"
import { useUser } from "../hooks/useUser"

const DATABASE_ID = "682c8c930037232d51ff"
const COLLECTION_ID = "682c985500091919d570"
const USER_PROFILES_COLLECTION_ID = "682c8cf9002bca82ad94" 

export const NutritionProgressContext = createContext()

export function NutritionProgressProvider({ children }) {
  const [nutritionProgress, setNutritionProgress] = useState([])
  const [todayProgress, setTodayProgress] = useState(null)
  const [weeklyProgress, setWeeklyProgress] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useUser()

  // Helper function to get formatted date string (YYYY-MM-DD)
  const getFormattedDate = (date = new Date()) => {
    return date.toISOString().split('T')[0];
  };

  // Fetch user's nutrition progress data
  const fetchNutritionProgress = async (limit = 30) => {
    if (!user) return [];
    
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal("userId", user.$id),
          Query.orderDesc("date"),
          Query.limit(limit)
        ]
      );
      
      setNutritionProgress(response.documents);
      return response.documents;
    } catch (err) {
      console.error("Error fetching nutrition progress:", err);
      setError("Failed to load your nutrition progress. Please try again later.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch today's nutrition progress
  const fetchTodayProgress = async () => {
    if (!user) return null;
    
    try {
      setLoading(true);
      const today = getFormattedDate();
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal("userId", user.$id),
          Query.equal("date", today)
        ]
      );
      
      if (response.documents.length > 0) {
        setTodayProgress(response.documents[0]);
        return response.documents[0];
      } else {
        // No progress entry for today yet, create one
        return await createDefaultProgressEntry(today);
      }
    } catch (err) {
      console.error("Error fetching today's nutrition progress:", err);
      setError("Failed to load today's nutrition data. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a default progress entry for a given date
  const createDefaultProgressEntry = async (date) => {
    if (!user) return null;
    
    try {
      // First, get the user's calorie goal from their profile
      const userProfileResponse = await databases.listDocuments(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        [Query.equal("userId", user.$id)]
      );
      
      const dailyCalorieGoal = userProfileResponse.documents.length > 0 
        ? userProfileResponse.documents[0].calorieGoal 
        : 2000; // Default if not set
      
      const newProgressData = {
        userId: user.$id,
        date,
        caloriesConsumed: 0,
        dailyCalorieGoal,
        mealsEaten: 0,
        mealsPlanned: 0
      };
      
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        newProgressData,
        [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id))
        ]
      );
      
      setTodayProgress(response);
      
      // Also add to the nutritionProgress array
      setNutritionProgress(prevProgress => [response, ...prevProgress]);
      
      return response;
    } catch (err) {
      console.error("Error creating default progress entry:", err);
      return null;
    }
  };

  // Fetch weekly nutrition progress
  const fetchWeeklyProgress = async () => {
    if (!user) return [];
    
    try {
      setLoading(true);
      // Calculate dates for the last 7 days
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 6); // Last 7 days including today
      
      const startDate = getFormattedDate(weekAgo);
      const endDate = getFormattedDate(today);
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal("userId", user.$id),
          Query.greaterThanEqual("date", startDate),
          Query.lessThanEqual("date", endDate),
          Query.orderAsc("date")
        ]
      );
      
      setWeeklyProgress(response.documents);
      return response.documents;
    } catch (err) {
      console.error("Error fetching weekly nutrition progress:", err);
      setError("Failed to load your weekly nutrition data. Please try again.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Update nutrition progress for a specific date
  const updateNutritionProgress = async (progressId, updatedData) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        progressId,
        updatedData
      );
      
      // Update local state
      setNutritionProgress(prevProgress => 
        prevProgress.map(progress => 
          progress.$id === progressId ? response : progress
        )
      );
      
      // Update today's progress if it's the same entry
      if (todayProgress && todayProgress.$id === progressId) {
        setTodayProgress(response);
      }
      
      // Update weekly progress if it's in there
      setWeeklyProgress(prevWeekly => 
        prevWeekly.map(progress => 
          progress.$id === progressId ? response : progress
        )
      );
      
      return response;
    } catch (err) {
      console.error("Error updating nutrition progress:", err);
      setError("Failed to update nutrition progress. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Record a meal consumption
  const recordMealConsumption = async (mealCalories, isNewMeal = false) => {
    if (!user) return null;
    
    try {
      // Make sure we have today's progress data
      let progress = todayProgress;
      if (!progress) {
        progress = await fetchTodayProgress();
        if (!progress) {
          throw new Error("Could not create or fetch today's progress");
        }
      }
      
      // Calculate the updated values
      const updatedCaloriesConsumed = progress.caloriesConsumed + mealCalories;
      const updatedMealsEaten = isNewMeal ? progress.mealsEaten + 1 : progress.mealsEaten;
      
      // Update the progress record
      return await updateNutritionProgress(progress.$id, {
        caloriesConsumed: updatedCaloriesConsumed,
        mealsEaten: updatedMealsEaten
      });
    } catch (err) {
      console.error("Error recording meal consumption:", err);
      setError("Failed to update meal consumption. Please try again.");
      return null;
    }
  };

  // Record a new meal planned
  const recordMealPlanned = async () => {
    if (!user) return null;
    
    try {
      // Make sure we have today's progress data
      let progress = todayProgress;
      if (!progress) {
        progress = await fetchTodayProgress();
        if (!progress) {
          throw new Error("Could not create or fetch today's progress");
        }
      }
      
      // Update the progress record
      return await updateNutritionProgress(progress.$id, {
        mealsPlanned: progress.mealsPlanned + 1
      });
    } catch (err) {
      console.error("Error recording meal planned:", err);
      setError("Failed to update meals planned. Please try again.");
      return null;
    }
  };

  // Update daily calorie goal
  const updateDailyCalorieGoal = async (newGoal) => {
    if (!user) return null;
    
    try {
      // Make sure we have today's progress data
      let progress = todayProgress;
      if (!progress) {
        progress = await fetchTodayProgress();
        if (!progress) {
          throw new Error("Could not create or fetch today's progress");
        }
      }
      
      // Also update user's profile with the new goal
      await databases.listDocuments(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        [Query.equal("userId", user.$id)]
      ).then(response => {
        if (response.documents.length > 0) {
          databases.updateDocument(
            DATABASE_ID,
            USER_PROFILES_COLLECTION_ID,
            response.documents[0].$id,
            { calorieGoal: newGoal }
          );
        }
      });
      
      // Update the progress record
      return await updateNutritionProgress(progress.$id, {
        dailyCalorieGoal: newGoal
      });
    } catch (err) {
      console.error("Error updating daily calorie goal:", err);
      setError("Failed to update daily calorie goal. Please try again.");
      return null;
    }
  };

  // Calculate calorie consumption percentage for today
  const calculateCaloriePercentage = () => {
    if (!todayProgress) return 0;
    
    const { caloriesConsumed, dailyCalorieGoal } = todayProgress;
    if (!dailyCalorieGoal || dailyCalorieGoal === 0) return 0;
    
    return Math.min(100, Math.round((caloriesConsumed / dailyCalorieGoal) * 100));
  };

  // Get nutrition progress for a specific date
  const getProgressByDate = async (date) => {
    if (!user) return null;
    
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal("userId", user.$id),
          Query.equal("date", date)
        ]
      );
      
      if (response.documents.length > 0) {
        return response.documents[0];
      } else {
        return null;
      }
    } catch (err) {
      console.error("Error fetching progress by date:", err);
      return null;
    }
  };

  // Get average calories consumed over the last week
  const getWeeklyCalorieAverage = () => {
    if (weeklyProgress.length === 0) return 0;
    
    const totalCalories = weeklyProgress.reduce(
      (sum, progress) => sum + progress.caloriesConsumed, 
      0
    );
    
    return Math.round(totalCalories / weeklyProgress.length);
  };

  // Get the highest calorie day in the last week
  const getHighestCalorieDay = () => {
    if (weeklyProgress.length === 0) return null;
    
    return weeklyProgress.reduce(
      (highest, current) => 
        current.caloriesConsumed > highest.caloriesConsumed ? current : highest,
      weeklyProgress[0]
    );
  };

  // Get the lowest calorie day in the last week
  const getLowestCalorieDay = () => {
    if (weeklyProgress.length === 0) return null;
    
    return weeklyProgress.reduce(
      (lowest, current) => 
        current.caloriesConsumed < lowest.caloriesConsumed ? current : lowest,
      weeklyProgress[0]
    );
  };

  // Calculate streak of days hitting calorie goal
  const calculateCalorieGoalStreak = () => {
    if (nutritionProgress.length === 0) return 0;
    
    // Sort by date in ascending order
    const sortedProgress = [...nutritionProgress].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    
    let streak = 0;
    let currentDate = new Date();
    
    // Start from today and go backwards
    for (let i = sortedProgress.length - 1; i >= 0; i--) {
      const progress = sortedProgress[i];
      const progressDate = new Date(progress.date);
      
      // Check if this is the expected date
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(currentDate.getDate() - streak);
      
      const isExpectedDate = progressDate.toISOString().split('T')[0] === 
                             expectedDate.toISOString().split('T')[0];
      
      if (!isExpectedDate) {
        // Break the streak if we have a gap in dates
        break;
      }
      
      // Check if goal was hit
      const goalHit = progress.caloriesConsumed <= progress.dailyCalorieGoal;
      if (!goalHit) {
        break;
      }
      
      streak++;
    }
    
    return streak;
  };

  // Initial data loading
  useEffect(() => {
    if (user) {
      fetchTodayProgress();
      fetchWeeklyProgress();
      fetchNutritionProgress();
    } else {
      setNutritionProgress([]);
      setTodayProgress(null);
      setWeeklyProgress([]);
    }
  }, [user]);

  return (
    <NutritionProgressContext.Provider value={{ 
      nutritionProgress,
      todayProgress,
      weeklyProgress,
      loading,
      error,
      fetchNutritionProgress,
      fetchTodayProgress,
      fetchWeeklyProgress,
      updateNutritionProgress,
      recordMealConsumption,
      recordMealPlanned,
      updateDailyCalorieGoal,
      calculateCaloriePercentage,
      getProgressByDate,
      getWeeklyCalorieAverage,
      getHighestCalorieDay,
      getLowestCalorieDay,
      calculateCalorieGoalStreak
    }}>
      {children}
    </NutritionProgressContext.Provider>
  );
}