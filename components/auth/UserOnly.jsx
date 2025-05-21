// components/auth/UserOnly.js
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter, useSegments } from 'expo-router'; // Use Expo Router hooks
import { useUser } from '../../hooks/useUser';
import ThemedLoader from '../ThemedLoader';

const UserOnly = ({ children }) => {
  const { user, authChecked } = useUser();
  const router = useRouter();
  const segments = useSegments(); // Get current path segments
  
  useEffect(() => {
    // Only redirect after auth has been checked
    if (!authChecked) return;
    
    // If user is not logged in, redirect to login
    if (!user) {
      router.replace('/(auth)/login');
    }
  }, [user, authChecked, router]);
  
  if (!authChecked || !user) {
    return <ThemedLoader text="Checking authentication..." />;
  }
  
  return children;
};

export default UserOnly;