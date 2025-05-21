import { StyleSheet, Text } from 'react-native';
import React from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

const ThemedText = ({ style, variant = 'body', children }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  
  const getVariantStyle = () => {
    switch (variant) {
      case 'title':
        return {
          fontSize: 24,
          fontWeight: 'bold',
          color: colors.title,
        };
      case 'subtitle':
        return {
          fontSize: 18,
          fontWeight: '600',
          color: colors.title,
        };
      case 'body':
      default:
        return {
          fontSize: 16,
          color: colors.text,
        };
      case 'caption':
        return {
          fontSize: 14,
          color: colors.iconColor,
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
