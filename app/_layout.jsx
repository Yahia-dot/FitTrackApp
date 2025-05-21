import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { UserProvider } from '../contexts/UserContext';
import { DashboardProvider } from "../contexts/DashboardContext"


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <UserProvider>
      <DashboardProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack 
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background }
        }}
      />
      </DashboardProvider>
    </UserProvider>
  );
}