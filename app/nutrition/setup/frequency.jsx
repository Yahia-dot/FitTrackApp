import React, { useState, useEffect } from "react";
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
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

const PRESETS = [
  {
    id: 3,
    value: 3,
    title: "3 Meals",
    subtitle: "Traditional approach",
    description: "Breakfast, lunch, and dinner",
    icon: "utensils",
    color: "#4CAF50",
    recommended: false
  },
  {
    id: 4,
    value: 4,
    title: "4 Meals", 
    subtitle: "Balanced option",
    description: "3 main meals + 1 snack",
    icon: "clock",
    color: "#2196F3",
    recommended: true
  },
  {
    id: 5,
    value: 5,
    title: "5 Meals",
    subtitle: "Frequent eating",
    description: "3 main meals + 2 snacks",
    icon: "chart-line",
    color: "#FF9800",
    recommended: false
  },
  {
    id: "Custom",
    value: "Custom",
    title: "Custom",
    subtitle: "Your preference",
    description: "Set your own meal frequency",
    icon: "cog",
    color: "#9C27B0",
    recommended: false
  }
];

export default function FrequencySetup() {
  const { goal } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const [selected, setSelected] = useState(null);
  const [customMeals, setCustomMeals] = useState("");
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

  const isCustom = selected === "Custom";
  const mealsPerDay = isCustom ? Number(customMeals) : Number(selected);
  const isValidSelection = mealsPerDay && !isNaN(mealsPerDay) && mealsPerDay >= 1 && mealsPerDay <= 10;

  const handleNext = () => {
    if (!isValidSelection) return;

    router.push({
      pathname: "/nutrition/setup/avoid",
      params: {
        goal,
        mealsPerDay,
      },
    });
  };

  const handlePresetSelect = (preset) => {
    setSelected(preset.id);
    if (preset.id !== "Custom") {
      setCustomMeals("");
    }
  };

  const getRecommendationText = () => {
    switch (goal?.toLowerCase()) {
      case 'build muscle':
        return "For muscle building, 4-5 meals help maintain protein synthesis";
      case 'lose fat':
        return "3-4 meals can help control hunger and maintain metabolism";
      case 'maintain weight':
        return "3-4 meals provide good balance for maintenance";
      case 'improve performance':
        return "4-5 meals optimize energy levels for training";
      default:
        return "4 meals per day is recommended for most fitness goals";
    }
  };

  const renderPresetCard = (preset, index) => {
    const isSelected = selected === preset.id;
    
    return (
      <Animated.View
        key={preset.id}
        style={[
          styles.presetCard,
          {
            backgroundColor: theme.uiBackground,
            borderColor: isSelected ? preset.color : 'transparent',
            borderWidth: isSelected ? 2 : 1,
            transform: [
  { scale: isSelected ? 1.02 : 1 },
  { translateY: slideAnim }
],
            opacity: fadeAnim,
          }
        ]}
      >
        <TouchableOpacity
          style={styles.presetCardContent}
          onPress={() => handlePresetSelect(preset)}
          activeOpacity={0.8}
        >
          {/* Header */}
          <View style={styles.presetHeader}>
            <View style={[styles.presetIcon, { backgroundColor: preset.color }]}>
              <FontAwesome5 name={preset.icon} size={20} color="#fff" />
            </View>
            
            <View style={styles.presetTitleContainer}>
              <View style={styles.titleRow}>
                <ThemedText variant="subtitle" style={styles.presetTitle}>
                  {preset.title}
                </ThemedText>
                {preset.recommended && (
                  <View style={[styles.recommendedBadge, { backgroundColor: Colors.primary }]}>
                    <FontAwesome5 name="star" size={10} color="#fff" />
                    <ThemedText style={styles.recommendedText}>Recommended</ThemedText>
                  </View>
                )}
              </View>
              <ThemedText variant="caption" style={styles.presetSubtitle}>
                {preset.subtitle}
              </ThemedText>
            </View>

            {/* Selection Indicator */}
            <View 
              style={[
                styles.selectionCircle,
                {
                  backgroundColor: isSelected ? preset.color : 'transparent',
                  borderColor: isSelected ? preset.color : theme.iconColor,
                }
              ]}
            >
              {isSelected && (
                <FontAwesome5 name="check" size={12} color="#fff" />
              )}
            </View>
          </View>

          {/* Description */}
          <ThemedText variant="caption" style={styles.presetDescription}>
            {preset.description}
          </ThemedText>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView />
      <Header />
      
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
                    width: '50%' // Step 2 of 4
                  }
                ]} 
              />
            </View>
            <ThemedText variant="caption" style={styles.progressText}>
              Step 2 of 4
            </ThemedText>
          </View>

          <Spacer size="medium" />

          {/* Header Section */}
          <View style={styles.headerSection}>
            <ThemedText variant="title" style={styles.title}>
              How many meals per day?
            </ThemedText>
            <ThemedText variant="body" style={styles.subtitle}>
              Choose the eating frequency that fits your lifestyle
            </ThemedText>
          </View>

          <Spacer size="medium" />

          {/* Recommendation Banner */}
          <View style={[styles.recommendationBanner, { backgroundColor: Colors.primary }]}>
            <FontAwesome5 name="lightbulb" size={16} color="#fff" />
            <ThemedText style={styles.recommendationText}>
              {getRecommendationText()}
            </ThemedText>
          </View>

          <Spacer size="large" />

          {/* Preset Options */}
          <View style={styles.presetsContainer}>
            {PRESETS.map((preset, index) => renderPresetCard(preset, index))}
          </View>

          {/* Custom Input */}
          {isCustom && (
            <Animated.View 
              style={[
                styles.customContainer,
                { backgroundColor: theme.uiBackground }
              ]}
            >
              <View style={styles.customHeader}>
                <FontAwesome5 name="edit" size={16} color={Colors.primary} />
                <ThemedText variant="subtitle" style={styles.customTitle}>
                  Custom Meal Count
                </ThemedText>
              </View>
              
              <ThemedTextInput
                label="Number of meals per day"
                placeholder="Enter number (1-10)"
                value={customMeals}
                onChangeText={setCustomMeals}
                style={styles.customInput}
                keyboardType="numeric"
              />
              
              {customMeals && !isValidSelection && (
                <View style={styles.errorContainer}>
                  <FontAwesome5 name="exclamation-triangle" size={12} color={Colors.warning} />
                  <ThemedText variant="caption" style={styles.errorText}>
                    Please enter a number between 1 and 10
                  </ThemedText>
                </View>
              )}
            </Animated.View>
          )}

          <Spacer size="large" />

          {/* Selection Summary */}
          {isValidSelection && (
            <Animated.View 
              style={[
                styles.summaryContainer,
                { backgroundColor: theme.background }
              ]}
            >
              <View style={styles.summaryHeader}>
                <FontAwesome5 name="info-circle" size={16} color={Colors.primary} />
                <ThemedText variant="subtitle" style={styles.summaryTitle}>
                  Your Meal Plan
                </ThemedText>
              </View>
              <ThemedText variant="caption" style={styles.summaryText}>
                We'll create a {mealsPerDay}-meal daily plan for your{" "}
                <ThemedText style={[styles.goalText, { color: Colors.primary }]}>
                  {goal?.toLowerCase()}
                </ThemedText>
                {" "}goal with proper portion sizes and timing.
              </ThemedText>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={[styles.bottomContainer, { backgroundColor: theme.background }]}>
        <ThemedButton
          title="Continue"
          onPress={handleNext}
          disabled={!isValidSelection}
          size="large"
          style={[
            styles.continueButton,
            !isValidSelection && styles.disabledButton
          ]}
          rightIcon={
            <FontAwesome5 
              name="arrow-right" 
              size={16} 
              color={isValidSelection ? "#fff" : theme.iconColor} 
            />
          }
        />
        
        <View style={styles.helpText}>
          <FontAwesome5 name="question-circle" size={12} color={theme.iconColor} />
          <ThemedText variant="caption" style={styles.helpTextContent}>
            This determines how we structure your daily nutrition
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  recommendationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  recommendationText: {
    color: '#fff',
    marginLeft: 12,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  presetsContainer: {
    gap: 12,
  },
  presetCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  presetCardContent: {
    gap: 12,
  },
  presetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  presetIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  presetTitleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  presetTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 8,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  presetSubtitle: {
    opacity: 0.7,
    fontWeight: '500',
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetDescription: {
    paddingLeft: 56,
    opacity: 0.8,
    lineHeight: 18,
  },
  customContainer: {
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  customTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  customInput: {
    marginBottom: 0,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    marginLeft: 6,
    color: Colors.warning,
    fontWeight: '500',
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
    marginBottom: 12,
  },
  summaryTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  summaryText: {
    lineHeight: 20,
    opacity: 0.8,
  },
  goalText: {
    fontWeight: 'bold',
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
  disabledButton: {
    opacity: 0.5,
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