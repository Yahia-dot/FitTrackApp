// app/(auth)/_layout.js
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

import GuestOnly from '../../components/auth/GuestOnly';

export default function AuthLayout() {
  return (
    <GuestOnly>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{ 
          headerShown: false, 
          animation: "slide_from_right" 
        }}
      />
    </GuestOnly>
  );
}