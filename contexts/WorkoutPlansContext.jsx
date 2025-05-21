import { createContext, useEffect, useState } from "react"
import { databases, client } from "../lib/appwrite"
import { ID, Permission, Query, Role } from "appwrite"
import { useUser } from "../hooks/useUser"

const DATABASE_ID = "682c8c930037232d51ff"
const COLLECTION_ID = "682c902e002bb984bc07"

export const WorkoutPlansContext = createContext()

export function WorkoutPlansProvider({ children }) {
  const [workoutPlans, setWorkoutPlans] = useState([])
  const [activePlan, setActivePlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useUser()

  // Fetch all workout plans for the user
  const fetchWorkoutPlans = async () => {
    if (!user) return [];
    
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.equal("userId", user.$id)]
      );
      
      // Sort by creation date (newest first)
      const sortedPlans = response.documents.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setWorkoutPlans(sortedPlans);
      
      // Set the most recent plan as active
      if (sortedPlans.length > 0) {
        setActivePlan(sortedPlans[0]);
      } else {
        setActivePlan(null);
      }
      
      return sortedPlans;
    } catch (err) {
      console.error("Error fetching workout plans:", err);
      setError("Failed to load your workout plans. Please try again later.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch a specific workout plan by ID
  const fetchWorkoutPlan = async (planId) => {
    if (!user || !planId) return null;
    
    try {
      setLoading(true);
      const response = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_ID,
        planId
      );
      
      return response;
    } catch (err) {
      console.error("Error fetching workout plan:", err);
      setError("Failed to load the workout plan. Please try again later.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new workout plan
  const createWorkoutPlan = async (goal, daysPerWeek, timePerWorkout) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      
      const newPlanData = {
        userId: user.$id,
        goal,
        daysPerWeek,
        timePerWorkout,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        newPlanData,
        [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id))
        ]
      );
      
      // Update the local state with the new plan
      setWorkoutPlans(prevPlans => [response, ...prevPlans]);
      
      // Set the new plan as active
      setActivePlan(response);
      
      return response;
    } catch (err) {
      console.error("Error creating workout plan:", err);
      setError("Failed to create workout plan. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing workout plan
  const updateWorkoutPlan = async (planId, updatedData) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      
      // Include updatedAt in the data
      const dataToUpdate = {
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        planId,
        dataToUpdate
      );
      
      // Update the local state with the updated plan
      setWorkoutPlans(prevPlans => 
        prevPlans.map(plan => 
          plan.$id === planId ? response : plan
        )
      );
      
      // Update active plan if needed
      if (activePlan && activePlan.$id === planId) {
        setActivePlan(response);
      }
      
      return response;
    } catch (err) {
      console.error("Error updating workout plan:", err);
      setError("Failed to update workout plan. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a workout plan
  const deleteWorkoutPlan = async (planId) => {
    if (!user) return false;
    
    try {
      setLoading(true);
      
      // Before deleting the plan, we should delete all related workout schedules and exercises
      // This would typically be handled by cascade delete rules in your database
      // or by additional function calls to delete those records
      
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_ID,
        planId
      );
      
      // Remove the deleted plan from local state
      const updatedPlans = workoutPlans.filter(plan => plan.$id !== planId);
      setWorkoutPlans(updatedPlans);
      
      // Update active plan if needed
      if (activePlan && activePlan.$id === planId) {
        setActivePlan(updatedPlans.length > 0 ? updatedPlans[0] : null);
      }
      
      return true;
    } catch (err) {
      console.error("Error deleting workout plan:", err);
      setError("Failed to delete workout plan. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Set a specific plan as the active plan
  const setActivePlanById = async (planId) => {
    if (!user || !planId) return false;
    
    try {
      // Fetch the plan to make sure it exists
      const plan = await fetchWorkoutPlan(planId);
      
      if (plan) {
        setActivePlan(plan);
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error("Error setting active plan:", err);
      return false;
    }
  };

  // Check if user has any workout plans
  const hasWorkoutPlan = () => {
    return workoutPlans.length > 0;
  };

  // Workout plan setup wizard
  const setupWorkoutPlan = async (setupData) => {
    if (!user) return null;
    
    const { goal, daysPerWeek, timePerWorkout } = setupData;
    
    try {
      setLoading(true);
      
      // Create the workout plan
      const plan = await createWorkoutPlan(goal, daysPerWeek, timePerWorkout);
      
      if (!plan) {
        throw new Error("Failed to create workout plan");
      }
      
      return plan;
    } catch (err) {
      console.error("Error setting up workout plan:", err);
      setError("Failed to set up workout plan. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Suggest a workout plan based on user goals and preferences
  const suggestWorkoutPlan = (goal, fitnessLevel, availableEquipment = []) => {
    // Define workout templates based on goals
    const templates = {
      "Build Muscle": {
        beginner: {
          daysPerWeek: 3,
          timePerWorkout: 45,
          split: ["Full Body", "Rest", "Full Body", "Rest", "Full Body", "Rest", "Rest"]
        },
        intermediate: {
          daysPerWeek: 4,
          timePerWorkout: 60,
          split: ["Upper Body", "Lower Body", "Rest", "Upper Body", "Lower Body", "Rest", "Rest"]
        },
        advanced: {
          daysPerWeek: 5,
          timePerWorkout: 75,
          split: ["Chest & Triceps", "Back & Biceps", "Rest", "Legs", "Shoulders & Arms", "Rest", "Rest"]
        }
      },
      "Lose Fat": {
        beginner: {
          daysPerWeek: 3,
          timePerWorkout: 45,
          split: ["Cardio & Full Body", "Rest", "HIIT", "Rest", "Cardio & Full Body", "Rest", "Rest"]
        },
        intermediate: {
          daysPerWeek: 4,
          timePerWorkout: 60,
          split: ["Full Body HIIT", "Cardio", "Rest", "Full Body Strength", "HIIT", "Rest", "Rest"]
        },
        advanced: {
          daysPerWeek: 5,
          timePerWorkout: 60,
          split: ["HIIT", "Upper Body", "Lower Body", "Cardio", "Full Body Circuit", "Rest", "Rest"]
        }
      },
      "Improve Endurance": {
        beginner: {
          daysPerWeek: 3,
          timePerWorkout: 30,
          split: ["Cardio", "Rest", "Circuit Training", "Rest", "Cardio", "Rest", "Rest"]
        },
        intermediate: {
          daysPerWeek: 4,
          timePerWorkout: 45,
          split: ["Cardio", "Circuit Training", "Rest", "Cardio", "HIIT", "Rest", "Rest"]
        },
        advanced: {
          daysPerWeek: 5,
          timePerWorkout: 60,
          split: ["Cardio", "Circuit Training", "Cardio", "HIIT", "Endurance Training", "Rest", "Rest"]
        }
      },
      "Get Stronger": {
        beginner: {
          daysPerWeek: 3,
          timePerWorkout: 45,
          split: ["Full Body Strength", "Rest", "Full Body Strength", "Rest", "Full Body Strength", "Rest", "Rest"]
        },
        intermediate: {
          daysPerWeek: 4,
          timePerWorkout: 60,
          split: ["Upper Body Strength", "Lower Body Strength", "Rest", "Upper Body Strength", "Lower Body Strength", "Rest", "Rest"]
        },
        advanced: {
          daysPerWeek: 5,
          timePerWorkout: 75,
          split: ["Bench Press Focus", "Squat Focus", "Rest", "Deadlift Focus", "Overhead Press Focus", "Rest", "Rest"]
        }
      },
      "General Fitness": {
        beginner: {
          daysPerWeek: 3,
          timePerWorkout: 30,
          split: ["Cardio & Strength", "Rest", "Flexibility & Core", "Rest", "Cardio & Strength", "Rest", "Rest"]
        },
        intermediate: {
          daysPerWeek: 4,
          timePerWorkout: 45,
          split: ["Cardio", "Strength", "Rest", "HIIT", "Flexibility", "Rest", "Rest"]
        },
        advanced: {
          daysPerWeek: 5,
          timePerWorkout: 60,
          split: ["Cardio", "Strength", "HIIT", "Strength", "Flexibility & Recovery", "Rest", "Rest"]
        }
      }
    };
    
    // Default to intermediate if fitnessLevel is not specified
    const level = fitnessLevel || "intermediate";
    
    // Get the appropriate template based on goal and fitness level
    const template = templates[goal]?.[level] || templates["General Fitness"][level];
    
    return {
      goal,
      daysPerWeek: template.daysPerWeek,
      timePerWorkout: template.timePerWorkout,
      suggestedSplit: template.split
    };
  };

  // Check if user can create a new plan (based on maximum allowed plans)
  const canCreateNewPlan = () => {
    // You can define your own logic here, e.g., limit to 3 plans per user
    const MAX_PLANS_PER_USER = 3;
    return workoutPlans.length < MAX_PLANS_PER_USER;
  };

  // Initial data loading when user changes
  useEffect(() => {
    if (user) {
      fetchWorkoutPlans();
    } else {
      setWorkoutPlans([]);
      setActivePlan(null);
    }
  }, [user]);

  return (
    <WorkoutPlansContext.Provider value={{ 
      workoutPlans,
      activePlan,
      loading,
      error,
      fetchWorkoutPlans,
      fetchWorkoutPlan,
      createWorkoutPlan,
      updateWorkoutPlan,
      deleteWorkoutPlan,
      setActivePlanById,
      hasWorkoutPlan,
      setupWorkoutPlan,
      suggestWorkoutPlan,
      canCreateNewPlan
    }}>
      {children}
    </WorkoutPlansContext.Provider>
  );
}