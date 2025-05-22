import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, View, Animated } from "react-native";
import { useNutritionPlan } from "../../hooks/useNutritionPlan";
import { useTheme } from "../../hooks/useTheme";
import ThemedView from "../../components/ThemedView";
import ThemedText from "../../components/ThemedText";
import ThemedLogo from "../../components/ThemedLogo";
import { Colors } from "../../constants/Colors";
import { FontAwesome5 } from "@expo/vector-icons";

export default function Index() {
  const router = useRouter();
  const { plan, loading } = useNutritionPlan();
  const { theme } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [progressAnim] = useState(new Animated.Value(0));
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: "search", text: "Checking your nutrition plan..." },
    { icon: "cog", text: "Setting up your experience..." },
    { icon: "check-circle", text: "Almost ready!" }
  ];

  useEffect(() => {
    // Start entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate progress steps
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(stepInterval);
        return prev;
      });
    }, 1000);

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    return () => clearInterval(stepInterval);
  }, []);

  useEffect(() => {
    if (loading) return;

    // Add a slight delay before navigation for better UX
    const navigationTimer = setTimeout(() => {
      if (plan) {
        router.replace("/nutrition/schedule/0"); // default to Sunday
      } else {
        router.replace("/nutrition/setup/start");
      }
    }, 500);

    return () => clearTimeout(navigationTimer);
  }, [plan, loading]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <ThemedView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={[styles.logoBackground, { backgroundColor: theme.uiBackground }]}>
            <ThemedLogo size={48} animated={true} />
          </View>
          <ThemedText variant="title" style={styles.appTitle}>
            FitTrack
          </ThemedText>
          <ThemedText variant="caption" style={styles.appSubtitle}>
            Nutrition Module
          </ThemedText>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBackground, { backgroundColor: theme.uiBackground }]}>
              <Animated.View 
                style={[
                  styles.progressBar,
                  { 
                    backgroundColor: Colors.primary,
                    width: progressWidth 
                  }
                ]} 
              />
            </View>
          </View>

          {/* Current Step Display */}
          <View style={styles.stepContainer}>
            <View style={styles.stepIconContainer}>
              <View style={[styles.stepIcon, { backgroundColor: Colors.primary }]}>
                <FontAwesome5 
                  name={steps[currentStep]?.icon} 
                  size={20} 
                  color="#fff" 
                />
              </View>
            </View>
            
            <ThemedText variant="body" style={styles.stepText}>
              {steps[currentStep]?.text}
            </ThemedText>
          </View>

          {/* Step Indicators */}
          <View style={styles.indicatorsContainer}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor: index <= currentStep 
                      ? Colors.primary 
                      : theme.iconColor,
                    transform: [{ 
                      scale: index === currentStep ? 1.2 : 1 
                    }]
                  }
                ]}
              />
            ))}
          </View>
        </View>

        {/* Loading Tips */}
        <View style={[styles.tipsContainer, { backgroundColor: theme.uiBackground }]}>
          <FontAwesome5 name="lightbulb" size={16} color={Colors.warning} />
          <ThemedText variant="caption" style={styles.tipText}>
            {plan 
              ? "Great! Your nutrition plan is ready to view."
              : "We'll help you create a personalized meal plan in just a few steps."
            }
          </ThemedText>
        </View>
      </Animated.View>

      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        {[...Array(6)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.patternDot,
              {
                backgroundColor: theme.iconColor,
                opacity: 0.1,
                left: `${20 + (i * 15)}%`,
                top: `${10 + (i * 10)}%`,
              }
            ]}
          />
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: 'relative',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.primary,
  },
  appSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    fontWeight: '500',
  },
  progressSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 30,
  },
  progressBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  stepContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  stepIconContainer: {
    marginBottom: 16,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepText: {
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 16,
  },
  indicatorsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipText: {
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  patternDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});