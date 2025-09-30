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
  }, [language]);

  const changeLanguage = (newLanguage) => {
    if (translationService.setLanguage(newLanguage)) {
      setLanguage(newLanguage);
      setTranslations(translationService.getTranslations());
      return true;
    }
    return false;
  };

  const t = (key) => {
    return translationService.t(key);
  };

  const value = {
    language,
    translations,
    changeLanguage,
    t
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export default TranslationContext;