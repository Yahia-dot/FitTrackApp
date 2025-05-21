import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import ThemedText from './ThemedText';
import { FontAwesome5 } from '@expo/vector-icons';

const ThemedAvatar = ({
 source,
 name,
 size = 'medium', // 'small', 'medium', 'large', 'xlarge'
 badgeIcon,
 badgeColor,
 badgeBackground,
 onPress,
 borderWidth = 0,
 style
}) => {
 const colorScheme = useColorScheme();
 const isDark = colorScheme === 'dark';
 const colors = isDark ? Colors.dark : Colors.light;
 
 // Get size dimensions
 const getSize = () => {
   switch (size) {
     case 'small':
       return {
         avatar: 36,
         initial: 14,
         badge: 12,
         badgeIcon: 8
       };
     case 'large':
       return {
         avatar: 80,
         initial: 32,
         badge: 24,
         badgeIcon: 14
       };
     case 'xlarge':
       return {
         avatar: 120,
         initial: 48,
         badge: 32,
         badgeIcon: 16
       };
     case 'medium':
     default:
       return {
         avatar: 56,
         initial: 22,
         badge: 18,
         badgeIcon: 10
       };
   }
 };
 
 const sizes = getSize();
 
 // Get initial from name
 const getInitials = () => {
   if (!name) return '?';
   
   const nameParts = name.trim().split(' ');
   if (nameParts.length === 1) {
     return nameParts[0].charAt(0).toUpperCase();
   }
   
   return (
     nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
   ).toUpperCase();
 };
 
 // Generate background color from name for placeholder
 const getColorFromName = () => {
   if (!name) return Colors.primary;
   
   const colors = [
     '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
     '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
     '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722'
   ];
   
   let hash = 0;
   for (let i = 0; i < name.length; i++) {
     hash = name.charCodeAt(i) + ((hash << 5) - hash);
   }
   
   return colors[Math.abs(hash) % colors.length];
 };
 
 const AvatarContent = () => (
   <View 
     style={[
       styles.container, 
       { 
         width: sizes.avatar, 
         height: sizes.avatar,
         borderRadius: sizes.avatar / 2,
         borderWidth: borderWidth,
         borderColor: colors.uiBackground
       },
       style
     ]}
   >
     {source ? (
       <Image
         source={source}
         style={[
           styles.image,
           {
             width: sizes.avatar,
             height: sizes.avatar,
             borderRadius: sizes.avatar / 2
           }
         ]}
         resizeMode="cover"
       />
     ) : (
       <View 
         style={[
           styles.placeholder,
           {
             width: sizes.avatar,
             height: sizes.avatar,
             borderRadius: sizes.avatar / 2,
             backgroundColor: getColorFromName()
           }
         ]}
       >
         <ThemedText 
           style={[
             styles.initial,
             { 
               fontSize: sizes.initial,
               color: '#ffffff'
             }
           ]}
         >
           {getInitials()}
         </ThemedText>
       </View>
     )}
     
     {/* Badge */}
     {badgeIcon && (
       <View 
         style={[
           styles.badge,
           {
             width: sizes.badge,
             height: sizes.badge,
             borderRadius: sizes.badge / 2,
             backgroundColor: badgeBackground || Colors.primary,
             borderColor: colors.uiBackground
           }
         ]}
       >
         <FontAwesome5
           name={badgeIcon}
           size={sizes.badgeIcon}
           color={badgeColor || '#ffffff'}
         />
       </View>
     )}
   </View>
 );
 
 // Wrap with TouchableOpacity if onPress is provided
 if (onPress) {
   return (
     <TouchableOpacity
       onPress={onPress}
       activeOpacity={0.7}
     >
       <AvatarContent />
     </TouchableOpacity>
   );
 }
 
 return <AvatarContent />;
};

export default ThemedAvatar;

const styles = StyleSheet.create({
 container: {
   position: 'relative',
   overflow: 'hidden'
 },
 image: {
   width: '100%',
   height: '100%'
 },
 placeholder: {
   justifyContent: 'center',
   alignItems: 'center',
   width: '100%',
   height: '100%'
 },
 initial: {
   fontWeight: 'bold',
   color: '#ffffff'
 },
 badge: {
   position: 'absolute',
   bottom: 0,
   right: 0,
   justifyContent: 'center',
   alignItems: 'center',
   borderWidth: 2
 }
});