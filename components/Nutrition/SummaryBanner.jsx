import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import ThemedText from "../ThemedText";
import { useTheme } from "../../hooks/useTheme";

const SummaryBanner = ({ meals = [], onPress }) => {
  const { theme } = useTheme();
  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const eatenCount = meals.filter((meal) => meal.isEaten).length;
  const totalMeals = meals.length;
  const remainingMeals = totalMeals - eatenCount;
  
  // Calculate progress percentage
  const progressPercentage = totalMeals > 0 ? (eatenCount / totalMeals) * 100 : 0;

  // Get status color based on progress
  const getStatusColor = () => {
    if (progressPercentage === 100) return Colors.primary;
    if (progressPercentage >= 50) return Colors.warning;
    return '#6c7d89';
  };

  // Get status message
  const getStatusMessage = () => {
    if (progressPercentage === 100) return "All meals completed! 🎉";
    if (progressPercentage >= 75) return "Almost there! 💪";
    if (progressPercentage >= 50) return "Making progress! 📈";
    if (progressPercentage > 0) return "Getting started! 🔥";
    return "Ready to start! ⚡";
  };

  const BannerContent = () => (
    <>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.leftHeader}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <FontAwesome5 name="utensils" size={18} color="#fff" />
          </View>
          <View style={styles.titleSection}>
            <ThemedText variant="subtitle" style={styles.mainTitle}>
              Today's Nutrition
            </ThemedText>
            <ThemedText variant="caption" style={styles.statusText}>
              {getStatusMessage()}
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.rightHeader}>
          <FontAwesome5 name="chevron-right" size={14} color="rgba(255,255,255,0.7)" />
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${progressPercentage}%`,
                backgroundColor: 'rgba(255,255,255,0.9)'
              }
            ]} 
          />
        </View>
        <ThemedText variant="caption" style={styles.progressText}>
          {eatenCount}/{totalMeals} meals completed
        </ThemedText>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <FontAwesome5 name="fire" size={14} color="#fff" />
          </View>
          <View style={styles.statText}>
            <ThemedText variant="caption" style={styles.statValue}>
              {totalCalories}
            </ThemedText>
            <ThemedText variant="caption" style={styles.statLabel}>
              calories
            </ThemedText>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <FontAwesome5 name="clock" size={14} color="#fff" />
          </View>
          <View style={styles.statText}>
            <ThemedText variant="caption" style={styles.statValue}>
              {remainingMeals}
            </ThemedText>
            <ThemedText variant="caption" style={styles.statLabel}>
              remaining
            </ThemedText>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <FontAwesome5 name="percentage" size={14} color="#fff" />
          </View>
          <View style={styles.statText}>
            <ThemedText variant="caption" style={styles.statValue}>
              {Math.round(progressPercentage)}%
            </ThemedText>
            <ThemedText variant="caption" style={styles.statLabel}>
              complete
            </ThemedText>
          </View>
        </View>
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity 
        style={[styles.banner, { backgroundColor: getStatusColor() }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <BannerContent />
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.banner, { backgroundColor: getStatusColor() }]}>
      <BannerContent />
    </View>
  );
};

export default SummaryBanner;

const styles = StyleSheet.create({
  banner: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  titleSection: {
    flex: 1,
  },
  mainTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 2,
  },
  statusText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "500",
  },
  rightHeader: {
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBackground: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    minWidth: 6,
  },
  progressText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    lineHeight: 18,
  },
  statLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 8,
  },
});