import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ThemedView from '../../components/ThemedView'
import { useDashboard } from '../../hooks/useDashboard'
import Spacer from '../../components/Spacer'

const Home = () => {
  const { caloriesToday, todayWorkout, weeklyProgress } = useDashboard()

  return (
    <ThemedView style={styles.container}>
      <Text style={styles.header}>Welcome Back!</Text>

      <Spacer />

      <Text style={styles.label}>Today's Calories:</Text>
      <Text style={styles.value}>{caloriesToday} kcal</Text>

      <Spacer />

      <Text style={styles.label}>Today's Workout:</Text>
      {todayWorkout ? (
        <View>
          <Text style={styles.value}>{todayWorkout.title}</Text>
          <Text>{todayWorkout.duration} min - {todayWorkout.targetAreas.join(', ')}</Text>
        </View>
      ) : (
        <Text>No workout scheduled.</Text>
      )}

      <Spacer />

      <Text style={styles.label}>Weekly Progress:</Text>
      <View style={styles.progressRow}>
        {[...Array(7)].map((_, i) => {
          const day = weeklyProgress.find(p => new Date(p.date).getDay() === i)
          const isToday = new Date().getDay() === i
          const done = day?.workoutCompleted

          return (
            <View key={i} style={[styles.dayDot, done && styles.doneDot, isToday && styles.todayDot]} />
          )
        })}
      </View>
    </ThemedView>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    marginTop: 5,
  },
  progressRow: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-around',
  },
  dayDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ccc',
  },
  doneDot: {
    backgroundColor: 'green',
  },
  todayDot: {
    borderWidth: 2,
    borderColor: 'blue',
  },
})
