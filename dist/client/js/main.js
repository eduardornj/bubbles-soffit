// Main JavaScript file for Bubbles Enterprise
// This file contains global functionality and utilities

(function() {
  'use strict';
  
  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Bubbles Enterprise - Main JS loaded');
    
    // Add any global functionality here
    initializeGlobalFeatures();
  });
  
  function initializeGlobalFeatures() {
    // Add smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
    
    // Add loading states for forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', function() {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Enviando...';
        }
      });
    });
  }
  
  // Export utilities to global scope if needed
  window.BubblesEnterprise = {
    version: '1.0.0',
    initialized: true
  };
})();