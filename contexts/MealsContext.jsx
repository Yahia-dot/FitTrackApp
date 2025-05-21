import { createContext, useEffect, useState } from "react"
import { databases, client } from "../lib/appwrite"
import { ID, Permission, Query, Role } from "appwrite"
import { useUser } from "../hooks/useUser"

const DATABASE_ID = "682c8c930037232d51ff"
const COLLECTION_ID = "682c972f000b70d1eab4"
const MEALS_API_URL = "https://yahia-dot.github.io/mealsLibrary_api/meals.json"

export const MealsContext = createContext()

export function MealsProvider({ children }) {
  const [meals, setMeals] = useState([])
  const [mealLibrary, setMealLibrary] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useUser()

  // Formats Google Drive URLs to direct image URLs
  const formatGoogleDriveLink = (url) => {
    if (!url) return undefined;
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
    return url;
  };

  // Fetch meal library from external API
  const fetchMealLibrary = async () => {
    try {
      setLoading(true);
      const response = await fetch(MEALS_API_URL);
      const data = await response.json();
      
      // Process the data to format images correctly
      const processedData = {};
      Object.keys(data).forEach(mealType => {
        processedData[mealType] = data[mealType].map(meal => ({
          ...meal,
          image: meal.image ? formatGoogleDriveLink(meal.image) : undefined
        }));
      });
      
      setMealLibrary(processedData);
      setError(null);
    } catch (err) {
      console.error("Error fetching meal library:", err);
      setError("Failed to load meal library. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's meals from Appwrite
  const fetchMeals = async (mealScheduleId = null) => {
    if (!user) return;
    
    try {
      setLoading(true);
      let queries = [Query.equal("userId", user.$id)];
      
      if (mealScheduleId) {
        queries.push(Query.equal("mealScheduleId", mealScheduleId));
      }
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        queries
      );
      
      // Sort meals by their time (breakfast first, dinner last)
      const sortedMeals = response.documents.sort((a, b) => {
        const mealOrder = {
          "Breakfast": 1,
          "Snack AM": 2,
          "Lunch": 3,
          "Snack PM": 4,
          "Dinner": 5
        };
        
        return (mealOrder[a.type] || 99) - (mealOrder[b.type] || 99);
      });
      
      setMeals(sortedMeals);
      setError(null);
    } catch (err) {
      console.error("Error fetching meals:", err);
      setError("Failed to load your meals. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Get meals for a specific date
  const fetchMealsByDate = async (date) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // First get meal schedules for the date
      const mealSchedulesResponse = await databases.listDocuments(
        DATABASE_ID,
        "682c93c6001fef723de5", // Your MealSchedules collection ID
        [
          Query.equal("userId", user.$id),
          Query.equal("date", date)
        ]
      );
      
      if (mealSchedulesResponse.documents.length === 0) {
        setMeals([]);
        return [];
      }
      
      // Get schedule IDs
      const scheduleIds = mealSchedulesResponse.documents.map(doc => doc.$id);
      
      // Then get meals for those schedules
      const mealsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.equal("mealScheduleId", scheduleIds)]
      );
      
      // Sort meals by type
      const sortedMeals = mealsResponse.documents.sort((a, b) => {
        const mealOrder = {
          "Breakfast": 1,
          "Snack AM": 2,
          "Lunch": 3,
          "Snack PM": 4,
          "Dinner": 5
        };
        
        return (mealOrder[a.type] || 99) - (mealOrder[b.type] || 99);
      });
      
      setMeals(sortedMeals);
      return sortedMeals;
    } catch (err) {
      console.error("Error fetching meals by date:", err);
      setError("Failed to load meals for the selected date.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create a new meal
  const createMeal = async (mealData) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      
      // Include userId in the meal data
      const newMealData = {
        ...mealData,
        userId: user.$id,
        isEaten: false
      };
      
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        newMealData,
        [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id))
        ]
      );
      
      // Update the local state with the new meal
      setMeals(prevMeals => [...prevMeals, response]);
      return response;
    } catch (err) {
      console.error("Error creating meal:", err);
      setError("Failed to create meal. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing meal
  const updateMeal = async (mealId, updatedData) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        mealId,
        updatedData
      );
      
      // Update the local state with the updated meal
      setMeals(prevMeals => 
        prevMeals.map(meal => 
          meal.$id === mealId ? response : meal
        )
      );
      
      return response;
    } catch (err) {
      console.error("Error updating meal:", err);
      setError("Failed to update meal. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a meal
  const deleteMeal = async (mealId) => {
    if (!user) return false;
    
    try {
      setLoading(true);
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_ID,
        mealId
      );
      
      // Remove the deleted meal from local state
      setMeals(prevMeals => 
        prevMeals.filter(meal => meal.$id !== mealId)
      );
      
      return true;
    } catch (err) {
      console.error("Error deleting meal:", err);
      setError("Failed to delete meal. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle meal eaten status
  const toggleMealEaten = async (mealId, isEaten) => {
    return await updateMeal(mealId, { isEaten });
  };

  // Create multiple meals at once (for creating a full day's meal plan)
  const createMultipleMeals = async (mealsData, mealScheduleId) => {
    if (!user || !mealScheduleId) return [];
    
    try {
      setLoading(true);
      const createdMeals = [];
      
      for (const mealData of mealsData) {
        const newMealData = {
          ...mealData,
          mealScheduleId,
          userId: user.$id,
          isEaten: false
        };
        
        const response = await databases.createDocument(
          DATABASE_ID,
          COLLECTION_ID,
          ID.unique(),
          newMealData,
          [
            Permission.read(Role.user(user.$id)),
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id))
          ]
        );
        
        createdMeals.push(response);
      }
      
      // Update the local state with all new meals
      setMeals(prevMeals => [...prevMeals, ...createdMeals]);
      return createdMeals;
    } catch (err) {
      console.error("Error creating multiple meals:", err);
      setError("Failed to create meals. Please try again.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get meals from library by type (breakfast, lunch, dinner)
  const getMealsByType = (mealType) => {
    return mealLibrary[mealType] || [];
  };

  // Calculate total calories for a day
  const calculateDailyCalories = (mealsArray = null) => {
    const mealsToCalculate = mealsArray || meals;
    
    return mealsToCalculate.reduce((total, meal) => {
      // Only count calories from eaten meals
      if (meal.isEaten) {
        return total + (meal.calories || 0);
      }
      return total;
    }, 0);
  };

  // Get all meal types eaten today
  const getMealsEatenToday = async () => {
    if (!user) return [];
    
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];
      
      const todaysMeals = await fetchMealsByDate(dateString);
      return todaysMeals.filter(meal => meal.isEaten);
    } catch (err) {
      console.error("Error getting meals eaten today:", err);
      return [];
    }
  };

  // Track nutrition progress for today
  const trackNutritionProgress = async () => {
    if (!user) return null;
    
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];
      
      // Get today's meals
      const todaysMeals = await fetchMealsByDate(dateString);
      
      // Calculate calories and count meals
      const caloriesConsumed = calculateDailyCalories(todaysMeals);
      const mealsEaten = todaysMeals.filter(meal => meal.isEaten).length;
      const mealsPlanned = todaysMeals.length;
      
      // Get user's calorie goal (you might store this in UserProfiles)
      const userProfilesResponse = await databases.listDocuments(
        DATABASE_ID,
        "682c8cd600379f70e7c5", // Your UserProfiles collection ID
        [Query.equal("userId", user.$id)]
      );
      
      const dailyCalorieGoal = userProfilesResponse.documents.length > 0 
        ? userProfilesResponse.documents[0].calorieGoal 
        : 2000; // Default if not set
      
      // Check if today's progress already exists
      const existingProgressResponse = await databases.listDocuments(
        DATABASE_ID,
        "682c93da006c1c7e3e7e", // Your NutritionProgress collection ID
        [
          Query.equal("userId", user.$id),
          Query.equal("date", dateString)
        ]
      );
      
      let progressResponse;
      
      if (existingProgressResponse.documents.length > 0) {
        // Update existing progress
        progressResponse = await databases.updateDocument(
          DATABASE_ID,
          "682c93da006c1c7e3e7e", // Your NutritionProgress collection ID
          existingProgressResponse.documents[0].$id,
          {
            caloriesConsumed,
            dailyCalorieGoal,
            mealsEaten,
            mealsPlanned
          }
        );
      } else {
        // Create new progress entry
        progressResponse = await databases.createDocument(
          DATABASE_ID,
          "682c93da006c1c7e3e7e", // Your NutritionProgress collection ID
          ID.unique(),
          {
            userId: user.$id,
            date: dateString,
            caloriesConsumed,
            dailyCalorieGoal,
            mealsEaten,
            mealsPlanned
          },
          [
            Permission.read(Role.user(user.$id)),
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id))
          ]
        );
      }
      
      return progressResponse;
    } catch (err) {
      console.error("Error tracking nutrition progress:", err);
      return null;
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchMealLibrary();
  }, []);

  // Fetch user's meals when user changes
  useEffect(() => {
    if (user) {
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];
      
      fetchMealsByDate(dateString);
    } else {
      setMeals([]);
    }
  }, [user]);

  return (
    <MealsContext.Provider value={{ 
      meals,
      mealLibrary,
      loading,
      error,
      fetchMeals,
      fetchMealsByDate,
      createMeal,
      updateMeal,
      deleteMeal,
      toggleMealEaten,
      createMultipleMeals,
      getMealsByType,
      calculateDailyCalories,
      getMealsEatenToday,
      trackNutritionProgress,
      fetchMealLibrary
    }}>
      {children}
    </MealsContext.Provider>
  );
}