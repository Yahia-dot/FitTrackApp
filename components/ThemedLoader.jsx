import { StyleSheet, View, ActivityIndicator, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import ThemedText from './ThemedText';

const ThemedLoader = ({ size = 'large', text, style }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);
  
  return (
    <View style={[styles.container, style]}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <ActivityIndicator size={size} color={Colors.primary} />
      </Animated.View>
      {text && (
        <ThemedText style={styles.text} variant="caption">
          {text}
        </ThemedText>
      )}
    </View>
  );
};

export default ThemedLoader;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    marginTop: 12,
  }
});
