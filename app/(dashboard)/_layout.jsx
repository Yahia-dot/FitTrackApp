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
          name="index"
          options={{ 
            title: "Home", 
            tabBarIcon: ({ focused, color }) => (
              <FontAwesome5
                size={24}
                name={focused ? 'home' : 'home'}
                color={color}
              />
            )
          }}
        />
        
        <Tabs.Screen
          name="workout"
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
          name="nutrition"
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
          name="progress" 
          options={{ 
            title: "Progress", 
            tabBarIcon: ({ focused, color }) => (
              <FontAwesome5
                size={24}
                name={focused ? 'chart-line' : 'chart-line'}
                color={color}
              />
            )
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{ 
            title: "Profile", 
            tabBarIcon: ({ focused, color }) => (
              <FontAwesome5
                size={24}
                name={focused ? 'user' : 'user'}
                color={color}
              />
            )
          }}
        />

        <Tabs.Screen
          name="settings" 
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