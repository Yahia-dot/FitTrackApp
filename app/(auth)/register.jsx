// app/(auth)/register.js
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

const Register = () => {
  const router = useRouter(); // Use Expo Router
  const { register, loading } = useUser();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const handleRegister = async () => {
    // Form validation
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!termsAccepted) {
      setError('Please accept the Terms of Service');
      return;
    }
    
    setError('');
    
    try {
      await register(email, password, fullName);
      // After successful registration, redirect to dashboard
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
              <ThemedText variant="title" style={styles.title}>Create Account</ThemedText>
              <Spacer size="small" />
              <ThemedText variant="caption">Join the FitTrack community</ThemedText>
            </View>
            
            <Spacer size="xlarge" />
            
            {/* Registration form */}
            <View style={styles.formContainer}>
              <ThemedTextInput 
                label="Full Name"
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
              />
              
              <Spacer size="medium" />
              
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
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              
              <Spacer size="medium" />
              
              <ThemedTextInput 
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              
              <Spacer size="xlarge" />
              
              {/* Terms and conditions checkbox */}
              <TouchableOpacity 
                style={styles.termsContainer}
                onPress={() => setTermsAccepted(!termsAccepted)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkbox, 
                  termsAccepted && styles.checkboxActive
                ]}>
                  {termsAccepted && (
                    <FontAwesome5 
                      name="check" 
                      size={12} 
                      color="#fff" 
                    />
                  )}
                </View>
                <ThemedText variant="caption" style={styles.termsText}>
                  I agree to the Terms of Service and Privacy Policy
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
              
              <Spacer size="large" />
              
              <ThemedButton 
                title="Register" 
                variant="primary" 
                size="large" 
                loading={loading}
                onPress={handleRegister}
                style={styles.button}
              />
            </View>
            
            <Spacer size="xlarge" />
            
            {/* Login link */}
            <View style={styles.loginContainer}>
              <ThemedText variant="body">Already have an account?</ThemedText>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <ThemedText 
                  variant="body" 
                  style={{ 
                    color: Colors.primary, 
                    fontWeight: 'bold',
                    marginLeft: 5 
                  }}
                >
                  Login
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

export default Register;

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
  button: {
    height: 54,
    borderRadius: 12,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22, 
    height: 22, 
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
  },
  termsText: {
    flex: 1,
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