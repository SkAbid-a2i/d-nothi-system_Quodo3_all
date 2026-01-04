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
      // Update language in backend
      this.saveLanguageToBackend(language);
      return true;
    }
    return false;
  }

  getCurrentLanguage() {
    // Note: Language preference will be loaded from backend via user data
    // when the user authenticates
    return this.currentLanguage;
  }
  
  async saveLanguageToBackend(language) {
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
              language: language
            }
          })
        });
      }
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
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