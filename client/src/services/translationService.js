import en from './translations/en';
import bn from './translations/bn';

const translations = {
  en,
  bn
};

class TranslationService {
  constructor() {
    this.currentLanguage = 'en';
    this.translations = translations;
  }

  setLanguage(language) {
    if (this.translations[language]) {
      this.currentLanguage = language;
      // Save to localStorage
      localStorage.setItem('language', language);
      return true;
    }
    return false;
  }

  getCurrentLanguage() {
    // Check for saved language preference first
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && this.translations[savedLanguage]) {
      this.currentLanguage = savedLanguage;
    }
    return this.currentLanguage;
  }

  t(key) {
    // Split the key by dots to navigate through the object
    const keys = key.split('.');
    let translation = this.translations[this.currentLanguage];
    
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
  }
  
  // Get all translations for the current language
  getTranslations() {
    return this.translations[this.currentLanguage];
  }
}

// Create a singleton instance
const translationService = new TranslationService();

// Check for saved language preference
const savedLanguage = localStorage.getItem('language');
if (savedLanguage && translations[savedLanguage]) {
  translationService.setLanguage(savedLanguage);
}

export default translationService;