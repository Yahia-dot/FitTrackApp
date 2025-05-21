import 'dotenv/config';

export default {
  expo: {
    name: "FitTrack",
    slug: "FitTrack",
    version: process.env.APP_VERSION,
    extra: {
      appwriteEndpoint: process.env.APPWRITE_ENDPOINT,
      appwriteProjectId: process.env.APPWRITE_PROJECT_ID,
      appwriteDatabaseId: process.env.APPWRITE_DATABASE_ID,
      appwriteBucketId: process.env.APPWRITE_STORAGE_BUCKET_ID,

      // Collections
      userProfiles: process.env.APPWRITE_COLLECTION_USER_PROFILES,
      workoutPlans: process.env.APPWRITE_COLLECTION_WORKOUT_PLANS,
      workoutSchedules: process.env.APPWRITE_COLLECTION_WORKOUT_SCHEDULES,
      exercises: process.env.APPWRITE_COLLECTION_EXERCISES,
      nutritionPlans: process.env.APPWRITE_COLLECTION_NUTRITION_PLANS,
      mealSchedules: process.env.APPWRITE_COLLECTION_MEAL_SCHEDULES,
      meals: process.env.APPWRITE_COLLECTION_MEALS,
      workoutProgress: process.env.APPWRITE_COLLECTION_WORKOUT_PROGRESS,
      nutritionProgress: process.env.APPWRITE_COLLECTION_NUTRITION_PROGRESS,
      userSettings: process.env.APPWRITE_COLLECTION_USER_SETTINGS,

      // External APIs
      exerciseApiUrl: process.env.EXERCISE_API_URL,
      nutritionApiUrl: process.env.NUTRITION_API_URL,

      // App Config
      debugMode: process.env.DEBUG_MODE,
      nodeEnv: process.env.NODE_ENV,
    },
  },
};
