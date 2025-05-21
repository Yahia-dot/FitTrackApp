import { StyleSheet, View } from 'react-native';
import React from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import ThemedText from './ThemedText';

const ThemedDivider = ({
 label,
 thickness = 1,
 orientation = 'horizontal', // 'horizontal' or 'vertical'
 length = '100%', // CSS value or number
 color,
 style,
 textStyle,
 spacing = 16 // Spacing around the divider
}) => {
 const colorScheme = useColorScheme();
 const isDark = colorScheme === 'dark';
 const colors = isDark ? Colors.dark : Colors.light;
 
 // Default divider color
 const dividerColor = color || (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)');
 
 // For vertical dividers
 if (orientation === 'vertical') {
   return (
     <View 
       style={[
         styles.verticalDivider,
         {
           width: thickness,
           height: length,
           backgroundColor: dividerColor,
           marginHorizontal: spacing,
         },
         style
       ]}
     />
   );
 }
 
 // For horizontal dividers with optional label
 if (label) {
   return (
     <View style={[styles.labeledDividerContainer, { marginVertical: spacing }, style]}>
       <View 
         style={[
           styles.dividerLine,
           {
             height: thickness,
             backgroundColor: dividerColor,
           }
         ]}
       />
       
       <View style={styles.labelContainer}>
         <ThemedText 
           variant="caption" 
           style={[
             styles.label,
             { paddingHorizontal: spacing },
             textStyle
           ]}
         >
           {label}
         </ThemedText>
       </View>
       
       <View 
         style={[
           styles.dividerLine,
           {
             height: thickness,
             backgroundColor: dividerColor,
           }
         ]}
       />
     </View>
   );
 }
 
 // Simple horizontal divider
 return (
   <View 
     style={[
       styles.divider,
       {
         height: thickness,
         width: length,
         backgroundColor: dividerColor,
         marginVertical: spacing,
       },
       style
     ]}
   />
 );
};

export default ThemedDivider;

const styles = StyleSheet.create({
 divider: {
   alignSelf: 'center',
 },
 verticalDivider: {
   alignSelf: 'stretch',
 },
 labeledDividerContainer: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'center',
   width: '100%',
 },
 dividerLine: {
   flex: 1,
 },
 labelContainer: {
   paddingHorizontal: 0,
   alignItems: 'center',
 },
 label: {
   textAlign: 'center',
 },
});