import { StyleSheet, View, Image } from 'react-native';
import React from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import ThemedText from './ThemedText';
import ThemedButton from './ThemedButton';
import Spacer from './Spacer';

const ThemedEmptyState = ({
 title,
 description,
 illustration,
 actionLabel,
 onActionPress,
 customIllustration,
 type = 'default', // 'default', 'workouts', 'meals', 'plans', 'progress'
 style
}) => {
 const colorScheme = useColorScheme();
 const isDark = colorScheme === 'dark';
 const colors = isDark ? Colors.dark : Colors.light;
 
 // Get default illustration based on type
 const getDefaultIllustration = () => {
   switch (type) {
     case 'workouts':
       return require('../assets/illustrations/empty-workouts.png'); // You'll need to add these files
     case 'meals':
       return require('../assets/illustrations/empty-meals.png');
     case 'plans':
       return require('../assets/illustrations/empty-plans.png');
     case 'progress':
       return require('../assets/illustrations/empty-progress.png');
     case 'default':
     default:
       return require('../assets/illustrations/empty-default.png');
   }
 };
 
 // Get default title based on type
 const getDefaultTitle = () => {
   switch (type) {
     case 'workouts':
       return 'No Workouts Yet';
     case 'meals':
       return 'No Meal Plans Yet';
     case 'plans':
       return 'No Plans Created';
     case 'progress':
       return 'No Progress Data';
     case 'default':
     default:
       return 'Nothing Here Yet';
   }
 };
 
 // Get default description based on type
 const getDefaultDescription = () => {
   switch (type) {
     case 'workouts':
       return 'Create your first workout to start tracking your fitness journey.';
     case 'meals':
       return 'Add meal plans to help you reach your nutrition goals.';
     case 'plans':
       return 'Create a plan to organize your workouts and meals.';
     case 'progress':
       return 'Complete workouts to start seeing your progress data.';
     case 'default':
     default:
       return 'Get started by adding some content.';
   }
 };
 
 // Get default action label based on type
 const getDefaultActionLabel = () => {
   switch (type) {
     case 'workouts':
       return 'Create Workout';
     case 'meals':
       return 'Add Meal Plan';
     case 'plans':
       return 'Create Plan';
     case 'progress':
       return 'Start Workout';
     case 'default':
     default:
       return 'Get Started';
   }
 };
 
 const displayTitle = title || getDefaultTitle();
 const displayDescription = description || getDefaultDescription();
 const displayActionLabel = actionLabel || getDefaultActionLabel();
 const displayIllustration = illustration || getDefaultIllustration();
 
 return (
   <View style={[styles.container, style]}>
     {customIllustration ? (
       <View style={styles.illustrationContainer}>
         {customIllustration}
       </View>
     ) : (
       <Image
         source={displayIllustration}
         style={styles.illustration}
         resizeMode="contain"
       />
     )}
     
     <ThemedText variant="subtitle" style={styles.title}>
       {displayTitle}
     </ThemedText>
     
     <ThemedText style={styles.description}>
       {displayDescription}
     </ThemedText>
     
     <Spacer size="large" />
     
     {onActionPress && (
       <ThemedButton
         title={displayActionLabel}
         onPress={onActionPress}
         variant="primary"
       />
     )}
   </View>
 );
};

export default ThemedEmptyState;

const styles = StyleSheet.create({
 container: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
   padding: 24,
 },
 illustrationContainer: {
   marginBottom: 24,
   alignItems: 'center',
   justifyContent: 'center',
 },
 illustration: {
   width: 200,
   height: 200,
   marginBottom: 24,
 },
 title: {
   textAlign: 'center',
   marginBottom: 8,
 },
 description: {
   textAlign: 'center',
   maxWidth: 300,
   opacity: 0.8,
 },
});