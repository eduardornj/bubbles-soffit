import { A as AISecurityEngine, l as logAIThreat, b as logBotDetection, c as logSpamAttempt } from './utils_XnkmivEU.mjs';

// AI Security Middleware for API Endpoints
// Advanced protection against AI-generated spam and sophisticated bots


class AISecurityMiddleware {
  constructor() {
    this.aiSecurity = new AISecurityEngine();
    this.suspiciousIPs = new Map();
    this.requestPatterns = new Map();
  }

  // Main middleware function
  async validateRequest(request) {
    const clientIP = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    const timestamp = Date.now();

    try {
      // Parse form data
      const formData = await this.parseFormData(request);
      
      // Extract security data
      const behaviorData = this.parseBehaviorData(formData._behavior);
      const aiSecurityReport = this.parseSecurityReport(formData._ai_security_report);
      
      // Perform comprehensive security analysis
      const securityAnalysis = await this.performSecurityAnalysis({
        formData,
        behaviorData,
        aiSecurityReport,
        clientIP,
        userAgent,
        timestamp
      });
      
      // Update tracking data
      this.updateRequestTracking(clientIP, securityAnalysis);
      
      // Log security events
      this.logSecurityEvents(securityAnalysis, clientIP, userAgent, request.url);
      
      return {
        allowed: securityAnalysis.action !== 'BLOCK',
        riskLevel: securityAnalysis.riskLevel,
        analysis: securityAnalysis,
        requiresChallenge: securityAnalysis.action === 'CHALLENGE'
      };
      
    } catch (error) {
      console.error('AI Security Middleware Error:', error);
      // Fail securely - allow request but log the error
      return {
        allowed: true,
        riskLevel: 'UNKNOWN',
        error: error.message
      };
    }
  }

  // Parse form data from request
  async parseFormData(request) {
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      return await request.json();
    } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      const data = {};
      for (const [key, value] of formData.entries()) {
        data[key] = value;
      }
      return data;
    }
    
    return {};
  }

  // Parse behavior data from hidden field
  parseBehaviorData(behaviorString) {
    try {
      return behaviorString ? JSON.parse(behaviorString) : null;
    } catch {
      return null;
    }
  }

  // Parse AI security report from hidden field
  parseSecurityReport(reportString) {
    try {
      return reportString ? JSON.parse(reportString) : null;
    } catch {
      return null;
    }
  }

  // Comprehensive security analysis
  async performSecurityAnalysis(data) {
    const { formData, behaviorData, aiSecurityReport, clientIP, userAgent, timestamp } = data;
    
    const analysis = {
      timestamp,
      clientIP,
      userAgent,
      riskFactors: [],
      riskLevel: 'LOW',
      action: 'ALLOW',
      confidence: 0
    };

    // 1. Analyze user behavior patterns
    if (behaviorData) {
      const behaviorRisk = this.analyzeBehaviorRisk(behaviorData);
      analysis.riskFactors.push(...behaviorRisk.factors);
      analysis.confidence += behaviorRisk.confidence;
    }

    // 2. Analyze AI-generated content
    const contentRisk = await this.analyzeContentRisk(formData);
    analysis.riskFactors.push(...contentRisk.factors);
    analysis.confidence += contentRisk.confidence;

    // 3. Analyze request patterns
    const patternRisk = this.analyzeRequestPatterns(clientIP, userAgent, timestamp);
    analysis.riskFactors.push(...patternRisk.factors);
    analysis.confidence += patternRisk.confidence;

    // 4. Check IP reputation
    const ipRisk = this.analyzeIPReputation(clientIP);
    analysis.riskFactors.push(...ipRisk.factors);
    analysis.confidence += ipRisk.confidence;

    // 5. Analyze user agent for bot signatures
    const uaRisk = this.analyzeUserAgent(userAgent);
    analysis.riskFactors.push(...uaRisk.factors);
    analysis.confidence += uaRisk.confidence;

    // 6. Cross-reference with AI security report
    if (aiSecurityReport) {
      const reportRisk = this.analyzeSecurityReport(aiSecurityReport);
      analysis.riskFactors.push(...reportRisk.factors);
      analysis.confidence += reportRisk.confidence;
    }

    // Calculate final risk level and action
    analysis.riskLevel = this.calculateRiskLevel(analysis.confidence, analysis.riskFactors);
    analysis.action = this.determineAction(analysis.riskLevel, analysis.riskFactors);

    return analysis;
  }

  // Analyze behavior patterns for bot-like activity
  analyzeBehaviorRisk(behaviorData) {
    const factors = [];
    let confidence = 0;

    // Check for impossibly fast form completion
    if (behaviorData.timeSpent < 5000) { // Less than 5 seconds
      factors.push('EXTREMELY_FAST_COMPLETION');
      confidence += 30;
    }

    // Check for perfect typing speed (bot-like)
    if (behaviorData.fillSpeed > 10) { // More than 10 chars per second
      factors.push('SUPERHUMAN_TYPING_SPEED');
      confidence += 25;
    }

    // Check for lack of mouse movement
    if (behaviorData.mouseMovements === 0) {
      factors.push('NO_MOUSE_INTERACTION');
      confidence += 20;
    }

    // Check for uniform keystroke timing (bot signature)
    if (behaviorData.keystrokeVariance && behaviorData.keystrokeVariance < 0.1) {
      factors.push('UNIFORM_KEYSTROKE_TIMING');
      confidence += 35;
    }

    return { factors, confidence };
  }

  // Analyze content for AI generation signatures
  async analyzeContentRisk(formData) {
    const factors = [];
    let confidence = 0;

    // Combine all text fields for analysis
    const textContent = Object.entries(formData)
      .filter(([key, value]) => typeof value === 'string' && !key.startsWith('_'))
      .map(([key, value]) => value)
      .join(' ');

    if (textContent.length > 0) {
      // Use AI security engine for content analysis
      const contentAnalysis = this.aiSecurity.detectAIGeneratedContent({ text: textContent });
      
      if (contentAnalysis.isAIGenerated) {
        factors.push('AI_GENERATED_CONTENT');
        confidence += contentAnalysis.confidence * 40;
      }

      // Check for common AI patterns
      const aiPatterns = [
        /as an ai/i,
        /i'm an ai/i,
        /as a language model/i,
        /i don't have personal/i,
        /i cannot provide/i,
        /i'm not able to/i
      ];

      for (const pattern of aiPatterns) {
        if (pattern.test(textContent)) {
          factors.push('AI_LANGUAGE_PATTERNS');
          confidence += 50;
          break;
        }
      }

      // Check for repetitive or template-like content
      const words = textContent.toLowerCase().split(/\s+/);
      const uniqueWords = new Set(words);
      const repetitionRatio = words.length / uniqueWords.size;
      
      if (repetitionRatio > 3) {
        factors.push('REPETITIVE_CONTENT');
        confidence += 15;
      }
    }

    return { factors, confidence };
  }

  // Analyze request patterns for automated behavior
  analyzeRequestPatterns(clientIP, userAgent, timestamp) {
    const factors = [];
    let confidence = 0;

    // Get or create pattern tracking for this IP
    if (!this.requestPatterns.has(clientIP)) {
      this.requestPatterns.set(clientIP, []);
    }

    const patterns = this.requestPatterns.get(clientIP);
    patterns.push({ userAgent, timestamp });

    // Keep only recent requests (last hour)
    const oneHourAgo = timestamp - 3600000;
    const recentPatterns = patterns.filter(p => p.timestamp > oneHourAgo);
    this.requestPatterns.set(clientIP, recentPatterns);

    // Check for rapid successive requests
    if (recentPatterns.length > 5) {
      factors.push('HIGH_REQUEST_FREQUENCY');
      confidence += 25;
    }

    // Check for identical user agents (bot signature)
    const userAgents = new Set(recentPatterns.map(p => p.userAgent));
    if (userAgents.size === 1 && recentPatterns.length > 3) {
      factors.push('IDENTICAL_USER_AGENTS');
      confidence += 20;
    }

    return { factors, confidence };
  }

  // Analyze IP reputation
  analyzeIPReputation(clientIP) {
    const factors = [];
    let confidence = 0;

    // Check if IP is in suspicious list
    if (this.suspiciousIPs.has(clientIP)) {
      const suspiciousData = this.suspiciousIPs.get(clientIP);
      factors.push('SUSPICIOUS_IP_HISTORY');
      confidence += Math.min(suspiciousData.violations * 10, 40);
    }

    // Note: In production, you'd want more sophisticated IP reputation checking
    // This is a simplified example

    return { factors, confidence };
  }

  // Analyze user agent for bot signatures
  analyzeUserAgent(userAgent) {
    const factors = [];
    let confidence = 0;

    if (!userAgent || userAgent.length < 10) {
      factors.push('MISSING_OR_SHORT_USER_AGENT');
      confidence += 30;
    }

    // Common bot signatures
    const botSignatures = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /requests/i
    ];

    for (const signature of botSignatures) {
      if (signature.test(userAgent)) {
        factors.push('BOT_USER_AGENT');
        confidence += 40;
        break;
      }
    }

    // Check for outdated browsers (often bots)
    if (userAgent.includes('Chrome/') && !userAgent.includes('Chrome/1')) {
      const chromeVersion = userAgent.match(/Chrome\/(\d+)/)?.[1];
      if (chromeVersion && parseInt(chromeVersion) < 100) {
        factors.push('OUTDATED_BROWSER');
        confidence += 15;
      }
    }

    return { factors, confidence };
  }

  // Analyze AI security report from client
  analyzeSecurityReport(report) {
    const factors = [];
    let confidence = 0;

    if (report.riskLevel === 'HIGH') {
      factors.push('CLIENT_HIGH_RISK_DETECTION');
      confidence += 30;
    } else if (report.riskLevel === 'MEDIUM') {
      factors.push('CLIENT_MEDIUM_RISK_DETECTION');
      confidence += 15;
    }

    if (report.aiContentDetected) {
      factors.push('CLIENT_AI_CONTENT_DETECTED');
      confidence += 25;
    }

    return { factors, confidence };
  }

  // Calculate overall risk level
  calculateRiskLevel(confidence, riskFactors) {
    if (confidence >= 70 || riskFactors.includes('AI_GENERATED_CONTENT')) {
      return 'HIGH';
    } else if (confidence >= 40) {
      return 'MEDIUM';
    } else if (confidence >= 20) {
      return 'LOW';
    }
    return 'MINIMAL';
  }

  // Determine action based on risk assessment
  determineAction(riskLevel, riskFactors) {
    // Block high-risk requests
    if (riskLevel === 'HIGH') {
      return 'BLOCK';
    }
    
    // Challenge medium-risk requests
    if (riskLevel === 'MEDIUM') {
      return 'CHALLENGE';
    }
    
    // Allow low-risk requests
    return 'ALLOW';
  }

  // Update request tracking
  updateRequestTracking(clientIP, analysis) {
    if (analysis.riskLevel === 'HIGH' || analysis.action === 'BLOCK') {
      if (!this.suspiciousIPs.has(clientIP)) {
        this.suspiciousIPs.set(clientIP, { violations: 0, firstSeen: Date.now() });
      }
      
      const data = this.suspiciousIPs.get(clientIP);
      data.violations++;
      data.lastViolation = Date.now();
    }
  }

  // Get client IP from request
  getClientIP(request) {
    // Check various headers for real IP
    const headers = [
      'cf-connecting-ip',     // Cloudflare
      'x-real-ip',           // Nginx
      'x-forwarded-for',     // Standard
      'x-client-ip',         // Apache
      'x-forwarded',         // General
      'forwarded-for',       // General
      'forwarded'            // RFC 7239
    ];

    for (const header of headers) {
      const value = request.headers.get(header);
      if (value) {
        // Take first IP if comma-separated
        return value.split(',')[0].trim();
      }
    }

    // Fallback to connection IP
    return request.headers.get('x-forwarded-for') || 'unknown';
  }

  // Log security events based on analysis
  logSecurityEvents(analysis, clientIP, userAgent, endpoint) {
    const baseEvent = {
      clientIP,
      userAgent,
      endpoint,
      riskLevel: analysis.riskLevel,
      riskFactors: analysis.riskFactors,
      action: analysis.action,
      confidence: analysis.confidence
    };

    // Log AI-specific threats
    if (analysis.riskFactors.includes('AI_GENERATED_CONTENT') || 
        analysis.riskFactors.includes('AI_LANGUAGE_PATTERNS')) {
      logAIThreat({
        ...baseEvent,
        aiContentDetected: true,
        behaviorAnomalies: analysis.riskFactors.filter(f => 
          f.includes('BEHAVIOR') || f.includes('TIMING')
        ),
        contentAnalysis: {
          hasAIPatterns: analysis.riskFactors.includes('AI_LANGUAGE_PATTERNS'),
          isRepetitive: analysis.riskFactors.includes('REPETITIVE_CONTENT')
        }
      });
    }

    // Log bot detection
    if (analysis.riskFactors.includes('BOT_USER_AGENT') || 
        analysis.riskFactors.includes('SUPERHUMAN_TYPING_SPEED') ||
        analysis.riskFactors.includes('NO_MOUSE_INTERACTION')) {
      logBotDetection({
        ...baseEvent,
        botType: this.determineBotType(analysis.riskFactors),
        certainty: Math.min(analysis.confidence / 100, 1),
        signatures: analysis.riskFactors.filter(f => 
          f.includes('BOT') || f.includes('USER_AGENT')
        ),
        behaviorPatterns: analysis.riskFactors.filter(f => 
          f.includes('TYPING') || f.includes('MOUSE') || f.includes('TIMING')
        )
      });
    }

    // Log spam attempts
    if (analysis.riskFactors.includes('HIGH_REQUEST_FREQUENCY') || 
        analysis.riskFactors.includes('REPETITIVE_CONTENT') ||
        analysis.riskFactors.includes('EXTREMELY_FAST_COMPLETION')) {
      logSpamAttempt({
        ...baseEvent,
        spamType: this.determineSpamType(analysis.riskFactors),
        honeypotTriggered: false, // This would be set by form validation
        rateLimitExceeded: analysis.riskFactors.includes('HIGH_REQUEST_FREQUENCY')
      });
    }
  }

  // Determine bot type based on risk factors
  determineBotType(riskFactors) {
    if (riskFactors.includes('BOT_USER_AGENT')) return 'DECLARED_BOT';
    if (riskFactors.includes('SUPERHUMAN_TYPING_SPEED')) return 'AUTOMATED_FORM_FILLER';
    if (riskFactors.includes('NO_MOUSE_INTERACTION')) return 'HEADLESS_BROWSER';
    if (riskFactors.includes('UNIFORM_KEYSTROKE_TIMING')) return 'SCRIPT_BOT';
    return 'SUSPICIOUS_BEHAVIOR';
  }

  // Determine spam type based on risk factors
  determineSpamType(riskFactors) {
    if (riskFactors.includes('AI_GENERATED_CONTENT')) return 'AI_GENERATED_SPAM';
    if (riskFactors.includes('REPETITIVE_CONTENT')) return 'TEMPLATE_SPAM';
    if (riskFactors.includes('HIGH_REQUEST_FREQUENCY')) return 'VOLUME_SPAM';
    if (riskFactors.includes('EXTREMELY_FAST_COMPLETION')) return 'AUTOMATED_SPAM';
    return 'GENERIC_SPAM';
  }
}

// Export middleware instance
const aiSecurityMiddleware = new AISecurityMiddleware();

// Export middleware function for use in API routes
async function validateAISecurityMiddleware(request) {
  return await aiSecurityMiddleware.validateRequest(request);
}

export { validateAISecurityMiddleware as v };
