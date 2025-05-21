import { StyleSheet, View } from 'react-native';
import React from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

const ThemedView = ({ style, children }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  
  return (
    <View style={[
      styles.container, 
      { backgroundColor: colors.background },
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