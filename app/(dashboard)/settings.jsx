import { StyleSheet, View, SafeAreaView, Switch, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useTheme } from '../../hooks/useTheme';
import { Colors } from '../../constants/Colors';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedButton from '../../components/ThemedButton';
import ThemedLoader from '../../components/ThemedLoader';
import ThemedTextInput from '../../components/ThemedTextInput';
import Spacer from '../../components/Spacer';
import Header from '../../components/Header';
import { FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

// Helper to format time from Date object or string
const formatTime = (time) => {
  if (!time) return '00:00';
  
  let date;
  if (typeof time === 'string') {
    const [hours, minutes] = time.split(':');
    date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
  } else {
    date = new Date(time);
  }
  
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

// Helper to convert time string to Date object
const parseTimeString = (timeString) => {
  if (!timeString) return new Date();
  
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));
  return date;
};

const Settings = () => {
  const { theme, setColorScheme } = useTheme();
  const { settings, loading, error, loadSettings, createSettings, updateSettings, deleteSettings } = useSettings();
  
  // State for our settings form
  const [darkMode, setDarkMode] = useState(false);
  const [workoutReminders, setWorkoutReminders] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(new Date());
  const [showWorkoutPicker, setShowWorkoutPicker] = useState(false);
  
  const [mealReminders, setMealReminders] = useState(false);
  const [breakfastTime, setBreakfastTime] = useState(new Date());
  const [showBreakfastPicker, setShowBreakfastPicker] = useState(false);
  const [lunchTime, setLunchTime] = useState(new Date());
  const [showLunchPicker, setShowLunchPicker] = useState(false);
  const [dinnerTime, setDinnerTime] = useState(new Date());
  const [showDinnerPicker, setShowDinnerPicker] = useState(false);
  
  const [otherReminder, setOtherReminder] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Format today's date for header
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
  
  // Load settings when they change
  useEffect(() => {
    if (settings) {
      setDarkMode(settings.darkMode || false);
      setWorkoutReminders(settings.workoutReminders || false);
      setWorkoutTime(parseTimeString(settings.workoutReminderTime));
      
      setMealReminders(settings.mealReminders || false);
      setBreakfastTime(parseTimeString(settings.breakfastReminderTime));
      setLunchTime(parseTimeString(settings.lunchReminderTime));
      setDinnerTime(parseTimeString(settings.dinnerReminderTime));
    }
  }, [settings]);
  
  // Handle dark mode toggle
  const handleDarkModeToggle = (value) => {
    setDarkMode(value);
    // Immediately update the theme for better UX
    setColorScheme(value ? 'dark' : 'light');
  };
  
  // Save all settings
  const handleSaveSettings = async () => {
    setIsSubmitting(true);
    
    const updatedSettings = {
      darkMode,
      workoutReminders,
      workoutReminderTime: `${workoutTime.getHours()}:${workoutTime.getMinutes()}`,
      mealReminders,
      breakfastReminderTime: `${breakfastTime.getHours()}:${breakfastTime.getMinutes()}`,
      lunchReminderTime: `${lunchTime.getHours()}:${lunchTime.getMinutes()}`,
      dinnerReminderTime: `${dinnerTime.getHours()}:${dinnerTime.getMinutes()}`,
    };
    
    try {
      if (settings) {
        await updateSettings(updatedSettings);
      } else {
        await createSettings(updatedSettings);
      }
      Alert.alert('Success', 'Your settings have been saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'There was a problem saving your settings.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset all settings
  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            if (settings) {
              const defaultSettings = {
                darkMode: false,
                workoutReminders: false,
                workoutReminderTime: '09:00',
                mealReminders: false,
                breakfastReminderTime: '08:00',
                lunchReminderTime: '12:00',
                dinnerReminderTime: '18:00',
              };
              
              // Update local state
              setDarkMode(defaultSettings.darkMode);
              setWorkoutReminders(defaultSettings.workoutReminders);
              setWorkoutTime(parseTimeString(defaultSettings.workoutReminderTime));
              setMealReminders(defaultSettings.mealReminders);
              setBreakfastTime(parseTimeString(defaultSettings.breakfastReminderTime));
              setLunchTime(parseTimeString(defaultSettings.lunchReminderTime));
              setDinnerTime(parseTimeString(defaultSettings.dinnerReminderTime));
              
              // Update theme immediately
              setColorScheme(defaultSettings.darkMode ? 'dark' : 'light');
              
              // Persist to storage
              updateSettings(defaultSettings);
            }
          }
        }
      ]
    );
  };
  
  // Delete all settings
  const handleDeleteSettings = () => {
    Alert.alert(
      'Delete Settings',
      'Are you sure you want to delete all your settings?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // Reset theme to system default before deleting
            setColorScheme('light');
            deleteSettings();
          }
        }
      ]
    );
  };
  
  // Time picker handlers
  const onWorkoutTimeChange = (event, selectedDate) => {
    const currentDate = selectedDate || workoutTime;
    setShowWorkoutPicker(false);
    setWorkoutTime(currentDate);
  };
  
  const onBreakfastTimeChange = (event, selectedDate) => {
    const currentDate = selectedDate || breakfastTime;
    setShowBreakfastPicker(false);
    setBreakfastTime(currentDate);
  };
  
  const onLunchTimeChange = (event, selectedDate) => {
    const currentDate = selectedDate || lunchTime;
    setShowLunchPicker(false);
    setLunchTime(currentDate);
  };
  
  const onDinnerTimeChange = (event, selectedDate) => {
    const currentDate = selectedDate || dinnerTime;
    setShowDinnerPicker(false);
    setDinnerTime(currentDate);
  };
  
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Header date={formattedDate} />
        <View style={styles.loaderContainer}>
          <ThemedLoader size="large" text="Loading your settings..." />
        </View>
      </ThemedView>
    );
  }
  
  if (error) {
    return (
      <ThemedView style={styles.container}>
        <Header date={formattedDate} />
        <View style={styles.errorContainer}>
          <ThemedText variant="subtitle" style={styles.errorText}>
            Error loading settings
          </ThemedText>
          <ThemedText style={styles.errorMessage}>
            {error}
          </ThemedText>
          <Spacer />
          <ThemedButton 
            title="Try Again" 
            onPress={loadSettings} 
            leftIcon={<FontAwesome5 name="sync" size={16} color="#fff" />}
          />
        </View>
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header date={formattedDate} />
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.settingsContainer}>
            
            <Spacer size="small" />
            
            {/* Appearance */}
            <View style={styles.settingsSection}>
              <View style={styles.sectionHeader}>
                <FontAwesome5 
                  name="palette" 
                  size={18} 
                  color={Colors.primary} 
                />
                <ThemedText variant="subtitle" style={styles.sectionTitle}>
                  Appearance
                </ThemedText>
              </View>
              
              <View style={styles.settingItem}>
                <ThemedText style={styles.settingLabel}>
                  Dark Mode
                </ThemedText>
                <Switch
                  value={darkMode}
                  onValueChange={handleDarkModeToggle}
                  trackColor={{ false: theme.uiBackground, true: Colors.primary }}
                  thumbColor={theme.background}
                />
              </View>
              
              <ThemedText variant="caption" style={styles.settingDescription}>
                Enable dark mode for a better experience in low light
              </ThemedText>
            </View>
            
            <Spacer />
            
            {/* Workout Reminders */}
            <View style={styles.settingsSection}>
              <View style={styles.sectionHeader}>
                <FontAwesome5 
                  name="dumbbell" 
                  size={18} 
                  color={Colors.primary} 
                />
                <ThemedText variant="subtitle" style={styles.sectionTitle}>
                  Workout Reminders
                </ThemedText>
              </View>
              
              <View style={styles.settingItem}>
                <ThemedText style={styles.settingLabel}>
                  Enable Workout Reminders
                </ThemedText>
                <Switch
                  value={workoutReminders}
                  onValueChange={setWorkoutReminders}
                  trackColor={{ false: theme.uiBackground, true: Colors.primary }}
                  thumbColor={theme.background}
                />
              </View>
              
              {workoutReminders && (
                <View style={styles.timePickerContainer}>
                  <ThemedText style={styles.timePickerLabel}>
                    Reminder Time
                  </ThemedText>
                  <TouchableOpacity 
                    style={[styles.timePicker, { backgroundColor: theme.uiBackground }]}
                    onPress={() => setShowWorkoutPicker(true)}
                  >
                    <ThemedText>{formatTime(workoutTime)}</ThemedText>
                    <FontAwesome5 
                      name="clock" 
                      size={16} 
                      color={theme.iconColor} 
                    />
                  </TouchableOpacity>
                  
                  {showWorkoutPicker && (
                    <DateTimePicker
                      value={workoutTime}
                      mode="time"
                      is24Hour={false}
                      display="default"
                      onChange={onWorkoutTimeChange}
                    />
                  )}
                </View>
              )}
            </View>
            
            <Spacer />
            
            {/* Meal Reminders */}
            <View style={styles.settingsSection}>
              <View style={styles.sectionHeader}>
                <FontAwesome5 
                  name="utensils" 
                  size={18} 
                  color={Colors.primary} 
                />
                <ThemedText variant="subtitle" style={styles.sectionTitle}>
                  Meal Reminders
                </ThemedText>
              </View>
              
              <View style={styles.settingItem}>
                <ThemedText style={styles.settingLabel}>
                  Enable Meal Reminders
                </ThemedText>
                <Switch
                  value={mealReminders}
                  onValueChange={setMealReminders}
                  trackColor={{ false: theme.uiBackground, true: Colors.primary }}
                  thumbColor={theme.background}
                />
              </View>
              
              {mealReminders && (
                <>
                  {/* Breakfast */}
                  <View style={styles.timePickerContainer}>
                    <ThemedText style={styles.timePickerLabel}>
                      Breakfast Reminder
                    </ThemedText>
                    <TouchableOpacity 
                      style={[styles.timePicker, { backgroundColor: theme.uiBackground }]}
                      onPress={() => setShowBreakfastPicker(true)}
                    >
                      <ThemedText>{formatTime(breakfastTime)}</ThemedText>
                      <FontAwesome5 
                        name="clock" 
                        size={16} 
                        color={theme.iconColor} 
                      />
                    </TouchableOpacity>
                    
                    {showBreakfastPicker && (
                      <DateTimePicker
                        value={breakfastTime}
                        mode="time"
                        is24Hour={false}
                        display="default"
                        onChange={onBreakfastTimeChange}
                      />
                    )}
                  </View>
                  
                  {/* Lunch */}
                  <View style={styles.timePickerContainer}>
                    <ThemedText style={styles.timePickerLabel}>
                      Lunch Reminder
                    </ThemedText>
                    <TouchableOpacity 
                      style={[styles.timePicker, { backgroundColor: theme.uiBackground }]}
                      onPress={() => setShowLunchPicker(true)}
                    >
                      <ThemedText>{formatTime(lunchTime)}</ThemedText>
                      <FontAwesome5 
                        name="clock" 
                        size={16} 
                        color={theme.iconColor} 
                      />
                    </TouchableOpacity>
                    
                    {showLunchPicker && (
                      <DateTimePicker
                        value={lunchTime}
                        mode="time"
                        is24Hour={false}
                        display="default"
                        onChange={onLunchTimeChange}
                      />
                    )}
                  </View>
                  
                  {/* Dinner */}
                  <View style={styles.timePickerContainer}>
                    <ThemedText style={styles.timePickerLabel}>
                      Dinner Reminder
                    </ThemedText>
                    <TouchableOpacity 
                      style={[styles.timePicker, { backgroundColor: theme.uiBackground }]}
                      onPress={() => setShowDinnerPicker(true)}
                    >
                      <ThemedText>{formatTime(dinnerTime)}</ThemedText>
                      <FontAwesome5 
                        name="clock" 
                        size={16} 
                        color={theme.iconColor} 
                      />
                    </TouchableOpacity>
                    
                    {showDinnerPicker && (
                      <DateTimePicker
                        value={dinnerTime}
                        mode="time"
                        is24Hour={false}
                        display="default"
                        onChange={onDinnerTimeChange}
                      />
                    )}
                  </View>
                </>
              )}
            </View>
            
            <Spacer />
            
            {/* Save Button */}
            <ThemedButton 
              title="Save Settings" 
              onPress={handleSaveSettings}
              loading={isSubmitting}
              leftIcon={!isSubmitting && <FontAwesome5 name="save" size={16} color="#fff" />}
              style={styles.saveButton}
            />
            
            <Spacer />
            
            {/* Settings Management */}
            <View style={styles.managementButtons}>
              <ThemedButton 
                title="Reset to Default" 
                onPress={handleResetSettings}
                variant="outline"
                leftIcon={<FontAwesome5 name="undo" size={16} color={Colors.primary} />}
                style={styles.resetButton}
              />
              
              <ThemedButton 
                title="Delete Settings" 
                onPress={handleDeleteSettings}
                variant="outline"
                leftIcon={<FontAwesome5 name="trash-alt" size={16} color={Colors.warning} />}
                style={[styles.deleteButton, { borderColor: Colors.warning }]}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
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
  },
  scrollContent: {
    flexGrow: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
  },
  errorMessage: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 8,
  },
  settingsContainer: {
    padding: 16,
  },
  settingsTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  settingsSection: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLabel: {
    fontWeight: '500',
  },
  settingDescription: {
    marginTop: 4,
    opacity: 0.7,
  },
  timePickerContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  timePickerLabel: {
    marginBottom: 8,
  },
  timePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  customReminderInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reminderInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  remindersList: {
    marginTop: 8,
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  reminderText: {
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  noRemindersText: {
    textAlign: 'center',
    marginVertical: 16,
    opacity: 0.7,
  },
  saveButton: {
    marginBottom: 16,
  },
  managementButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resetButton: {
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    flex: 1,
    marginLeft: 8,
  },
});