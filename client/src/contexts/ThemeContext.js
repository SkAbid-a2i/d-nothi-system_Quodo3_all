import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#667eea');
  const [secondaryColor, setSecondaryColor] = useState('#f093fb');

  // Load saved theme preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
    
    // Load saved color preferences
    const savedPrimaryColor = localStorage.getItem('primaryColor');
    const savedSecondaryColor = localStorage.getItem('secondaryColor');
    
    if (savedPrimaryColor) {
      setPrimaryColor(savedPrimaryColor);
    }
    
    if (savedSecondaryColor) {
      setSecondaryColor(savedSecondaryColor);
    }
  }, []);

  // Save theme preferences
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const updatePrimaryColor = (color) => {
    setPrimaryColor(color);
    localStorage.setItem('primaryColor', color);
  };

  const updateSecondaryColor = (color) => {
    setSecondaryColor(color);
    localStorage.setItem('secondaryColor', color);
  };

  const resetToDefaultColors = () => {
    setPrimaryColor('#667eea');
    setSecondaryColor('#f093fb');
    localStorage.removeItem('primaryColor');
    localStorage.removeItem('secondaryColor');
  };

  const value = {
    darkMode,
    setDarkMode,
    primaryColor,
    secondaryColor,
    toggleDarkMode,
    updatePrimaryColor,
    updateSecondaryColor,
    resetToDefaultColors
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};