import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import ThemedText from './ThemedText';
import { FontAwesome5 } from '@expo/vector-icons';

const ThemedNumericalInput = ({
 label,
 value,
 onChangeValue,
 min = 0,
 max = 999,
 step = 1,
 unit,
 placeholder = '0',
 keyboardType = 'number-pad',
 disabled = false,
 style,
 smallButtons = false,
 error
}) => {
 const colorScheme = useColorScheme();
 const isDark = colorScheme === 'dark';
 const colors = isDark ? Colors.dark : Colors.light;
 
 const [localValue, setLocalValue] = useState('');
 const [isFocused, setIsFocused] = useState(false);
 
 // Update local value when prop changes
 useEffect(() => {
   if (value !== undefined) {
     setLocalValue(value.toString());
   }
 }, [value]);
 
 // Increment value
 const handleIncrement = () => {
   if (disabled) return;
   
   const currentValue = parseFloat(localValue) || 0;
   const newValue = Math.min(currentValue + step, max);
   
   setLocalValue(newValue.toString());
   onChangeValue && onChangeValue(newValue);
 };
 
 // Decrement value
 const handleDecrement = () => {
   if (disabled) return;
   
   const currentValue = parseFloat(localValue) || 0;
   const newValue = Math.max(currentValue - step, min);
   
   setLocalValue(newValue.toString());
   onChangeValue && onChangeValue(newValue);
 };
 
 // Handle text input change
 const handleChange = (text) => {
   // Allow empty string
   if (text === '') {
     setLocalValue('');
     return;
   }
   
   // Only allow numbers and decimal point
   if (!/^[0-9]*\.?[0-9]*$/.test(text)) {
     return;
   }
   
   setLocalValue(text);
 };
 
 // Handle blur (end editing)
 const handleBlur = () => {
   setIsFocused(false);
   
   // Validate and set final value
   let newValue = parseFloat(localValue);
   
   // If empty or invalid, set to min
   if (isNaN(newValue)) {
     newValue = min;
   }
   
   // Clamp between min and max
   newValue = Math.max(min, Math.min(newValue, max));
   
   setLocalValue(newValue.toString());
   onChangeValue && onChangeValue(newValue);
 };
 
 return (
   <View style={[styles.container, style]}>
     {label && <ThemedText style={styles.label}>{label}</ThemedText>}
     
     <View 
       style={[
         styles.inputContainer,
         {
           borderColor: error
             ? Colors.warning
             : isFocused
               ? Colors.primary
               : isDark
                 ? colors.navBackground
                 : 'rgba(0,0,0,0.1)',
           opacity: disabled ? 0.6 : 1,
         },
       ]}
     >
       {/* Decrement button */}
       <TouchableOpacity
         style={[
           styles.button,
           smallButtons && styles.smallButton,
           { backgroundColor: isDark ? colors.navBackground : 'rgba(0,0,0,0.05)' }
         ]}
         onPress={handleDecrement}
         disabled={disabled || parseFloat(localValue) <= min}
         activeOpacity={0.7}
       >
         <FontAwesome5
           name="minus"
           size={smallButtons ? 10 : 14}
           color={(disabled || parseFloat(localValue) <= min) ? colors.iconColor : Colors.primary}
         />
       </TouchableOpacity>
       
       {/* Input field */}
       <View style={styles.inputWrapper}>
         <TextInput
           style={[
             styles.input,
             {
               color: colors.text,
               textAlign: 'center',
             },
           ]}
           value={localValue}
           onChangeText={handleChange}
           onBlur={handleBlur}
           onFocus={() => setIsFocused(true)}
           keyboardType={keyboardType}
           placeholder={placeholder}
           placeholderTextColor={colors.iconColor}
           editable={!disabled}
         />
         
         {unit && (
           <ThemedText variant="caption" style={styles.unit}>
             {unit}
           </ThemedText>
         )}
       </View>
       
       {/* Increment button */}
       <TouchableOpacity
         style={[
           styles.button,
           smallButtons && styles.smallButton,
           { backgroundColor: isDark ? colors.navBackground : 'rgba(0,0,0,0.05)' }
         ]}
         onPress={handleIncrement}
         disabled={disabled || parseFloat(localValue) >= max}
         activeOpacity={0.7}
       >
         <FontAwesome5
           name="plus"
           size={smallButtons ? 10 : 14}
           color={(disabled || parseFloat(localValue) >= max) ? colors.iconColor : Colors.primary}
         />
       </TouchableOpacity>
     </View>
     
     {error && (
       <ThemedText variant="caption" style={styles.errorText}>
         {error}
       </ThemedText>
     )}
   </View>
 );
};

export default ThemedNumericalInput;

const styles = StyleSheet.create({
 container: {
   marginBottom: 16,
 },
 label: {
   marginBottom: 6,
   fontWeight: '600',
 },
 inputContainer: {
   flexDirection: 'row',
   alignItems: 'center',
   borderWidth: 1,
   borderRadius: 8,
   height: 48,
   overflow: 'hidden',
 },
 button: {
   width: 48,
   height: '100%',
   alignItems: 'center',
   justifyContent: 'center',
 },
 smallButton: {
   width: 36,
 },
 inputWrapper: {
   flex: 1,
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'center',
   height: '100%',
 },
 input: {
   fontSize: A6,
   fontWeight: '500',
   width: '60%',
   height: '100%',
   paddingHorizontal: 4,
 },
 unit: {
   marginLeft: 4,
   opacity: 0.7,
 },
 errorText: {
   color: Colors.warning,
   marginTop: 4,
 },
});