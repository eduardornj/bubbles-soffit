// AI-Based Security and Advanced Bot Detection for 2025
// Protection against AI-generated attacks, deepfakes, and sophisticated bots

class AISecurityEngine {
  constructor() {
    this.behaviorPatterns = new Map();
    this.suspiciousActivities = [];
    this.aiDetectionRules = this.initializeAIDetectionRules();
    this.mlModel = this.initializeBasicMLModel();
  }

  // Initialize AI detection rules based on 2025 threat intelligence
  initializeAIDetectionRules() {
    return {
      // Patterns common in AI-generated content
      aiGeneratedText: [
        /\b(as an ai|i'm an ai|artificial intelligence|language model)\b/i,
        /\b(i don't have personal|i cannot provide personal|as a language model)\b/i,
        /\b(i'm sorry, but i|unfortunately, i cannot|i'm unable to)\b/i,
        /\b(please note that|it's important to note|keep in mind that)\b/i
      ],
      
      // Suspicious timing patterns (too fast for humans)
      rapidFilling: {
        minTimePerField: 500, // milliseconds
        maxFormCompletionTime: 5000 // 5 seconds is suspiciously fast
      },
      
      // Perfect grammar/formatting (AI characteristic)
      perfectFormatting: {
        punctuationAccuracy: 0.98,
        grammarScore: 0.95,
        consistentCapitalization: true
      },
      
      // Behavioral anomalies
      behaviorAnomalies: {
        noMouseMovement: true,
        perfectKeystrokes: true,
        noBackspacing: true,
        uniformTypingSpeed: true
      }
    };
  }

  // Basic ML model for behavior analysis
  initializeBasicMLModel() {
    return {
      weights: {
        typingSpeed: 0.3,
        mouseMovement: 0.25,
        formCompletionTime: 0.2,
        errorRate: 0.15,
        pausePatterns: 0.1
      },
      threshold: 0.7 // Suspicion threshold
    };
  }

  // Analyze user behavior for AI/bot characteristics
  analyzeBehavior(behaviorData) {
    const features = this.extractBehaviorFeatures(behaviorData);
    const suspicionScore = this.calculateSuspicionScore(features);
    
    return {
      isHuman: suspicionScore < this.mlModel.threshold,
      suspicionScore,
      flags: this.identifyFlags(features),
      recommendation: this.getRecommendation(suspicionScore)
    };
  }

  extractBehaviorFeatures(data) {
    const {
      timeSpent,
      keystrokes,
      mouseMovements,
      backspaces = 0,
      pauses = [],
      fieldFocusTime = {},
      typingIntervals = []
    } = data;

    return {
      // Typing characteristics
      avgTypingSpeed: keystrokes / (timeSpent / 1000),
      typingConsistency: this.calculateTypingConsistency(typingIntervals),
      backspaceRatio: backspaces / keystrokes,
      
      // Mouse behavior
      mouseActivity: mouseMovements / (timeSpent / 1000),
      hasMouseMovement: mouseMovements > 0,
      
      // Timing patterns
      formCompletionSpeed: timeSpent,
      pauseFrequency: pauses.length,
      avgPauseLength: pauses.length > 0 ? pauses.reduce((a, b) => a + b, 0) / pauses.length : 0,
      
      // Focus patterns
      fieldSwitchingPattern: Object.keys(fieldFocusTime).length,
      avgFieldFocusTime: Object.values(fieldFocusTime).reduce((a, b) => a + b, 0) / Object.keys(fieldFocusTime).length
    };
  }

  calculateSuspicionScore(features) {
    let score = 0;
    const weights = this.mlModel.weights;
    const userAgent = features.userAgent || '';

    // Enhanced typing speed analysis with mobile device tolerance
    let typingThreshold = 12; // Increased from 10 to 12 chars/sec
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      typingThreshold = 15; // Higher threshold for mobile devices (predictive keyboards)
    }
    
    if (features.avgTypingSpeed > typingThreshold || features.typingConsistency > 0.9) {
      score += weights.typingSpeed;
    }

    // Mouse movement analysis
    if (!features.hasMouseMovement || features.mouseActivity < 0.1) {
      score += weights.mouseMovement;
    }

    // Form completion time (too fast = bot)
    if (features.formCompletionSpeed < this.aiDetectionRules.rapidFilling.maxFormCompletionTime) {
      score += weights.formCompletionTime;
    }

    // Error patterns (no backspaces = suspicious)
    if (features.backspaceRatio < 0.02) {
      score += weights.errorRate;
    }

    // Pause patterns (no natural pauses = bot)
    if (features.pauseFrequency < 2 || features.avgPauseLength < 200) {
      score += weights.pausePatterns;
    }

    // JavaScript verification check (enhanced bot detection)
    if (features.jsEnabled === false || features.jsEnabled === 'false') {
      score += 0.3; // High penalty for disabled JavaScript
    }

    return Math.min(score, 1.0);
  }

  calculateTypingConsistency(intervals) {
    if (intervals.length < 2) return 0;
    
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower standard deviation = more consistent = more suspicious
    return 1 - (stdDev / mean);
  }

  identifyFlags(features) {
    const flags = [];

    if (features.avgTypingSpeed > 15) flags.push('SUPERHUMAN_TYPING_SPEED');
    if (features.typingConsistency > 0.95) flags.push('ROBOTIC_TYPING_PATTERN');
    if (!features.hasMouseMovement) flags.push('NO_MOUSE_INTERACTION');
    if (features.backspaceRatio < 0.01) flags.push('NO_CORRECTIONS');
    if (features.formCompletionSpeed < 3000) flags.push('INSTANT_COMPLETION');
    if (features.pauseFrequency === 0) flags.push('NO_NATURAL_PAUSES');

    return flags;
  }

  getRecommendation(score) {
    if (score >= 0.9) return 'BLOCK_IMMEDIATELY';
    if (score >= 0.7) return 'REQUIRE_ADDITIONAL_VERIFICATION';
    if (score >= 0.5) return 'MONITOR_CLOSELY';
    return 'ALLOW';
  }

  // Detect AI-generated content in form submissions
  detectAIGeneratedContent(formData) {
    const suspiciousFields = [];
    
    for (const [fieldName, value] of Object.entries(formData)) {
      if (typeof value === 'string' && value.length > 10) {
        const aiScore = this.analyzeTextForAI(value);
        if (aiScore > 0.6) {
          suspiciousFields.push({
            field: fieldName,
            score: aiScore,
            reasons: this.getAIDetectionReasons(value)
          });
        }
      }
    }

    return {
      isAIGenerated: suspiciousFields.length > 0,
      suspiciousFields,
      overallScore: suspiciousFields.length > 0 ? 
        suspiciousFields.reduce((sum, field) => sum + field.score, 0) / suspiciousFields.length : 0
    };
  }

  analyzeTextForAI(text) {
    let score = 0;
    const rules = this.aiDetectionRules.aiGeneratedText;

    // Check for AI-specific phrases
    rules.forEach(pattern => {
      if (pattern.test(text)) {
        score += 0.3;
      }
    });

    // Check for perfect grammar/formatting
    const grammarScore = this.analyzeGrammar(text);
    if (grammarScore > 0.95) score += 0.2;

    // Check for unnatural perfection
    const perfectionScore = this.analyzePerfection(text);
    score += perfectionScore * 0.3;

    // Check for repetitive patterns common in AI
    const repetitionScore = this.analyzeRepetition(text);
    score += repetitionScore * 0.2;

    return Math.min(score, 1.0);
  }

  analyzeGrammar(text) {
    // Simple grammar analysis
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let correctSentences = 0;

    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      // Check for proper capitalization
      if (trimmed.length > 0 && trimmed[0] === trimmed[0].toUpperCase()) {
        correctSentences++;
      }
    });

    return sentences.length > 0 ? correctSentences / sentences.length : 0;
  }

  analyzePerfection(text) {
    let perfectionIndicators = 0;
    const totalChecks = 4;

    // No typos (simplified check)
    const commonTypos = /\b(teh|recieve|seperate|occured|definately)\b/gi;
    if (!commonTypos.test(text)) perfectionIndicators++;

    // Perfect punctuation spacing
    const punctuationSpacing = /[.!?]\s+[A-Z]/g;
    const matches = text.match(punctuationSpacing) || [];
    const sentences = text.split(/[.!?]+/).length - 1;
    if (sentences > 0 && matches.length / sentences > 0.8) perfectionIndicators++;

    // Consistent formatting
    const hasConsistentQuotes = !/["'][^"']*["'].*["'][^"']*["']/g.test(text) || 
                               /^["'][^"']*["']$|^[^"']*$/.test(text);
    if (hasConsistentQuotes) perfectionIndicators++;

    // No informal language
    const informalWords = /\b(gonna|wanna|kinda|sorta|yeah|nah|ok|okay)\b/gi;
    if (!informalWords.test(text)) perfectionIndicators++;

    return perfectionIndicators / totalChecks;
  }

  analyzeRepetition(text) {
    const words = text.toLowerCase().split(/\s+/);
    const phrases = [];
    
    // Extract 3-word phrases
    for (let i = 0; i < words.length - 2; i++) {
      phrases.push(words.slice(i, i + 3).join(' '));
    }

    // Count repetitions
    const phraseCount = {};
    phrases.forEach(phrase => {
      phraseCount[phrase] = (phraseCount[phrase] || 0) + 1;
    });

    const repetitions = Object.values(phraseCount).filter(count => count > 1).length;
    return phrases.length > 0 ? repetitions / phrases.length : 0;
  }

  getAIDetectionReasons(text) {
    const reasons = [];
    const rules = this.aiDetectionRules.aiGeneratedText;

    rules.forEach((pattern, index) => {
      if (pattern.test(text)) {
        reasons.push(`AI_PHRASE_DETECTED_${index + 1}`);
      }
    });

    if (this.analyzeGrammar(text) > 0.95) reasons.push('PERFECT_GRAMMAR');
    if (this.analyzePerfection(text) > 0.8) reasons.push('UNNATURAL_PERFECTION');
    if (this.analyzeRepetition(text) > 0.3) reasons.push('REPETITIVE_PATTERNS');

    return reasons;
  }

  // Advanced honeypot with AI detection
  createAdvancedHoneypot() {
    return {
      // Multiple honeypot fields with different strategies
      fields: [
        {
          name: 'website_url',
          type: 'url',
          style: 'position: absolute; left: -9999px; opacity: 0;',
          tabindex: '-1',
          autocomplete: 'off'
        },
        {
          name: 'confirm_email',
          type: 'email',
          style: 'display: none !important;',
          tabindex: '-1',
          autocomplete: 'new-password'
        },
        {
          name: 'phone_backup',
          type: 'tel',
          style: 'visibility: hidden; height: 0; width: 0;',
          tabindex: '-1'
        }
      ],
      
      // Time-based honeypot
      timeCheck: {
        minTime: 3000, // Minimum 3 seconds to fill form
        maxTime: 1800000 // Maximum 30 minutes
      },
      
      // JavaScript challenge
      jsChallenge: {
        required: true,
        token: this.generateJSChallengeToken()
      }
    };
  }

  generateJSChallengeToken() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return btoa(`${timestamp}:${random}`);
  }

  validateJSChallenge(token, submissionTime) {
    try {
      const decoded = atob(token);
      const [timestamp, random] = decoded.split(':');
      const tokenTime = parseInt(timestamp);
      
      // Check if token is within valid time range (5 minutes)
      const timeDiff = submissionTime - tokenTime;
      return timeDiff > 3000 && timeDiff < 300000;
    } catch (error) {
      return false;
    }
  }

  // Generate security report
  generateSecurityReport(analysisResults) {
    return {
      timestamp: new Date().toISOString(),
      riskLevel: this.calculateRiskLevel(analysisResults),
      behaviorAnalysis: analysisResults.behavior,
      contentAnalysis: analysisResults.content,
      recommendations: this.generateRecommendations(analysisResults),
      actionTaken: this.determineAction(analysisResults)
    };
  }

  calculateRiskLevel(results) {
    const behaviorRisk = results.behavior?.suspicionScore || 0;
    const contentRisk = results.content?.overallScore || 0;
    const overallRisk = (behaviorRisk + contentRisk) / 2;

    if (overallRisk >= 0.8) return 'CRITICAL';
    if (overallRisk >= 0.6) return 'HIGH';
    if (overallRisk >= 0.4) return 'MEDIUM';
    return 'LOW';
  }

  generateRecommendations(results) {
    const recommendations = [];
    const riskLevel = this.calculateRiskLevel(results);

    switch (riskLevel) {
      case 'CRITICAL':
        recommendations.push('Block submission immediately');
        recommendations.push('Log IP for monitoring');
        recommendations.push('Implement additional verification');
        break;
      case 'HIGH':
        recommendations.push('Require CAPTCHA verification');
        recommendations.push('Manual review required');
        break;
      case 'MEDIUM':
        recommendations.push('Monitor future submissions');
        recommendations.push('Consider additional validation');
        break;
      default:
        recommendations.push('Allow with standard processing');
    }

    return recommendations;
  }

  determineAction(results) {
    const riskLevel = this.calculateRiskLevel(results);
    
    const actions = {
      'CRITICAL': 'BLOCK',
      'HIGH': 'CHALLENGE',
      'MEDIUM': 'MONITOR',
      'LOW': 'ALLOW'
    };

    return actions[riskLevel] || 'ALLOW';
  }
}

// Export for use in other modules
export { AISecurityEngine };

// Utility function to integrate with existing form security
export function enhanceFormWithAISecurity(formElement, options = {}) {
  const aiSecurity = new AISecurityEngine();
  const honeypot = aiSecurity.createAdvancedHoneypot();
  
  // Add advanced honeypot fields
  honeypot.fields.forEach(field => {
    const input = document.createElement('input');
    input.type = field.type;
    input.name = field.name;
    input.style.cssText = field.style;
    input.tabIndex = field.tabindex;
    input.autocomplete = field.autocomplete;
    formElement.appendChild(input);
  });
  
  // Add JavaScript challenge
  const challengeInput = document.createElement('input');
  challengeInput.type = 'hidden';
  challengeInput.name = '_js_challenge';
  challengeInput.value = honeypot.jsChallenge.token;
  formElement.appendChild(challengeInput);
  
  // Add form start time
  const startTimeInput = document.createElement('input');
  startTimeInput.type = 'hidden';
  startTimeInput.name = '_form_start';
  startTimeInput.value = Date.now().toString();
  formElement.appendChild(startTimeInput);
  
  return aiSecurity;
}

// Advanced behavior tracking
export function createAdvancedBehaviorTracker() {
  return {
    startTime: Date.now(),
    keystrokes: 0,
    mouseMovements: 0,
    backspaces: 0,
    pauses: [],
    fieldFocusTime: {},
    typingIntervals: [],
    lastKeystroke: 0,
    currentField: null,
    
    trackKeydown(event) {
      const now = Date.now();
      if (this.lastKeystroke > 0) {
        this.typingIntervals.push(now - this.lastKeystroke);
      }
      this.lastKeystroke = now;
      this.keystrokes++;
      
      if (event.key === 'Backspace') {
        this.backspaces++;
      }
    },
    
    trackMouseMove() {
      this.mouseMovements++;
    },
    
    trackFieldFocus(fieldName) {
      if (this.currentField && this.fieldFocusTime[this.currentField]) {
        this.fieldFocusTime[this.currentField] += Date.now() - this.fieldFocusTime[this.currentField];
      }
      this.currentField = fieldName;
      this.fieldFocusTime[fieldName] = Date.now();
    },
    
    trackPause() {
      const now = Date.now();
      if (this.lastKeystroke > 0 && now - this.lastKeystroke > 1000) {
        this.pauses.push(now - this.lastKeystroke);
      }
    },
    
    getBehaviorData() {
      return {
        timeSpent: Date.now() - this.startTime,
        keystrokes: this.keystrokes,
        mouseMovements: this.mouseMovements,
        backspaces: this.backspaces,
        pauses: this.pauses,
        fieldFocusTime: this.fieldFocusTime,
        typingIntervals: this.typingIntervals
      };
    }
  };
}