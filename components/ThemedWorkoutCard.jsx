import { StyleSheet, View, Image, TouchableOpacity, Animated } from 'react-native';
import React, { useState, useRef } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import ThemedText from './ThemedText';
import ThemedCheckbox from './ThemedCheckbox';
import { FontAwesome5 } from '@expo/vector-icons';

const ThemedWorkoutCard = ({
 title,
 image,
 sets = 3,
 reps = 12,
 weight,
 restTime = 60, // in seconds
 instructions,
 completed = false,
 onToggleComplete,
 onUpdateSets,
 onUpdateReps,
 onUpdateWeight,
 style
}) => {
 const colorScheme = useColorScheme();
 const isDark = colorScheme === 'dark';
 const colors = isDark ? Colors.dark : Colors.light;
 
 const [expanded, setExpanded] = useState(false);
 const animatedHeight = useRef(new Animated.Value(0)).current;
 const maxHeight = 150; // Maximum height for instructions
 
 // Handle expand/collapse
 const toggleExpanded = () => {
   const toValue = expanded ? 0 : maxHeight;
   
   setExpanded(!expanded);
   Animated.timing(animatedHeight, {
     toValue,
     duration: 300,
     useNativeDriver: false,
   }).start();
 };
 
 // Format rest time
 const formatRestTime = (seconds) => {
   if (seconds < 60) {
     return `${seconds}s`;
   }
   
   const minutes = Math.floor(seconds / 60);
   const remainingSeconds = seconds % 60;
   
   if (remainingSeconds === 0) {
     return `${minutes}m`;
   }
   
   return `${minutes}m ${remainingSeconds}s`;
 };
 
 // Update sets/reps helpers
 const handleIncrementSets = () => {
   onUpdateSets && onUpdateSets(sets + 1);
 };
 
 const handleDecrementSets = () => {
   if (sets > 1) {
     onUpdateSets && onUpdateSets(sets - 1);
   }
 };
 
 const handleIncrementReps = () => {
   onUpdateReps && onUpdateReps(reps + 1);
 };
 
 const handleDecrementReps = () => {
   if (reps > 1) {
     onUpdateReps && onUpdateReps(reps - 1);
   }
 };
 
 return (
   <View 
     style={[
       styles.container, 
       { 
         backgroundColor: colors.uiBackground,
         borderColor: isDark ? colors.navBackground : 'rgba(0,0,0,0.1)',
         opacity: completed ? 0.8 : 1
       },
       style
     ]}
   >
     {/* Header with checkbox */}
     <View style={styles.header}>
       <ThemedCheckbox
         checked={completed}
         onPress={onToggleComplete}
         size="medium"
       />
       
       <ThemedText 
         variant="subtitle" 
         style={[
           styles.title,
           completed && styles.completedText
         ]}
       >
         {title}
       </ThemedText>
       
       <TouchableOpacity
         onPress={toggleExpanded}
         hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
       >
         <FontAwesome5
           name={expanded ? 'chevron-up' : 'chevron-down'}
           size={16}
           color={colors.iconColor}
         />
       </TouchableOpacity>
     </View>
     
     {/* Main content */}
     <View style={styles.content}>
       {/* Left side - Image */}
       {image && (
         <Image
           source={image}
           style={styles.image}
           resizeMode="cover"
         />
       )}
       
       {/* Right side - Exercise details */}
       <View style={styles.details}>
         {/* Sets and Reps */}
         <View style={styles.metricsContainer}>
           {/* Sets */}
           <View style={styles.metricItem}>
             <ThemedText variant="caption" style={styles.metricLabel}>
               Sets
             </ThemedText>
             
             <View style={styles.counterContainer}>
               {onUpdateSets && (
                 <TouchableOpacity
                   style={styles.counterButton}
                   onPress={handleDecrementSets}
                   disabled={sets <= 1}
                 >
                   <FontAwesome5
                     name="minus"
                     size={12}
                     color={sets <= 1 ? colors.iconColor : Colors.primary}
                   />
                 </TouchableOpacity>
               )}
               
               <ThemedText style={styles.counterValue}>
                 {sets}
               </ThemedText>
               
               {onUpdateSets && (
                 <TouchableOpacity
                   style={styles.counterButton}
                   onPress={handleIncrementSets}
                 >
                   <FontAwesome5
                     name="plus"
                     size={12}
                     color={Colors.primary}
                   />
                 </TouchableOpacity>
               )}
             </View>
           </View>
           
           {/* Reps */}
           <View style={styles.metricItem}>
             <ThemedText variant="caption" style={styles.metricLabel}>
               Reps
             </ThemedText>
             
             <View style={styles.counterContainer}>
               {onUpdateReps && (
                 <TouchableOpacity
                   style={styles.counterButton}
                   onPress={handleDecrementReps}
                   disabled={reps <= 1}
                 >
                   <FontAwesome5
                     name="minus"
                     size={12}
                     color={reps <= 1 ? colors.iconColor : Colors.primary}
                   />
                 </TouchableOpacity>
               )}
               
               <ThemedText style={styles.counterValue}>
                 {reps}
               </ThemedText>
               
               {onUpdateReps && (
                 <TouchableOpacity
                   style={styles.counterButton}
                   onPress={handleIncrementReps}
                 >
                   <FontAwesome5
                     name="plus"
                     size={12}
                     color={Colors.primary}
                   />
                 </TouchableOpacity>
               )}
             </View>
           </View>
         </View>
         
         {/* Weight and Rest */}
         <View style={styles.metricsContainer}>
           {/* Weight (optional) */}
           {weight !== undefined && (
             <View style={styles.metricItem}>
               <ThemedText variant="caption" style={styles.metricLabel}>
                 Weight
               </ThemedText>
               
               <View style={styles.weightContainer}>
                 <ThemedText>
                   {weight} kg
                 </ThemedText>
               </View>
             </View>
           )}
           
           {/* Rest time */}
           {restTime && (
             <View style={styles.metricItem}>
               <ThemedText variant="caption" style={styles.metricLabel}>
                 Rest
               </ThemedText>
               
               <View style={styles.restContainer}>
                 <FontAwesome5
                   name="clock"
                   size={12}
                   color={colors.iconColor}
                   style={styles.restIcon}
                 />
                 <ThemedText>
                   {formatRestTime(restTime)}
                 </ThemedText>
               </View>
             </View>
           )}
         </View>
       </View>
     </View>
     
     {/* Expandable instructions */}
     {instructions && (
       <Animated.View 
         style={[
           styles.instructionsContainer,
           { height: animatedHeight }
         ]}
       >
         <ThemedText variant="caption" style={styles.instructionsLabel}>
           Instructions
         </ThemedText>
         
         <ThemedText style={styles.instructions}>
           {instructions}
         </ThemedText>
       </Animated.View>
     )}
   </View>
 );
};

export default ThemedWorkoutCard;

const styles = StyleSheet.create({
 container: {
   borderRadius: 12,
   borderWidth: 1,
   marginVertical: 8,
   overflow: 'hidden',
 },
 header: {
   flexDirection: 'row',
   alignItems: 'center',
   paddingHorizontal: 16,
   paddingVertical: 12,
   borderBottomWidth: StyleSheet.hairlineWidth,
   borderBottomColor: 'rgba(0,0,0,0.1)',
 },
 title: {
   flex: 1,
   marginLeft: 12,
 },
 completedText: {
   textDecorationLine: 'line-through',
   opacity: 0.7,
 },
 content: {
   flexDirection: 'row',
   padding: 16,
 },
 image: {
   width: 100,
   height: 100,
   borderRadius: 8,
 },
 details: {
   flex: 1,
   marginLeft: 16,
   justifyContent: 'space-between',
 },
 metricsContainer: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   marginBottom: 12,
 },
 metricItem: {
   flex: 1,
 },
 metricLabel: {
   marginBottom: 4,
 },
 counterContainer: {
   flexDirection: 'row',
   alignItems: 'center',
 },
 counterButton: {
   width: 28,
   height: 28,
   borderRadius: 14,
   backgroundColor: 'rgba(0,0,0,0.05)',
   alignItems: 'center',
   justifyContent: 'center',
 },
 counterValue: {
   minWidth: 30,
   textAlign: 'center',
   fontWeight: '600',
 },
 weightContainer: {
   flexDirection: 'row',
   alignItems: 'center',
 },
 restContainer: {
   flexDirection: 'row',
   alignItems: 'center',
 },
 restIcon: {
   marginRight: 6,
 },
 instructionsContainer: {
   paddingHorizontal: 16,
   overflow: 'hidden',
 },
 instructionsLabel: {
   fontWeight: '600',
   marginBottom: 4,
 },
 instructions: {
   lineHeight: 20,
 },
});