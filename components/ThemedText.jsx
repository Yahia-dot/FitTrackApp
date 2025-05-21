import { StyleSheet, Text } from 'react-native';
import React from 'react';
import { useTheme } from '../hooks/useTheme';

const ThemedText = ({ style, variant = 'body', children }) => {
  const { theme } = useTheme();
  
  const getVariantStyle = () => {
    switch (variant) {
      case 'title':
        return {
          fontSize: 24,
          fontWeight: 'bold',
          color: theme.title,
        };
      case 'subtitle':
        return {
          fontSize: 18,
          fontWeight: '600',
          color: theme.title,
        };
      case 'body':
      default:
        return {
          fontSize: 16,
          color: theme.text,
        };
      case 'caption':
        return {
          fontSize: 14,
          color: theme.iconColor,
        };
    }
  };
  
  return (
    <Text style={[getVariantStyle(), style]}>
      {children}
    </Text>
  );
};

export default ThemedText;

const styles = StyleSheet.create({});