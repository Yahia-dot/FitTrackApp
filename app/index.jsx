// app/index.js
import React from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router'; // Import useRouter instead of useNavigation

// Import themed components
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import ThemedLogo from '../components/ThemedLogo';
import ThemedButton from '../components/ThemedButton';
import Spacer from '../components/Spacer';
import { Colors } from '../constants/Colors';
import { useTheme } from '../hooks/useTheme';

const Index = () => {
  const router = useRouter(); // Use Expo Router's router
  const { theme: colors, isDark } = useTheme(); // Replace useColorScheme


  return (
    <ThemedView>
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      
      <ThemedView style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <ThemedLogo size={90} animated={true} />
            <Spacer size="large" />
            <ThemedText variant="title" style={styles.appTitle}>
              FitTrack
            </ThemedText>
            <Spacer size="small" />
            <ThemedText variant="caption" style={styles.tagline}>
              Track your fitness journey through every trail
            </ThemedText>
          </View>
          
          <Spacer size="xlarge" />
          
          <View style={styles.buttonContainer}>
            <ThemedButton 
              title="Login" 
              variant="primary" 
              size="large" 
              onPress={() => router.push('/(auth)/login')} // Use router.push with the correct path
              style={styles.button}
            />
            <Spacer size="medium" />
            <ThemedButton 
              title="Register" 
              variant="outline" 
              size="large" 
              onPress={() => router.push('/(auth)/register')} // Use router.push with the correct path
              style={styles.button}
            />
          </View>
        </View>
        
        <ThemedText variant="caption" style={styles.policyText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </ThemedText>
      </ThemedView>
    </SafeAreaView>
    </ThemedView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 36,
    letterSpacing: 0.5,
  },
  tagline: {
    textAlign: 'center',
    fontSize: 16,
    maxWidth: '80%',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    width: '100%',
    height: 54,
    borderRadius: 12,
  },
  policyText: {
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.8,
    paddingHorizontal: 20,
  }
});