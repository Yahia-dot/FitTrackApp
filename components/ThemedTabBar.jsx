import { StyleSheet, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import ThemedText from './ThemedText';
import { Animated } from 'react-native';

const ThemedTabBar = ({ 
 tabs = [], // Array of {key, label, icon} objects
 activeTab,
 onTabPress,
 style 
}) => {
 const colorScheme = useColorScheme();
 const isDark = colorScheme === 'dark';
 const colors = isDark ? Colors.dark : Colors.light;
 
 return (
   <View 
     style={[
       styles.container, 
       { backgroundColor: colors.navBackground },
       style
     ]}
   >
     {tabs.map((tab, index) => {
       const isActive = tab.key === activeTab;
       const activeColor = isActive 
         ? Colors.primary 
         : colors.iconColor;
         
       return (
         <TouchableOpacity
           key={tab.key}
           style={styles.tab}
           onPress={() => onTabPress(tab.key)}
           activeOpacity={0.7}
         >
           <View style={styles.tabContent}>
             {tab.icon && (
               <View style={styles.iconContainer}>
                 {React.cloneElement(tab.icon, { 
                   color: activeColor,
                   size: 24 
                 })}
               </View>
             )}
             
             <ThemedText
               style={[
                 styles.label,
                 { color: activeColor }
               ]}
               variant="caption"
             >
               {tab.label}
             </ThemedText>
             
             {isActive && (
               <View 
                 style={[
                   styles.indicator, 
                   { backgroundColor: Colors.primary }
                 ]} 
               />
             )}
           </View>
         </TouchableOpacity>
       );
     })}
   </View>
 );
};

export default ThemedTabBar;

const styles = StyleSheet.create({
 container: {
   flexDirection: 'row',
   height: 60,
   borderTopWidth: 1,
   borderTopColor: 'rgba(0,0,0,0.05)',
 },
 tab: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
 },
 tabContent: {
   justifyContent: 'center',
   alignItems: 'center',
   paddingVertical: 8,
   position: 'relative',
   width: '100%',
 },
 iconContainer: {
   marginBottom: 4,
 },
 label: {
   fontSize: 12,
   fontWeight: '500',
 },
 indicator: {
   position: 'absolute',
   top: 0,
   height: 3,
   width: '50%',
   borderRadius: 1.5,
 },
});