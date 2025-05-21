import { StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import ThemedText from './ThemedText';

const ThemedSegmentedControl = ({
 options = [], // Array of { label, value, icon? } objects
 selectedValue,
 onValueChange,
 style,
 showIcons = true
}) => {
 const colorScheme = useColorScheme();
 const isDark = colorScheme === 'dark';
 const colors = isDark ? Colors.dark : Colors.light;
 
 const [containerWidth, setContainerWidth] = useState(0);
 const [segmentWidth, setSegmentWidth] = useState(0);
 const [activeIndex, setActiveIndex] = useState(0);
 
 const animatedValue = useRef(new Animated.Value(0)).current;
 
 // Update active index when selectedValue changes
 useEffect(() => {
   const index = options.findIndex(option => option.value === selectedValue);
   if (index !== -1) {
     setActiveIndex(index);
     Animated.timing(animatedValue, {
       toValue: index,
       duration: 200,
       useNativeDriver: false,
     }).start();
   }
 }, [selectedValue, options]);
 
 // Handle container layout
 const handleLayout = (event) => {
   const { width } = event.nativeEvent.layout;
   setContainerWidth(width);
   setSegmentWidth(width / options.length);
 };
 
 // Calculate left position for slider
 const translateX = animatedValue.interpolate({
   inputRange: [0, 1],
   outputRange: [0, segmentWidth],
   extrapolate: 'clamp',
 });
 
 // Handle option press
 const handlePress = (value, index) => {
   if (value !== selectedValue) {
     onValueChange(value);
     setActiveIndex(index);
     Animated.timing(animatedValue, {
       toValue: index,
       duration: 200,
       useNativeDriver: false,
     }).start();
   }
 };
 
 return (
   <View 
     style={[
       styles.container, 
       { 
         backgroundColor: isDark 
           ? colors.navBackground 
           : 'rgba(0,0,0,0.05)' 
       },
       style
     ]}
     onLayout={handleLayout}
   >
     {/* Animated selector */}
     {containerWidth > 0 && (
       <Animated.View
         style={[
           styles.selector,
           {
             backgroundColor: colors.uiBackground,
             width: segmentWidth,
             transform: [{ translateX }],
           },
         ]}
       />
     )}
     
     {/* Options */}
     {options.map((option, index) => (
       <TouchableOpacity
         key={option.value}
         style={styles.option}
         onPress={() => handlePress(option.value, index)}
         activeOpacity={0.7}
       >
         <View style={styles.optionContent}>
           {showIcons && option.icon && (
             <View style={styles.iconContainer}>
               {React.cloneElement(option.icon, { 
                 color: activeIndex === index ? Colors.primary : colors.iconColor,
                 size: 16
               })}
             </View>
           )}
           <ThemedText
             style={[
               styles.optionLabel,
               {
                 color: activeIndex === index ? Colors.primary : colors.text,
                 fontWeight: activeIndex === index ? '600' : 'normal',
               },
             ]}
           >
             {option.label}
           </ThemedText>
         </View>
       </TouchableOpacity>
     ))}
   </View>
 );
};

export default ThemedSegmentedControl;

const styles = StyleSheet.create({
 container: {
   flexDirection: 'row',
   borderRadius: 8,
   height: 44,
   padding: 4,
   position: 'relative',
   marginVertical: 8,
 },
 selector: {
   position: 'absolute',
   top: 4,
   left: 4,
   bottom: 4,
   borderRadius: 6,
   shadowColor: '#000',
   shadowOffset: { width: 0, height: 1 },
   shadowOpacity: 0.1,
   shadowRadius: 1,
   elevation: 2,
 },
 option: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
   zIndex: 1,
 },
 optionContent: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'center',
 },
 optionLabel: {
   fontSize: 14,
   textAlign: 'center',
 },
 iconContainer: {
   marginRight: 6,
 },
});