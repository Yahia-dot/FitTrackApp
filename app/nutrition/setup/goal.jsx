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
import { useRouter } from "expo-router";
import { useTheme } from "../../../hooks/useTheme";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import ThemedButton from "../../../components/ThemedButton";
import Header from "../../../components/Header";
import Spacer from "../../../components/Spacer";
import { Colors } from "../../../constants/Colors";
import { FontAwesome5 } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

const GOALS = [
  {
    id: "Build Muscle",
    title: "Build Muscle",
    description: "Gain lean muscle mass with protein-rich meals",
    icon: "dumbbell",
    color: "#4CAF50",
    benefits: ["High protein intake", "Calorie surplus", "Post-workout nutrition"]
  },
  {
    id: "Lose Fat",
    title: "Lose Fat", 
    description: "Burn fat while maintaining muscle with balanced nutrition",
    icon: "fire",
    color: "#FF5722",
    benefits: ["Calorie deficit", "Metabolism boost", "Nutrient dense foods"]
  },
  {
    id: "Maintain Weight",
    title: "Maintain Weight",
    description: "Sustain your current weight with balanced meals",
    icon: "balance-scale",
    color: "#2196F3",
    benefits: ["Calorie maintenance", "Balanced macros", "Consistent energy"]
  },
  {
    id: "Improve Performance",
    title: "Improve Performance",
    description: "Optimize energy and recovery for peak athletic performance",
    icon: "bolt",
    color: "#FF9800",
    benefits: ["Pre-workout fuel", "Recovery nutrition", "Endurance support"]
  },
];

export default function GoalSetup() {
  const router = useRouter();
  const { theme } = useTheme();
  const [selected, setSelected] = useState(null);
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

  const handleNext = () => {
    if (!selected) return;

    router.push({
      pathname: "/nutrition/setup/frequency",
      params: { goal: selected },
    });
  };

  const handleGoalSelect = (goalId) => {
    setSelected(goalId);
    
    // Add haptic feedback (if available)
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderGoalCard = (goal, index) => {
    const isSelected = selected === goal.id;
    
    return (
      <Animated.View
        key={goal.id}
        style={[
          styles.goalCard,
          {
            backgroundColor: theme.uiBackground,
            borderColor: isSelected ? goal.color : 'transparent',
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
          style={styles.goalCardContent}
          onPress={() => handleGoalSelect(goal.id)}
          activeOpacity={0.8}
        >
          {/* Header Section */}
          <View style={styles.goalHeader}>
            <View style={[styles.goalIcon, { backgroundColor: goal.color }]}>
              <FontAwesome5 name={goal.icon} size={24} color="#fff" />
            </View>
            
            {isSelected && (
              <View style={[styles.selectedBadge, { backgroundColor: goal.color }]}>
                <FontAwesome5 name="check" size={12} color="#fff" />
              </View>
            )}
          </View>

          {/* Content Section */}
          <View style={styles.goalContent}>
            <ThemedText variant="subtitle" style={styles.goalTitle}>
              {goal.title}
            </ThemedText>
            <ThemedText variant="caption" style={styles.goalDescription}>
              {goal.description}
            </ThemedText>
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsContainer}>
            {goal.benefits.map((benefit, benefitIndex) => (
              <View key={benefitIndex} style={styles.benefitItem}>
                <View style={[styles.benefitDot, { backgroundColor: goal.color }]} />
                <ThemedText variant="caption" style={styles.benefitText}>
                  {benefit}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* Selection Indicator */}
          <View style={styles.selectionIndicator}>
            <View 
              style={[
                styles.selectionCircle,
                {
                  backgroundColor: isSelected ? goal.color : 'transparent',
                  borderColor: isSelected ? goal.color : theme.iconColor,
                }
              ]}
            >
              {isSelected && (
                <FontAwesome5 name="check" size={14} color="#fff" />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView />
      <Header/>
      
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
                    width: '25%' // Step 1 of 4
                  }
                ]} 
              />
            </View>
            <ThemedText variant="caption" style={styles.progressText}>
              Step 1 of 4
            </ThemedText>
          </View>

          <Spacer size="medium" />

          {/* Header Section */}
          <View style={styles.headerSection}>
            <ThemedText variant="title" style={styles.title}>
              What's your fitness goal?
            </ThemedText>
            <ThemedText variant="body" style={styles.subtitle}>
              This helps us create the perfect meal plan for your journey
            </ThemedText>
          </View>

          <Spacer size="large" />

          {/* Goals Grid */}
          <View style={styles.goalsContainer}>
            {GOALS.map((goal, index) => renderGoalCard(goal, index))}
          </View>

          <Spacer size="large" />

          {/* Selected Goal Summary */}
          {selected && (
            <Animated.View 
              style={[
                styles.summaryContainer,
                { backgroundColor: theme.background }
              ]}
            >
              <View style={styles.summaryHeader}>
                <FontAwesome5 name="info-circle" size={16} color={Colors.primary} />
                <ThemedText variant="subtitle" style={styles.summaryTitle}>
                  Perfect Choice!
                </ThemedText>
              </View>
              <ThemedText variant="caption" style={styles.summaryText}>
                We'll design your meal plan specifically for{" "}
                <ThemedText style={[styles.selectedGoalText, { color: Colors.primary }]}>
                  {selected.toLowerCase()}
                </ThemedText>
                {" "}with the right balance of nutrients and calories.
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
          disabled={!selected}
          size="large"
          style={[
            styles.continueButton,
            !selected && styles.disabledButton
          ]}
          rightIcon={
            <FontAwesome5 
              name="arrow-right" 
              size={16} 
              color={selected ? "#fff" : theme.iconColor} 
            />
          }
        />
        
        <View style={styles.helpText}>
          <FontAwesome5 name="question-circle" size={12} color={theme.iconColor} />
          <ThemedText variant="caption" style={styles.helpTextContent}>
            You can change this later in your settings
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
    paddingBottom: 120, // Space for fixed bottom button
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
  goalsContainer: {
    gap: 16,
  },
  goalCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  goalCardContent: {
    position: 'relative',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  goalIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalContent: {
    marginBottom: 16,
  },
  goalTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 8,
  },
  goalDescription: {
    opacity: 0.8,
    lineHeight: 20,
  },
  benefitsContainer: {
    marginBottom: 16,
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  benefitText: {
    flex: 1,
    fontWeight: '500',
  },
  selectionIndicator: {
    alignItems: 'flex-end',
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
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
  selectedGoalText: {
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