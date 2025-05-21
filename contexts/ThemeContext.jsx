// contexts/ThemeContext.js
import React, { createContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { useSettings } from '../hooks/useSettings';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const { settings } = useSettings();
  const [colorScheme, setColorScheme] = useState(systemColorScheme);
  
  // Effect to apply user's preference when settings change
  useEffect(() => {
    if (settings && settings.darkMode !== undefined) {
      // If user has explicitly set a preference, use it
      setColorScheme(settings.darkMode ? 'dark' : 'light');
    } else {
      // Otherwise fall back to system preference
      setColorScheme(systemColorScheme);
    }
  }, [settings, systemColorScheme]);
  
  // Compute theme based on active color scheme
  const theme = Colors[colorScheme] ?? Colors.light;
  const isDark = colorScheme === 'dark';

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      isDark, 
      colorScheme,
      // Add these methods to allow manual control
      setColorScheme,
      systemColorScheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}