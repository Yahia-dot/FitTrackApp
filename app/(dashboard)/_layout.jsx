// _layout.jsx for (dashboard) folder
import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

// Import UserOnly component
import UserOnly from '../../components/auth/UserOnly';

export default function DashboardLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <UserOnly>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { 
            backgroundColor: theme.navBackground, 
            paddingTop: 10, 
            height: 90 
          },
          tabBarActiveTintColor: theme.iconColorFocused,
          tabBarInactiveTintColor: theme.iconColor,
        }}
      >
        <Tabs.Screen
          name="index" // Home tab - maps to dashboard/index.js
          options={{ 
            title: "Dashboard", 
            tabBarIcon: ({ focused, color }) => (
              <FontAwesome5
                size={24}
                name={focused ? 'tachometer-alt' : 'tachometer-alt'}
                color={color}
              />
            )
          }}
        />
        
        <Tabs.Screen
          name="workout" // Workout tab - maps to dashboard/workout.js
          options={{ 
            title: "Workouts", 
            tabBarIcon: ({ focused, color }) => (
              <FontAwesome5
                size={24}
                name={focused ? 'dumbbell' : 'dumbbell'}
                color={color}
              />
            )
          }}
        />

        <Tabs.Screen
          name="create" // Profile tab - maps to dashboard/profile.js
          options={{ 
            title: "Create Plan", 
            tabBarIcon: ({ focused, color }) => (
              <FontAwesome5
                size={24}
                name={focused ? 'plus' : 'plus'}
                color={color}
              />
            )
          }}
        />
        <Tabs.Screen
          name="nutrition" // Nutrition tab - maps to dashboard/nutrition.js
          options={{ 
            title: "Nutrition", 
            tabBarIcon: ({ focused, color }) => (
              <FontAwesome5
                size={24}
                name={focused ? 'apple-alt' : 'apple-alt'}
                color={color}
              />
            )
          }}
        />
        <Tabs.Screen
          name="settings" // Settings tab - maps to dashboard/settings.js
          options={{ 
            title: "Settings", 
            tabBarIcon: ({ focused, color }) => (
              <FontAwesome5
                size={24}
                name={focused ? 'cog' : 'cog'}
                color={color}
              />
            )
          }}
        />
      </Tabs>
    </UserOnly>
  );
}