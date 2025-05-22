import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  View,
  Animated,
  Dimensions 
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "../../../hooks/useTheme";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import ThemedTextInput from "../../../components/ThemedTextInput";
import ThemedButton from "../../../components/ThemedButton";
import Header from "../../../components/Header";
import Spacer from "../../../components/Spacer";
import { Colors } from "../../../constants/Colors";
import { FontAwesome5 } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

const COMMON_RESTRICTIONS = [
  { id: "dairy", label: "Dairy", icon: "cheese", color: "#FFC107" },
  { id: "gluten", label: "Gluten", icon: "bread-slice", color: "#FF9800" },
  { id: "nuts", label: "Nuts", icon: "seedling", color: "#8BC34A" },
  { id: "seafood", label: "Seafood", icon: "fish", color: "#00BCD4" },
  { id: "eggs", label: "Eggs", icon: "egg", color: "#FFEB3B" },
  { id: "soy", label: "Soy", icon: "leaf", color: "#4CAF50" },
  { id: "shellfish", label: "Shellfish", icon: "shrimp", color: "#FF5722" },
  { id: "peanuts", label: "Peanuts", icon: "circle", color: "#795548" },
];

const DIETARY_PREFERENCES = [
  { id: "vegetarian", label: "Vegetarian", icon: "carrot", color: "#4CAF50" },
  { id: "vegan", label: "Vegan", icon: "leaf", color: "#2E7D32" },
  { id: "keto", label: "Keto", icon: "bacon", color: "#FF5722" },
  { id: "paleo", label: "Paleo", icon: "drumstick-bite", color: "#8D6E63" },
];

export default function AvoidSetup() {
  const { goal, mealsPerDay } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const [avoidText, setAvoidText] = useState("");
  const [selectedRestrictions, setSelectedRestrictions] = useState([]);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRestrictionToggle = (restrictionId) => {
    setSelectedRestrictions(prev => 
      prev.includes(restrictionId) 
        ? prev.filter(id => id !== restrictionId)
        : [...prev, restrictionId]
    );
  };

  const handlePreferenceToggle = (preferenceId) => {
    setSelectedPreferences(prev => 
      prev.includes(preferenceId) 
        ? prev.filter(id => id !== preferenceId)
        : [...prev, preferenceId]
    );
  };

  const handleNext = () => {
    // Combine selected restrictions, preferences, and custom text
    const allAvoidances = [
      ...selectedRestrictions,
      ...selectedPreferences,
      ...avoidText.split(",").map(item => item.trim()).filter(Boolean)
    ];

    const uniqueAvoidances = [...new Set(allAvoidances)];

    router.push({
      pathname: "/nutrition/setup/summary",
      params: {
        goal,
        mealsPerDay,
        foodsToAvoid: JSON.stringify(uniqueAvoidances),
      },
    });
  };

  const clearAll = () => {
    setSelectedRestrictions([]);
    setSelectedPreferences([]);
    setAvoidText("");
  };

  const hasSelections = selectedRestrictions.length > 0 || 
                      selectedPreferences.length > 0 || 
                      avoidText.trim().length > 0;

  const renderQuickSelectButton = (item, isSelected, onToggle, category) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.quickSelectButton,
        {
          backgroundColor: isSelected ? item.color : theme.uiBackground,
          borderColor: isSelected ? item.color : 'transparent',
        }
      ]}
      onPress={() => onToggle(item.id)}
      activeOpacity={0.8}
    >
      <FontAwesome5 
        name={item.icon} 
        size={16} 
        color={isSelected ? "#fff" : theme.iconColor} 
      />
      <ThemedText 
        variant="caption" 
        style={[
          styles.quickSelectText,
          { color: isSelected ? "#fff" : theme.text }
        ]}
      >
        {item.label}
      </ThemedText>
      {isSelected && (
        <FontAwesome5 name="check" size={12} color="#fff" />
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView />
      <Header />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: theme.uiBackground }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: Colors.primary,
                      width: '75%' // Step 3 of 4
                    }
                  ]} 
                />
              </View>
              <ThemedText variant="caption" style={styles.progressText}>
                Step 3 of 4
              </ThemedText>
            </View>

            <Spacer size="medium" />

            {/* Header Section */}
            <View style={styles.headerSection}>
              <ThemedText variant="title" style={styles.title}>
                Any foods to avoid?
              </ThemedText>
              <ThemedText variant="body" style={styles.subtitle}>
                Help us customize your meal plan by selecting restrictions or preferences
              </ThemedText>
            </View>

            <Spacer size="large" />

            {/* Common Food Restrictions */}
            <View style={[styles.sectionContainer, { backgroundColor: theme.uiBackground }]}>
              <View style={styles.sectionHeader}>
                <FontAwesome5 name="ban" size={16} color={Colors.warning} />
                <ThemedText variant="subtitle" style={styles.sectionTitle}>
                  Common Allergies & Restrictions
                </ThemedText>
              </View>
              
              <View style={styles.quickSelectGrid}>
                {COMMON_RESTRICTIONS.map(item => 
                  renderQuickSelectButton(
                    item, 
                    selectedRestrictions.includes(item.id), 
                    handleRestrictionToggle,
                    'restrictions'
                  )
                )}
              </View>
            </View>

            <Spacer size="medium" />

            {/* Dietary Preferences */}
            <View style={[styles.sectionContainer, { backgroundColor: theme.uiBackground }]}>
              <View style={styles.sectionHeader}>
                <FontAwesome5 name="heart" size={16} color={Colors.primary} />
                <ThemedText variant="subtitle" style={styles.sectionTitle}>
                  Dietary Preferences
                </ThemedText>
              </View>
              
              <View style={styles.quickSelectGrid}>
                {DIETARY_PREFERENCES.map(item => 
                  renderQuickSelectButton(
                    item, 
                    selectedPreferences.includes(item.id), 
                    handlePreferenceToggle,
                    'preferences'
                  )
                )}
              </View>
            </View>

            <Spacer size="medium" />

            {/* Custom Input */}
            <View style={[styles.sectionContainer, { backgroundColor: theme.uiBackground }]}>
              <View style={styles.sectionHeader}>
                <FontAwesome5 name="edit" size={16} color={Colors.primary} />
                <ThemedText variant="subtitle" style={styles.sectionTitle}>
                  Additional Foods to Avoid
                </ThemedText>
              </View>
              
              <ThemedText variant="caption" style={styles.inputHint}>
                List any other ingredients you dislike or can't eat, separated by commas
              </ThemedText>
              
              <ThemedTextInput
                placeholder="e.g. spicy food, mushrooms, cilantro"
                value={avoidText}
                onChangeText={setAvoidText}
                style={styles.customInput}
                multiline
              />
            </View>

            <Spacer size="medium" />

            {/* Selection Summary */}
            {hasSelections && (
              <Animated.View 
                style={[
                  styles.summaryContainer,
                  { backgroundColor: theme.background }
                ]}
              >
                <View style={styles.summaryHeader}>
                  <FontAwesome5 name="list-check" size={16} color={Colors.primary} />
                  <ThemedText variant="subtitle" style={styles.summaryTitle}>
                    Your Preferences
                  </ThemedText>
                  <TouchableOpacity onPress={clearAll} style={styles.clearButton}>
                    <FontAwesome5 name="times" size={12} color={Colors.warning} />
                    <ThemedText variant="caption" style={styles.clearText}>
                      Clear All
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                <View style={styles.selectedItems}>
                  {/* Restrictions */}
                  {selectedRestrictions.map(id => {
                    const item = COMMON_RESTRICTIONS.find(r => r.id === id);
                    return (
                      <View key={id} style={[styles.selectedItem, { backgroundColor: item.color }]}>
                        <FontAwesome5 name={item.icon} size={12} color="#fff" />
                        <ThemedText style={styles.selectedItemText}>{item.label}</ThemedText>
                      </View>
                    );
                  })}

                  {/* Preferences */}
                  {selectedPreferences.map(id => {
                    const item = DIETARY_PREFERENCES.find(p => p.id === id);
                    return (
                      <View key={id} style={[styles.selectedItem, { backgroundColor: item.color }]}>
                        <FontAwesome5 name={item.icon} size={12} color="#fff" />
                        <ThemedText style={styles.selectedItemText}>{item.label}</ThemedText>
                      </View>
                    );
                  })}

                  {/* Custom items */}
                  {avoidText.trim() && avoidText.split(",").map((item, index) => {
                    const trimmedItem = item.trim();
                    if (!trimmedItem) return null;
                    return (
                      <View key={`custom-${index}`} style={[styles.selectedItem, { backgroundColor: theme.iconColor }]}>
                        <FontAwesome5 name="user" size={12} color="#fff" />
                        <ThemedText style={styles.selectedItemText}>{trimmedItem}</ThemedText>
                      </View>
                    );
                  })}
                </View>
              </Animated.View>
            )}

            <Spacer size="large" />
          </Animated.View>
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View style={[styles.bottomContainer, { backgroundColor: theme.background }]}>
          <ThemedButton
            title="Continue"
            onPress={handleNext}
            size="large"
            style={styles.continueButton}
            rightIcon={
              <FontAwesome5 name="arrow-right" size={16} color="#fff" />
            }
          />
          
          <View style={styles.helpText}>
            <FontAwesome5 name="info-circle" size={12} color={theme.iconColor} />
            <ThemedText variant="caption" style={styles.helpTextContent}>
              You can skip this step if you don't have any restrictions
            </ThemedText>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  content: {
    paddingTop: 10,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontWeight: '500',
    opacity: 0.7,
  },
  headerSection: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  sectionContainer: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
  quickSelectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  quickSelectText: {
    fontWeight: '500',
  },
  inputHint: {
    marginBottom: 12,
    opacity: 0.7,
    lineHeight: 18,
  },
  customInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 0,
  },
  summaryContainer: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
    flex: 1,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearText: {
    marginLeft: 4,
    color: Colors.warning,
    fontWeight: '500',
  },
  selectedItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 6,
  },
  selectedItemText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  continueButton: {
    width: '100%',
  },
  helpText: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  helpTextContent: {
    marginLeft: 6,
    opacity: 0.6,
  },
});