import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

import UserOnly from '../../components/auth/UserOnly';

export default function NutritionLayout() {
  return (
    <UserOnly>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
    </UserOnly>
  );
}
