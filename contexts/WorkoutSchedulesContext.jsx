import { createContext, useEffect, useState } from "react"
import { databases, client } from "../lib/appwrite"
import { ID, Permission, Query, Role } from "appwrite"
import { useUser } from "../hooks/useUser"

const DATABASE_ID = "682c8c930037232d51ff"
const COLLECTION_ID = "682c918200033bb63b15"
const WORKOUT_PLANS_COLLECTION_ID = "682c902e002bb984bc07"

export const WorkoutSchedulesContext = createContext()

export function WorkoutSchedulesProvider({ children }) {
  const [workoutSchedules, setWorkoutSchedules] = useState([])
  const [activePlan, setActivePlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useUser()

  // Fetch active workout plan
  const fetchActivePlan = async () => {
    if (!user) return null;
    
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        WORKOUT_PLANS_COLLECTION_ID,
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
      console.error("Error fetching active workout plan:", err);
      setError("Failed to load your workout plan. Please try again later.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch workout schedules for a specific workout plan
  const fetchWorkoutSchedules = async (workoutPlanId = null) => {
    if (!user) return [];
    
    // If no planId provided, use active plan
    if (!workoutPlanId && activePlan) {
      workoutPlanId = activePlan.$id;
    } else if (!workoutPlanId && !activePlan) {
      // Try to fetch active plan first
      const plan = await fetchActivePlan();
      if (plan) {
        workoutPlanId = plan.$id;
      } else {
        setWorkoutSchedules([]);
        return [];
      }
    }
    
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.equal("workoutPlanId", workoutPlanId)]
      );
      
      // Sort by day of week
      const sortedSchedules = response.documents.sort(
        (a, b) => a.dayOfWeek - b.dayOfWeek
      );
      
      setWorkoutSchedules(sortedSchedules);
      return sortedSchedules;
    } catch (err) {
      console.error("Error fetching workout schedules:", err);
      setError("Failed to load your workout schedules. Please try again later.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch workout schedule for a specific date
  const fetchWorkoutScheduleByDate = async (date) => {
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
      console.error("Error fetching workout schedule by date:", err);
      setError("Failed to load workout schedule for the selected date.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new workout schedule
  const createWorkoutSchedule = async (workoutPlanId, dayOfWeek, title, duration, targetAreas, date, status = "Not Started") => {
    if (!user || !workoutPlanId) return null;
    
    try {
      setLoading(true);
      
      // Check if a schedule already exists for this date
      const existingSchedule = await fetchWorkoutScheduleByDate(date);
      if (existingSchedule) {
        return existingSchedule; // Return existing schedule instead of creating duplicate
      }
      
      const newScheduleData = {
        workoutPlanId,
        userId: user.$id,
        dayOfWeek,
        title,
        duration,
        targetAreas,
        date,
        status
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
      setWorkoutSchedules(prevSchedules => [...prevSchedules, response]);
      return response;
    } catch (err) {
      console.error("Error creating workout schedule:", err);
      setError("Failed to create workout schedule. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing workout schedule
  const updateWorkoutSchedule = async (scheduleId, updatedData) => {
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
      setWorkoutSchedules(prevSchedules => 
        prevSchedules.map(schedule => 
          schedule.$id === scheduleId ? response : schedule
        )
      );
      
      return response;
    } catch (err) {
      console.error("Error updating workout schedule:", err);
      setError("Failed to update workout schedule. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a workout schedule
  const deleteWorkoutSchedule = async (scheduleId) => {
    if (!user) return false;
    
    try {
      setLoading(true);
      
      // First, delete all exercises associated with this schedule
      // (You'll need to implement a function to delete exercises by workoutScheduleId in ExercisesContext)
      
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_ID,
        scheduleId
      );
      
      // Remove the deleted schedule from local state
      setWorkoutSchedules(prevSchedules => 
        prevSchedules.filter(schedule => schedule.$id !== scheduleId)
      );
      
      return true;
    } catch (err) {
      console.error("Error deleting workout schedule:", err);
      setError("Failed to delete workout schedule. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update workout schedule status
  const updateWorkoutStatus = async (scheduleId, status) => {
    return await updateWorkoutSchedule(scheduleId, { status });
  };

  // Create a full week of workout schedules
  const createWeeklyWorkoutSchedules = async (workoutPlanId, workoutData) => {
    if (!user || !workoutPlanId || !workoutData || !workoutData.length) return [];
    
    try {
      setLoading(true);
      const createdSchedules = [];
      
      // Get today's date
      const today = new Date();
      const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Create schedules for each workout day in the data
      for (const workout of workoutData) {
        // Calculate the date for this workout's day of the week
        let targetDay = workout.dayOfWeek - 1; // Convert from 1-7 to 0-6 format
        if (targetDay < 0) targetDay = 6; // Handle Sunday
        
        // Calculate days to add
        let daysToAdd = (targetDay - currentDay + 7) % 7;
        if (daysToAdd === 0) {
          // If it's today, we could either schedule for today or for next week
          // Let's default to today
          daysToAdd = 0;
        }
        
        // Calculate the date
        const date = new Date(today);
        date.setDate(today.getDate() + daysToAdd);
        
        // Format date as YYYY-MM-DD
        const formattedDate = date.toISOString().split('T')[0];
        
        // Create the schedule
        const schedule = await createWorkoutSchedule(
          workoutPlanId,
          workout.dayOfWeek,
          workout.title,
          workout.duration,
          workout.targetAreas,
          formattedDate
        );
        
        if (schedule) {
          createdSchedules.push(schedule);
        }
      }
      
      // Update the local state with all new schedules
      setWorkoutSchedules(createdSchedules);
      return createdSchedules;
    } catch (err) {
      console.error("Error creating weekly workout schedules:", err);
      setError("Failed to create weekly workout schedules. Please try again.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Generate recommended workout splits based on user's plan
  const generateWorkoutSplits = (workoutPlan) => {
    if (!workoutPlan) return [];
    
    const { goal, daysPerWeek } = workoutPlan;
    
    // Define different splits based on goals and days per week
    const workoutSplits = {
      "Build Muscle": {
        2: [
          { dayOfWeek: 1, title: "Upper Body", targetAreas: ["chest", "back", "shoulders", "arms"] },
          { dayOfWeek: 4, title: "Lower Body", targetAreas: ["legs", "glutes", "core"] }
        ],
        3: [
          { dayOfWeek: 1, title: "Push (Chest & Triceps)", targetAreas: ["chest", "shoulders", "triceps"] },
          { dayOfWeek: 3, title: "Pull (Back & Biceps)", targetAreas: ["back", "biceps", "forearms"] },
          { dayOfWeek: 5, title: "Legs & Core", targetAreas: ["legs", "glutes", "core"] }
        ],
        4: [
          { dayOfWeek: 1, title: "Chest & Triceps", targetAreas: ["chest", "triceps"] },
          { dayOfWeek: 2, title: "Back & Biceps", targetAreas: ["back", "biceps"] },
          { dayOfWeek: 4, title: "Legs", targetAreas: ["legs", "glutes"] },
          { dayOfWeek: 5, title: "Shoulders & Core", targetAreas: ["shoulders", "core"] }
        ],
        5: [
          { dayOfWeek: 1, title: "Chest", targetAreas: ["chest"] },
          { dayOfWeek: 2, title: "Back", targetAreas: ["back"] },
          { dayOfWeek: 3, title: "Legs", targetAreas: ["legs", "glutes"] },
          { dayOfWeek: 4, title: "Shoulders", targetAreas: ["shoulders"] },
          { dayOfWeek: 5, title: "Arms & Core", targetAreas: ["biceps", "triceps", "core"] }
        ],
        6: [
          { dayOfWeek: 1, title: "Chest", targetAreas: ["chest"] },
          { dayOfWeek: 2, title: "Back", targetAreas: ["back"] },
          { dayOfWeek: 3, title: "Legs", targetAreas: ["legs", "glutes"] },
          { dayOfWeek: 4, title: "Shoulders", targetAreas: ["shoulders"] },
          { dayOfWeek: 5, title: "Arms", targetAreas: ["biceps", "triceps"] },
          { dayOfWeek: 6, title: "Core & Mobility", targetAreas: ["core", "mobility"] }
        ]
      },
      "Lose Fat": {
        2: [
          { dayOfWeek: 1, title: "Full Body + HIIT", targetAreas: ["full body", "cardio"] },
          { dayOfWeek: 4, title: "Full Body + Cardio", targetAreas: ["full body", "cardio"] }
        ],
        3: [
          { dayOfWeek: 1, title: "Upper Body + HIIT", targetAreas: ["upper body", "cardio"] },
          { dayOfWeek: 3, title: "Lower Body + Cardio", targetAreas: ["lower body", "cardio"] },
          { dayOfWeek: 5, title: "Full Body Circuit", targetAreas: ["full body", "core"] }
        ],
        4: [
          { dayOfWeek: 1, title: "Upper Body + HIIT", targetAreas: ["upper body", "cardio"] },
          { dayOfWeek: 2, title: "Lower Body + Cardio", targetAreas: ["lower body", "cardio"] },
          { dayOfWeek: 4, title: "Full Body + HIIT", targetAreas: ["full body", "cardio"] },
          { dayOfWeek: 5, title: "HIIT & Core", targetAreas: ["cardio", "core"] }
        ],
        5: [
          { dayOfWeek: 1, title: "Upper Body + HIIT", targetAreas: ["upper body", "cardio"] },
          { dayOfWeek: 2, title: "Lower Body + Cardio", targetAreas: ["lower body", "cardio"] },
          { dayOfWeek: 3, title: "HIIT & Core", targetAreas: ["cardio", "core"] },
          { dayOfWeek: 4, title: "Full Body Circuit", targetAreas: ["full body"] },
          { dayOfWeek: 5, title: "Cardio & Mobility", targetAreas: ["cardio", "mobility"] }
        ],
        6: [
          { dayOfWeek: 1, title: "Upper Body + HIIT", targetAreas: ["upper body", "cardio"] },
          { dayOfWeek: 2, title: "Lower Body + Cardio", targetAreas: ["lower body", "cardio"] },
          { dayOfWeek: 3, title: "HIIT & Core", targetAreas: ["cardio", "core"] },
          { dayOfWeek: 4, title: "Strength Training", targetAreas: ["full body"] },
          { dayOfWeek: 5, title: "Cardio Endurance", targetAreas: ["cardio"] },
          { dayOfWeek: 6, title: "Active Recovery", targetAreas: ["mobility", "core"] }
        ]
      },
      "Improve Endurance": {
        2: [
          { dayOfWeek: 1, title: "Cardio & Core", targetAreas: ["cardio", "core"] },
          { dayOfWeek: 4, title: "Full Body Endurance", targetAreas: ["full body", "cardio"] }
        ],
        3: [
          { dayOfWeek: 1, title: "Cardio Intervals", targetAreas: ["cardio"] },
          { dayOfWeek: 3, title: "Strength Endurance", targetAreas: ["full body"] },
          { dayOfWeek: 5, title: "Long Duration Cardio", targetAreas: ["cardio"] }
        ],
        4: [
          { dayOfWeek: 1, title: "Cardio Intervals", targetAreas: ["cardio"] },
          { dayOfWeek: 2, title: "Upper Body Endurance", targetAreas: ["upper body"] },
          { dayOfWeek: 4, title: "Lower Body Endurance", targetAreas: ["lower body"] },
          { dayOfWeek: 5, title: "Long Duration Cardio", targetAreas: ["cardio"] }
        ],
        5: [
          { dayOfWeek: 1, title: "HIIT Cardio", targetAreas: ["cardio"] },
          { dayOfWeek: 2, title: "Upper Body Endurance", targetAreas: ["upper body"] },
          { dayOfWeek: 3, title: "Steady State Cardio", targetAreas: ["cardio"] },
          { dayOfWeek: 4, title: "Lower Body Endurance", targetAreas: ["lower body"] },
          { dayOfWeek: 5, title: "Long Duration Cardio", targetAreas: ["cardio"] }
        ],
        6: [
          { dayOfWeek: 1, title: "HIIT Cardio", targetAreas: ["cardio"] },
          { dayOfWeek: 2, title: "Upper Body Endurance", targetAreas: ["upper body"] },
          { dayOfWeek: 3, title: "Steady State Cardio", targetAreas: ["cardio"] },
          { dayOfWeek: 4, title: "Lower Body Endurance", targetAreas: ["lower body"] },
          { dayOfWeek: 5, title: "Tempo Cardio", targetAreas: ["cardio"] },
          { dayOfWeek: 6, title: "Active Recovery", targetAreas: ["mobility", "core"] }
        ]
      },
      "Get Stronger": {
        2: [
          { dayOfWeek: 1, title: "Upper Body Strength", targetAreas: ["chest", "back", "shoulders", "arms"] },
          { dayOfWeek: 4, title: "Lower Body Strength", targetAreas: ["legs", "glutes", "core"] }
        ],
        3: [
          { dayOfWeek: 1, title: "Push (Bench Focus)", targetAreas: ["chest", "shoulders", "triceps"] },
          { dayOfWeek: 3, title: "Pull (Deadlift Focus)", targetAreas: ["back", "biceps", "forearms"] },
          { dayOfWeek: 5, title: "Legs (Squat Focus)", targetAreas: ["legs", "glutes", "core"] }
        ],
        4: [
          { dayOfWeek: 1, title: "Bench Press Day", targetAreas: ["chest", "triceps"] },
          { dayOfWeek: 2, title: "Squat Day", targetAreas: ["legs", "core"] },
          { dayOfWeek: 4, title: "Overhead Press Day", targetAreas: ["shoulders", "triceps"] },
          { dayOfWeek: 5, title: "Deadlift Day", targetAreas: ["back", "glutes", "hamstrings"] }
        ],
        5: [
          { dayOfWeek: 1, title: "Bench Press Day", targetAreas: ["chest", "triceps"] },
          { dayOfWeek: 2, title: "Squat Day", targetAreas: ["legs", "core"] },
          { dayOfWeek: 3, title: "Upper Accessory", targetAreas: ["shoulders", "arms"] },
          { dayOfWeek: 4, title: "Deadlift Day", targetAreas: ["back", "glutes", "hamstrings"] },
          { dayOfWeek: 5, title: "Lower Accessory", targetAreas: ["legs", "core"] }
        ],
        6: [
          { dayOfWeek: 1, title: "Bench Press Day", targetAreas: ["chest", "triceps"] },
          { dayOfWeek: 2, title: "Squat Day", targetAreas: ["legs", "core"] },
          { dayOfWeek: 3, title: "Upper Accessory", targetAreas: ["shoulders", "arms"] },
          { dayOfWeek: 4, title: "Deadlift Day", targetAreas: ["back", "glutes", "hamstrings"] },
          { dayOfWeek: 5, title: "Overhead Press Day", targetAreas: ["shoulders", "triceps"] },
          { dayOfWeek: 6, title: "Lower Accessory", targetAreas: ["legs", "core"] }
        ]
      },
      "General Fitness": {
        2: [
          { dayOfWeek: 1, title: "Full Body & Cardio", targetAreas: ["full body", "cardio"] },
          { dayOfWeek: 4, title: "Full Body & Core", targetAreas: ["full body", "core"] }
        ],
        3: [
          { dayOfWeek: 1, title: "Full Body Strength", targetAreas: ["full body"] },
          { dayOfWeek: 3, title: "Cardio & Core", targetAreas: ["cardio", "core"] },
          { dayOfWeek: 5, title: "Mobility & Functional", targetAreas: ["full body", "mobility"] }
        ],
        4: [
          { dayOfWeek: 1, title: "Upper Body", targetAreas: ["upper body"] },
          { dayOfWeek: 2, title: "Cardio Day", targetAreas: ["cardio"] },
          { dayOfWeek: 4, title: "Lower Body", targetAreas: ["lower body"] },
          { dayOfWeek: 5, title: "Core & Mobility", targetAreas: ["core", "mobility"] }
        ],
        5: [
          { dayOfWeek: 1, title: "Upper Body", targetAreas: ["upper body"] },
          { dayOfWeek: 2, title: "Lower Body", targetAreas: ["lower body"] },
          { dayOfWeek: 3, title: "Cardio Day", targetAreas: ["cardio"] },
          { dayOfWeek: 4, title: "Full Body Circuit", targetAreas: ["full body"] },
          { dayOfWeek: 5, title: "Mobility & Core", targetAreas: ["mobility", "core"] }
        ],
        6: [
          { dayOfWeek: 1, title: "Upper Body", targetAreas: ["upper body"] },
          { dayOfWeek: 2, title: "Lower Body", targetAreas: ["lower body"] },
          { dayOfWeek: 3, title: "HIIT Cardio", targetAreas: ["cardio"] },
          { dayOfWeek: 4, title: "Core & Arms", targetAreas: ["core", "arms"] },
          { dayOfWeek: 5, title: "Steady Cardio", targetAreas: ["cardio"] },
          { dayOfWeek: 6, title: "Mobility & Flexibility", targetAreas: ["mobility"] }
        ]
      }
    };
    
    // Default to General Fitness if goal not found
    const goalSplits = workoutSplits[goal] || workoutSplits["General Fitness"];
    
    // Default to 3 days if daysPerWeek not found
    const split = goalSplits[daysPerWeek] || goalSplits[3];
    
    // Add duration to each workout based on the plan's timePerWorkout
    return split.map(workout => ({
      ...workout,
      duration: workoutPlan.timePerWorkout
    }));
  };

  // Get today's workout schedule
  const getTodaysWorkoutSchedule = async () => {
    if (!user) return null;
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    
    return await fetchWorkoutScheduleByDate(dateString);
  };

  // Generate workout schedule for the entire next week
  const generateNextWeekWorkoutSchedules = async (workoutPlanId, workoutData) => {
    if (!user || !workoutPlanId || !workoutData || !workoutData.length) return [];
    
    try {
      setLoading(true);
      const createdSchedules = [];
      
      // Get today's date
      const today = new Date();
      
      // Start from next week (today + 7 days)
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + 7);
      
      for (const workout of workoutData) {
        // Calculate the date for this workout's day of the week
        let targetDay = workout.dayOfWeek - 1; // Convert from 1-7 to 0-6 format
        if (targetDay < 0) targetDay = 6; // Handle Sunday
        
        // Find the next occurrence of this day of week after the start date
        const date = new Date(startDate);
        const currentDay = startDate.getDay();
        
        // Calculate days to add
        let daysToAdd = (targetDay - currentDay + 7) % 7;
        date.setDate(startDate.getDate() + daysToAdd);
        
        // Format date as YYYY-MM-DD
        const formattedDate = date.toISOString().split('T')[0];
        
        // Create the schedule
        const schedule = await createWorkoutSchedule(
          workoutPlanId,
          workout.dayOfWeek,
          workout.title,
          workout.duration,
          workout.targetAreas,
          formattedDate
        );
        
        if (schedule) {
          createdSchedules.push(schedule);
        }
      }
      
      return createdSchedules;
    } catch (err) {
      console.error("Error generating next week's workout schedules:", err);
      setError("Failed to generate workout schedules for next week.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Check if user has a workout schedule for today
  const hasTodaysWorkout = async () => {
    const todayWorkout = await getTodaysWorkoutSchedule();
    return todayWorkout !== null;
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
          fetchWorkoutSchedules(plan.$id);
        }
      });
    } else {
      setWorkoutSchedules([]);
      setActivePlan(null);
    }
  }, [user]);

  return (
    <WorkoutSchedulesContext.Provider value={{ 
      workoutSchedules,
      activePlan,
      loading,
      error,
      fetchActivePlan,
      fetchWorkoutSchedules,
      fetchWorkoutScheduleByDate,
      createWorkoutSchedule,
      updateWorkoutSchedule,
      deleteWorkoutSchedule,
      updateWorkoutStatus,
      createWeeklyWorkoutSchedules,
      generateWorkoutSplits,
      getTodaysWorkoutSchedule,
      generateNextWeekWorkoutSchedules,
      hasTodaysWorkout,
      getCurrentWeekSchedules
    }}>
      {children}
    </WorkoutSchedulesContext.Provider>
  );
}