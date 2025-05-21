import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import UserOnly from '../../components/auth/UserOnly';
import { useTheme } from '../../hooks/useTheme';

export default function DashboardLayout() {
  const { theme } = useTheme();

  return (
    <UserOnly>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.navBackground,
            height: 75,
            borderTopWidth: 0.5,
            borderTopColor: theme.iconColor + '33', // subtle border
            elevation: 0,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            marginBottom: 4,
          },
          tabBarActiveTintColor: theme.iconColorFocused,
          tabBarInactiveTintColor: theme.iconColor,
        }}
      >
        {[
          { name: 'index', title: 'Home', icon: 'home' },
          { name: 'workout', title: 'Workouts', icon: 'dumbbell' },
          { name: 'nutrition', title: 'Nutrition', icon: 'apple-alt' },
          { name: 'progress', title: 'Progress', icon: 'chart-line' },
          { name: 'profile', title: 'Profile', icon: 'user' },
          { name: 'settings', title: 'Settings', icon: 'cog' },
        ].map(({ name, title, icon }) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title,
              tabBarIcon: ({ color }) => (
                <FontAwesome5 name={icon} size={20} color={color} />
              ),
            }}
          />
        ))}
      </Tabs>
    </UserOnly>
  );
}
