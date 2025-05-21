import { createContext, useEffect, useState } from "react"
import { databases, client } from "../lib/appwrite"
import { ID, Permission, Query, Role } from "appwrite"
import { useUser } from "../hooks/useUser"

const DATABASE_ID = "682c8c930037232d51ff"
const COLLECTION_ID = "682c96c3002e4fb49e19"
const NUTRITION_PLANS_COLLECTION_ID = "682c961e000a03f6901c"

export const MealSchedulesContext = createContext()

export function MealSchedulesProvider({ children }) {
  const [mealSchedules, setMealSchedules] = useState([])
  const [activePlan, setActivePlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useUser()

  // Fetch active nutrition plan
  const fetchActivePlan = async () => {
    if (!user) return null;
    
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        NUTRITION_PLANS_COLLECTION_ID,
        [Query.equal("userId", user.$id)]
      );
      
      if (response.documents.length > 0) {
        // Sort by creation date to get the most recent plan
        const sortedPlans = response.documents.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setActivePlan(sortedPlans[0]);
        return sortedPlans[0];
      } else {
        setActivePlan(null);
        return null;
      }
    } catch (err) {
      console.error("Error fetching active nutrition plan:", err);
      setError("Failed to load your nutrition plan. Please try again later.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch meal schedules for a specific nutrition plan
  const fetchMealSchedules = async (nutritionPlanId = null) => {
    if (!user) return [];
    
    // If no planId provided, use active plan
    if (!nutritionPlanId && activePlan) {
      nutritionPlanId = activePlan.$id;
    } else if (!nutritionPlanId && !activePlan) {
      // Try to fetch active plan first
      const plan = await fetchActivePlan();
      if (plan) {
        nutritionPlanId = plan.$id;
      } else {
        setMealSchedules([]);
        return [];
      }
    }
    
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.equal("nutritionPlanId", nutritionPlanId)]
      );
      
      // Sort by day of week
      const sortedSchedules = response.documents.sort(
        (a, b) => a.dayOfWeek - b.dayOfWeek
      );
      
      setMealSchedules(sortedSchedules);
      return sortedSchedules;
    } catch (err) {
      console.error("Error fetching meal schedules:", err);
      setError("Failed to load your meal schedules. Please try again later.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch meal schedule for a specific date
  const fetchMealScheduleByDate = async (date) => {
    if (!user) return null;
    
    try {
      setLoading(true);
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
      console.error("Error fetching meal schedule by date:", err);
      setError("Failed to load meal schedule for the selected date.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new meal schedule
  const createMealSchedule = async (nutritionPlanId, dayOfWeek, date) => {
    if (!user || !nutritionPlanId) return null;
    
    try {
      setLoading(true);
      
      // Check if a schedule already exists for this date
      const existingSchedule = await fetchMealScheduleByDate(date);
      if (existingSchedule) {
        return existingSchedule; // Return existing schedule instead of creating duplicate
      }
      
      const newScheduleData = {
        nutritionPlanId,
        userId: user.$id,
        dayOfWeek,
        date
      };
      
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        newScheduleData,
        [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id))
        ]
      );
      
      // Update the local state with the new schedule
      setMealSchedules(prevSchedules => [...prevSchedules, response]);
      return response;
    } catch (err) {
      console.error("Error creating meal schedule:", err);
      setError("Failed to create meal schedule. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing meal schedule
  const updateMealSchedule = async (scheduleId, updatedData) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        scheduleId,
        updatedData
      );
      
      // Update the local state with the updated schedule
      setMealSchedules(prevSchedules => 
        prevSchedules.map(schedule => 
          schedule.$id === scheduleId ? response : schedule
        )
      );
      
      return response;
    } catch (err) {
      console.error("Error updating meal schedule:", err);
      setError("Failed to update meal schedule. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a meal schedule
  const deleteMealSchedule = async (scheduleId) => {
    if (!user) return false;
    
    try {
      setLoading(true);
      
      // First, delete all meals associated with this schedule
      // (You'll need to implement a function to delete meals by mealScheduleId in MealsContext)
      
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_ID,
        scheduleId
      );
      
      // Remove the deleted schedule from local state
      setMealSchedules(prevSchedules => 
        prevSchedules.filter(schedule => schedule.$id !== scheduleId)
      );
      
      return true;
    } catch (err) {
      console.error("Error deleting meal schedule:", err);
      setError("Failed to delete meal schedule. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Create a full week of meal schedules
  const createWeeklyMealSchedules = async (nutritionPlanId) => {
    if (!user || !nutritionPlanId) return [];
    
    try {
      setLoading(true);
      const createdSchedules = [];
      
      // Get today's date
      const today = new Date();
      const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Create schedules for the next 7 days
      for (let i = 0; i < 7; i++) {
        // Calculate the date for each day
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Format date as YYYY-MM-DD
        const formattedDate = date.toISOString().split('T')[0];
        
        // Calculate day of week (using 1 = Monday, 7 = Sunday format)
        const dayOfWeek = (currentDay + i) % 7 + 1;
        
        // Create the schedule
        const schedule = await createMealSchedule(
          nutritionPlanId,
          dayOfWeek,
          formattedDate
        );
        
        if (schedule) {
          createdSchedules.push(schedule);
        }
      }
      
      // Update the local state with all new schedules
      setMealSchedules(createdSchedules);
      return createdSchedules;
    } catch (err) {
      console.error("Error creating weekly meal schedules:", err);
      setError("Failed to create weekly meal schedules. Please try again.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get today's meal schedule
  const getTodaysMealSchedule = async () => {
    if (!user) return null;
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    
    return await fetchMealScheduleByDate(dateString);
  };

  // Generate meal schedule for the entire next week
  const generateNextWeekMealSchedules = async (nutritionPlanId) => {
    if (!user || !nutritionPlanId) return [];
    
    try {
      setLoading(true);
      const createdSchedules = [];
      
      // Get today's date
      const today = new Date();
      
      // Start from next week (today + 7 days)
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + 7);
      
      // Create schedules for the next 7 days (a full week)
      for (let i = 0; i < 7; i++) {
        // Calculate the date for each day
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        // Format date as YYYY-MM-DD
        const formattedDate = date.toISOString().split('T')[0];
        
        // Calculate day of week (using 1 = Monday, 7 = Sunday format)
        const dayOfWeek = (date.getDay() + 6) % 7 + 1; // Convert to 1-7 format
        
        // Create the schedule
        const schedule = await createMealSchedule(
          nutritionPlanId,
          dayOfWeek,
          formattedDate
        );
        
        if (schedule) {
          createdSchedules.push(schedule);
        }
      }
      
      return createdSchedules;
    } catch (err) {
      console.error("Error generating next week's meal schedules:", err);
      setError("Failed to generate meal schedules for next week.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Check if user has a meal schedule for today
  const hasTodaysMealSchedule = async () => {
    const todaySchedule = await getTodaysMealSchedule();
    return todaySchedule !== null;
  };

  // Get schedules for the current week
  const getCurrentWeekSchedules = async () => {
    if (!user) return [];
    
    try {
      // Get the start and end dates of the current week
      const today = new Date();
      const startOfWeek = new Date(today);
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Adjust to get Monday as the start of the week
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(today.getDate() - diff);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      // Format dates as YYYY-MM-DD
      const startDate = startOfWeek.toISOString().split('T')[0];
      const endDate = endOfWeek.toISOString().split('T')[0];
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal("userId", user.$id),
          Query.greaterThanEqual("date", startDate),
          Query.lessThanEqual("date", endDate)
        ]
      );
      
      // Sort by date
      const sortedSchedules = response.documents.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      
      return sortedSchedules;
    } catch (err) {
      console.error("Error fetching current week schedules:", err);
      return [];
    }
  };

  // Initial data loading when user changes
  useEffect(() => {
    if (user) {
      fetchActivePlan().then(plan => {
        if (plan) {
          fetchMealSchedules(plan.$id);
        }
      });
    } else {
      setMealSchedules([]);
      setActivePlan(null);
    }
  }, [user]);

  return (
    <MealSchedulesContext.Provider value={{ 
      mealSchedules,
      activePlan,
      loading,
      error,
      fetchActivePlan,
      fetchMealSchedules,
      fetchMealScheduleByDate,
      createMealSchedule,
      updateMealSchedule,
      deleteMealSchedule,
      createWeeklyMealSchedules,
      getTodaysMealSchedule,
      generateNextWeekMealSchedules,
      hasTodaysMealSchedule,
      getCurrentWeekSchedules
    }}>
      {children}
    </MealSchedulesContext.Provider>
  );
}