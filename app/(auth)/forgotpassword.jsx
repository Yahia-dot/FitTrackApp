// app/(auth)/forgot-password.js
import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router'; // Use Expo Router's hook
import { FontAwesome5 } from '@expo/vector-icons';

// Import from appwrite
import { account } from '../../lib/appwrite';

// Import themed components
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedTextInput from '../../components/ThemedTextInput';
import ThemedButton from '../../components/ThemedButton';
import ThemedLogo from '../../components/ThemedLogo';
import Spacer from '../../components/Spacer';
import { Colors } from '../../constants/Colors';

const ForgotPassword = () => {
  const router = useRouter(); // Use Expo Router
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // Use Appwrite to send password recovery email
      await account.createRecovery(email, 'https://yourapp.com/recovery');
      setSuccess(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
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
              <ThemedText variant="title" style={styles.title}>Forgot Password</ThemedText>
              <Spacer size="small" />
              <ThemedText variant="caption" style={styles.subtitle}>
                Enter your email and we'll send you instructions to reset your password
              </ThemedText>
            </View>
            
            <Spacer size="xlarge" />
            
            {success ? (
              <View style={styles.successContainer}>
                <FontAwesome5 
                  name="check-circle" 
                  size={48} 
                  color={Colors.primary} 
                  style={styles.successIcon}
                />
                <Spacer size="large" />
                <ThemedText variant="subtitle" style={styles.successTitle}>
                  Reset Email Sent
                </ThemedText>
                <Spacer size="small" />
                <ThemedText variant="body" style={styles.successText}>
                  We've sent recovery instructions to your email. Please check your inbox.
                </ThemedText>
                <Spacer size="xlarge" />
                <ThemedButton 
                  title="Back to Login" 
                  variant="primary" 
                  size="large" 
                  onPress={() => router.push('/(auth)/login')} // Use router.push()
                  style={styles.button}
                />
              </View>
            ) : (
              <View style={styles.formContainer}>
                <ThemedTextInput 
                  label="Email"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                
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
                  title="Reset Password" 
                  variant="primary" 
                  size="large" 
                  loading={loading}
                  onPress={handleResetPassword}
                  style={styles.button}
                />
                
                <Spacer size="large" />
                
                <TouchableOpacity 
                  onPress={() => router.push('/(auth)/login')} // Use router.push()
                  style={styles.backToLogin}
                >
                  <ThemedText style={styles.backToLoginText}>
                    Back to Login
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </ThemedView>
  );
};

export default ForgotPassword;

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
  subtitle: {
    textAlign: 'center',
    maxWidth: '90%',
  },
  formContainer: {
    width: '100%',
  },
  button: {
    height: 54,
    borderRadius: 12,
  },
  backToLogin: {
    alignItems: 'center',
  },
  backToLoginText: {
    color: Colors.primary,
    fontWeight: '600',
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
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    textAlign: 'center',
    color: Colors.primary,
  },
  successText: {
    textAlign: 'center',
  }
});