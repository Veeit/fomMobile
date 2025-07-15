import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

export const lightTheme = {
  background: '#FFFFFF',
  text: '#000000',
  secondary: '#666666',
  border: '#e0e0e0',
  card: '#FFFFFF',
  cardBackground: '#f8f9fa',
  primary: '#007AFF',
  headerBackground: '#f5f5f5',
};

export const darkTheme = {
  background: '#000000',
  text: '#FFFFFF',
  secondary: '#A0A0A0',
  border: '#333333',
  card: '#1C1C1E',
  cardBackground: '#2C2C2E',
  primary: '#0A84FF',
  headerBackground: '#1C1C1E',
};

export const ThemeContext = createContext({
  theme: lightTheme,
  isDark: false,
});

export const ThemeProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');

  useEffect(() => {
    setIsDark(colorScheme === 'dark');
  }, [colorScheme]);

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);