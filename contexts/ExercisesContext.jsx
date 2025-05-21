import { createContext, useEffect, useState } from "react"
import { databases, client } from "../lib/appwrite"
import { ID, Permission, Query, Role } from "appwrite"
import { useUser } from "../hooks/useUser"

const DATABASE_ID = "682c8c930037232d51ff"
const COLLECTION_ID = "682c93c000157cde5ed1"
const EXERCISE_API_URL = "https://yahia-dot.github.io/exerciseLibrary_api/exercises.json"

export const ExercisesContext = createContext()

export function ExercisesProvider({ children }) {
  const [exercises, setExercises] = useState([])
  const [exerciseLibrary, setExerciseLibrary] = useState({})
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

  // Fetch exercise library from external API
  const fetchExerciseLibrary = async () => {
    try {
      setLoading(true);
      const response = await fetch(EXERCISE_API_URL);
      const data = await response.json();
      
      // Process the data to format images correctly
      const processedData = {};
      Object.keys(data).forEach(muscleGroup => {
        processedData[muscleGroup] = data[muscleGroup].map(exercise => ({
          ...exercise,
          image: exercise.image ? formatGoogleDriveLink(exercise.image) : undefined
        }));
      });
      
      setExerciseLibrary(processedData);
      setError(null);
    } catch (err) {
      console.error("Error fetching exercise library:", err);
      setError("Failed to load exercise library. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's exercises from Appwrite
  const fetchExercises = async (workoutScheduleId = null) => {
    if (!user) return;
    
    try {
      setLoading(true);
      let queries = [Query.equal("userId", user.$id)];
      
      if (workoutScheduleId) {
        queries.push(Query.equal("workoutScheduleId", workoutScheduleId));
      }
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        queries
      );
      
      // Sort exercises by their order in the workout
      const sortedExercises = response.documents.sort((a, b) => a.order - b.order);
      setExercises(sortedExercises);
      setError(null);
    } catch (err) {
      console.error("Error fetching exercises:", err);
      setError("Failed to load your exercises. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Create a new exercise
  const createExercise = async (exerciseData) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      
      // Include userId in the exercise data
      const newExerciseData = {
        ...exerciseData,
        userId: user.$id,
        isCompleted: false,
        // Add default values for any missing required fields
        sets: exerciseData.sets || 3,
        reps: exerciseData.reps || 10,
        weight: exerciseData.weight || 0,
        restTime: exerciseData.restTime || 60,
        order: exerciseData.order || exercises.length + 1
      };
      
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        newExerciseData,
        [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id))
        ]
      );
      
      // Update the local state with the new exercise
      setExercises(prevExercises => [...prevExercises, response]);
      return response;
    } catch (err) {
      console.error("Error creating exercise:", err);
      setError("Failed to create exercise. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing exercise
  const updateExercise = async (exerciseId, updatedData) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        exerciseId,
        updatedData
      );
      
      // Update the local state with the updated exercise
      setExercises(prevExercises => 
        prevExercises.map(exercise => 
          exercise.$id === exerciseId ? response : exercise
        )
      );
      
      return response;
    } catch (err) {
      console.error("Error updating exercise:", err);
      setError("Failed to update exercise. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete an exercise
  const deleteExercise = async (exerciseId) => {
    if (!user) return false;
    
    try {
      setLoading(true);
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_ID,
        exerciseId
      );
      
      // Remove the deleted exercise from local state
      setExercises(prevExercises => 
        prevExercises.filter(exercise => exercise.$id !== exerciseId)
      );
      
      return true;
    } catch (err) {
      console.error("Error deleting exercise:", err);
      setError("Failed to delete exercise. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle exercise completion status
  const toggleExerciseCompletion = async (exerciseId, isCompleted) => {
    return await updateExercise(exerciseId, { isCompleted });
  };

  // Update exercise sets, reps, weight
  const updateExerciseDetails = async (exerciseId, sets, reps, weight, restTime) => {
    return await updateExercise(exerciseId, { sets, reps, weight, restTime });
  };

  // Create multiple exercises at once (for bulk adding to a workout)
  const createMultipleExercises = async (exercisesData, workoutScheduleId) => {
    if (!user || !workoutScheduleId) return [];
    
    try {
      setLoading(true);
      const createdExercises = [];
      
      for (let i = 0; i < exercisesData.length; i++) {
        const exerciseData = {
          ...exercisesData[i],
          workoutScheduleId,
          userId: user.$id,
          isCompleted: false,
          order: i + 1
        };
        
        const response = await databases.createDocument(
          DATABASE_ID,
          COLLECTION_ID,
          ID.unique(),
          exerciseData,
          [
            Permission.read(Role.user(user.$id)),
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id))
          ]
        );
        
        createdExercises.push(response);
      }
      
      // Update the local state with all new exercises
      setExercises(prevExercises => [...prevExercises, ...createdExercises]);
      return createdExercises;
    } catch (err) {
      console.error("Error creating multiple exercises:", err);
      setError("Failed to create exercises. Please try again.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Reorder exercises in a workout
  const reorderExercises = async (workoutScheduleId, newOrdering) => {
    if (!user || !workoutScheduleId) return false;
    
    try {
      setLoading(true);
      
      // newOrdering should be an array of { exerciseId, newOrder } objects
      for (const item of newOrdering) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTION_ID,
          item.exerciseId,
          { order: item.newOrder }
        );
      }
      
      // Refresh exercises to get the updated ordering
      await fetchExercises(workoutScheduleId);
      return true;
    } catch (err) {
      console.error("Error reordering exercises:", err);
      setError("Failed to reorder exercises. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get exercises from library by muscle group
  const getExercisesByMuscleGroup = (muscleGroup) => {
    return exerciseLibrary[muscleGroup] || [];
  };

  // Get exercise details from library by name
  const getExerciseDetailsFromLibrary = (exerciseName) => {
    for (const muscleGroup in exerciseLibrary) {
      const found = exerciseLibrary[muscleGroup].find(
        exercise => exercise.name.toLowerCase() === exerciseName.toLowerCase()
      );
      if (found) return found;
    }
    return null;
  };

  // Initial data loading
  useEffect(() => {
    fetchExerciseLibrary();
  }, []);

  // Fetch user's exercises when user changes
  useEffect(() => {
    if (user) {
      fetchExercises();
    } else {
      setExercises([]);
    }
  }, [user]);

  return (
    <ExercisesContext.Provider value={{ 
      exercises,
      exerciseLibrary,
      loading,
      error,
      fetchExercises,
      createExercise,
      updateExercise,
      deleteExercise,
      toggleExerciseCompletion,
      updateExerciseDetails,
      createMultipleExercises,
      reorderExercises,
      getExercisesByMuscleGroup,
      getExerciseDetailsFromLibrary,
      fetchExerciseLibrary
    }}>
      {children}
    </ExercisesContext.Provider>
  );
}