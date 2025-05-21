import { StyleSheet, View } from 'react-native';
import React from 'react';
import { useTheme } from '../hooks/useTheme';

const ThemedView = ({ style, children }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[
      styles.container, 
      { backgroundColor: theme.background },
      style
    ]}>
      {children}
    </View>
  );
};

export default ThemedView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  }
});