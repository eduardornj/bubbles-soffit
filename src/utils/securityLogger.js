// Security Logging and Monitoring System
// Advanced threat detection logging for 2025 security measures

class SecurityLogger {
  constructor() {
    this.logBuffer = [];
    this.maxBufferSize = 1000;
    this.flushInterval = 30000; // 30 seconds
    this.threatPatterns = new Map();
    
    // Start periodic log flushing
    this.startPeriodicFlush();
  }

  // Log security events
  logSecurityEvent(event) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: event.type,
      severity: event.severity || 'INFO',
      clientIP: event.clientIP,
      userAgent: event.userAgent,
      riskLevel: event.riskLevel,
      riskFactors: event.riskFactors || [],
      action: event.action,
      details: event.details || {},
      sessionId: event.sessionId,
      endpoint: event.endpoint
    };

    // Add to buffer
    this.logBuffer.push(logEntry);

    // Immediate console log for high severity events
    if (event.severity === 'HIGH' || event.severity === 'CRITICAL') {
      console.warn('🚨 High Severity Security Event:', logEntry);
    }

    // Update threat patterns
    this.updateThreatPatterns(logEntry);

    // Flush if buffer is full
    if (this.logBuffer.length >= this.maxBufferSize) {
      this.flushLogs();
    }

    return logEntry;
  }

  // Log AI-specific threats
  logAIThreat(threat) {
    return this.logSecurityEvent({
      type: 'AI_THREAT_DETECTED',
      severity: threat.riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
      clientIP: threat.clientIP,
      userAgent: threat.userAgent,
      riskLevel: threat.riskLevel,
      riskFactors: threat.riskFactors,
      action: threat.action,
      details: {
        aiContentDetected: threat.aiContentDetected,
        behaviorAnomalies: threat.behaviorAnomalies,
        confidence: threat.confidence,
        contentAnalysis: threat.contentAnalysis
      },
      endpoint: threat.endpoint
    });
  }

  // Log bot detection
  logBotDetection(detection) {
    return this.logSecurityEvent({
      type: 'BOT_DETECTED',
      severity: detection.certainty > 0.8 ? 'HIGH' : 'MEDIUM',
      clientIP: detection.clientIP,
      userAgent: detection.userAgent,
      riskLevel: detection.riskLevel,
      riskFactors: detection.indicators,
      action: detection.action,
      details: {
        botType: detection.botType,
        certainty: detection.certainty,
        signatures: detection.signatures,
        behaviorPatterns: detection.behaviorPatterns
      },
      endpoint: detection.endpoint
    });
  }

  // Log spam attempts
  logSpamAttempt(spam) {
    return this.logSecurityEvent({
      type: 'SPAM_DETECTED',
      severity: 'MEDIUM',
      clientIP: spam.clientIP,
      userAgent: spam.userAgent,
      riskLevel: spam.riskLevel,
      riskFactors: spam.indicators,
      action: spam.action,
      details: {
        spamType: spam.spamType,
        content: spam.content ? spam.content.substring(0, 200) : null, // Truncate for privacy
        honeypotTriggered: spam.honeypotTriggered,
        rateLimitExceeded: spam.rateLimitExceeded
      },
      endpoint: spam.endpoint
    });
  }

  // Log rate limit violations
  logRateLimitViolation(violation) {
    return this.logSecurityEvent({
      type: 'RATE_LIMIT_EXCEEDED',
      severity: 'MEDIUM',
      clientIP: violation.clientIP,
      userAgent: violation.userAgent,
      riskLevel: 'MEDIUM',
      riskFactors: ['RATE_LIMIT_EXCEEDED'],
      action: 'BLOCKED',
      details: {
        requestCount: violation.requestCount,
        timeWindow: violation.timeWindow,
        limit: violation.limit,
        retryAfter: violation.retryAfter
      },
      endpoint: violation.endpoint
    });
  }

  // Log CSRF token violations
  logCSRFViolation(violation) {
    return this.logSecurityEvent({
      type: 'CSRF_TOKEN_INVALID',
      severity: 'HIGH',
      clientIP: violation.clientIP,
      userAgent: violation.userAgent,
      riskLevel: 'HIGH',
      riskFactors: ['CSRF_TOKEN_INVALID'],
      action: 'BLOCKED',
      details: {
        tokenProvided: !!violation.tokenProvided,
        tokenValid: violation.tokenValid,
        expectedToken: violation.expectedToken ? 'present' : 'missing'
      },
      endpoint: violation.endpoint
    });
  }

  // Log 404 Not Found errors
  log404Error(errorData) {
    return this.logSecurityEvent({
      type: '404_NOT_FOUND',
      severity: 'LOW',
      clientIP: errorData.clientIP,
      userAgent: errorData.userAgent,
      riskLevel: errorData.isRepeated ? 'MEDIUM' : 'LOW',
      riskFactors: errorData.isRepeated ? ['REPEATED_404', 'POSSIBLE_ENUMERATION'] : ['NOT_FOUND'],
      action: 'LOGGED',
      details: {
        requestedUrl: errorData.requestedUrl,
        referrer: errorData.referrer,
        timestamp: new Date().toISOString(),
        possibleAttack: errorData.isRepeated || errorData.requestedUrl.includes('../')
      },
      endpoint: errorData.requestedUrl
    });
  }

  // Log 405 Method Not Allowed errors
  log405Error(errorData) {
    return this.logSecurityEvent({
      type: '405_METHOD_NOT_ALLOWED',
      severity: 'MEDIUM',
      clientIP: errorData.clientIP,
      userAgent: errorData.userAgent,
      riskLevel: 'MEDIUM',
      riskFactors: ['INVALID_METHOD', 'POSSIBLE_ENUMERATION'],
      action: 'BLOCKED',
      details: {
        attemptedMethod: errorData.attemptedMethod,
        allowedMethods: errorData.allowedMethods,
        requestedUrl: errorData.requestedUrl,
        timestamp: new Date().toISOString()
      },
      endpoint: errorData.requestedUrl
    });
  }

  // Log 413 Payload Too Large errors
  log413Error(errorData) {
    return this.logSecurityEvent({
      type: '413_PAYLOAD_TOO_LARGE',
      severity: 'MEDIUM',
      clientIP: errorData.clientIP,
      userAgent: errorData.userAgent,
      riskLevel: 'MEDIUM',
      riskFactors: ['OVERSIZED_REQUEST', 'POSSIBLE_DOS'],
      action: 'BLOCKED',
      details: {
        payloadSize: errorData.payloadSize,
        maxAllowedSize: errorData.maxAllowedSize,
        contentType: errorData.contentType,
        requestedUrl: errorData.requestedUrl,
        timestamp: new Date().toISOString()
      },
      endpoint: errorData.requestedUrl
    });
  }

  // Log 429 Too Many Requests errors
  log429Error(errorData) {
    return this.logSecurityEvent({
      type: '429_TOO_MANY_REQUESTS',
      severity: 'HIGH',
      clientIP: errorData.clientIP,
      userAgent: errorData.userAgent,
      riskLevel: 'HIGH',
      riskFactors: ['RATE_LIMIT_EXCEEDED', 'POSSIBLE_DOS', 'AUTOMATED_REQUESTS'],
      action: 'RATE_LIMITED',
      details: {
        requestCount: errorData.requestCount,
        timeWindow: errorData.timeWindow,
        retryAfter: errorData.retryAfter,
        requestedUrl: errorData.requestedUrl,
        timestamp: new Date().toISOString()
      },
      endpoint: errorData.requestedUrl
    });
  }

  // Log 500 Internal Server Error
  log500Error(errorData) {
    return this.logSecurityEvent({
      type: '500_INTERNAL_SERVER_ERROR',
      severity: 'CRITICAL',
      clientIP: errorData.clientIP,
      userAgent: errorData.userAgent,
      riskLevel: 'LOW', // Usually not a security risk, but critical for operations
      riskFactors: ['SERVER_ERROR'],
      action: 'ERROR_LOGGED',
      details: {
        errorId: errorData.errorId,
        requestedUrl: errorData.requestedUrl,
        timestamp: new Date().toISOString(),
        // Don't log sensitive error details for security
        hasStackTrace: !!errorData.stackTrace
      },
      endpoint: errorData.requestedUrl
    });
  }

  // Log 403 Forbidden errors
  log403Error(errorData) {
    return this.logSecurityEvent({
      type: '403_FORBIDDEN',
      severity: 'HIGH',
      clientIP: errorData.clientIP,
      userAgent: errorData.userAgent,
      riskLevel: 'HIGH',
      riskFactors: ['UNAUTHORIZED_ACCESS', 'PERMISSION_DENIED'],
      action: 'ACCESS_DENIED',
      details: {
        requestedResource: errorData.requestedResource,
        userRole: errorData.userRole || 'anonymous',
        requiredPermission: errorData.requiredPermission,
        authenticationStatus: errorData.authenticationStatus,
        timestamp: new Date().toISOString()
      },
      endpoint: errorData.requestedResource
    });
  }

  // Log generic error page access
  logErrorPageAccess(errorData) {
    const severityMap = {
      400: 'MEDIUM', 401: 'HIGH', 403: 'HIGH', 404: 'LOW', 405: 'MEDIUM',
      413: 'MEDIUM', 414: 'MEDIUM', 415: 'LOW', 429: 'HIGH', 500: 'CRITICAL',
      501: 'LOW', 502: 'MEDIUM', 503: 'MEDIUM', 504: 'MEDIUM', 505: 'LOW'
    };

    return this.logSecurityEvent({
      type: `${errorData.statusCode}_ERROR_PAGE_ACCESS`,
      severity: severityMap[errorData.statusCode] || 'MEDIUM',
      clientIP: errorData.clientIP,
      userAgent: errorData.userAgent,
      riskLevel: errorData.isRepeated ? 'HIGH' : 'LOW',
      riskFactors: errorData.isRepeated ? ['REPEATED_ERRORS', 'POSSIBLE_ATTACK'] : ['ERROR_ACCESS'],
      action: 'PAGE_SERVED',
      details: {
        statusCode: errorData.statusCode,
        originalUrl: errorData.originalUrl,
        referrer: errorData.referrer,
        timestamp: new Date().toISOString(),
        sessionId: errorData.sessionId
      },
      endpoint: errorData.originalUrl
    });
  }

  // Update threat patterns for analysis
  updateThreatPatterns(logEntry) {
    const key = `${logEntry.clientIP}_${logEntry.type}`;
    
    if (!this.threatPatterns.has(key)) {
      this.threatPatterns.set(key, {
        count: 0,
        firstSeen: logEntry.timestamp,
        lastSeen: logEntry.timestamp,
        riskFactors: new Set(),
        endpoints: new Set()
      });
    }

    const pattern = this.threatPatterns.get(key);
    pattern.count++;
    pattern.lastSeen = logEntry.timestamp;
    
    if (logEntry.riskFactors) {
      logEntry.riskFactors.forEach(factor => pattern.riskFactors.add(factor));
    }
    
    if (logEntry.endpoint) {
      pattern.endpoints.add(logEntry.endpoint);
    }

    // Alert on repeated threats from same IP
    if (pattern.count >= 5) {
      this.logSecurityEvent({
        type: 'REPEATED_THREAT_PATTERN',
        severity: 'CRITICAL',
        clientIP: logEntry.clientIP,
        userAgent: logEntry.userAgent,
        riskLevel: 'HIGH',
        riskFactors: ['REPEATED_VIOLATIONS'],
        action: 'ALERT',
        details: {
          patternCount: pattern.count,
          timeSpan: new Date(logEntry.timestamp) - new Date(pattern.firstSeen),
          uniqueRiskFactors: Array.from(pattern.riskFactors),
          affectedEndpoints: Array.from(pattern.endpoints)
        }
      });
    }
  }

  // Get security statistics
  getSecurityStats(timeRange = 3600000) { // Default 1 hour
    const now = new Date();
    const cutoff = new Date(now.getTime() - timeRange);
    
    const recentLogs = this.logBuffer.filter(log => 
      new Date(log.timestamp) > cutoff
    );

    const stats = {
      totalEvents: recentLogs.length,
      eventsByType: {},
      eventsBySeverity: {},
      topRiskFactors: {},
      topClientIPs: {},
      blockedRequests: 0,
      challengedRequests: 0
    };

    recentLogs.forEach(log => {
      // Count by type
      stats.eventsByType[log.type] = (stats.eventsByType[log.type] || 0) + 1;
      
      // Count by severity
      stats.eventsBySeverity[log.severity] = (stats.eventsBySeverity[log.severity] || 0) + 1;
      
      // Count risk factors
      if (log.riskFactors) {
        log.riskFactors.forEach(factor => {
          stats.topRiskFactors[factor] = (stats.topRiskFactors[factor] || 0) + 1;
        });
      }
      
      // Count client IPs
      if (log.clientIP) {
        stats.topClientIPs[log.clientIP] = (stats.topClientIPs[log.clientIP] || 0) + 1;
      }
      
      // Count actions
      if (log.action === 'BLOCKED') stats.blockedRequests++;
      if (log.action === 'CHALLENGE') stats.challengedRequests++;
    });

    return stats;
  }

  // Get threat patterns
  getThreatPatterns() {
    const patterns = [];
    
    for (const [key, pattern] of this.threatPatterns.entries()) {
      const [clientIP, type] = key.split('_');
      patterns.push({
        clientIP,
        type,
        count: pattern.count,
        firstSeen: pattern.firstSeen,
        lastSeen: pattern.lastSeen,
        riskFactors: Array.from(pattern.riskFactors),
        endpoints: Array.from(pattern.endpoints)
      });
    }

    return patterns.sort((a, b) => b.count - a.count);
  }

  // Flush logs to persistent storage
  async flushLogs() {
    if (this.logBuffer.length === 0) return;

    try {
      // In a production environment, you would send these to:
      // - External logging service (e.g., Datadog, Splunk)
      // - Database for analysis
      // - Security monitoring system
      
      console.log(`📊 Security Log Flush: ${this.logBuffer.length} events`);
      
      // For now, we'll just log high-severity events
      const highSeverityEvents = this.logBuffer.filter(log => 
        log.severity === 'HIGH' || log.severity === 'CRITICAL'
      );
      
      if (highSeverityEvents.length > 0) {
        console.warn('🚨 High Severity Security Events:', highSeverityEvents);
      }
      
      // Clear buffer
      this.logBuffer = [];
      
    } catch (error) {
      console.error('Failed to flush security logs:', error);
    }
  }

  // Start periodic log flushing
  startPeriodicFlush() {
    setInterval(() => {
      this.flushLogs();
    }, this.flushInterval);
  }

  // Generate security report
  generateSecurityReport(timeRange = 86400000) { // Default 24 hours
    const stats = this.getSecurityStats(timeRange);
    const patterns = this.getThreatPatterns();
    
    const report = {
      generatedAt: new Date().toISOString(),
      timeRange: timeRange,
      summary: {
        totalSecurityEvents: stats.totalEvents,
        blockedRequests: stats.blockedRequests,
        challengedRequests: stats.challengedRequests,
        highSeverityEvents: stats.eventsBySeverity.HIGH || 0,
        criticalEvents: stats.eventsBySeverity.CRITICAL || 0
      },
      topThreats: {
        eventTypes: Object.entries(stats.eventsByType)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10),
        riskFactors: Object.entries(stats.topRiskFactors)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10),
        suspiciousIPs: Object.entries(stats.topClientIPs)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
      },
      threatPatterns: patterns.slice(0, 20),
      recommendations: this.generateRecommendations(stats, patterns)
    };

    return report;
  }

  // Generate security recommendations
  generateRecommendations(stats, patterns) {
    const recommendations = [];

    // Check for high bot activity
    if (stats.eventsByType.BOT_DETECTED > 10) {
      recommendations.push({
        type: 'HIGH_BOT_ACTIVITY',
        priority: 'HIGH',
        message: 'High bot activity detected. Consider implementing additional CAPTCHA challenges.',
        action: 'Implement stricter bot detection measures'
      });
    }

    // Check for AI-generated content
    if (stats.eventsByType.AI_THREAT_DETECTED > 5) {
      recommendations.push({
        type: 'AI_CONTENT_THREATS',
        priority: 'MEDIUM',
        message: 'AI-generated content detected. Monitor for sophisticated spam campaigns.',
        action: 'Enhance AI content detection algorithms'
      });
    }

    // Check for repeated violations
    const repeatedViolators = patterns.filter(p => p.count >= 5);
    if (repeatedViolators.length > 0) {
      recommendations.push({
        type: 'REPEATED_VIOLATORS',
        priority: 'HIGH',
        message: `${repeatedViolators.length} IPs with repeated violations detected.`,
        action: 'Consider IP blocking for persistent violators',
        affectedIPs: repeatedViolators.map(v => v.clientIP)
      });
    }

    return recommendations;
  }
}

// Export singleton instance
export const securityLogger = new SecurityLogger();

// Export convenience functions
export function logAIThreat(threat) {
  return securityLogger.logAIThreat(threat);
}

export function logBotDetection(detection) {
  return securityLogger.logBotDetection(detection);
}

export function logSpamAttempt(spam) {
  return securityLogger.logSpamAttempt(spam);
}

export function logRateLimitViolation(violation) {
  return securityLogger.logRateLimitViolation(violation);
}

export function logCSRFViolation(violation) {
  return securityLogger.logCSRFViolation(violation);
}

export function getSecurityStats(timeRange) {
  return securityLogger.getSecurityStats(timeRange);
}

export function generateSecurityReport(timeRange) {
  return securityLogger.generateSecurityReport(timeRange);
}

export default securityLogger;