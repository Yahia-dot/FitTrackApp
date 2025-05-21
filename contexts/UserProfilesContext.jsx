import { createContext, useEffect, useState } from "react"
import { databases, client, storage } from "../lib/appwrite"
import { ID, Permission, Query, Role } from "appwrite"
import { useUser } from "../hooks/useUser"
import * as ImagePicker from 'expo-image-picker'

const DATABASE_ID = "682c8c930037232d51ff"
const COLLECTION_ID = "682c8cf9002bca82ad94"
const STORAGE_BUCKET_ID = "682ca583002fc084d95e" 

export const UserProfilesContext = createContext()

export function UserProfilesProvider({ children }) {
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useUser()

  // Fetch user profile
  const fetchUserProfile = async () => {
    if (!user) return null;
    
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.equal("userId", user.$id)]
      );
      
      if (response.documents.length > 0) {
        setUserProfile(response.documents[0]);
        return response.documents[0];
      } else {
        // Create a default profile if none exists
        return await createDefaultUserProfile();
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError("Failed to load your profile. Please try again later.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a default user profile
  const createDefaultUserProfile = async () => {
    if (!user) return null;
    
    try {
      setLoading(true);
      
      const name = user.name || "Fitness Enthusiast";
      
      const newProfileData = {
        userId: user.$id,
        name,
        age: 30,
        weight: 70,
        height: 175,
        fitnessLevel: "intermediate",
        profileImage: null,
        calorieGoal: 2000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        newProfileData,
        [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id))
        ]
      );
      
      setUserProfile(response);
      return response;
    } catch (err) {
      console.error("Error creating default user profile:", err);
      setError("Failed to create your profile. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updatedData) => {
    if (!user || !userProfile) return null;
    
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
        userProfile.$id,
        dataToUpdate
      );
      
      setUserProfile(response);
      return response;
    } catch (err) {
      console.error("Error updating user profile:", err);
      setError("Failed to update your profile. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile image
  const updateProfileImage = async () => {
    if (!user || !userProfile) return null;
    
    try {
      setLoading(true);
      
      // Request permission to access the photo library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        throw new Error("You need to allow access to your photos to upload a profile image.");
      }
      
      // Let the user select an image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (result.canceled) {
        setLoading(false);
        return null;
      }
      
      // Get the selected image
      const selectedImage = result.assets[0];
      
      // Detect file type from URI
      const uriParts = selectedImage.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      // Create a file name
      const fileName = `profile_${user.$id}_${Date.now()}.${fileType}`;
      
      // Convert image to blob
      const response = await fetch(selectedImage.uri);
      const blob = await response.blob();
      
      // Upload to Appwrite Storage
      const uploadResult = await storage.createFile(
        STORAGE_BUCKET_ID,
        ID.unique(),
        blob
      );
      
      // Generate a URL for the uploaded image
      const imageUrl = storage.getFileView(STORAGE_BUCKET_ID, uploadResult.$id);
      
      // Update the user profile with the new image URL
      const updatedProfile = await updateUserProfile({
        profileImage: imageUrl
      });
      
      return updatedProfile;
    } catch (err) {
      console.error("Error updating profile image:", err);
      setError("Failed to update your profile image. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update user weight
  const updateWeight = async (newWeight) => {
    if (!user || !userProfile) return null;
    
    try {
      return await updateUserProfile({ weight: newWeight });
    } catch (err) {
      console.error("Error updating weight:", err);
      setError("Failed to update weight. Please try again.");
      return null;
    }
  };

  // Update user height
  const updateHeight = async (newHeight) => {
    if (!user || !userProfile) return null;
    
    try {
      return await updateUserProfile({ height: newHeight });
    } catch (err) {
      console.error("Error updating height:", err);
      setError("Failed to update height. Please try again.");
      return null;
    }
  };

  // Update user calorie goal
  const updateCalorieGoal = async (newCalorieGoal) => {
    if (!user || !userProfile) return null;
    
    try {
      return await updateUserProfile({ calorieGoal: newCalorieGoal });
    } catch (err) {
      console.error("Error updating calorie goal:", err);
      setError("Failed to update calorie goal. Please try again.");
      return null;
    }
  };

  // Update user fitness level
  const updateFitnessLevel = async (newFitnessLevel) => {
    if (!user || !userProfile) return null;
    
    try {
      return await updateUserProfile({ fitnessLevel: newFitnessLevel });
    } catch (err) {
      console.error("Error updating fitness level:", err);
      setError("Failed to update fitness level. Please try again.");
      return null;
    }
  };

  // Calculate BMI
  const calculateBMI = () => {
    if (!userProfile || !userProfile.height || !userProfile.weight) return null;
    
    // Height in meters (convert from cm)
    const heightInMeters = userProfile.height / 100;
    
    // BMI formula: weight (kg) / (height (m) * height (m))
    const bmi = userProfile.weight / (heightInMeters * heightInMeters);
    
    return parseFloat(bmi.toFixed(1));
  };

  // Get BMI category
  const getBMICategory = () => {
    const bmi = calculateBMI();
    
    if (bmi === null) return "Unknown";
    
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  // Calculate recommended calorie intake
  const calculateRecommendedCalories = () => {
    if (!userProfile || !userProfile.height || !userProfile.weight || !userProfile.age) {
      return null;
    }
    
    // Basic Basal Metabolic Rate (BMR) calculation using the Harris-Benedict Equation
    // This is a simplified version and doesn't account for gender or activity level
    const bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age + 5;
    
    // Apply activity factor based on fitness level
    let activityFactor = 1.2; // Sedentary
    
    if (userProfile.fitnessLevel === "beginner") {
      activityFactor = 1.375; // Light activity
    } else if (userProfile.fitnessLevel === "intermediate") {
      activityFactor = 1.55; // Moderate activity
    } else if (userProfile.fitnessLevel === "advanced") {
      activityFactor = 1.725; // Very active
    }
    
    const recommendedCalories = Math.round(bmr * activityFactor);
    
    return recommendedCalories;
  };

  // Check if profile is complete
  const isProfileComplete = () => {
    if (!userProfile) return false;
    
    return (
      userProfile.name &&
      userProfile.age &&
      userProfile.weight &&
      userProfile.height &&
      userProfile.fitnessLevel
    );
  };

  // Initial data loading when user changes
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
    }
  }, [user]);

  return (
    <UserProfilesContext.Provider value={{ 
      userProfile,
      loading,
      error,
      fetchUserProfile,
      updateUserProfile,
      updateProfileImage,
      updateWeight,
      updateHeight,
      updateCalorieGoal,
      updateFitnessLevel,
      calculateBMI,
      getBMICategory,
      calculateRecommendedCalories,
      isProfileComplete
    }}>
      {children}
    </UserProfilesContext.Provider>
  );
}