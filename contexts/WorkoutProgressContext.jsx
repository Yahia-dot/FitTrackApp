import { createContext, useEffect, useState } from "react"
import { databases, client } from "../lib/appwrite"
import { ID, Permission, Query, Role } from "appwrite"
import { useUser } from "../hooks/useUser"

const DATABASE_ID = "682c8c930037232d51ff"
const COLLECTION_ID = "682c97dd00369176ca25"
const WORKOUT_SCHEDULES_COLLECTION_ID = "682c918200033bb63b15"
const EXERCISES_COLLECTION_ID = "682c93c000157cde5ed1"

export const WorkoutProgressContext = createContext()

export function WorkoutProgressProvider({ children }) {
  const [workoutProgress, setWorkoutProgress] = useState([])
  const [weeklyProgress, setWeeklyProgress] = useState([])
  const [todayProgress, setTodayProgress] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useUser()

  // Helper function to get formatted date string (YYYY-MM-DD)
  const getFormattedDate = (date = new Date()) => {
    return date.toISOString().split('T')[0];
  };

  // Fetch user's workout progress data
  const fetchWorkoutProgress = async (limit = 30) => {
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
      
      setWorkoutProgress(response.documents);
      return response.documents;
    } catch (err) {
      console.error("Error fetching workout progress:", err);
      setError("Failed to load your workout progress. Please try again later.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch weekly workout progress
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
      console.error("Error fetching weekly workout progress:", err);
      setError("Failed to load your weekly workout data. Please try again.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch today's workout progress
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
      console.error("Error fetching today's workout progress:", err);
      setError("Failed to load today's workout data. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a default progress entry for a given date
  const createDefaultProgressEntry = async (date) => {
    if (!user) return null;
    
    try {
      // First, check if there's a workout scheduled for this day
      const scheduleResponse = await databases.listDocuments(
        DATABASE_ID,
        WORKOUT_SCHEDULES_COLLECTION_ID,
        [
          Query.equal("userId", user.$id),
          Query.equal("date", date)
        ]
      );
      
      // Get the total workouts completed so far
      const progressResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal("userId", user.$id),
          Query.equal("workoutCompleted", true)
        ]
      );
      
      const totalWorkoutsCompleted = progressResponse.documents.length;
      
      // Check if there's a scheduled workout to determine the weekly goal
      const hasWorkoutScheduled = scheduleResponse.documents.length > 0;
      let weeklyGoal = 0;
      
      if (hasWorkoutScheduled) {
        // If there's a workout plan, try to get the weekly goal from it
        const workoutPlanId = scheduleResponse.documents[0].workoutPlanId;
        
        if (workoutPlanId) {
          // Get workout plan to find the daysPerWeek value
          const planResponse = await databases.getDocument(
            DATABASE_ID,
            "682c8cdb000bfe5ddd16", // Your WorkoutPlans collection ID
            workoutPlanId
          );
          
          weeklyGoal = planResponse.daysPerWeek || 0;
        }
      }
      
      const newProgressData = {
        userId: user.$id,
        date,
        workoutCompleted: false,
        totalWorkoutsCompleted,
        weeklyGoal,
        notes: ""
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
      
      // Also add to the workoutProgress array
      setWorkoutProgress(prevProgress => [response, ...prevProgress]);
      
      return response;
    } catch (err) {
      console.error("Error creating default progress entry:", err);
      return null;
    }
  };

  // Update workout progress for a specific date
  const updateWorkoutProgress = async (progressId, updatedData) => {
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
      setWorkoutProgress(prevProgress => 
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
      console.error("Error updating workout progress:", err);
      setError("Failed to update workout progress. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Mark a workout as completed
  const markWorkoutCompleted = async (workoutScheduleId, notes = "") => {
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
      
      // Update the workout schedule status first
      await databases.updateDocument(
        DATABASE_ID,
        WORKOUT_SCHEDULES_COLLECTION_ID,
        workoutScheduleId,
        { status: "Completed" }
      );
      
      // Update the progress record
      return await updateWorkoutProgress(progress.$id, {
        workoutCompleted: true,
        totalWorkoutsCompleted: progress.totalWorkoutsCompleted + 1,
        notes
      });
    } catch (err) {
      console.error("Error marking workout as completed:", err);
      setError("Failed to mark workout as completed. Please try again.");
      return null;
    }
  };

  // Update workout notes
  const updateWorkoutNotes = async (notes) => {
    if (!user || !todayProgress) return null;
    
    try {
      return await updateWorkoutProgress(todayProgress.$id, { notes });
    } catch (err) {
      console.error("Error updating workout notes:", err);
      setError("Failed to update workout notes. Please try again.");
      return null;
    }
  };

  // Get workout progress for a specific date
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

  // Calculate weekly completion rate
  const calculateWeeklyCompletionRate = () => {
    if (weeklyProgress.length === 0) return 0;
    
    const completedWorkouts = weeklyProgress.filter(progress => progress.workoutCompleted).length;
    return (completedWorkouts / weeklyProgress.length) * 100;
  };

  // Calculate streak of consecutive workout days
  const calculateWorkoutStreak = () => {
    if (workoutProgress.length === 0) return 0;
    
    // Sort by date in ascending order
    const sortedProgress = [...workoutProgress].sort(
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
      
      // Check if workout was completed
      if (!progress.workoutCompleted) {
        break;
      }
      
      streak++;
    }
    
    return streak;
  };

  // Get count of workouts completed this week
  const getWeeklyCompletedWorkouts = () => {
    return weeklyProgress.filter(progress => progress.workoutCompleted).length;
  };

  // Calculate progress toward weekly goal
  const calculateWeeklyGoalProgress = () => {
    if (weeklyProgress.length === 0 || !todayProgress) return 0;
    
    const completedWorkouts = weeklyProgress.filter(progress => progress.workoutCompleted).length;
    const weeklyGoal = todayProgress.weeklyGoal || 0;
    
    if (weeklyGoal === 0) return 0;
    return Math.min(100, (completedWorkouts / weeklyGoal) * 100);
  };

  // Get completed exercise count for today
  const getTodayCompletedExercises = async () => {
    if (!user) return { total: 0, completed: 0 };
    
    try {
      // First, get today's workout schedule
      const today = getFormattedDate();
      
      const scheduleResponse = await databases.listDocuments(
        DATABASE_ID,
        WORKOUT_SCHEDULES_COLLECTION_ID,
        [
          Query.equal("userId", user.$id),
          Query.equal("date", today)
        ]
      );
      
      if (scheduleResponse.documents.length === 0) {
        return { total: 0, completed: 0 };
      }
      
      const workoutScheduleId = scheduleResponse.documents[0].$id;
      
      // Get all exercises for this workout
      const exercisesResponse = await databases.listDocuments(
        DATABASE_ID,
        EXERCISES_COLLECTION_ID,
        [Query.equal("workoutScheduleId", workoutScheduleId)]
      );
      
      const total = exercisesResponse.documents.length;
      const completed = exercisesResponse.documents.filter(exercise => exercise.isCompleted).length;
      
      return { total, completed };
    } catch (err) {
      console.error("Error getting completed exercises:", err);
      return { total: 0, completed: 0 };
    }
  };

  // Generate a workout summary message
  const generateWorkoutSummary = (progress) => {
    if (!progress) return "";
    
    const { workoutCompleted, weeklyGoal } = progress;
    
    if (!workoutCompleted) {
      return "You haven't completed your workout yet today. Keep pushing!";
    }
    
    // Get number of completed workouts this week
    const completedThisWeek = weeklyProgress.filter(p => p.workoutCompleted).length;
    
    if (completedThisWeek >= weeklyGoal) {
      return `Amazing! You've hit your weekly goal of ${weeklyGoal} workouts. Keep crushing it!`;
    } else if (weeklyGoal - completedThisWeek === 1) {
      return `Great work! Just one more workout to hit your weekly goal of ${weeklyGoal}.`;
    } else {
      return `Nice job! You've completed ${completedThisWeek} out of ${weeklyGoal} workouts this week.`;
    }
  };

  // Initial data loading
  useEffect(() => {
    if (user) {
      fetchTodayProgress();
      fetchWeeklyProgress();
      fetchWorkoutProgress();
    } else {
      setWorkoutProgress([]);
      setTodayProgress(null);
      setWeeklyProgress([]);
    }
  }, [user]);

  return (
    <WorkoutProgressContext.Provider value={{ 
      workoutProgress,
      weeklyProgress,
      todayProgress,
      loading,
      error,
      fetchWorkoutProgress,
      fetchWeeklyProgress,
      fetchTodayProgress,
      updateWorkoutProgress,
      markWorkoutCompleted,
      updateWorkoutNotes,
      getProgressByDate,
      calculateWeeklyCompletionRate,
      calculateWorkoutStreak,
      getWeeklyCompletedWorkouts,
      calculateWeeklyGoalProgress,
      getTodayCompletedExercises,
      generateWorkoutSummary
    }}>
      {children}
    </WorkoutProgressContext.Provider>
  );
}