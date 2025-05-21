import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import React from 'react';
import { Colors } from '../constants/Colors';
import ThemedText from './ThemedText';
import { useTheme } from '../hooks/useTheme';

const ThemedButton = ({ 
  title, 
  onPress, 
  variant = 'primary', // or 'outline', 'text'
  size = 'medium', // or 'small', 'large'
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style 
}) => {
  const { theme } = useTheme();
  
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled 
            ? `${Colors.primary}80` 
            : Colors.primary,
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled 
            ? `${Colors.primary}80` 
            : Colors.primary,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        };
      default:
        return {
          backgroundColor: disabled 
            ? `${Colors.primary}80` 
            : Colors.primary,
          borderWidth: 0,
        };
    }
  };
  
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 12,
          minWidth: 80,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
          minWidth: 120,
        };
      case 'medium':
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 20,
          minWidth: 100,
        };
    }
  };
  
  const getTextColor = () => {
    if (disabled) {
      return variant === 'primary' ? '#fff' : `${Colors.primary}80`;
    }
    
    switch (variant) {
      case 'primary':
        return '#fff';
      case 'outline':
      case 'text':
        return Colors.primary;
      default:
        return '#fff';
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyle(),
        getSizeStyle(),
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={getTextColor()} 
        />
      ) : (
        <>
          {leftIcon}
          <ThemedText 
            style={[
              styles.buttonText, 
              { color: getTextColor() },
              leftIcon && { marginLeft: 8 },
              rightIcon && { marginRight: 8 }
            ]}
          >
            {title}
          </ThemedText>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

export default ThemedButton;

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
});