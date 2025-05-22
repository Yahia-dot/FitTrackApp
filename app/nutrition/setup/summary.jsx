import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  Alert, 
  ScrollView, 
  SafeAreaView,
  TouchableOpacity,
  View,
  Animated,
  Dimensions 
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "../../../hooks/useTheme";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import ThemedButton from "../../../components/ThemedButton";
import ThemedLoader from "../../../components/ThemedLoader";
import Header from "../../../components/Header";
import SummaryBanner from "../../../components/Nutrition/SummaryBanner";
import Spacer from "../../../components/Spacer";
import { useNutritionPlan } from "../../../hooks/useNutritionPlan";
import { useUser } from "../../../hooks/useUser";
import { filterMealsByPreferences } from "../../../utils/filterMeals";
import { generateMealPlan } from "../../../utils/generateMealPlan";
import { Colors } from "../../../constants/Colors";
import { FontAwesome5 } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

export default function Summary() {
  const { goal, mealsPerDay, foodsToAvoid } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  const { user } = useUser();
  const {
    createPlan,
    mealsLibrary,
    loading: isLoadingLibrary,
  } = useNutritionPlan();

  const [estimatedMeals, setEstimatedMeals] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  const parsedAvoidList = foodsToAvoid ? JSON.parse(foodsToAvoid) : [];

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

  useEffect(() => {
    if (!mealsLibrary || isLoadingLibrary) return;

    const filtered = filterMealsByPreferences(mealsLibrary, goal, parsedAvoidList);
    const combined = [
      ...(filtered.breakfast || []),
      ...(filtered.lunch || []),
      ...(filtered.dinner || []),
    ];

    const estimate = combined.slice(0, mealsPerDay); // just show sample
    setEstimatedMeals(estimate);
  }, [mealsLibrary, goal, mealsPerDay, foodsToAvoid]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const plan = await createPlan({
        goal,
        mealsPerDay: Number(mealsPerDay),
        foodsToAvoid: parsedAvoidList.join(", "),
      });

      const filtered = filterMealsByPreferences(mealsLibrary, goal, parsedAvoidList);
      await generateMealPlan({
        plan,
        filteredMeals: filtered,
        user,
      });

      router.replace("/nutrition/schedule/0");
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to generate plan.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getGoalIcon = (goal) => {
    switch (goal?.toLowerCase()) {
      case 'build muscle':
        return 'dumbbell';
      case 'lose fat':
        return 'fire';
      case 'maintain weight':
        return 'balance-scale';
      case 'improve performance':
        return 'bolt';
      default:
        return 'bullseye';
    }
  };

  const getGoalColor = (goal) => {
    switch (goal?.toLowerCase()) {
      case 'build muscle':
        return '#4CAF50';
      case 'lose fat':
        return '#FF5722';
      case 'maintain weight':
        return '#2196F3';
      case 'improve performance':
        return '#FF9800';
      default:
        return Colors.primary;
    }
  };

  const handleEditStep = (step) => {
    switch (step) {
      case 'goal':
        router.push("/nutrition/setup/goal");
        break;
      case 'frequency':
        router.push({
          pathname: "/nutrition/setup/frequency",
          params: { goal },
        });
        break;
      case 'avoid':
        router.push({
          pathname: "/nutrition/setup/avoid",
          params: { goal, mealsPerDay },
        });
        break;
    }
  };

  if (isLoadingLibrary) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView />
        <Header pageTitle="Generating Plan" />
        <ThemedLoader text="Loading meal database..." />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView />
      <Header pageTitle="Plan Summary" />
      
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
                    width: '100%' // Step 4 of 4
                  }
                ]} 
              />
            </View>
            <ThemedText variant="caption" style={styles.progressText}>
              Step 4 of 4 - Ready to Generate!
            </ThemedText>
          </View>

          <Spacer size="medium" />

          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={[styles.successIcon, { backgroundColor: Colors.primary }]}>
              <FontAwesome5 name="check" size={24} color="#fff" />
            </View>
            <ThemedText variant="title" style={styles.title}>
              Confirm Your Plan
            </ThemedText>
            <ThemedText variant="body" style={styles.subtitle}>
              Review your preferences before we create your personalized meal plan
            </ThemedText>
          </View>

          <Spacer size="large" />

          {/* Plan Summary Cards */}
          <View style={styles.summaryCards}>
            {/* Goal Card */}
            <TouchableOpacity 
              style={[styles.summaryCard, { backgroundColor: theme.uiBackground }]}
              onPress={() => handleEditStep('goal')}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <View style={[styles.cardIcon, { backgroundColor: getGoalColor(goal) }]}>
                  <FontAwesome5 name={getGoalIcon(goal)} size={20} color="#fff" />
                </View>
                <View style={styles.cardInfo}>
                  <ThemedText variant="caption" style={styles.cardLabel}>
                    Fitness Goal
                  </ThemedText>
                  <ThemedText variant="subtitle" style={styles.cardValue}>
                    {goal}
                  </ThemedText>
                </View>
              </View>
              <FontAwesome5 name="edit" size={14} color={theme.iconColor} />
            </TouchableOpacity>

            {/* Frequency Card */}
            <TouchableOpacity 
              style={[styles.summaryCard, { backgroundColor: theme.uiBackground }]}
              onPress={() => handleEditStep('frequency')}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <View style={[styles.cardIcon, { backgroundColor: Colors.primary }]}>
                  <FontAwesome5 name="utensils" size={20} color="#fff" />
                </View>
                <View style={styles.cardInfo}>
                  <ThemedText variant="caption" style={styles.cardLabel}>
                    Daily Meals
                  </ThemedText>
                  <ThemedText variant="subtitle" style={styles.cardValue}>
                    {mealsPerDay} meals per day
                  </ThemedText>
                </View>
              </View>
              <FontAwesome5 name="edit" size={14} color={theme.iconColor} />
            </TouchableOpacity>

            {/* Restrictions Card */}
            <TouchableOpacity 
              style={[styles.summaryCard, { backgroundColor: theme.uiBackground }]}
              onPress={() => handleEditStep('avoid')}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <View style={[styles.cardIcon, { backgroundColor: Colors.warning }]}>
                  <FontAwesome5 name="ban" size={20} color="#fff" />
                </View>
                <View style={styles.cardInfo}>
                  <ThemedText variant="caption" style={styles.cardLabel}>
                    Food Restrictions
                  </ThemedText>
                  <ThemedText variant="subtitle" style={styles.cardValue}>
                    {parsedAvoidList.length > 0 
                      ? `${parsedAvoidList.length} restriction${parsedAvoidList.length > 1 ? 's' : ''}`
                      : "None specified"
                    }
                  </ThemedText>
                  {parsedAvoidList.length > 0 && (
                    <View style={styles.restrictionsList}>
                      {parsedAvoidList.slice(0, 3).map((item, index) => (
                        <View key={index} style={styles.restrictionChip}>
                          <ThemedText variant="caption" style={styles.restrictionText}>
                            {item}
                          </ThemedText>
                        </View>
                      ))}
                      {parsedAvoidList.length > 3 && (
                        <View style={styles.restrictionChip}>
                          <ThemedText variant="caption" style={styles.restrictionText}>
                            +{parsedAvoidList.length - 3} more
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
              <FontAwesome5 name="edit" size={14} color={theme.iconColor} />
            </TouchableOpacity>
          </View>

          <Spacer size="large" />

          {/* Preview Section */}
          <View style={[styles.previewContainer, { backgroundColor: theme.uiBackground }]}>
            <View style={styles.previewHeader}>
              <FontAwesome5 name="eye" size={16} color={Colors.primary} />
              <ThemedText variant="subtitle" style={styles.previewTitle}>
                Meal Plan Preview
              </ThemedText>
            </View>
            
            <ThemedText variant="caption" style={styles.previewDescription}>
              Here's a sample of what your personalized meal plan might include:
            </ThemedText>

            {estimatedMeals.length > 0 ? (
              <SummaryBanner meals={estimatedMeals} />
            ) : (
              <View style={styles.previewPlaceholder}>
                <FontAwesome5 name="utensils" size={24} color={theme.iconColor} />
                <ThemedText variant="caption" style={styles.placeholderText}>
                  Meal preview will be generated based on your preferences
                </ThemedText>
              </View>
            )}
          </View>

          <Spacer size="large" />

          {/* Features Banner */}
          <View style={[styles.featuresBanner, { backgroundColor: Colors.primary }]}>
            <View style={styles.featuresHeader}>
              <FontAwesome5 name="sparkles" size={16} color="#fff" />
              <ThemedText style={styles.featuresTitle}>
                What happens next?
              </ThemedText>
            </View>
            
            <View style={styles.featuresList}>
              {[
                "Generate 7-day meal schedule",
                "Match meals to your preferences", 
                "Calculate nutrition targets",
                "Create shopping lists"
              ].map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <FontAwesome5 name="check-circle" size={12} color="#fff" />
                  <ThemedText style={styles.featureText}>{feature}</ThemedText>
                </View>
              ))}
            </View>
          </View>

          <Spacer size="large" />
        </Animated.View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={[styles.bottomContainer, { backgroundColor: theme.background }]}>
        <ThemedButton
          title={isGenerating ? "Creating Your Plan..." : "Generate My Plan"}
          onPress={handleGenerate}
          disabled={isLoadingLibrary || isGenerating}
          size="large"
          style={styles.generateButton}
          loading={isGenerating}
          leftIcon={
            !isGenerating && <FontAwesome5 name="magic" size={16} color="#fff" />
          }
        />
        
        <View style={styles.helpText}>
          <FontAwesome5 name="clock" size={12} color={theme.iconColor} />
          <ThemedText variant="caption" style={styles.helpTextContent}>
            This may take a few moments to complete
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
    color: Colors.primary,
  },
  headerSection: {
    alignItems: 'center',
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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
  summaryCards: {
    gap: 12,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardLabel: {
    opacity: 0.7,
    marginBottom: 4,
    fontWeight: '500',
  },
  cardValue: {
    fontWeight: 'bold',
  },
  restrictionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  restrictionChip: {
    backgroundColor: 'rgba(188, 71, 73, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  restrictionText: {
    color: Colors.warning,
    fontSize: 11,
    fontWeight: '500',
  },
  previewContainer: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  previewDescription: {
    opacity: 0.8,
    marginBottom: 16,
    lineHeight: 18,
  },
  previewPlaceholder: {
    alignItems: 'center',
    paddingVertical: 32,
    opacity: 0.5,
  },
  placeholderText: {
    marginTop: 12,
    textAlign: 'center',
  },
  featuresBanner: {
    borderRadius: 16,
    padding: 20,
  },
  featuresHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featuresTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
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
  generateButton: {
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