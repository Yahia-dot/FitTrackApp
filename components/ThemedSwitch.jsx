import { StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import ThemedText from './ThemedText';

const ThemedSwitch = ({
 value = false,
 onValueChange,
 label,
 description,
 disabled = false,
 size = 'medium', // 'small', 'medium', 'large'
 style
}) => {
 const colorScheme = useColorScheme();
 const isDark = colorScheme === 'dark';
 const colors = isDark ? Colors.dark : Colors.light;
 
 // Animation values
 const translateX = useRef(new Animated.Value(value ? 1 : 0)).current;
 const backgroundColor = useRef(new Animated.Value(value ? 1 : 0)).current;
 
 // Update animation when value changes
 useEffect(() => {
   Animated.parallel([
     Animated.timing(translateX, {
       toValue: value ? 1 : 0,
       duration: 200,
       useNativeDriver: false,
     }),
     Animated.timing(backgroundColor, {
       toValue: value ? 1 : 0,
       duration: 200,
       useNativeDriver: false,
     }),
   ]).start();
 }, [value]);
 
 // Get sizes based on size prop
 const getSizes = () => {
   switch (size) {
     case 'small':
       return {
         width: 36,
         height: 20,
         circle: 16,
         padding: 2,
       };
     case 'large':
       return {
         width: 56,
         height: 30,
         circle: 26,
         padding: 2,
       };
     case 'medium':
     default:
       return {
         width: 46,
         height: 24,
         circle: 20,
         padding: 2,
       };
   }
 };
 
 const sizes = getSizes();
 
 // Handle toggle
 const handleToggle = () => {
   if (!disabled && onValueChange) {
     onValueChange(!value);
   }
 };
 
 // Get interpolated background color
 const getBackgroundColor = backgroundColor.interpolate({
   inputRange: [0, 1],
   outputRange: [
     isDark ? colors.uiBackground : 'rgba(0,0,0,0.2)',
     Colors.primary,
   ],
 });
 
 // Get interpolated circle position
 const getTranslateX = translateX.interpolate({
   inputRange: [0, 1],
   outputRange: [0, sizes.width - sizes.circle - 2 * sizes.padding],
 });
 
 return (
   <View style={[styles.container, style]}>
     {/* Text content */}
     {(label || description) && (
       <View style={styles.textContainer}>
         {label && (
           <ThemedText 
             style={[
               styles.label,
               disabled && styles.disabledText
             ]}
           >
             {label}
           </ThemedText>
         )}
         
         {description && (
           <ThemedText 
             variant="caption" 
             style={[
               styles.description,
               disabled && styles.disabledText
             ]}
           >
             {description}
           </ThemedText>
         )}
       </View>
     )}
     
     {/* Switch toggle */}
     <TouchableOpacity
       activeOpacity={0.8}
       onPress={handleToggle}
       disabled={disabled}
     >
       <Animated.View
         style={[
           styles.track,
           {
             backgroundColor: getBackgroundColor,
             width: sizes.width,
             height: sizes.height,
             borderRadius: sizes.height / 2,
             padding: sizes.padding,
             opacity: disabled ? 0.5 : 1,
           },
         ]}
       >
         <Animated.View
           style={[
             styles.thumb,
             {
               width: sizes.circle,
               height: sizes.circle,
               borderRadius: sizes.circle / 2,
               transform: [{ translateX: getTranslateX }],
               backgroundColor: isDark ? colors.title : '#FFFFFF',
             },
           ]}
         />
       </Animated.View>
     </TouchableOpacity>
   </View>
 );
};

export default ThemedSwitch;

const styles = StyleSheet.create({
 container: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'space-between',
   paddingVertical: 8,
 },
 textContainer: {
   flex: 1,
   marginRight: 16,
 },
 label: {
   fontWeight: '500',
 },
 description: {
   marginTop: 2,
 },
 disabledText: {
   opacity: 0.5,
 },
 track: {
   justifyContent: 'center',
 },
 thumb: {
   shadowColor: '#000',
   shadowOffset: { width: 0, height: 1 },
   shadowOpacity: 0.15,
   shadowRadius: 2,
   elevation: 2,
 },
});