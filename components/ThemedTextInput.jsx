import { StyleSheet, TextInput, View } from 'react-native';
import React, { useState } from 'react';
import { Colors } from '../constants/Colors';
import ThemedText from './ThemedText';
import { useTheme } from '../hooks/useTheme';

const ThemedTextInput = ({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false,
  style 
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <View style={[styles.container, style]}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.uiBackground,
            color: theme.text,
            borderColor: isFocused ? Colors.primary : theme.iconColor,
          }
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.iconColor}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

export default ThemedTextInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
  }
});