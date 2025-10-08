import React, { createContext, useContext, useState, useEffect } from 'react';
import translationService from '../services/translationService';

// Create context
const TranslationContext = createContext();

// Custom hook to use translation context
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

// Translation provider component
export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState(translationService.getCurrentLanguage());
  const [translations, setTranslations] = useState(translationService.getTranslations());

  // Load saved language preference on initial load
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    if (savedLanguage !== language) {
      changeLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (newLanguage) => {
    if (translationService.setLanguage(newLanguage)) {
      setLanguage(newLanguage);
      setTranslations(translationService.getTranslations());
      return true;
    }
    return false;
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'bn' : 'en';
    return changeLanguage(newLanguage);
  };

  const t = (key) => {
    // Split the key by dots to navigate through the object
    const keys = key.split('.');
    let translation = translations;
    
    // Navigate through the object using the keys
    for (const k of keys) {
      if (translation && translation[k] !== undefined) {
        translation = translation[k];
      } else {
        // If translation not found, return the key itself
        return key;
      }
    }
    
    return translation;
  };

  const value = {
    language,
    translations,
    changeLanguage,
    toggleLanguage,
    t
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export default TranslationContext;