import React, { useState, useContext, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  Switch, 
  Alert,
  Platform
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';

// Import themed components
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedTextInput from '../../components/ThemedTextInput';
import ThemedButton from '../../components/ThemedButton';
import Spacer from '../../components/Spacer';
import ThemedLoader from '../../components/ThemedLoader';

// Import contexts
import { useUser } from '../../hooks/useUser';
import { UserProfilesContext } from '../../contexts/UserProfilesContext';
import { UserSettingsContext } from '../../contexts/UserSettingsContext';
import { Colors } from '../../constants/Colors';

const Settings = () => {
  const router = useRouter();
  const { user, logout } = useUser();
  const { 
    userProfile, 
    loading: profileLoading, 
    updateUserProfile,
    updateProfileImage,
    updateWeight,
    updateHeight,
    updateFitnessLevel
  } = useContext(UserProfilesContext);
  
  const { 
    userSettings, 
    darkMode, 
    notificationsEnabled, 
    loading: settingsLoading, 
    toggleDarkMode,
    toggleWorkoutReminders,
    updateWorkoutReminderTime,
    toggleMealReminders,
    updateMealReminderTimes
  } = useContext(UserSettingsContext);

  // Form fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('');
  
  // Time pickers
  const [showWorkoutTimePicker, setShowWorkoutTimePicker] = useState(false);
  const [showBreakfastTimePicker, setShowBreakfastTimePicker] = useState(false);
  const [showLunchTimePicker, setShowLunchTimePicker] = useState(false);
  const [showDinnerTimePicker, setShowDinnerTimePicker] = useState(false);
  
  // Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Loading states
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Load user data into form
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setAge(userProfile.age ? userProfile.age.toString() : '');
      setWeight(userProfile.weight ? userProfile.weight.toString() : '');
      setHeight(userProfile.height ? userProfile.height.toString() : '');
      setFitnessLevel(userProfile.fitnessLevel || 'beginner');
    }
  }, [userProfile]);

  // Format time string from "HH:MM" to display format
  const formatTimeString = (timeString) => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    
    if (Platform.OS === 'ios') {
      // iOS usually displays times in 12-hour format
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${period}`;
    } else {
      // Android often uses 24-hour format
      return timeString;
    }
  };

  // Time picker handlers
  const handleTimeChange = (event, selectedTime, type) => {
    if (Platform.OS === 'android') {
      setShowWorkoutTimePicker(false);
      setShowBreakfastTimePicker(false);
      setShowLunchTimePicker(false);
      setShowDinnerTimePicker(false);
    }
    
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      switch (type) {
        case 'workout':
          updateWorkoutReminderTime(timeString);
          break;
        case 'breakfast':
        case 'lunch':
        case 'dinner':
          const breakfast = type === 'breakfast' ? timeString : userSettings?.breakfastReminderTime;
          const lunch = type === 'lunch' ? timeString : userSettings?.lunchReminderTime;
          const dinner = type === 'dinner' ? timeString : userSettings?.dinnerReminderTime;
          updateMealReminderTimes(breakfast, lunch, dinner);
          break;
      }
    }
  };

  // Handles saving profile changes
  const handleSaveProfile = async () => {
    setUpdateLoading(true);
    
    try {
      await updateUserProfile({
        name,
        age: parseInt(age),
        weight: parseFloat(weight),
        height: parseFloat(height),
        fitnessLevel
      });
      
      setIsEditingProfile(false);
      Alert.alert('Success', 'Your profile has been updated.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      console.error('Update profile error:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle changing password
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      // Using Appwrite SDK through the account object
      await account.updatePassword(newPassword, currentPassword);
      
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Your password has been updated.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update password. Please check your current password.');
      console.error('Password update error:', error);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: confirmDeleteAccount 
        }
      ]
    );
  };

  // Confirm and process account deletion
  const confirmDeleteAccount = async () => {
    try {
      // Delete user from Appwrite
      await account.deleteSession('current');
      await account.delete();
      
      // Navigate to welcome screen
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete account. Please try again.');
      console.error('Delete account error:', error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
      console.error('Logout error:', error);
    }
  };

  if (profileLoading || settingsLoading) {
    return <ThemedLoader text="Loading settings..." />;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText variant="title" style={styles.headerTitle}>Settings</ThemedText>
          </View>
          
          <Spacer size="large" />
          
          {/* Profile Section */}
          <View style={styles.section}>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              Account & Profile
            </ThemedText>
            
            <Spacer size="medium" />
            
            {/* Profile Card */}
            <View style={styles.profileCard}>
              <TouchableOpacity 
                style={styles.profileImageContainer}
                onPress={updateProfileImage}
              >
                {userProfile?.profileImage ? (
                  <Image 
                    source={{ uri: userProfile.profileImage }} 
                    style={styles.profileImage} 
                  />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <FontAwesome5 name="user" size={40} color={Colors.primary} />
                  </View>
                )}
                <View style={styles.profileImageOverlay}>
                  <FontAwesome5 name="camera" size={16} color="#fff" />
                </View>
              </TouchableOpacity>
              
              <View style={styles.profileInfo}>
                <ThemedText variant="subtitle">{userProfile?.name}</ThemedText>
                <ThemedText variant="caption">{user?.email}</ThemedText>
              </View>
            </View>
            
            <Spacer size="medium" />
            
            {isEditingProfile ? (
              <>
                <ThemedTextInput 
                  label="Full Name"
                  value={name}
                  onChangeText={setName}
                />
                
                <Spacer size="small" />
                
                <ThemedTextInput 
                  label="Age"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                />
                
                <Spacer size="small" />
                
                <ThemedTextInput 
                  label="Weight (kg)"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                />
                
                <Spacer size="small" />
                
                <ThemedTextInput 
                  label="Height (cm)"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="decimal-pad"
                />
                
                <Spacer size="small" />
                
                <ThemedText variant="body">Fitness Level</ThemedText>
                <View style={styles.fitnessLevelContainer}>
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <TouchableOpacity 
                      key={level}
                      style={[
                        styles.fitnessLevelButton,
                        fitnessLevel === level && styles.fitnessLevelButtonActive
                      ]}
                      onPress={() => setFitnessLevel(level)}
                    >
                      <ThemedText 
                        variant="caption"
                        style={fitnessLevel === level && styles.fitnessLevelTextActive}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Spacer size="medium" />
                
                <View style={styles.buttonRow}>
                  <ThemedButton 
                    title="Cancel" 
                    variant="outline"
                    size="medium"
                    onPress={() => setIsEditingProfile(false)}
                    style={styles.buttonHalf}
                  />
                  <ThemedButton 
                    title="Save" 
                    variant="primary"
                    size="medium"
                    loading={updateLoading}
                    onPress={handleSaveProfile}
                    style={styles.buttonHalf}
                  />
                </View>
              </>
            ) : (
              <ThemedButton 
                title="Edit Profile" 
                variant="outline"
                icon="user-edit"
                onPress={() => setIsEditingProfile(true)}
              />
            )}
            
            <Spacer size="medium" />
            
            {isChangingPassword ? (
              <>
                <ThemedTextInput 
                  label="Current Password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                />
                
                <Spacer size="small" />
                
                <ThemedTextInput 
                  label="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
                
                <Spacer size="small" />
                
                <ThemedTextInput 
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
                
                <Spacer size="medium" />
                
                <View style={styles.buttonRow}>
                  <ThemedButton 
                    title="Cancel" 
                    variant="outline"
                    size="medium"
                    onPress={() => setIsChangingPassword(false)}
                    style={styles.buttonHalf}
                  />
                  <ThemedButton 
                    title="Update" 
                    variant="primary"
                    size="medium"
                    loading={passwordLoading}
                    onPress={handleChangePassword}
                    style={styles.buttonHalf}
                  />
                </View>
              </>
            ) : (
              <ThemedButton 
                title="Change Password" 
                variant="outline"
                icon="lock"
                onPress={() => setIsChangingPassword(true)}
              />
            )}
          </View>
          
          <Spacer size="large" />
          
          {/* App Preferences Section */}
          <View style={styles.section}>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              App Preferences
            </ThemedText>
            
            <Spacer size="medium" />
            
            {/* Dark Mode Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <FontAwesome5 name="moon" size={18} color={Colors.primary} style={styles.settingIcon} />
                <ThemedText variant="body">Dark Mode</ThemedText>
              </View>
              <Switch
                value={darkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#d1d1d6', true: `${Colors.primary}80` }}
                thumbColor={darkMode ? Colors.primary : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.divider} />
            
            {/* Workout Reminders */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <FontAwesome5 name="bell" size={18} color={Colors.primary} style={styles.settingIcon} />
                <ThemedText variant="body">Workout Reminders</ThemedText>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleWorkoutReminders}
                trackColor={{ false: '#d1d1d6', true: `${Colors.primary}80` }}
                thumbColor={notificationsEnabled ? Colors.primary : '#f4f3f4'}
              />
            </View>
            
            {notificationsEnabled && (
              <TouchableOpacity 
                style={styles.timeSetting}
                onPress={() => setShowWorkoutTimePicker(true)}
              >
                <ThemedText variant="caption">
                  Reminder Time: {formatTimeString(userSettings?.workoutReminderTime)}
                </ThemedText>
              </TouchableOpacity>
            )}
            
            <View style={styles.divider} />
            
            {/* Meal Reminders */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <FontAwesome5 name="utensils" size={18} color={Colors.primary} style={styles.settingIcon} />
                <ThemedText variant="body">Meal Reminders</ThemedText>
              </View>
              <Switch
                value={userSettings?.mealReminders}
                onValueChange={toggleMealReminders}
                trackColor={{ false: '#d1d1d6', true: `${Colors.primary}80` }}
                thumbColor={userSettings?.mealReminders ? Colors.primary : '#f4f3f4'}
              />
            </View>
            
            {userSettings?.mealReminders && (
              <>
                <TouchableOpacity 
                  style={styles.timeSetting}
                  onPress={() => setShowBreakfastTimePicker(true)}
                >
                  <ThemedText variant="caption">
                    Breakfast: {formatTimeString(userSettings?.breakfastReminderTime)}
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.timeSetting}
                  onPress={() => setShowLunchTimePicker(true)}
                >
                  <ThemedText variant="caption">
                    Lunch: {formatTimeString(userSettings?.lunchReminderTime)}
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.timeSetting}
                  onPress={() => setShowDinnerTimePicker(true)}
                >
                  <ThemedText variant="caption">
                    Dinner: {formatTimeString(userSettings?.dinnerReminderTime)}
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}
          </View>
          
          <Spacer size="large" />
          
          {/* Privacy & Data Section */}
          <View style={styles.section}>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              Privacy & Data
            </ThemedText>
            
            <Spacer size="medium" />
            
            <ThemedButton 
              title="Log Out" 
              variant="outline"
              icon="sign-out-alt"
              onPress={handleLogout}
            />
            
            <Spacer size="medium" />
            
            <ThemedButton 
              title="Delete Account" 
              variant="danger"
              icon="trash-alt"
              onPress={handleDeleteAccount}
            />
          </View>
          
          <Spacer size="xlarge" />
        </ScrollView>
      </SafeAreaView>
      
      {/* Time Pickers */}
      {showWorkoutTimePicker && (
        <DateTimePicker
          value={(() => {
            const [hours, minutes] = (userSettings?.workoutReminderTime || '08:00').split(':');
            const date = new Date();
            date.setHours(parseInt(hours, 10));
            date.setMinutes(parseInt(minutes, 10));
            return date;
          })()}
          mode="time"
          is24Hour={Platform.OS === 'android'}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedTime) => handleTimeChange(event, selectedTime, 'workout')}
          onDismiss={() => setShowWorkoutTimePicker(false)}
        />
      )}
      
      {showBreakfastTimePicker && (
        <DateTimePicker
          value={(() => {
            const [hours, minutes] = (userSettings?.breakfastReminderTime || '07:30').split(':');
            const date = new Date();
            date.setHours(parseInt(hours, 10));
            date.setMinutes(parseInt(minutes, 10));
            return date;
          })()}
          mode="time"
          is24Hour={Platform.OS === 'android'}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedTime) => handleTimeChange(event, selectedTime, 'breakfast')}
          onDismiss={() => setShowBreakfastTimePicker(false)}
        />
      )}
      
      {showLunchTimePicker && (
        <DateTimePicker
          value={(() => {
            const [hours, minutes] = (userSettings?.lunchReminderTime || '12:30').split(':');
            const date = new Date();
            date.setHours(parseInt(hours, 10));
            date.setMinutes(parseInt(minutes, 10));
            return date;
          })()}
          mode="time"
          is24Hour={Platform.OS === 'android'}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedTime) => handleTimeChange(event, selectedTime, 'lunch')}
          onDismiss={() => setShowLunchTimePicker(false)}
        />
      )}
      
      {showDinnerTimePicker && (
        <DateTimePicker
          value={(() => {
            const [hours, minutes] = (userSettings?.dinnerReminderTime || '18:30').split(':');
            const date = new Date();
            date.setHours(parseInt(hours, 10));
            date.setMinutes(parseInt(minutes, 10));
            return date;
          })()}
          mode="time"
          is24Hour={Platform.OS === 'android'}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedTime) => handleTimeChange(event, selectedTime, 'dinner')}
          onDismiss={() => setShowDinnerTimePicker(false)}
        />
      )}
    </ThemedView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    marginLeft: 16,
  },
  fitnessLevelContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  fitnessLevelButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  fitnessLevelButtonActive: {
    backgroundColor: Colors.primary,
  },
  fitnessLevelTextActive: {
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonHalf: {
    flex: 1,
    marginHorizontal: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  timeSetting: {
    paddingVertical: 8,
    paddingLeft: 36,
  }
});