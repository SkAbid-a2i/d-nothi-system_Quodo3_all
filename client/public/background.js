// Background script to handle events safely
(function() {
  'use strict';
  
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBackground);
  } else {
    // DOM is already loaded
    initializeBackground();
  }
  
  function initializeBackground() {
    try {
      // Add any necessary event listeners here
      // Make sure elements exist before adding listeners
      console.log('Background script initialized successfully');
    } catch (error) {
      console.error('Error initializing background script:', error);
    }
  }
  
  // Safely add event listener only if element exists
  function safeAddEventListener(selector, event, handler) {
    const element = document.querySelector(selector);
    if (element) {
      element.addEventListener(event, handler);
    } else {
      console.warn('Element not found for selector:', selector);
    }
  }
  
  // Export any necessary functions
  window.BackgroundScript = {
    // Add any public methods here
  };
})();