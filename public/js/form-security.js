// Form Security and Validation
// Client-side protection against spam and malicious submissions
// Enhanced with AI-based detection for 2025 threats

// Note: AI Security features will be loaded dynamically to avoid import issues
// when script is loaded as inline in Astro

class FormSecurity {
  constructor(formId, options = {}) {
    this.form = document.getElementById(formId);
    this.options = {
      maxSubmissions: 3,
      cooldownTime: 60000, // 1 minute
      enableHoneypot: true,
      enableRateLimit: true,
      enableValidation: true,
      enableAIDetection: true, // New AI-based detection
      enableAdvancedBehaviorTracking: true, // Enhanced behavior analysis
      ...options
    };
    
    this.submissionCount = 0;
    this.lastSubmission = 0;
    this.isSubmitting = false;
    
    // Initialize AI security engine (will be loaded dynamically)
    this.aiSecurity = null;
    this.behaviorTracker = null;
    
    // Load AI security features asynchronously
    this.loadAISecurityFeatures();
    
    if (this.form) {
      this.init();
    }
  }
  
  init() {
    // Add event listeners
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    
    // Add real-time validation
    if (this.options.enableValidation) {
      this.addValidationListeners();
    }
    
    // Monitor form interaction patterns
    this.monitorBehavior();
    
    // Enhanced AI-based behavior tracking
    if (this.options.enableAdvancedBehaviorTracking) {
      this.initAdvancedBehaviorTracking();
    }
    
    // Add CSRF token if available
    this.addCSRFToken();
    
    // AI security features will be initialized after dynamic loading
  }
  
  async handleSubmit(event) {
    event.preventDefault();
    
    // Prevent double submission
    if (this.isSubmitting) {
      return false;
    }
    
    // Check rate limiting
    if (this.options.enableRateLimit && !this.checkRateLimit()) {
      this.showMessage('Please wait before submitting again.', 'error');
      return false;
    }
    
    // Validate honeypot
    if (this.options.enableHoneypot && !this.validateHoneypot()) {
      // Silently reject spam
      this.showMessage('There was an error processing your request.', 'error');
      return false;
    }
    
    // Validate form data
    const validation = this.validateForm();
    if (!validation.isValid) {
      this.showMessage(validation.message, 'error');
      return false;
    }
    
    // Check for suspicious patterns
    if (this.detectSuspiciousPatterns()) {
      this.showMessage('Please review your submission and try again.', 'error');
      return false;
    }
    
    // AI-based security analysis
    if (this.options.enableAIDetection) {
      const aiAnalysis = await this.performAISecurityAnalysis();
      if (aiAnalysis.action === 'BLOCK') {
        this.showMessage('Security validation failed. Please try again.', 'error');
        return false;
      } else if (aiAnalysis.action === 'CHALLENGE') {
        // Could implement CAPTCHA or additional verification here
        this.showMessage('Additional verification may be required.', 'warning');
      }
    }
    
    // Submit form
    await this.submitForm();
  }
  
  checkRateLimit() {
    const now = Date.now();
    const timeSinceLastSubmission = now - this.lastSubmission;
    
    if (this.submissionCount >= this.options.maxSubmissions) {
      if (timeSinceLastSubmission < this.options.cooldownTime) {
        return false;
      } else {
        // Reset counter after cooldown
        this.submissionCount = 0;
      }
    }
    
    return true;
  }
  
  // Create honeypot fields
  createHoneypot() {
    if (!this.options.enableHoneypot) return;
    
    // Create multiple dynamic honeypots with random names (enhanced security)
    const honeypotCount = 2 + Math.floor(Math.random() * 2); // 2-3 honeypots
    const honeypotNames = [
      'website', // Keep original for compatibility
      'honeypot_' + Math.random().toString(36).substr(2, 8),
      'field_' + Math.random().toString(36).substr(2, 6),
      'input_' + Date.now().toString(36)
    ];
    
    for (let i = 0; i < honeypotCount; i++) {
      const honeypot = document.createElement('input');
      honeypot.type = 'text';
      honeypot.name = honeypotNames[i] || 'honeypot_' + i;
      honeypot.style.cssText = 'position: absolute; left: -9999px; top: -9999px; opacity: 0; pointer-events: none;';
      honeypot.tabIndex = -1;
      honeypot.autocomplete = 'off';
      honeypot.setAttribute('aria-hidden', 'true');
      
      // Add random attributes to make it look more legitimate to bots
      if (Math.random() > 0.5) {
        honeypot.placeholder = ['email', 'name', 'phone', 'address'][Math.floor(Math.random() * 4)];
      }
      
      this.form.appendChild(honeypot);
    }
    
    // Add JavaScript-enabled verification field (enhanced bot detection)
    const jsVerification = document.createElement('input');
    jsVerification.type = 'hidden';
    jsVerification.name = '_js_enabled';
    jsVerification.value = 'false'; // Will be set to 'true' by JS if enabled
    this.form.appendChild(jsVerification);
    
    // Set JS verification to true (bots without JS will fail this check)
    setTimeout(() => {
      jsVerification.value = 'true';
    }, 100);
  }
  
  validateHoneypot() {
    // Check all honeypot fields (enhanced validation)
    const honeypotFields = this.form.querySelectorAll('input[name^="honeypot_"], input[name^="field_"], input[name^="input_"], input[name="website"]');
    for (const field of honeypotFields) {
      if (field.value !== '') {
        return false; // Honeypot was filled, likely spam
      }
    }
    
    // Check JavaScript verification
    const jsVerification = this.form.querySelector('input[name="_js_enabled"]');
    if (jsVerification && jsVerification.value !== 'true') {
      return false; // JavaScript not enabled, likely bot
    }
    
    return true;
  }
  
  validateForm() {
    const formData = new FormData(this.form);
    const errors = [];
    
    // Required field validation
    const requiredFields = this.form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        errors.push(`${this.getFieldLabel(field)} is required`);
      }
    });
    
    // Email validation
    const emailField = this.form.querySelector('input[type="email"]');
    if (emailField && emailField.value) {
      if (!this.isValidEmail(emailField.value)) {
        errors.push('Please enter a valid email address');
      }
    }
    
    // Phone validation
    const phoneField = this.form.querySelector('input[type="tel"]');
    if (phoneField && phoneField.value) {
      if (!this.isValidPhone(phoneField.value)) {
        errors.push('Please enter a valid phone number');
      }
    }
    
    // Text length validation
    const textFields = this.form.querySelectorAll('input[type="text"], textarea');
    textFields.forEach(field => {
      const minLength = field.getAttribute('minlength');
      const maxLength = field.getAttribute('maxlength');
      
      if (minLength && field.value.length < parseInt(minLength)) {
        errors.push(`${this.getFieldLabel(field)} must be at least ${minLength} characters`);
      }
      
      if (maxLength && field.value.length > parseInt(maxLength)) {
        errors.push(`${this.getFieldLabel(field)} must be less than ${maxLength} characters`);
      }
    });
    
    // File validation
    const fileFields = this.form.querySelectorAll('input[type="file"]');
    fileFields.forEach(field => {
      if (field.files.length > 0) {
        const validation = this.validateFiles(field.files);
        if (!validation.isValid) {
          errors.push(validation.message);
        }
      }
    });
    
    return {
      isValid: errors.length === 0,
      message: errors.join(', ')
    };
  }
  
  detectSuspiciousPatterns() {
    const formData = new FormData(this.form);
    
    // Check for common spam patterns
    const spamPatterns = [
      /\b(viagra|cialis|casino|poker|loan|mortgage|insurance)\b/i,
      /\b(click here|visit now|act now|limited time)\b/i,
      /\b(free money|make money|work from home)\b/i,
      /(http:\/\/|https:\/\/|www\.|\.[a-z]{2,4}\s)/gi
    ];
    
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        for (const pattern of spamPatterns) {
          if (pattern.test(value)) {
            return true;
          }
        }
        
        // Check for excessive repetition
        if (this.hasExcessiveRepetition(value)) {
          return true;
        }
        
        // Check for suspicious character patterns
        if (this.hasSuspiciousCharacters(value)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  hasExcessiveRepetition(text) {
    // Check for repeated characters or words
    const repeatedChars = /(..).*\1.*\1.*\1/;
    const repeatedWords = /(\b\w+\b).*\1.*\1/i;
    
    return repeatedChars.test(text) || repeatedWords.test(text);
  }
  
  hasSuspiciousCharacters(text) {
    // Check for excessive special characters or numbers
    const specialCharRatio = (text.match(/[^a-zA-Z0-9\s]/g) || []).length / text.length;
    const numberRatio = (text.match(/[0-9]/g) || []).length / text.length;
    
    return specialCharRatio > 0.3 || numberRatio > 0.5;
  }
  
  async submitForm() {
    this.isSubmitting = true;
    this.updateSubmitButton(true);
    
    try {
      const formData = new FormData(this.form);
      
      // Add security metadata
      formData.append('_timestamp', Date.now());
      formData.append('_timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
      formData.append('_userAgent', navigator.userAgent);
      
      const response = await fetch(this.form.action, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        this.showMessage(result.message || 'Thank you! Your request has been submitted successfully.', 'success');
        this.form.reset();
        
        // Track successful submission
        this.submissionCount++;
        this.lastSubmission = Date.now();
        
        // Optional: redirect after success
        if (result.redirectUrl) {
          setTimeout(() => {
            window.location.href = result.redirectUrl;
          }, 2000);
        }
      } else {
        throw new Error(result.message || 'Submission failed');
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      this.showMessage(error.message || 'There was an error submitting your request. Please try again.', 'error');
    } finally {
      this.isSubmitting = false;
      this.updateSubmitButton(false);
    }
  }
  
  addValidationListeners() {
    // Real-time validation for email
    const emailField = this.form.querySelector('input[type="email"]');
    if (emailField) {
      emailField.addEventListener('blur', () => {
        if (emailField.value && !this.isValidEmail(emailField.value)) {
          this.showFieldError(emailField, 'Please enter a valid email address');
        } else {
          this.clearFieldError(emailField);
        }
      });
    }
    
    // Real-time validation for phone
    const phoneField = this.form.querySelector('input[type="tel"]');
    if (phoneField) {
      phoneField.addEventListener('blur', () => {
        if (phoneField.value && !this.isValidPhone(phoneField.value)) {
          this.showFieldError(phoneField, 'Please enter a valid phone number');
        } else {
          this.clearFieldError(phoneField);
        }
      });
    }
    
    // Character count for textareas
    const textareas = this.form.querySelectorAll('textarea[maxlength]');
    textareas.forEach(textarea => {
      const maxLength = parseInt(textarea.getAttribute('maxlength'));
      const counter = document.createElement('div');
      counter.className = 'text-sm text-gray-500 mt-1';
      textarea.parentNode.appendChild(counter);
      
      const updateCounter = () => {
        const remaining = maxLength - textarea.value.length;
        counter.textContent = `${remaining} characters remaining`;
        counter.className = remaining < 50 ? 'text-sm text-red-500 mt-1' : 'text-sm text-gray-500 mt-1';
      };
      
      textarea.addEventListener('input', updateCounter);
      updateCounter();
    });
  }
  
  monitorBehavior() {
    let startTime = Date.now();
    let keystrokes = 0;
    let mouseMovements = 0;
    
    this.form.addEventListener('keydown', () => {
      keystrokes++;
    });
    
    this.form.addEventListener('mousemove', () => {
      mouseMovements++;
    });
    
    // Store behavior data for analysis
    this.form.addEventListener('submit', () => {
      const timeSpent = Date.now() - startTime;
      const behaviorData = {
        timeSpent,
        keystrokes,
        mouseMovements,
        fillSpeed: keystrokes / (timeSpent / 1000)
      };
      
      // Add behavior data to form
      const behaviorInput = document.createElement('input');
      behaviorInput.type = 'hidden';
      behaviorInput.name = '_behavior';
      behaviorInput.value = JSON.stringify(behaviorData);
      this.form.appendChild(behaviorInput);
    });
  }
  
  // Enhanced behavior tracking with AI analysis
  initAdvancedBehaviorTracking() {
    // Track detailed keystroke patterns
    this.form.addEventListener('keydown', (event) => {
      this.behaviorTracker.trackKeydown(event);
    });
    
    // Track mouse movements with more precision
    this.form.addEventListener('mousemove', () => {
      this.behaviorTracker.trackMouseMove();
    });
    
    // Track field focus patterns
    const formFields = this.form.querySelectorAll('input, textarea, select');
    formFields.forEach(field => {
      field.addEventListener('focus', () => {
        this.behaviorTracker.trackFieldFocus(field.name || field.id);
      });
    });
    
    // Track typing pauses
    let pauseTimer;
    this.form.addEventListener('keydown', () => {
      clearTimeout(pauseTimer);
      pauseTimer = setTimeout(() => {
        this.behaviorTracker.trackPause();
      }, 1000);
    });
  }
  
  // Load AI security features dynamically
  async loadAISecurityFeatures() {
    try {
      // In a production environment, you would load the AI security module here
      // For now, we'll create a basic behavior tracker
      this.behaviorTracker = {
        keydownEvents: [],
        mouseMoves: 0,
        fieldFocuses: [],
        pauses: 0,
        
        trackKeydown: function(event) {
          this.keydownEvents.push({
            timestamp: Date.now(),
            key: event.key,
            code: event.code
          });
        },
        
        trackMouseMove: function() {
          this.mouseMoves++;
        },
        
        trackFieldFocus: function(fieldName) {
          this.fieldFocuses.push({
            field: fieldName,
            timestamp: Date.now()
          });
        },
        
        trackPause: function() {
          this.pauses++;
        },
        
        getBehaviorData: function() {
          return {
            keydownCount: this.keydownEvents.length,
            mouseMoves: this.mouseMoves,
            fieldFocuses: this.fieldFocuses.length,
            pauses: this.pauses,
            keystrokeVariance: this.calculateKeystrokeVariance()
          };
        },
        
        calculateKeystrokeVariance: function() {
          if (this.keydownEvents.length < 2) return 0;
          
          const intervals = [];
          for (let i = 1; i < this.keydownEvents.length; i++) {
            intervals.push(this.keydownEvents[i].timestamp - this.keydownEvents[i-1].timestamp);
          }
          
          const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
          const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - mean, 2), 0) / intervals.length;
          
          return variance / (mean * mean); // Coefficient of variation
        }
      };
      
      // Basic AI security engine mock
      this.aiSecurity = {
        analyzeBehavior: function(behaviorData) {
          return {
            isBot: behaviorData.keystrokeVariance < 0.1 && behaviorData.mouseMoves === 0,
            confidence: 0.5
          };
        },
        
        detectAIGeneratedContent: function(content) {
          const text = Object.values(content).join(' ').toLowerCase();
          const aiPatterns = ['as an ai', 'i\'m an ai', 'as a language model', 'i cannot provide'];
          const hasAIPatterns = aiPatterns.some(pattern => text.includes(pattern));
          
          return {
            isAIGenerated: hasAIPatterns,
            confidence: hasAIPatterns ? 0.9 : 0.1
          };
        },
        
        generateSecurityReport: function(analysisResults) {
          const riskLevel = (analysisResults.behavior.isBot || analysisResults.content.isAIGenerated) ? 'HIGH' : 'LOW';
          return {
            actionTaken: riskLevel === 'HIGH' ? 'CHALLENGE' : 'ALLOW',
            riskLevel: riskLevel,
            behaviorAnalysis: analysisResults.behavior,
            contentAnalysis: analysisResults.content
          };
        }
      };
      
    } catch (error) {
      console.warn('Failed to load AI security features:', error);
      // Fallback to basic tracking
      this.behaviorTracker = { getBehaviorData: () => ({}) };
      this.aiSecurity = {
        analyzeBehavior: () => ({ isBot: false, confidence: 0 }),
        detectAIGeneratedContent: () => ({ isAIGenerated: false, confidence: 0 }),
        generateSecurityReport: () => ({ actionTaken: 'ALLOW', riskLevel: 'LOW' })
      };
    }
  }
  
  // Perform AI-based security analysis
  async performAISecurityAnalysis() {
    try {
      if (!this.aiSecurity || !this.behaviorTracker) {
        return { action: 'ALLOW', riskLevel: 'LOW' };
      }
      
      // Get behavior data
      const behaviorData = this.behaviorTracker.getBehaviorData();
      
      // Get form content
      const formData = new FormData(this.form);
      const formContent = {};
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string' && !key.startsWith('_')) {
          formContent[key] = value;
        }
      }
      
      // Analyze behavior patterns
      const behaviorAnalysis = this.aiSecurity.analyzeBehavior(behaviorData);
      
      // Analyze content for AI generation
      const contentAnalysis = this.aiSecurity.detectAIGeneratedContent(formContent);
      
      // Generate security report
      const analysisResults = {
        behavior: behaviorAnalysis,
        content: contentAnalysis
      };
      
      const securityReport = this.aiSecurity.generateSecurityReport(analysisResults);
      
      // Add security report to form data
      const securityInput = document.createElement('input');
      securityInput.type = 'hidden';
      securityInput.name = '_ai_security_report';
      securityInput.value = JSON.stringify(securityReport);
      this.form.appendChild(securityInput);
      
      return {
        action: securityReport.actionTaken,
        riskLevel: securityReport.riskLevel,
        report: securityReport
      };
      
    } catch (error) {
      console.warn('AI security analysis failed:', error);
      return { action: 'ALLOW', riskLevel: 'LOW' };
    }
  }
  
  addCSRFToken() {
    // Add CSRF token if available in meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (csrfToken) {
      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = '_token';
      tokenInput.value = csrfToken.getAttribute('content');
      this.form.appendChild(tokenInput);
    }
  }
  
  validateFiles(files) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxFiles = 10;
    
    if (files.length > maxFiles) {
      return {
        isValid: false,
        message: `Maximum ${maxFiles} files allowed`
      };
    }
    
    for (const file of files) {
      if (file.size > maxSize) {
        return {
          isValid: false,
          message: `File "${file.name}" is too large. Maximum size is 5MB`
        };
      }
      
      if (!allowedTypes.includes(file.type)) {
        return {
          isValid: false,
          message: `File "${file.name}" is not a supported image format`
        };
      }
    }
    
    return { isValid: true };
  }
  
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  isValidPhone(phone) {
    const phoneRegex = /^[\d\s\(\)\-\+\.]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
  
  getFieldLabel(field) {
    const label = this.form.querySelector(`label[for="${field.id}"]`);
    return label ? label.textContent.replace('*', '').trim() : field.name;
  }
  
  showFieldError(field, message) {
    this.clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-1 field-error';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
    field.classList.add('border-red-500');
  }
  
  clearFieldError(field) {
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
      errorDiv.remove();
    }
    field.classList.remove('border-red-500');
  }
  
  showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('formMessage');
    if (messageDiv) {
      messageDiv.className = `p-4 rounded-lg ${type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 
                                                type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : 
                                                'bg-blue-100 text-blue-800 border border-blue-200'}`;
      messageDiv.textContent = message;
      messageDiv.classList.remove('hidden');
      
      // Auto-hide success messages
      if (type === 'success') {
        setTimeout(() => {
          messageDiv.classList.add('hidden');
        }, 5000);
      }
    }
  }
  
  updateSubmitButton(isSubmitting) {
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitLoader = document.getElementById('submitLoader');
    
    if (submitBtn && submitText && submitLoader) {
      submitBtn.disabled = isSubmitting;
      
      if (isSubmitting) {
        submitText.classList.add('hidden');
        submitLoader.classList.remove('hidden');
      } else {
        submitText.classList.remove('hidden');
        submitLoader.classList.add('hidden');
      }
    }
  }
}

// Initialize form security when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize quote form security
  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    new FormSecurity('quoteForm', {
      maxSubmissions: 3,
      cooldownTime: 60000, // 1 minute
      enableHoneypot: true,
      enableRateLimit: true,
      enableValidation: true
    });
  }
  
  // Initialize calculator form security
  const calculatorForm = document.getElementById('calculatorForm');
  if (calculatorForm) {
    new FormSecurity('calculatorForm', {
      maxSubmissions: 5,
      cooldownTime: 30000, // 30 seconds
      enableHoneypot: true,
      enableRateLimit: true,
      enableValidation: true
    });
  }
  
  // Initialize estimate form security
  const estimateForm = document.getElementById('estimate-form');
  if (estimateForm) {
    new FormSecurity('estimate-form', {
      maxSubmissions: 5,
      cooldownTime: 30000, // 30 seconds
      enableHoneypot: true,
      enableRateLimit: true,
      enableValidation: true
    });
  }
});