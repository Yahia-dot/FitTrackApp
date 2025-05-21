import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import ThemedText from './ThemedText';

const ThemedCard = ({ 
  title,
  subtitle,
  image,
  children,
  actions,
  onPress,
  elevation = 'medium', // 'none', 'low', 'medium', 'high'
  style 
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  
  const getElevationStyle = () => {
    // No elevation on dark mode to avoid visual artifacts
    if (isDark) {
      return {};
    }
    
    switch (elevation) {
      case 'none':
        return {
          shadowOpacity: 0,
          elevation: 0,
        };
      case 'low':
        return {
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        };
      case 'high':
        return {
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 6,
        };
      case 'medium':
      default:
        return {
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 4,
        };
    }
  };
  
  const CardContent = () => (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.uiBackground,
        borderColor: isDark ? colors.navBackground : 'transparent'
      },
      getElevationStyle(),
      style
    ]}>
      {/* Optional Image */}
      {image && (
        <Image 
          source={image} 
          style={styles.image}
          resizeMode="cover"
        />
      )}
      
      {/* Header Section */}
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <ThemedText variant="subtitle">{title}</ThemedText>}
          {subtitle && (
            <ThemedText variant="caption" style={styles.subtitle}>
              {subtitle}
            </ThemedText>
          )}
        </View>
      )}
      
      {/* Content Section */}
      <View style={styles.content}>
        {children}
      </View>
      
      {/* Actions Section */}
      {actions && (
        <View style={styles.actions}>
          {actions}
        </View>
      )}
    </View>
  );
  
  // Wrap with TouchableOpacity if onPress is provided
  if (onPress) {
    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={onPress}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }
  
  return <CardContent />;
};

export default ThemedCard;

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: '100%',
    height: 140,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  subtitle: {
    marginTop: 4,
  },
  content: {
    padding: 16,
    paddingTop: 8,
  },
  actions: {
    flexDirection: 'row',
    padding: 12,
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
});