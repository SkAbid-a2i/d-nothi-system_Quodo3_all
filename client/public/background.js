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
      console.log('Background script initializing...');
      
      // Safely add event listeners - check if elements exist before adding listeners
      // Example of safe event listener addition:
      /*
      const someElement = document.getElementById('some-element-id');
      if (someElement) {
        someElement.addEventListener('click', function() {
          // Handle click event
          console.log('Element clicked');
        });
      }
      */
      
      // Add other initialization code here
      console.log('Background script initialized successfully');
    } catch (error) {
      console.error('Error initializing background script:', error);
    }
  }
  
  // Safe function to add event listeners
  function safeAddEventListener(selector, event, handler) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        element.addEventListener(event, handler);
        console.log('Event listener added for:', selector, event);
      } else {
        console.warn('Element not found for selector:', selector);
      }
    } catch (error) {
      console.error('Error adding event listener for:', selector, event, error);
    }
  }
  
  // Export any necessary functions
  window.BackgroundScript = {
    safeAddEventListener: safeAddEventListener
  };
  
  console.log('Background script loaded');
})();