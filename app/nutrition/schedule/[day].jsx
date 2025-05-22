import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useNutritionPlan } from "../../../hooks/useNutritionPlan";
import { useTheme } from "../../../hooks/useTheme";
import { databases } from "../../../lib/appwrite";
import { Query } from "appwrite";
import Constants from "expo-constants";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import ThemedLoader from "../../../components/ThemedLoader";
import Header from "../../../components/Header";
import MealCard from "../../../components/Nutrition/MealCard";
import SummaryBanner from "../../../components/Nutrition/SummaryBanner";
import Spacer from "../../../components/Spacer";
import { Colors } from "../../../constants/Colors";
import { FontAwesome5 } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

const {
  appwriteDatabaseId,
  mealSchedules,
  meals,
} = Constants.expoConfig.extra;

const ScheduleDay = () => {
  const { day } = useLocalSearchParams();
  const { plan } = useNutritionPlan();
  const { theme } = useTheme();
  const router = useRouter();
  
  const [scheduleId, setScheduleId] = useState(null);
  const [mealList, setMealList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = dayNames[Number(day)] || "Day";
  const isToday = new Date().getDay() === Number(day);

  const today = new Date();
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', options);

  const loadMealsForDay = async (showRefreshIndicator = false) => {
    if (!plan || day === undefined) return;

    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // 1. Find the schedule for this plan and day
      const scheduleRes = await databases.listDocuments(
        appwriteDatabaseId,
        mealSchedules,
        [
          Query.equal("nutritionPlanId", plan.$id),
          Query.equal("dayOfWeek", Number(day)),
        ]
      );

      if (scheduleRes.documents.length === 0) {
        setMealList([]);
        setError("No meals scheduled for this day");
        return;
      }

      const schedule = scheduleRes.documents[0];
      setScheduleId(schedule.$id);

      // 2. Load meals under that schedule
      const mealsRes = await databases.listDocuments(
        appwriteDatabaseId,
        meals,
        [Query.equal("mealScheduleId", schedule.$id)]
      );

      setMealList(mealsRes.documents);
    } catch (err) {
      console.error("Error loading meals:", err.message);
      setError("Failed to load meals. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleEaten = async (meal) => {
    try {
      await databases.updateDocument(
        appwriteDatabaseId,
        meals,
        meal.$id,
        { isEaten: !meal.isEaten }
      );
      setMealList((prev) =>
        prev.map((m) => (m.$id === meal.$id ? { ...m, isEaten: !m.isEaten } : m))
      );
    } catch (err) {
      console.error("Error updating meal:", err.message);
      Alert.alert("Error", "Failed to update meal status. Please try again.");
    }
  };

  const onRefresh = () => {
    loadMealsForDay(true);
  };

  useEffect(() => {
    loadMealsForDay();
  }, [day, plan]);

  const getDayIcon = () => {
    if (isToday) return "calendar-check";
    const dayIndex = Number(day);
    if (dayIndex === 0 || dayIndex === 6) return "calendar"; // Weekend
    return "calendar-alt"; // Weekday
  };

  const getDayColor = () => {
    if (isToday) return Colors.primary;
    return theme.iconColor;
  };

  const renderEmptyState = () => (
    <View style={[styles.emptyContainer, { backgroundColor: theme.uiBackground }]}>
      <View style={[styles.emptyIconContainer, { backgroundColor: Colors.warning }]}>
        <FontAwesome5 name="utensils" size={32} color="#fff" />
      </View>
      <ThemedText variant="subtitle" style={styles.emptyTitle}>
        No Meals Scheduled
      </ThemedText>
      <ThemedText variant="body" style={styles.emptyDescription}>
        {error || `No meals have been planned for ${dayName} yet.`}
      </ThemedText>
      <TouchableOpacity 
        style={[styles.emptyButton, { backgroundColor: Colors.primary }]}
        onPress={() => loadMealsForDay()}
      >
        <FontAwesome5 name="refresh" size={16} color="#fff" />
        <ThemedText style={styles.emptyButtonText}>Try Again</ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderDayNavigation = () => (
    <View style={[styles.navigationContainer, { backgroundColor: theme.uiBackground }]}>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => {
          const prevDay = Number(day) === 0 ? 6 : Number(day) - 1;
          router.replace(`/nutrition/schedule/${prevDay}`);
        }}
      >
        <FontAwesome5 name="chevron-left" size={16} color={theme.iconColor} />
      </TouchableOpacity>

      <View style={styles.dayInfo}>
        <View style={styles.dayHeader}>
          <FontAwesome5 name={getDayIcon()} size={18} color={getDayColor()} />
          <ThemedText variant="subtitle" style={[styles.dayTitle, isToday && { color: Colors.primary }]}>
            {dayName}
          </ThemedText>
        </View>
        {isToday && (
          <View style={[styles.todayBadge, { backgroundColor: Colors.primary }]}>
            <ThemedText style={styles.todayText}>Today</ThemedText>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => {
          const nextDay = Number(day) === 6 ? 0 : Number(day) + 1;
          router.replace(`/nutrition/schedule/${nextDay}`);
        }}
      >
        <FontAwesome5 name="chevron-right" size={16} color={theme.iconColor} />
      </TouchableOpacity>
    </View>
  );

  const renderMealsByType = () => {
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const groupedMeals = mealTypes.reduce((acc, type) => {
      acc[type] = mealList.filter(meal => meal.type?.toLowerCase() === type);
      return acc;
    }, {});

    return (
      <View style={styles.mealsContainer}>
        {mealTypes.map(type => {
          const typeMeals = groupedMeals[type];
          if (typeMeals.length === 0) return null;

          return (
            <View key={type} style={styles.mealTypeSection}>
              <View style={styles.mealTypeHeader}>
                <ThemedText variant="subtitle" style={styles.mealTypeTitle}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </ThemedText>
                <View style={[styles.mealCountBadge, { backgroundColor: theme.background }]}>
                  <ThemedText variant="caption" style={styles.mealCountText}>
                    {typeMeals.filter(m => m.isEaten).length}/{typeMeals.length}
                  </ThemedText>
                </View>
              </View>
              
              {typeMeals.map((meal, index) => (
                <MealCard
                  key={meal.$id}
                  meal={meal}
                  onToggle={() => toggleEaten(meal)}
                />
              ))}
            </View>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView />
        <Header pageTitle={`${dayName}'s Meals`} />
        <ThemedLoader text="Loading your meal schedule..." />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView />
      <Header  onPress={() => router.push("/(dashboard)/nutrition")} date={formattedDate}/>
      
      <FlatList
        data={[{ key: 'content' }]}
        renderItem={() => (
          <View style={styles.content}>
            {renderDayNavigation()}
            <Spacer size="medium" />
            
            {mealList.length > 0 ? (
              <>
                <SummaryBanner 
                  meals={mealList} 
                  onPress={() => {
                    // Could navigate to detailed nutrition stats
                  }}
                />
                {renderMealsByType()}
              </>
            ) : (
              renderEmptyState()
            )}
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      />
    </ThemedView>
  );
};

export default ScheduleDay;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  dayInfo: {
    alignItems: 'center',
    flex: 1,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginLeft: 8,
  },
  todayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  emptyDescription: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  mealsContainer: {
    marginTop: 8,
  },
  mealTypeSection: {
    marginBottom: 24,
  },
  mealTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  mealTypeTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  mealCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  mealCountText: {
    fontWeight: '600',
  },
});