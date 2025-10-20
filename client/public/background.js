// Background script to handle events safely
(function() {
  'use strict';
  
  // Wait for DOM to be fully loaded
  if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBackground);
  } else {
    // DOM is already loaded or not available
    if (typeof window !== 'undefined') {
      window.addEventListener('load', initializeBackground);
    } else {
      initializeBackground();
    }
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
      // Check if document is available
      if (typeof document === 'undefined') {
        console.warn('Document not available for event listener');
        return;
      }
      
      const element = document.querySelector(selector);
      if (element) {
        // Check if addEventListener exists on the element
        if (typeof element.addEventListener === 'function') {
          element.addEventListener(event, handler);
          console.log('Event listener added for:', selector, event);
        } else {
          console.warn('addEventListener not available on element:', selector);
        }
      } else {
        console.warn('Element not found for selector:', selector);
      }
    } catch (error) {
      console.error('Error adding event listener for:', selector, event, error);
    }
  }
  
  // Export any necessary functions
  if (typeof window !== 'undefined') {
    window.BackgroundScript = {
      safeAddEventListener: safeAddEventListener
    };
  }
  
  console.log('Background script loaded');
})();