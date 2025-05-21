import { StyleSheet, View, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import ThemedText from './ThemedText';

const ThemedProgressBar = ({
 progress = 0, // 0 to 1
 height = 8,
 label,
 showPercentage = false,
 customColors,
 animated = true,
 style
}) => {
 const colorScheme = useColorScheme();
 const isDark = colorScheme === 'dark';
 const colors = isDark ? Colors.dark : Colors.light;
 
 // Animation value
 const animatedWidth = useRef(new Animated.Value(0)).current;
 
 // Update animation when progress changes
 useEffect(() => {
   if (animated) {
     Animated.timing(animatedWidth, {
       toValue: progress,
       duration: 500,
       useNativeDriver: false,
     }).start();
   } else {
     animatedWidth.setValue(progress);
   }
 }, [progress, animated]);
 
 // Clamp progress between 0 and 1
 const clampedProgress = Math.min(Math.max(progress, 0), 1);
 
 // Get color based on progress level
 const getProgressColor = () => {
   if (customColors) {
     return customColors;
   }
   
   // Default color logic based on progress
   if (clampedProgress < 0.3) {
     return Colors.warning; // Low progress
   } else if (clampedProgress < 0.7) {
     return isDark ? Colors.dark.iconColorFocused : Colors.light.iconColorFocused; // Medium progress
   } else {
     return Colors.primary; // Good progress
   }
 };
 
 // Format percentage for display
 const formattedPercentage = `${Math.round(clampedProgress * 100)}%`;
 
 return (
   <View style={[styles.container, style]}>
     {/* Label and percentage row */}
     {(label || showPercentage) && (
       <View style={styles.labelRow}>
         {label && <ThemedText variant="caption">{label}</ThemedText>}
         {showPercentage && (
           <ThemedText variant="caption" style={styles.percentage}>
             {formattedPercentage}
           </ThemedText>
         )}
       </View>
     )}
     
     {/* Progress bar */}
     <View 
       style={[
         styles.track, 
         { 
           backgroundColor: isDark ? colors.navBackground : 'rgba(0,0,0,0.05)',
           height 
         }
       ]}
     >
       <Animated.View
         style={[
           styles.progress,
           {
             width: animatedWidth.interpolate({
               inputRange: [0, 1],
               outputRange: ['0%', '100%'],
             }),
             backgroundColor: getProgressColor(),
             height
           }
         ]}
       />
     </View>
   </View>
 );
};

export default ThemedProgressBar;

const styles = StyleSheet.create({
 container: {
   width: '100%',
   marginVertical: 8,
 },
 labelRow: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   marginBottom: 4,
 },
 percentage: {
   fontWeight: '600',
 },
 track: {
   width: '100%',
   borderRadius: 999,
   overflow: 'hidden',
 },
 progress: {
   borderRadius: 999,
 },
});