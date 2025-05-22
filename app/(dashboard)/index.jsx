import { StyleSheet, Text, View, SafeAreaView, ImageBackground, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import ThemedView from '../../components/ThemedView';
import { useDashboard } from '../../hooks/useDashboard';
import { useProgress } from '../../hooks/useProgress'; 
import Spacer from '../../components/Spacer';
import ThemedText from '../../components/ThemedText';
import Header from '../../components/Header';
import { Colors } from '../../constants/Colors';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

const Home = () => {
  const { userName, caloriesToday, todayWorkout } = useDashboard();
  const { weeklyProgress } = useProgress(); 
  const { theme } = useTheme();

  const today = new Date();
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', options);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView />
      
      <Header date={formattedDate} />
      
      {/* Scrollable Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section with User Greeting */}
        <ImageBackground 
          source={require('../../assets/img/fitness-background.png')}
          style={styles.heroBanner}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroOverlay}>
            <ThemedText variant="title" style={styles.greeting}>
              {userName ? `Hello, ${userName}!` : 'Hello!'}
            </ThemedText>
            <ThemedText variant="body" style={styles.greetingSubtext}>
              Ready for today's fitness journey?
            </ThemedText>
            
            {todayWorkout && (
              <TouchableOpacity style={styles.startButton}>
                <FontAwesome5 name="play-circle" size={16} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Start Workout</Text>
              </TouchableOpacity>
            )}
          </View>
        </ImageBackground>
        
        <Spacer size="medium" />
        
        {/* Today's Overview Section */}
        <View style={styles.sectionHeader}>
          <ThemedText variant="subtitle" style={styles.sectionTitle}>Today's Overview</ThemedText>
          <FontAwesome5 name="calendar-day" size={16} color={theme.text} />
        </View>
        
        {/* Cards Row: Calories and Workout */}
        <View style={styles.cardsRow}>
          {/* Today's Calories Card */}
          <View style={[styles.card, styles.halfCard, { backgroundColor: theme.uiBackground }]}>
            <View style={styles.cardHeader}>
              <ThemedText variant="subtitle" style={styles.cardTitle}>Calories</ThemedText>
              <View style={[styles.iconCircle, { backgroundColor: Colors.primary }]}>
                <FontAwesome5 name="fire" size={16} color="#fff" />
              </View>
            </View>
            <ThemedText variant="title" style={styles.calorieValue}>{caloriesToday} kcal</ThemedText>
            <View style={styles.cardFooter}>
            </View>
          </View>
          
          {/* Today's Workout Card */}
          <View style={[styles.card, styles.halfCard, { backgroundColor: theme.uiBackground }]}>
            <View style={styles.cardHeader}>
              <ThemedText variant="subtitle" style={styles.cardTitle}>Workout</ThemedText>
              <View style={[styles.iconCircle, { backgroundColor: Colors.primary }]}>
                <FontAwesome5 name="dumbbell" size={16} color="#fff" />
              </View>
            </View>
            {todayWorkout ? (
              <View style={styles.workoutInfo}>
                <ThemedText variant="title" style={styles.workoutTitle}>{todayWorkout.title}</ThemedText>
                <ThemedText variant="body" style={styles.workoutDetails}>
                  {todayWorkout.duration} min
                </ThemedText>
              </View>
            ) : (
              <ThemedText variant="body">Not scheduled</ThemedText>
            )}
          </View>
        </View>
        
        <Spacer size="medium" />
        
        {/* Weekly Progress Section */}
        <View style={styles.sectionHeader}>
          <ThemedText variant="subtitle" style={styles.sectionTitle}>Your Progress</ThemedText>
          <FontAwesome5 name="chart-line" size={16} color={theme.text} />
        </View>
        
        {/* Weekly Progress Card - Redesigned */}
        <View style={[styles.card, { backgroundColor: theme.uiBackground }]}>
          <View style={styles.progressHeader}>
            <ThemedText variant="subtitle" style={styles.cardTitle}>Weekly Workout Streak</ThemedText>
            <FontAwesome5 name="calendar-check" size={16} color={theme.text} />
          </View>
          
          <View style={styles.progressContainer}>
            {[...Array(7)].map((_, i) => {
              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const day = weeklyProgress.find(p => new Date(p.date).getDay() === i);
              const isToday = new Date().getDay() === i;
              const done = day?.workoutCompleted;
              
              return (
                <View key={i} style={styles.progressItem}>
                  <ThemedText variant="caption" style={[
                    styles.dayName,
                    isToday && styles.todayText
                  ]}>
                    {dayNames[i]}
                  </ThemedText>
                  <View 
                    style={[
                      styles.progressBar,
                      done && styles.progressBarDone,
                      !done && styles.progressBarEmpty,
                      isToday && styles.progressBarToday
                    ]} 
                  />
                  {done && <FontAwesome5 name="check" size={12} color="#fff" style={styles.checkIcon} />}
                </View>
              );
            })}
          </View>
          
          <View style={styles.streakBadge}>
            <FontAwesome5 name="fire" size={16} color="#fff" style={styles.streakIcon} />
            <Text style={styles.streakText}>Discipline brings results!</Text>
          </View>
        </View>
        
        <Spacer size="medium" />
        
      </ScrollView>
    </ThemedView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  heroBanner: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    marginTop: 10,
  },
  heroImage: {
    borderRadius: 20,
  },
  heroOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
    height: '100%',
    justifyContent: 'center',
  },
  greeting: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  greetingSubtext: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5
  },
  startButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  halfCard: {
    width: '48%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  cardFooterText: {
    fontSize: 12,
    marginLeft: 5,
    color: Colors.success,
  },
  calorieValue: {
    fontSize: 24,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  workoutInfo: {
    marginTop: 4,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  workoutDetails: {
    marginTop: 4,
    fontSize: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  progressItem: {
    alignItems: 'center',
    width: '13%',
    position: 'relative',
  },
  dayName: {
    fontSize: 12,
    marginBottom: 8,
  },
  todayText: {
    fontWeight: 'bold',
    color: Colors.warning,
  },
  progressBar: {
    width: '100%',
    height: 10,
    borderRadius: 10,
    position: 'relative',
  },
  progressBarEmpty: {
    backgroundColor: '#E0E0E0',
  },
  progressBarDone: {
    backgroundColor: Colors.primary,
  },
  progressBarToday: {
    borderWidth: 2,
    borderColor: Colors.warning,
  },
  checkIcon: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
  },
  streakBadge: {
    backgroundColor: Colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    alignSelf: 'center',
    marginTop: 20,
  },
  streakText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  streakIcon: {
    marginRight: 3,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '31%',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 8,
    fontSize: 12,
  },
});