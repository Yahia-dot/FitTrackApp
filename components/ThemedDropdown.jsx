import { StyleSheet, View, TouchableOpacity, Modal, FlatList, Animated } from 'react-native';
import React, { useState, useRef } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import ThemedText from './ThemedText';
import { FontAwesome5 } from '@expo/vector-icons';

const ThemedDropdown = ({
 label,
 placeholder = 'Select an option',
 options = [], // Array of { label, value } objects
 selectedValue,
 onSelect,
 disabled = false,
 style
}) => {
 const colorScheme = useColorScheme();
 const isDark = colorScheme === 'dark';
 const colors = isDark ? Colors.dark : Colors.light;
 
 const [isOpen, setIsOpen] = useState(false);
 const fadeAnim = useRef(new Animated.Value(0)).current;
 
 // Open the dropdown
 const openDropdown = () => {
   if (disabled) return;
   setIsOpen(true);
   Animated.timing(fadeAnim, {
     toValue: 1,
     duration: 200,
     useNativeDriver: true,
   }).start();
 };
 
 // Close the dropdown
 const closeDropdown = () => {
   Animated.timing(fadeAnim, {
     toValue: 0,
     duration: 200,
     useNativeDriver: true,
   }).start(() => setIsOpen(false));
 };
 
 // Handle option selection
 const handleSelect = (option) => {
   onSelect(option.value);
   closeDropdown();
 };
 
 // Get the selected option label
 const getSelectedLabel = () => {
   const selected = options.find(option => option.value === selectedValue);
   return selected ? selected.label : placeholder;
 };
 
 return (
   <View style={[styles.container, style]}>
     {label && <ThemedText style={styles.label}>{label}</ThemedText>}
     
     <TouchableOpacity
       style={[
         styles.dropdownButton,
         {
           backgroundColor: colors.uiBackground,
           borderColor: isDark ? colors.navBackground : 'rgba(0,0,0,0.1)',
           opacity: disabled ? 0.6 : 1,
         },
       ]}
       onPress={openDropdown}
       disabled={disabled}
       activeOpacity={0.7}
     >
       <ThemedText 
         style={[
           styles.selectedText,
           !selectedValue && { color: colors.iconColor },
         ]}
       >
         {getSelectedLabel()}
       </ThemedText>
       
       <FontAwesome5
         name="chevron-down"
         size={14}
         color={colors.iconColor}
       />
     </TouchableOpacity>
     
     <Modal
       visible={isOpen}
       transparent
       animationType="none"
       onRequestClose={closeDropdown}
     >
       <TouchableOpacity
         style={styles.modalOverlay}
         activeOpacity={1}
         onPress={closeDropdown}
       >
         <Animated.View
           style={[
             {
               opacity: fadeAnim,
               transform: [
                 {
                   translateY: fadeAnim.interpolate({
                     inputRange: [0, 1],
                     outputRange: [-20, 0],
                   }),
                 },
               ],
             },
           ]}
         >
           <View 
             style={[
               styles.dropdownMenu,
               {
                 backgroundColor: colors.uiBackground,
                 borderColor: isDark ? colors.navBackground : 'rgba(0,0,0,0.1)',
               },
             ]}
           >
             <FlatList
               data={options}
               keyExtractor={(item) => item.value.toString()}
               renderItem={({ item }) => (
                 <TouchableOpacity
                   style={[
                     styles.option,
                     selectedValue === item.value && {
                       backgroundColor: `${Colors.primary}20`,
                     },
                   ]}
                   onPress={() => handleSelect(item)}
                   activeOpacity={0.7}
                 >
                   <ThemedText>
                     {item.label}
                   </ThemedText>
                   
                   {selectedValue === item.value && (
                     <FontAwesome5
                       name="check"
                       size={14}
                       color={Colors.primary}
                     />
                   )}
                 </TouchableOpacity>
               )}
               nestedScrollEnabled
             />
           </View>
         </Animated.View>
       </TouchableOpacity>
     </Modal>
   </View>
 );
};

export default ThemedDropdown;

const styles = StyleSheet.create({
 container: {
   marginBottom: 16,
 },
 label: {
   marginBottom: 6,
   fontWeight: '600',
 },
 dropdownButton: {
   height: 48,
   borderRadius: 8,
   borderWidth: 1,
   paddingHorizontal: 12,
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'space-between',
 },
 selectedText: {
   fontSize: 16,
 },
 modalOverlay: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
   backgroundColor: 'rgba(0,0,0,0.5)',
 },
 dropdownMenu: {
   width: '90%',
   maxHeight: 300,
   borderRadius: 8,
   borderWidth: 1,
   overflow: 'hidden',
   shadowColor: '#000',
   shadowOffset: { width: 0, height: 4 },
   shadowOpacity: 0.15,
   shadowRadius: 8,
   elevation: 5,
 },
 option: {
   padding: 16,
   borderBottomWidth: StyleSheet.hairlineWidth,
   borderBottomColor: 'rgba(0,0,0,0.1)',
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'space-between',
 },
});