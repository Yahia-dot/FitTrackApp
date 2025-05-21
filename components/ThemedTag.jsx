import { StyleSheet, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import ThemedText from './ThemedText';

const ThemedTag = ({
 label,
 variant = 'default', // 'default', 'primary', 'warning', or custom color
 size = 'medium', // 'small', 'medium', 'large'
 icon,
 onPress,
 selected = false,
 style
}) => {
 const colorScheme = useColorScheme();
 const isDark = colorScheme === 'dark';
 const colors = isDark ? Colors.dark : Colors.light;
 
 // Get colors based on variant
 const getVariantColors = () => {
   // Handle custom color variant
   if (variant !== 'default' && variant !== 'primary' && variant !== 'warning') {
     return {
       background: selected ? variant : `${variant}20`,
       text: selected ? '#ffffff' : variant,
       border: variant
     };
   }
   
   // Handle predefined variants
   switch (variant) {
     case 'primary':
       return {
         background: selected ? Colors.primary : `${Colors.primary}20`,
         text: selected ? '#ffffff' : Colors.primary,
         border: Colors.primary
       };
     case 'warning':
       return {
         background: selected ? Colors.warning : `${Colors.warning}20`,
         text: selected ? '#ffffff' : Colors.warning,
         border: Colors.warning
       };
     case 'default':
     default:
       return {
         background: selected 
           ? colors.iconColor 
           : isDark 
             ? 'rgba(255,255,255,0.1)' 
             : 'rgba(0,0,0,0.05)',
         text: selected ? '#ffffff' : colors.text,
         border: colors.iconColor
       };
   }
 };
 
 // Get size styles
 const getSizeStyles = () => {
   switch (size) {
     case 'small':
       return {
         paddingVertical: 4,
         paddingHorizontal: 8,
         borderRadius: 4,
         fontSize: 12
       };
     case 'large':
       return {
         paddingVertical: 8,
         paddingHorizontal: 16,
         borderRadius: 8,
         fontSize: 16
       };
     case 'medium':
     default:
       return {
         paddingVertical: 6,
         paddingHorizontal: 12,
         borderRadius: 6,
         fontSize: 14
       };
   }
 };
 
 const variantColors = getVariantColors();
 const sizeStyles = getSizeStyles();
 
 const TagContent = () => (
   <View
     style={[
       styles.container,
       {
         backgroundColor: variantColors.background,
         borderColor: selected ? variantColors.border : 'transparent',
         paddingVertical: sizeStyles.paddingVertical,
         paddingHorizontal: sizeStyles.paddingHorizontal,
         borderRadius: sizeStyles.borderRadius
       },
       style
     ]}
   >
     {icon && (
       <View style={styles.iconContainer}>
         {React.cloneElement(icon, { 
           color: variantColors.text,
           size: sizeStyles.fontSize + 2
         })}
       </View>
     )}
     <ThemedText
       style={[
         styles.label,
         {
           color: variantColors.text,
           fontSize: sizeStyles.fontSize
         }
       ]}
     >
       {label}
     </ThemedText>
   </View>
 );
 
 // Wrap with TouchableOpacity if onPress is provided
 if (onPress) {
   return (
     <TouchableOpacity
       onPress={onPress}
       activeOpacity={0.7}
     >
       <TagContent />
     </TouchableOpacity>
   );
 }
 
 return <TagContent />;
};

export default ThemedTag;

const styles = StyleSheet.create({
 container: {
   flexDirection: 'row',
   alignItems: 'center',
   borderWidth: 1,
   alignSelf: 'flex-start'
 },
 iconContainer: {
   marginRight: 6
 },
 label: {
   fontWeight: '500'
 }
});