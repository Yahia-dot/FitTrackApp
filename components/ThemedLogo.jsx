import { StyleSheet, Animated, View } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

const ThemedLogo = ({ size = 24, animated = true, style }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  
  const spinValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [animated, spinValue]);
  
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  return (
    <View style={[styles.container, style]}>
      <Animated.View style={{ transform: [{ rotate: animated ? spin : '0deg' }] }}>
        <FontAwesome5
          name="dumbbell"
          size={size}
          color={Colors.primary}
        />
      </Animated.View>
    </View>
  );
};

export default ThemedLogo;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  }
});
