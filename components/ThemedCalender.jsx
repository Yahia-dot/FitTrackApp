import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import ThemedText from './ThemedText';

const ThemedCalendar = ({
 startDate = new Date(), // Start date of the week
 selectedDates = [], // Array of selected date strings 'YYYY-MM-DD'
 completedDates = [], // Array of completed workout date strings 'YYYY-MM-DD'
 plannedDates = [], // Array of planned workout date strings 'YYYY-MM-DD'
 onSelectDate, // Callback when a date is selected
 selectionMode = 'single', // 'single', 'multiple', or 'none'
 style
}) => {
 const colorScheme = useColorScheme();
 const isDark = colorScheme === 'dark';
 const colors = isDark ? Colors.dark : Colors.light;
 
 // Generate array of 7 days starting from startDate
 const [weekDays, setWeekDays] = useState([]);
 
 useEffect(() => {
   generateWeekDays();
 }, [startDate]);
 
 const generateWeekDays = () => {
   const days = [];
   const currentDate = new Date(startDate);
   
   // Adjust to start from Monday
   const day = currentDate.getDay();
   const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
   currentDate.setDate(diff);
   
   for (let i = 0; i < 7; i++) {
     const date = new Date(currentDate);
     days.push(date);
     currentDate.setDate(currentDate.getDate() + 1);
   }
   
   setWeekDays(days);
 };
 
 // Format date as YYYY-MM-DD
 const formatDate = (date) => {
   return date.toISOString().split('T')[0];
 };
 
 // Check if a date is today
 const isToday = (date) => {
   const today = new Date();
   return date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear();
 };
 
 // Check if a date is selected
 const isSelected = (date) => {
   return selectedDates.includes(formatDate(date));
 };
 
 // Check if a date has a completed workout
 const isCompleted = (date) => {
   return completedDates.includes(formatDate(date));
 };
 
 // Check if a date has a planned workout
 const isPlanned = (date) => {
   return plannedDates.includes(formatDate(date));
 };
 
 // Handle date selection
 const handleSelectDate = (date) => {
   if (selectionMode === 'none' || !onSelectDate) return;
   
   const dateStr = formatDate(date);
   
   if (selectionMode === 'single') {
     onSelectDate([dateStr]);
   } else if (selectionMode === 'multiple') {
     const isDateSelected = selectedDates.includes(dateStr);
     const updatedSelection = isDateSelected
       ? selectedDates.filter(d => d !== dateStr)
       : [...selectedDates, dateStr];
     
     onSelectDate(updatedSelection);
   }
 };
 
 // Day abbreviations
 const dayAbbr = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
 
 return (
   <View style={[styles.container, style]}>
     <ScrollView 
       horizontal 
       showsHorizontalScrollIndicator={false}
       contentContainerStyle={styles.scrollContent}
     >
       {weekDays.map((date, index) => {
         const dateStr = formatDate(date);
         const _isToday = isToday(date);
         const _isSelected = isSelected(date);
         const _isCompleted = isCompleted(date);
         const _isPlanned = isPlanned(date);
         
         // Determine background color based on state
         let backgroundColor = 'transparent';
         if (_isSelected) {
           backgroundColor = Colors.primary;
         } else if (_isToday) {
           backgroundColor = isDark ? colors.uiBackground : 'rgba(0,0,0,0.05)';
         }
         
         // Determine text color based on state
         let textColor = colors.text;
         if (_isSelected) {
           textColor = '#ffffff';
         }
         
         return (
           <TouchableOpacity
             key={dateStr}
             style={styles.dayContainer}
             onPress={() => handleSelectDate(date)}
             disabled={selectionMode === 'none'}
             activeOpacity={0.7}
           >
             <ThemedText 
               style={styles.dayName}
               variant="caption"
             >
               {dayAbbr[index]}
             </ThemedText>
             
             <View 
               style={[
                 styles.dateCircle,
                 { backgroundColor },
               ]}
             >
               <ThemedText 
                 style={[
                   styles.dateText,
                   _isSelected && { color: textColor }
                 ]}
               >
                 {date.getDate()}
               </ThemedText>
             </View>
             
             <View style={styles.indicatorContainer}>
               {_isCompleted && (
                 <View 
                   style={[
                     styles.indicator, 
                     { backgroundColor: Colors.primary }
                   ]} 
                 />
               )}
               
               {_isPlanned && !_isCompleted && (
                 <View 
                   style={[
                     styles.indicator, 
                     { backgroundColor: colors.iconColor }
                   ]} 
                 />
               )}
             </View>
           </TouchableOpacity>
         );
       })}
     </ScrollView>
   </View>
 );
};

export default ThemedCalendar;

const styles = StyleSheet.create({
 container: {
   marginVertical: 12,
 },
 scrollContent: {
   paddingHorizontal: 12,
 },
 dayContainer: {
   alignItems: 'center',
   paddingHorizontal: 8,
   paddingVertical: 4,
 },
 dayName: {
   fontSize: 12,
   marginBottom: 4,
 },
 dateCircle: {
   width: 36,
   height: 36,
   borderRadius: 18,
   justifyContent: 'center',
   alignItems: 'center',
   marginVertical: 4,
 },
 dateText: {
   fontSize: 16,
   fontWeight: '600',
 },
 indicatorContainer: {
   height: 8,
   flexDirection: 'row',
   justifyContent: 'center',
   marginTop: 2,
 },
 indicator: {
   width: 8,
   height: 8,
   borderRadius: 4,
   marginHorizontal: 2,
 },
});