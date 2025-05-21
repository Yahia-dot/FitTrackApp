import { StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import ThemedText from './ThemedText';
import { FontAwesome5 } from '@expo/vector-icons';

const ThemedCheckbox = ({
 checked = false,
 disabled = false,
 label,
 onPress,
 size = 'medium', // 'small', 'medium', 'large'
 style
}) => {
 const colorScheme = useColorScheme();
 const isDark = colorScheme === 'dark';
 const colors = isDark ? Colors.dark : Colors.light;
 
 // Animation value
 const scaleAnim = useRef(new Animated.Value(1)).current;
 const opacityAnim = useRef(new Animated.Value(checked ? 1 : 0)).current;
 
 // Update animation when checked status changes
 useEffect(() => {
   Animated.parallel([
     Animated.sequence([
       Animated.timing(scaleAnim, {
         toValue: checked ? 0.8 : 1,
         duration: 100,
         useNativeDriver: true,
       }),
       Animated.timing(scaleAnim, {
         toValue: 1,
         duration: 100,
         useNativeDriver: true,
       }),
     ]),
     Animated.timing(opacityAnim, {
       toValue: checked ? 1 : 0,
       duration: 150,
       useNativeDriver: true,
     }),
   ]).start();
 }, [checked]);
 
 // Get size dimensions
 const getSize = () => {
   switch (size) {
     case 'small':
       return { box: 18, icon: 10 };
     case 'large':
       return { box: 28, icon: 16 };
     case 'medium':
     default:
       return { box: 24, icon: 14 };
   }
 };
 
 const sizeObj = getSize();
 
 // Get colors based on state
 const getColors = () => {
   if (disabled) {
     return {
       border: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
       background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
       checkmark: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
     };
   }
   
   return {
     border: checked ? Colors.primary : colors.iconColor,
     background: checked ? Colors.primary : 'transparent',
     checkmark: '#ffffff',
   };
 };
 
 const stateColors = getColors();
 
 return (
   <TouchableOpacity
     style={[styles.container, style]}
     onPress={onPress}
     disabled={disabled}
     activeOpacity={0.7}
   >
     <Animated.View
       style={[
         styles.checkbox,
         {
           width: sizeObj.box,
           height: sizeObj.box,
           borderRadius: sizeObj.box / 2,
           borderColor: stateColors.border,
           backgroundColor: stateColors.background,
           transform: [{ scale: scaleAnim }],
         },
       ]}
     >
       <Animated.View
         style={{
           opacity: opacityAnim,
           alignItems: 'center',
           justifyContent: 'center',
         }}
       >
         <FontAwesome5
           name="check"
           size={sizeObj.icon}
           color={stateColors.checkmark}
         />
       </Animated.View>
     </Animated.View>
     
     {label && (
       <ThemedText 
         style={[
           styles.label, 
           { marginLeft: sizeObj.box / 2 },
           disabled && { opacity: 0.5 }
         ]}
       >
         {label}
       </ThemedText>
     )}
   </TouchableOpacity>
 );
};

export default ThemedCheckbox;

const styles = StyleSheet.create({
 container: {
   flexDirection: 'row',
   alignItems: 'center',
   paddingVertical: 6,
 },
 checkbox: {
   borderWidth: 2,
   alignItems: 'center',
   justifyContent: 'center',
 },
 label: {
   marginLeft: 12,
 },
});