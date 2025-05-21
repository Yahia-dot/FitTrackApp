// _layout.jsx
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { UserProvider } from '../contexts/UserContext';
import { DashboardProvider } from "../contexts/DashboardContext";
import { ProfileProvider } from "../contexts/ProfileContext";
import { SettingsProvider } from '../contexts/SettingsContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useTheme } from '../hooks/useTheme';

// We need a separate component to use the theme
function AppLayout() {
  const { theme, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background }
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <SettingsProvider>
        <ThemeProvider>
          <DashboardProvider>
            <ProfileProvider>
              <AppLayout />
            </ProfileProvider>
          </DashboardProvider>
        </ThemeProvider>
      </SettingsProvider>
    </UserProvider>
  );
}