import { StyleSheet, View, Modal, TouchableOpacity, Animated, Dimensions } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import ThemedText from './ThemedText';
import { FontAwesome5 } from '@expo/vector-icons';

const ThemedModal = ({
 visible = false,
 title,
 message,
 type = 'default', // 'default', 'success', 'warning', 'error'
 icon,
 showCloseButton = true,
 actions = [],
 onClose,
 children,
 style
}) => {
 const colorScheme = useColorScheme();
 const isDark = colorScheme === 'dark';
 const colors = isDark ? Colors.dark : Colors.light;
 
 const { height } = Dimensions.get('window');
 const modalAnim = useRef(new Animated.Value(0)).current;
 const backdropAnim = useRef(new Animated.Value(0)).current;
 
 useEffect(() => {
   if (visible) {
     Animated.parallel([
       Animated.timing(backdropAnim, {
         toValue: 1,
         duration: 300,
         useNativeDriver: true,
       }),
       Animated.spring(modalAnim, {
         toValue: 1,
         friction: 8,
         tension: 40,
         useNativeDriver: true,
       })
     ]).start();
   } else {
     Animated.parallel([
       Animated.timing(backdropAnim, {
         toValue: 0,
         duration: 200,
         useNativeDriver: true,
       }),
       Animated.timing(modalAnim, {
         toValue: 0,
         duration: 200,
         useNativeDriver: true,
       })
     ]).start();
   }
 }, [visible]);
 
 // Get icon and colors based on type
 const getTypeStyles = () => {
   switch (type) {
     case 'success':
       return {
         icon: 'check-circle',
         color: '#4CAF50'
       };
     case 'warning':
       return {
         icon: 'exclamation-triangle',
         color: Colors.warning
       };
     case 'error':
       return {
         icon: 'times-circle',
         color: '#F44336'
       };
     case 'default':
     default:
       return {
         icon: 'info-circle',
         color: Colors.primary
       };
   }
 };
 
 const typeStyles = getTypeStyles();
 
 // Handle backdrop press
 const handleBackdropPress = () => {
   if (showCloseButton) {
     onClose && onClose();
   }
 };
 
 return (
   <Modal
     transparent
     visible={visible}
     animationType="none"
     onRequestClose={onClose}
   >
     <Animated.View 
       style={[
         styles.container,
         { opacity: backdropAnim }
       ]}
     >
       <TouchableOpacity
         style={styles.backdrop}
         activeOpacity={1}
         onPress={handleBackdropPress}
       >
         <Animated.View
           style={[
             styles.modalContainer,
             {
               backgroundColor: colors.uiBackground,
               transform: [
                 {
                   translateY: modalAnim.interpolate({
                     inputRange: [0, 1],
                     outputRange: [height / 2, 0],
                   }),
                 },
                 {
                   scale: modalAnim.interpolate({
                     inputRange: [0, 1],
                     outputRange: [0.9, 1],
                   }),
                 },
               ],
               opacity: modalAnim,
             },
             style
           ]}
         >
           {/* Header section */}
           {(title || showCloseButton) && (
             <View style={styles.header}>
               {title && (
                 <ThemedText variant="subtitle" style={styles.title}>
                   {title}
                 </ThemedText>
               )}
               
               {showCloseButton && (
                 <TouchableOpacity
                   style={styles.closeButton}
                   onPress={onClose}
                   hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                 >
                   <FontAwesome5
                     name="times"
                     size={16}
                     color={colors.iconColor}
                   />
                 </TouchableOpacity>
               )}
             </View>
           )}
           
           {/* Content section */}
           <View style={styles.content}>
             {/* Icon */}
             {(icon || type !== 'default') && (
               <View 
                 style={[
                   styles.iconContainer,
                   { borderColor: typeStyles.color }
                 ]}
               >
                 <FontAwesome5
                   name={icon || typeStyles.icon}
                   size={28}
                   color={typeStyles.color}
                 />
               </View>
             )}
             
             {/* Message */}
             {message && (
               <ThemedText style={styles.message}>
                 {message}
               </ThemedText>
             )}
             
             {/* Custom content */}
             {children}
           </View>
           
           {/* Actions section */}
           {actions.length > 0 && (
             <View style={styles.actionsContainer}>
               {actions.map((action, index) => (
                 <View 
                   key={index} 
                   style={[
                     styles.actionButton,
                     index > 0 && styles.actionButtonMargin
                   ]}
                 >
                   {action}
                 </View>
               ))}
             </View>
           )}
         </Animated.View>
       </TouchableOpacity>
     </Animated.View>
   </Modal>
 );
};

export default ThemedModal;

const styles = StyleSheet.create({
 container: {
   flex: 1,
   backgroundColor: 'rgba(0,0,0,0.5)',
 },
 backdrop: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
 },
 modalContainer: {
   width: '85%',
   maxWidth: 400,
   borderRadius: 12,
   overflow: 'hidden',
   shadowColor: '#000',
   shadowOffset: { width: 0, height: 10 },
   shadowOpacity: 0.3,
   shadowRadius: 20,
   elevation: 10,
 },
 header: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   paddingVertical: 16,
   paddingHorizontal: 20,
   borderBottomWidth: StyleSheet.hairlineWidth,
   borderBottomColor: 'rgba(0,0,0,0.1)',
 },
 title: {
   flex: 1,
 },
 closeButton: {
   padding: 4,
 },
 content: {
   padding: 20,
   alignItems: 'center',
 },
 iconContainer: {
   width: 64,
   height: 64,
   borderRadius: 32,
   borderWidth: 2,
   justifyContent: 'center',
   alignItems: 'center',
   marginBottom: 16,
 },
 message: {
   textAlign: 'center',
   marginBottom: 16,
 },
 actionsContainer: {
   flexDirection: 'row',
   justifyContent: 'flex-end',
   padding: 16,
   borderTopWidth: StyleSheet.hairlineWidth,
   borderTopColor: 'rgba(0,0,0,0.1)',
 },
 actionButton: {
   flex: 1,
   maxWidth: 120,
 },
 actionButtonMargin: {
   marginLeft: 8,
 },
});