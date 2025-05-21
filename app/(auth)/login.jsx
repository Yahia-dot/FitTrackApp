// app/(auth)/login.js
import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router'; // Use Expo Router's hook
import { FontAwesome5 } from '@expo/vector-icons';

// Import hooks and context
import { useUser } from '../../hooks/useUser';

// Import themed components
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedTextInput from '../../components/ThemedTextInput';
import ThemedButton from '../../components/ThemedButton';
import ThemedLogo from '../../components/ThemedLogo';
import Spacer from '../../components/Spacer';
import { Colors } from '../../constants/Colors';

const Login = () => {
  const router = useRouter(); // Use Expo Router
  const { login, loading } = useUser();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    
    try {
      await login(email, password);
      // After successful login, redirect to dashboard
      router.replace('/(dashboard)');
    } catch (error) {
      setError(error.message);
    }
  };
  
  return (
    <ThemedView>
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <ThemedView style={styles.container}>
            {/* Header with back button */}
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={() => router.back()} // Use router.back()
                style={styles.backButton}
              >
                <FontAwesome5 name="arrow-left" size={18} color={Colors.primary} />
              </TouchableOpacity>
              
              <View style={styles.logoSmall}>
                <ThemedLogo size={24} animated={false} />
              </View>
            </View>
            
            <Spacer size="large" />
            
            {/* Form title */}
            <View style={styles.titleContainer}>
              <ThemedText variant="title" style={styles.title}>Welcome Back</ThemedText>
              <Spacer size="small" />
              <ThemedText variant="caption">Sign in to continue your fitness journey</ThemedText>
            </View>
            
            <Spacer size="xlarge" />
            
            {/* Login form */}
            <View style={styles.formContainer}>
              <ThemedTextInput 
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <Spacer size="medium" />
              
              <ThemedTextInput 
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              
              <Spacer size="small" />
              
              <TouchableOpacity 
                onPress={() => router.push('/(auth)/forgotpassword')} // Use router.push
                style={styles.forgotPassword}
              >
                <ThemedText variant="caption" style={styles.forgotPasswordText}>
                  Forgot Password?
                </ThemedText>
              </TouchableOpacity>
              
              {error ? (
                <>
                  <Spacer size="medium" />
                  <View style={styles.errorContainer}>
                    <ThemedText variant="caption" style={styles.errorText}>
                      {error}
                    </ThemedText>
                  </View>
                </>
              ) : null}
              
              <Spacer size="xlarge" />
              
              <ThemedButton 
                title="Login" 
                variant="primary" 
                size="large" 
                loading={loading}
                onPress={handleLogin}
                style={styles.button}
              />
            </View>
            
            <Spacer size="xlarge" />
            
            {/* Register link */}
            <View style={styles.registerContainer}>
              <ThemedText variant="body">Don't have an account?</ThemedText>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <ThemedText 
                  variant="body" 
                  style={{ 
                    color: Colors.primary, 
                    fontWeight: 'bold',
                    marginLeft: 5 
                  }}
                >
                  Register
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </ThemedView>
  );
};

export default Login;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
  },
  backButton: {
    padding: 10,
  },
  logoSmall: {
    flex: 1,
    alignItems: 'center',
    marginRight: 40, // To offset the back button width
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
  },
  formContainer: {
    width: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: Colors.primary,
  },
  button: {
    height: 54,
    borderRadius: 12,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  errorContainer: {
    backgroundColor: `${Colors.warning}20`,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  errorText: {
    color: Colors.warning,
    textAlign: 'center',
  }
});