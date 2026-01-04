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
  
  // Background customization state
  const [backgroundType, setBackgroundType] = useState('solid');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [gradientEndColor, setGradientEndColor] = useState('#f0f0f0');
  const [gradientDirection, setGradientDirection] = useState('to right');
  const [backgroundImage, setBackgroundImage] = useState('');

  // Load theme preferences from backend
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          const preferences = userData.preferences;
          
          if (preferences) {
            if (preferences.theme === 'dark') {
              setDarkMode(true);
            }
            
            if (preferences.primaryColor) {
              setPrimaryColor(preferences.primaryColor);
            }
            if (preferences.secondaryColor) {
              setSecondaryColor(preferences.secondaryColor);
            }
            if (preferences.backgroundType) {
              setBackgroundType(preferences.backgroundType);
            }
            if (preferences.backgroundColor) {
              setBackgroundColor(preferences.backgroundColor);
            }
            if (preferences.gradientEndColor) {
              setGradientEndColor(preferences.gradientEndColor);
            }
            if (preferences.gradientDirection) {
              setGradientDirection(preferences.gradientDirection);
            }
            if (preferences.backgroundImage) {
              setBackgroundImage(preferences.backgroundImage);
            }
          }
        }
      } catch (error) {
        console.error('Error loading theme preferences:', error);
      }
    };
    
    loadPreferences();
  }, []);

  // Save theme preferences
  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    // Update preferences in backend
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            preferences: {
              theme: newMode ? 'dark' : 'light',
              primaryColor,
              secondaryColor,
              backgroundType,
              backgroundColor,
              gradientEndColor,
              gradientDirection,
              backgroundImage
            }
          })
        });
      }
    } catch (error) {
      console.error('Error saving theme preferences:', error);
    }
  };

  const updatePrimaryColor = async (color) => {
    setPrimaryColor(color);
    
    // Update preferences in backend
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            preferences: {
              theme: darkMode ? 'dark' : 'light',
              primaryColor: color,
              secondaryColor,
              backgroundType,
              backgroundColor,
              gradientEndColor,
              gradientDirection,
              backgroundImage
            }
          })
        });
      }
    } catch (error) {
      console.error('Error saving theme preferences:', error);
    }
  };

  const updateSecondaryColor = async (color) => {
    setSecondaryColor(color);
    
    // Update preferences in backend
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            preferences: {
              theme: darkMode ? 'dark' : 'light',
              primaryColor,
              secondaryColor: color,
              backgroundType,
              backgroundColor,
              gradientEndColor,
              gradientDirection,
              backgroundImage
            }
          })
        });
      }
    } catch (error) {
      console.error('Error saving theme preferences:', error);
    }
  };

  const resetToDefaultColors = async () => {
    setPrimaryColor('#667eea');
    setSecondaryColor('#f093fb');
    setBackgroundType('solid');
    setBackgroundColor('#ffffff');
    setGradientEndColor('#f0f0f0');
    setGradientDirection('to right');
    setBackgroundImage('');
    
    // Update preferences in backend
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            preferences: {
              theme: darkMode ? 'dark' : 'light',
              primaryColor: '#667eea',
              secondaryColor: '#f093fb',
              backgroundType: 'solid',
              backgroundColor: '#ffffff',
              gradientEndColor: '#f0f0f0',
              gradientDirection: 'to right',
              backgroundImage: ''
            }
          })
        });
      }
    } catch (error) {
      console.error('Error saving theme preferences:', error);
    }
  };
  
  const updateBackgroundType = async (type) => {
    setBackgroundType(type);
    
    // Update preferences in backend
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            preferences: {
              theme: darkMode ? 'dark' : 'light',
              primaryColor,
              secondaryColor,
              backgroundType: type,
              backgroundColor,
              gradientEndColor,
              gradientDirection,
              backgroundImage
            }
          })
        });
      }
    } catch (error) {
      console.error('Error saving theme preferences:', error);
    }
  };
  
  const updateBackgroundColor = async (color) => {
    setBackgroundColor(color);
    
    // Update preferences in backend
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            preferences: {
              theme: darkMode ? 'dark' : 'light',
              primaryColor,
              secondaryColor,
              backgroundType,
              backgroundColor: color,
              gradientEndColor,
              gradientDirection,
              backgroundImage
            }
          })
        });
      }
    } catch (error) {
      console.error('Error saving theme preferences:', error);
    }
  };
  
  const updateGradientEndColor = async (color) => {
    setGradientEndColor(color);
    
    // Update preferences in backend
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            preferences: {
              theme: darkMode ? 'dark' : 'light',
              primaryColor,
              secondaryColor,
              backgroundType,
              backgroundColor,
              gradientEndColor: color,
              gradientDirection,
              backgroundImage
            }
          })
        });
      }
    } catch (error) {
      console.error('Error saving theme preferences:', error);
    }
  };
  
  const updateGradientDirection = async (direction) => {
    setGradientDirection(direction);
    
    // Update preferences in backend
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            preferences: {
              theme: darkMode ? 'dark' : 'light',
              primaryColor,
              secondaryColor,
              backgroundType,
              backgroundColor,
              gradientEndColor,
              gradientDirection: direction,
              backgroundImage
            }
          })
        });
      }
    } catch (error) {
      console.error('Error saving theme preferences:', error);
    }
  };
  
  const updateBackgroundImage = async (image) => {
    setBackgroundImage(image);
    
    // Update preferences in backend
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            preferences: {
              theme: darkMode ? 'dark' : 'light',
              primaryColor,
              secondaryColor,
              backgroundType,
              backgroundColor,
              gradientEndColor,
              gradientDirection,
              backgroundImage: image
            }
          })
        });
      }
    } catch (error) {
      console.error('Error saving theme preferences:', error);
    }
  };

  const value = {
    darkMode,
    setDarkMode,
    primaryColor,
    secondaryColor,
    toggleDarkMode,
    updatePrimaryColor,
    updateSecondaryColor,
    resetToDefaultColors,
    // Background customization
    backgroundType,
    backgroundColor,
    gradientEndColor,
    gradientDirection,
    backgroundImage,
    updateBackgroundType,
    updateBackgroundColor,
    updateGradientEndColor,
    updateGradientDirection,
    updateBackgroundImage
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};