import { StyleSheet, View, SafeAreaView, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import React, { useState, useMemo } from 'react';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import Header from '../../components/Header';
import Spacer from '../../components/Spacer';
import ThemedLoader from '../../components/ThemedLoader';
import { useProgress } from '../../hooks/useProgress';
import { useTheme } from '../../hooks/useTheme';
import { Colors } from '../../constants/Colors';
import { FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const Progress = () => {
  const { 
    workoutProgressData, 
    nutritionProgressData, 
    loading, 
    error 
  } = useProgress();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'workout', 'nutrition'
  
  const today = new Date();
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', options);

  // Calculate workout statistics
  const workoutStats = useMemo(() => {
    if (!workoutProgressData.length) return null;

    const totalWorkouts = workoutProgressData.reduce((sum, item) => sum + (item.totalWorkoutsCompleted || 0), 0);
    const completedDays = workoutProgressData.filter(item => item.workoutCompleted).length;
    const totalDays = workoutProgressData.length;
    const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
    
    // Last 7 days
    const last7Days = workoutProgressData
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7);
    
    const weeklyCompletedDays = last7Days.filter(item => item.workoutCompleted).length;
    const averageWeeklyGoal = workoutProgressData.reduce((sum, item) => sum + (item.weeklyGoal || 0), 0) / workoutProgressData.length;

    return {
      totalWorkouts,
      completedDays,
      totalDays,
      completionRate,
      weeklyCompletedDays,
      averageWeeklyGoal: Math.round(averageWeeklyGoal),
      last7Days
    };
  }, [workoutProgressData]);

  // Calculate nutrition statistics
  const nutritionStats = useMemo(() => {
    if (!nutritionProgressData.length) return null;

    const totalCalories = nutritionProgressData.reduce((sum, item) => sum + (item.caloriesConsumed || 0), 0);
    const averageDailyCalories = Math.round(totalCalories / nutritionProgressData.length);
    const averageDailyGoal = nutritionProgressData.reduce((sum, item) => sum + (item.dailyCalorieGoal || 0), 0) / nutritionProgressData.length;
    
    const goalAchievedDays = nutritionProgressData.filter(item => 
      item.caloriesConsumed >= (item.dailyCalorieGoal * 0.9) && 
      item.caloriesConsumed <= (item.dailyCalorieGoal * 1.1)
    ).length;
    
    const goalAchievementRate = nutritionProgressData.length > 0 ? 
      Math.round((goalAchievedDays / nutritionProgressData.length) * 100) : 0;

    // Last 7 days
    const last7Days = nutritionProgressData
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7);

    const totalMealsEaten = nutritionProgressData.reduce((sum, item) => sum + (item.mealsEaten || 0), 0);
    const totalMealsPlanned = nutritionProgressData.reduce((sum, item) => sum + (item.mealsPlanned || 0), 0);
    const mealPlanAdherence = totalMealsPlanned > 0 ? Math.round((totalMealsEaten / totalMealsPlanned) * 100) : 0;

    return {
      totalCalories,
      averageDailyCalories,
      averageDailyGoal: Math.round(averageDailyGoal),
      goalAchievedDays,
      goalAchievementRate,
      totalMealsEaten,
      totalMealsPlanned,
      mealPlanAdherence,
      last7Days
    };
  }, [nutritionProgressData]);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView />
        <ThemedLoader text="Loading your progress..." />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView />
        <View style={styles.errorContainer}>
          <FontAwesome5 name="exclamation-triangle" size={48} color={Colors.warning} />
          <ThemedText variant="subtitle" style={styles.errorText}>
            Unable to load progress data
          </ThemedText>
          <ThemedText variant="caption" style={styles.errorSubtext}>
            {error}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const renderTabButton = (tab, title, icon) => (
    <TouchableOpacity
      key={tab}
      style={[
        styles.tabButton, 
        { backgroundColor: theme.uiBackground },
        activeTab === tab && { backgroundColor: Colors.primary }
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <FontAwesome5 
        name={icon} 
        size={16} 
        color={activeTab === tab ? '#fff' : theme.iconColor} 
      />
      <ThemedText 
        variant="caption" 
        style={[
          styles.tabText,
          { color: activeTab === tab ? '#fff' : theme.text }
        ]}
      >
        {title}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderOverviewTab = () => (
    <View>
      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: theme.uiBackground }]}>
          <View style={[styles.summaryIcon, { backgroundColor: Colors.primary }]}>
            <FontAwesome5 name="dumbbell" size={20} color="#fff" />
          </View>
          <ThemedText variant="title" style={styles.summaryValue}>
            {workoutStats?.completionRate || 0}%
          </ThemedText>
          <ThemedText variant="caption" style={styles.summaryLabel}>
            Workout Completion
          </ThemedText>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: theme.uiBackground }]}>
          <View style={[styles.summaryIcon, { backgroundColor: Colors.warning }]}>
            <FontAwesome5 name="fire" size={20} color="#fff" />
          </View>
          <ThemedText variant="title" style={styles.summaryValue}>
            {nutritionStats?.averageDailyCalories || 0}
          </ThemedText>
          <ThemedText variant="caption" style={styles.summaryLabel}>
            Avg Daily Calories
          </ThemedText>
        </View>
      </View>

      <Spacer size="medium" />

      {/* Weekly Progress Chart */}
      <View style={[styles.card, { backgroundColor: theme.uiBackground }]}>
        <View style={styles.cardHeader}>
          <ThemedText variant="subtitle" style={styles.cardTitle}>
            Weekly Overview
          </ThemedText>
          <FontAwesome5 name="chart-line" size={16} color={theme.iconColor} />
        </View>

        <View style={styles.weeklyChart}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
            const workoutDay = workoutStats?.last7Days.find(item => 
              new Date(item.date).getDay() === index
            );
            const nutritionDay = nutritionStats?.last7Days.find(item => 
              new Date(item.date).getDay() === index
            );
            
            return (
              <View key={day} style={styles.dayColumn}>
                <ThemedText variant="caption" style={styles.dayLabel}>{day}</ThemedText>
                
                {/* Workout Bar */}
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.workoutBar,
                      { 
                        backgroundColor: workoutDay?.workoutCompleted ? Colors.primary : '#E0E0E0',
                        height: workoutDay?.workoutCompleted ? 40 : 20
                      }
                    ]} 
                  />
                </View>

                {/* Nutrition Indicator */}
                <View 
                  style={[
                    styles.nutritionDot,
                    { 
                      backgroundColor: nutritionDay && 
                        nutritionDay.caloriesConsumed >= (nutritionDay.dailyCalorieGoal * 0.9) &&
                        nutritionDay.caloriesConsumed <= (nutritionDay.dailyCalorieGoal * 1.1)
                        ? Colors.warning : '#E0E0E0'
                    }
                  ]} 
                />
              </View>
            );
          })}
        </View>

        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
            <ThemedText variant="caption">Workout</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
            <ThemedText variant="caption">Nutrition Goal</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );

  const renderWorkoutTab = () => (
    <View>
      {/* Workout Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: theme.uiBackground }]}>
          <FontAwesome5 name="trophy" size={24} color={Colors.primary} />
          <ThemedText variant="title" style={styles.statValue}>
            {workoutStats?.totalWorkouts || 0}
          </ThemedText>
          <ThemedText variant="caption">Total Workouts</ThemedText>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.uiBackground }]}>
          <FontAwesome5 name="calendar-check" size={24} color={Colors.primary} />
          <ThemedText variant="title" style={styles.statValue}>
            {workoutStats?.completedDays || 0}
          </ThemedText>
          <ThemedText variant="caption">Days Active</ThemedText>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.uiBackground }]}>
          <FontAwesome5 name="bullseye" size={24} color={Colors.primary} />
          <ThemedText variant="title" style={styles.statValue}>
            {workoutStats?.averageWeeklyGoal || 0}
          </ThemedText>
          <ThemedText variant="caption">Weekly Goal</ThemedText>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.uiBackground }]}>
          <FontAwesome5 name="fire" size={24} color={Colors.warning} />
          <ThemedText variant="title" style={styles.statValue}>
            {workoutStats?.weeklyCompletedDays || 0}/7
          </ThemedText>
          <ThemedText variant="caption">This Week</ThemedText>
        </View>
      </View>

      <Spacer size="medium" />

      {/* Recent Activity */}
      <View style={[styles.card, { backgroundColor: theme.uiBackground }]}>
        <View style={styles.cardHeader}>
          <ThemedText variant="subtitle" style={styles.cardTitle}>
            Recent Activity
          </ThemedText>
          <FontAwesome5 name="history" size={16} color={theme.iconColor} />
        </View>

        {workoutStats?.last7Days.map((item, index) => (
          <View key={index} style={styles.activityItem}>
            <View style={styles.activityLeft}>
              <View 
                style={[
                  styles.activityDot, 
                  { backgroundColor: item.workoutCompleted ? Colors.primary : '#E0E0E0' }
                ]} 
              />
              <View>
                <ThemedText variant="body">
                  {new Date(item.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </ThemedText>
                <ThemedText variant="caption">
                  {item.workoutCompleted ? 'Workout Completed' : 'Rest Day'}
                </ThemedText>
              </View>
            </View>
            {item.workoutCompleted && (
              <FontAwesome5 name="check-circle" size={16} color={Colors.primary} />
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderNutritionTab = () => (
    <View>
      {/* Nutrition Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: theme.uiBackground }]}>
          <FontAwesome5 name="fire" size={24} color={Colors.warning} />
          <ThemedText variant="title" style={styles.statValue}>
            {nutritionStats?.averageDailyCalories || 0}
          </ThemedText>
          <ThemedText variant="caption">Avg Calories</ThemedText>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.uiBackground }]}>
          <FontAwesome5 name="bullseye" size={24} color={Colors.primary} />
          <ThemedText variant="title" style={styles.statValue}>
            {nutritionStats?.goalAchievementRate || 0}%
          </ThemedText>
          <ThemedText variant="caption">Goal Achievement</ThemedText>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.uiBackground }]}>
          <FontAwesome5 name="utensils" size={24} color={Colors.primary} />
          <ThemedText variant="title" style={styles.statValue}>
            {nutritionStats?.totalMealsEaten || 0}
          </ThemedText>
          <ThemedText variant="caption">Total Meals</ThemedText>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.uiBackground }]}>
          <FontAwesome5 name="clipboard-check" size={24} color={Colors.warning} />
          <ThemedText variant="title" style={styles.statValue}>
            {nutritionStats?.mealPlanAdherence || 0}%
          </ThemedText>
          <ThemedText variant="caption">Plan Adherence</ThemedText>
        </View>
      </View>

      <Spacer size="medium" />

      {/* Calorie Trend */}
      <View style={[styles.card, { backgroundColor: theme.uiBackground }]}>
        <View style={styles.cardHeader}>
          <ThemedText variant="subtitle" style={styles.cardTitle}>
            Weekly Calorie Trend
          </ThemedText>
          <FontAwesome5 name="chart-area" size={16} color={theme.iconColor} />
        </View>

        <View style={styles.calorieChart}>
          {nutritionStats?.last7Days.map((item, index) => {
            const percentage = item.dailyCalorieGoal > 0 
              ? Math.min((item.caloriesConsumed / item.dailyCalorieGoal) * 100, 100)
              : 0;
            const dayName = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' });
            
            return (
              <View key={index} style={styles.calorieDay}>
                <View style={styles.calorieBarContainer}>
                  <View 
                    style={[
                      styles.calorieBar,
                      { 
                        height: `${percentage}%`,
                        backgroundColor: percentage >= 90 && percentage <= 110 
                          ? Colors.primary 
                          : percentage < 90 
                            ? Colors.warning 
                            : '#ff6b6b'
                      }
                    ]} 
                  />
                </View>
                <ThemedText variant="caption" style={styles.calorieDayLabel}>
                  {dayName}
                </ThemedText>
                <ThemedText variant="caption" style={styles.calorieValue}>
                  {item.caloriesConsumed}
                </ThemedText>
              </View>
            );
          })}
        </View>

        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
            <ThemedText variant="caption">On Target</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
            <ThemedText variant="caption">Under Goal</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ff6b6b' }]} />
            <ThemedText variant="caption">Over Goal</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView />
      
      <Header date={formattedDate} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {renderTabButton('overview', 'Overview', 'chart-pie')}
          {renderTabButton('workout', 'Workout', 'dumbbell')}
          {renderTabButton('nutrition', 'Nutrition', 'apple-alt')}
        </View>

        <Spacer size="medium" />

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'workout' && renderWorkoutTab()}
        {activeTab === 'nutrition' && renderNutritionTab()}

        <Spacer size="large" />
      </ScrollView>
    </ThemedView>
  );
};

export default Progress;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    marginTop: 8,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  tabText: {
    marginLeft: 8,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    textAlign: 'center',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontWeight: 'bold',
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
    marginBottom: 20,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    marginBottom: 8,
  },
  barContainer: {
    height: 50,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutBar: {
    width: 12,
    borderRadius: 6,
  },
  nutritionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  calorieChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 20,
  },
  calorieDay: {
    alignItems: 'center',
    flex: 1,
  },
  calorieBarContainer: {
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  calorieBar: {
    width: 16,
    borderRadius: 8,
    minHeight: 4,
  },
  calorieDayLabel: {
    marginBottom: 4,
  },
  calorieValue: {
    fontSize: 10,
  },
});