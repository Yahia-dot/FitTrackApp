import { createContext, useEffect, useState } from "react"
import { databases, client } from "../lib/appwrite"
import { ID, Permission, Query, Role } from "appwrite"
import { useUser } from "../hooks/useUser"
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import { Alert, Platform } from 'react-native'

const DATABASE_ID = "682c8c930037232d51ff"
const COLLECTION_ID = "682c98ea002b762865e3"

export const UserSettingsContext = createContext()

export function UserSettingsProvider({ children }) {
  const [userSettings, setUserSettings] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useUser()

  // Fetch user settings
  const fetchUserSettings = async () => {
    if (!user) return null;
    
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.equal("userId", user.$id)]
      );
      
      if (response.documents.length > 0) {
        const settings = response.documents[0];
        setUserSettings(settings);
        
        // Update local state based on fetched settings
        setDarkMode(settings.darkMode || false);
        setNotificationsEnabled(settings.workoutReminders || false);
        
        // Save theme preference to AsyncStorage for fast loading
        await AsyncStorage.setItem('darkMode', JSON.stringify(settings.darkMode));
        
        return settings;
      } else {
        // Create default settings if none exist
        return await createDefaultUserSettings();
      }
    } catch (err) {
      console.error("Error fetching user settings:", err);
      setError("Failed to load your settings. Please try again later.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create default user settings
  const createDefaultUserSettings = async () => {
    if (!user) return null;
    
    try {
      setLoading(true);
      
      const newSettingsData = {
        userId: user.$id,
        darkMode: false,
        workoutReminders: false,
        workoutReminderTime: "08:00",
        mealReminders: false,
        breakfastReminderTime: "07:30",
        lunchReminderTime: "12:30",
        dinnerReminderTime: "18:30",
        otherReminders: []
      };
      
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        newSettingsData,
        [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id))
        ]
      );
      
      setUserSettings(response);
      setDarkMode(false);
      setNotificationsEnabled(false);
      
      // Save theme preference to AsyncStorage
      await AsyncStorage.setItem('darkMode', JSON.stringify(false));
      
      return response;
    } catch (err) {
      console.error("Error creating default user settings:", err);
      setError("Failed to create your settings. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update user settings
  const updateUserSettings = async (updatedData) => {
    if (!user || !userSettings) return null;
    
    try {
      setLoading(true);
      
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        userSettings.$id,
        updatedData
      );
      
      setUserSettings(response);
      
      // Update local state based on updated settings
      if (updatedData.darkMode !== undefined) {
        setDarkMode(updatedData.darkMode);
        await AsyncStorage.setItem('darkMode', JSON.stringify(updatedData.darkMode));
      }
      
      if (updatedData.workoutReminders !== undefined) {
        setNotificationsEnabled(updatedData.workoutReminders);
      }
      
      return response;
    } catch (err) {
      console.error("Error updating user settings:", err);
      setError("Failed to update your settings. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = async () => {
    try {
      const newDarkModeValue = !darkMode;
      await updateUserSettings({ darkMode: newDarkModeValue });
      return newDarkModeValue;
    } catch (err) {
      console.error("Error toggling dark mode:", err);
      setError("Failed to update theme preference. Please try again.");
      return darkMode; // Return current value if there was an error
    }
  };

  // Toggle workout reminders
  const toggleWorkoutReminders = async () => {
    try {
      // First check if we have notification permissions
      if (!notificationsEnabled) {
        const permission = await requestNotificationPermissions();
        if (!permission) {
          return false;
        }
      }
      
      const newValue = !notificationsEnabled;
      await updateUserSettings({ workoutReminders: newValue });
      
      // Schedule or cancel notifications based on the new value
      if (newValue) {
        await scheduleWorkoutReminders();
      } else {
        await cancelWorkoutReminders();
      }
      
      return newValue;
    } catch (err) {
      console.error("Error toggling workout reminders:", err);
      setError("Failed to update notification settings. Please try again.");
      return notificationsEnabled; // Return current value if there was an error
    }
  };

  // Update workout reminder time
  const updateWorkoutReminderTime = async (time) => {
    try {
      await updateUserSettings({ workoutReminderTime: time });
      
      // If reminders are enabled, reschedule with the new time
      if (notificationsEnabled) {
        await cancelWorkoutReminders();
        await scheduleWorkoutReminders();
      }
      
      return true;
    } catch (err) {
      console.error("Error updating workout reminder time:", err);
      setError("Failed to update reminder time. Please try again.");
      return false;
    }
  };

  // Toggle meal reminders
  const toggleMealReminders = async () => {
    try {
      // First check if we have notification permissions
      if (!userSettings.mealReminders) {
        const permission = await requestNotificationPermissions();
        if (!permission) {
          return false;
        }
      }
      
      const newValue = !userSettings.mealReminders;
      await updateUserSettings({ mealReminders: newValue });
      
      // Schedule or cancel notifications based on the new value
      if (newValue) {
        await scheduleMealReminders();
      } else {
        await cancelMealReminders();
      }
      
      return newValue;
    } catch (err) {
      console.error("Error toggling meal reminders:", err);
      setError("Failed to update meal notification settings. Please try again.");
      return userSettings.mealReminders; // Return current value if there was an error
    }
  };

  // Update meal reminder times
  const updateMealReminderTimes = async (breakfast, lunch, dinner) => {
    try {
      await updateUserSettings({
        breakfastReminderTime: breakfast,
        lunchReminderTime: lunch,
        dinnerReminderTime: dinner
      });
      
      // If reminders are enabled, reschedule with the new times
      if (userSettings.mealReminders) {
        await cancelMealReminders();
        await scheduleMealReminders();
      }
      
      return true;
    } catch (err) {
      console.error("Error updating meal reminder times:", err);
      setError("Failed to update meal reminder times. Please try again.");
      return false;
    }
  };

  // Request notification permissions
  const requestNotificationPermissions = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert(
          "Notifications Disabled",
          "To receive reminders, please enable notifications for FitTrack in your device settings.",
          [{ text: "OK" }]
        );
        return false;
      }
      
      return true;
    } catch (err) {
      console.error("Error requesting notification permissions:", err);
      return false;
    }
  };

  // Schedule workout reminders
  const scheduleWorkoutReminders = async () => {
    if (!userSettings) return;
    
    try {
      // Cancel any existing notifications first
      await cancelWorkoutReminders();
      
      // Parse the time string (format: "HH:MM")
      const [hours, minutes] = userSettings.workoutReminderTime.split(':').map(Number);
      
      // Create a date object for today at the specified time
      const now = new Date();
      const scheduledTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes
      );
      
      // If the time has already passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }
      
      // Calculate seconds until the scheduled time
      const secondsUntilScheduled = Math.floor((scheduledTime - now) / 1000);
      
      // Schedule the workout reminder
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Workout Reminder",
          body: "Don't forget your workout today! 💪",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          seconds: secondsUntilScheduled,
          repeats: true,
        },
        identifier: "workout-reminder",
      });
      
      return true;
    } catch (err) {
      console.error("Error scheduling workout reminders:", err);
      return false;
    }
  };

  // Cancel workout reminders
  const cancelWorkoutReminders = async () => {
    try {
      await Notifications.cancelScheduledNotificationAsync("workout-reminder");
      return true;
    } catch (err) {
      console.error("Error canceling workout reminders:", err);
      return false;
    }
  };

  // Schedule meal reminders
  const scheduleMealReminders = async () => {
    if (!userSettings) return;
    
    try {
      // Cancel any existing notifications first
      await cancelMealReminders();
      
      const now = new Date();
      const meals = [
        {
          id: "breakfast-reminder",
          title: "Breakfast Reminder",
          body: "Time for breakfast! Start your day with a nutritious meal. 🍳",
          time: userSettings.breakfastReminderTime
        },
        {
          id: "lunch-reminder",
          title: "Lunch Reminder",
          body: "Time for lunch! Don't skip this important meal. 🥗",
          time: userSettings.lunchReminderTime
        },
        {
          id: "dinner-reminder",
          title: "Dinner Reminder",
          body: "Time for dinner! Complete your daily nutrition goals. 🍽️",
          time: userSettings.dinnerReminderTime
        }
      ];
      
      for (const meal of meals) {
        // Parse the time string (format: "HH:MM")
        const [hours, minutes] = meal.time.split(':').map(Number);
        
        // Create a date object for today at the specified time
        const scheduledTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hours,
          minutes
        );
        
        // If the time has already passed today, schedule for tomorrow
        if (scheduledTime <= now) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }
        
        // Calculate seconds until the scheduled time
        const secondsUntilScheduled = Math.floor((scheduledTime - now) / 1000);
        
        // Schedule the meal reminder
        await Notifications.scheduleNotificationAsync({
          content: {
            title: meal.title,
            body: meal.body,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            seconds: secondsUntilScheduled,
            repeats: true,
          },
          identifier: meal.id,
        });
      }
      
      return true;
    } catch (err) {
      console.error("Error scheduling meal reminders:", err);
      return false;
    }
  };

  // Cancel meal reminders
  const cancelMealReminders = async () => {
    try {
      await Notifications.cancelScheduledNotificationAsync("breakfast-reminder");
      await Notifications.cancelScheduledNotificationAsync("lunch-reminder");
      await Notifications.cancelScheduledNotificationAsync("dinner-reminder");
      return true;
    } catch (err) {
      console.error("Error canceling meal reminders:", err);
      return false;
    }
  };

  // Load theme preference from AsyncStorage on app start
  const loadThemePreference = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('darkMode');
      if (storedTheme !== null) {
        setDarkMode(JSON.parse(storedTheme));
      }
    } catch (err) {
      console.error("Error loading theme preference:", err);
    }
  };

  // Configure notifications
  const configureNotifications = async () => {
    // Set up notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  };

  // Initial setup
  useEffect(() => {
    loadThemePreference();
    configureNotifications();
  }, []);

  // Load user settings when user changes
  useEffect(() => {
    if (user) {
      fetchUserSettings();
    } else {
      setUserSettings(null);
      // Keep theme preference even when logged out
    }
  }, [user]);

  // Set up or cancel reminders when settings change
  useEffect(() => {
    if (!userSettings) return;
    
    if (userSettings.workoutReminders) {
      scheduleWorkoutReminders();
    }
    
    if (userSettings.mealReminders) {
      scheduleMealReminders();
    }
    
    return () => {
      // Clean up notifications when component unmounts
      cancelWorkoutReminders();
      cancelMealReminders();
    };
  }, [userSettings]);

  return (
    <UserSettingsContext.Provider value={{ 
      userSettings,
      darkMode,
      notificationsEnabled,
      loading,
      error,
      fetchUserSettings,
      updateUserSettings,
      toggleDarkMode,
      toggleWorkoutReminders,
      updateWorkoutReminderTime,
      toggleMealReminders,
      updateMealReminderTimes,
      requestNotificationPermissions
    }}>
      {children}
    </UserSettingsContext.Provider>
  );
}