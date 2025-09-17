// CSP Violation Report Endpoint
// Receives and processes Content Security Policy violation reports

import { securityLogger } from '../../utils/securityLogger.js';

// Force server-side rendering for this API endpoint
export const prerender = false;

export async function POST({ request }) {
  try {
    // Get headers safely (may not be available in static mode)
    let clientIP = 'unknown';
    let userAgent = 'unknown';
    let contentType = '';
    
    try {
      clientIP = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown';
      userAgent = request.headers.get('user-agent') || 'unknown';
      contentType = request.headers.get('content-type') || '';
    } catch (headerError) {
      console.warn('Could not access request headers:', headerError.message);
    }

    let violationData;
    
    // Parse violation report based on content type
    try {
      const requestText = await request.text();
      
      // Check if request body is empty
      if (!requestText || requestText.trim() === '') {
        return new Response(JSON.stringify({ error: 'Empty request body' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const requestData = JSON.parse(requestText);
      
      if (contentType.includes('application/csp-report')) {
        // Standard CSP violation report format
        violationData = requestData['csp-report'] || requestData;
      } else if (contentType.includes('application/reports+json')) {
        // Reporting API format
        violationData = requestData[0]?.body || requestData[0] || requestData;
      } else {
        // Fallback - use parsed data directly
        violationData = requestData['csp-report'] || requestData;
      }
    } catch (parseError) {
      console.error('CSP Report Parse Error:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extract violation details
    const violation = {
      documentUri: violationData['document-uri'] || violationData.documentURL,
      referrer: violationData.referrer || '',
      blockedUri: violationData['blocked-uri'] || violationData.blockedURL,
      violatedDirective: violationData['violated-directive'] || violationData.effectiveDirective,
      originalPolicy: violationData['original-policy'] || violationData.policy,
      sourceFile: violationData['source-file'] || violationData.sourceFile,
      lineNumber: violationData['line-number'] || violationData.lineNumber,
      columnNumber: violationData['column-number'] || violationData.columnNumber,
      statusCode: violationData['status-code'] || violationData.statusCode,
      scriptSample: violationData['script-sample'] || violationData.sample
    };

    // Determine violation severity
    const severity = determineSeverity(violation);
    
    // Log the CSP violation
    await securityLogger.logSecurityEvent({
      type: 'CSP_VIOLATION',
      severity: severity,
      clientIP: clientIP,
      userAgent: userAgent,
      riskLevel: severity === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
      riskFactors: ['CSP_VIOLATION', 'POTENTIAL_XSS', 'POLICY_BREACH'],
      action: 'BLOCKED',
      details: {
        documentUri: violation.documentUri,
        blockedUri: violation.blockedUri,
        violatedDirective: violation.violatedDirective,
        sourceFile: violation.sourceFile,
        lineNumber: violation.lineNumber,
        columnNumber: violation.columnNumber,
        scriptSample: violation.scriptSample ? violation.scriptSample.substring(0, 100) : null,
        timestamp: new Date().toISOString(),
        isRepeatedViolation: await checkRepeatedViolation(violation, clientIP)
      },
      endpoint: violation.documentUri
    });

    // Check for potential attack patterns
    await analyzeViolationPattern(violation, clientIP, userAgent);

    return new Response(JSON.stringify({ 
      status: 'received',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    console.error('CSP Violation Report Error:', error);
    
    // Log the error but don't expose details
    await securityLogger.logSecurityEvent({
      type: 'CSP_REPORT_ERROR',
      severity: 'MEDIUM',
      clientIP: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      riskLevel: 'LOW',
      riskFactors: ['REPORT_PROCESSING_ERROR'],
      action: 'ERROR_LOGGED',
      details: {
        error: error.message,
        timestamp: new Date().toISOString()
      },
      endpoint: '/api/csp-violation-report'
    });

    return new Response(JSON.stringify({ 
      status: 'error',
      message: 'Report processing failed'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// Determine violation severity based on violation details
function determineSeverity(violation) {
  const blockedUri = violation.blockedUri || '';
  const violatedDirective = violation.violatedDirective || '';
  const scriptSample = violation.scriptSample || '';

  // Critical violations
  if (violatedDirective.includes('script-src') && 
      (blockedUri.includes('javascript:') || 
       blockedUri.includes('data:') ||
       scriptSample.includes('eval(') ||
       scriptSample.includes('innerHTML'))) {
    return 'CRITICAL';
  }

  // High severity violations
  if (violatedDirective.includes('script-src') || 
      violatedDirective.includes('object-src') ||
      blockedUri.includes('http://') || // Mixed content
      blockedUri.includes('file://')) {
    return 'HIGH';
  }

  // Medium severity violations
  if (violatedDirective.includes('style-src') ||
      violatedDirective.includes('img-src') ||
      violatedDirective.includes('connect-src')) {
    return 'MEDIUM';
  }

  return 'LOW';
}

// Check if this is a repeated violation from the same source
async function checkRepeatedViolation(violation, clientIP) {
  // Simple in-memory tracking (in production, use Redis or database)
  const violationKey = `${clientIP}-${violation.violatedDirective}-${violation.blockedUri}`;
  
  if (!global.cspViolationTracker) {
    global.cspViolationTracker = new Map();
  }
  
  const now = Date.now();
  const existing = global.cspViolationTracker.get(violationKey);
  
  if (existing && (now - existing.lastSeen) < 300000) { // 5 minutes
    existing.count++;
    existing.lastSeen = now;
    return existing.count > 1;
  } else {
    global.cspViolationTracker.set(violationKey, {
      count: 1,
      firstSeen: now,
      lastSeen: now
    });
    return false;
  }
}

// Analyze violation patterns for potential attacks
async function analyzeViolationPattern(violation, clientIP, userAgent) {
  const blockedUri = violation.blockedUri || '';
  const scriptSample = violation.scriptSample || '';
  
  // Check for common XSS patterns
  const xssPatterns = [
    /javascript:/i,
    /data:text\/html/i,
    /eval\(/i,
    /document\.write/i,
    /innerHTML/i,
    /outerHTML/i,
    /document\.cookie/i,
    /window\.location/i
  ];
  
  const suspiciousPatterns = xssPatterns.some(pattern => 
    pattern.test(blockedUri) || pattern.test(scriptSample)
  );
  
  if (suspiciousPatterns) {
    await securityLogger.logSecurityEvent({
      type: 'POTENTIAL_XSS_ATTACK',
      severity: 'CRITICAL',
      clientIP: clientIP,
      userAgent: userAgent,
      riskLevel: 'CRITICAL',
      riskFactors: ['XSS_ATTEMPT', 'CSP_VIOLATION', 'MALICIOUS_SCRIPT'],
      action: 'BLOCKED_AND_FLAGGED',
      details: {
        attackVector: 'CSP_VIOLATION',
        blockedUri: blockedUri,
        scriptSample: scriptSample.substring(0, 200),
        violatedDirective: violation.violatedDirective,
        timestamp: new Date().toISOString()
      },
      endpoint: violation.documentUri
    });
  }
}

// Handle GET requests (should not be allowed)
export async function GET({ request }) {
  return new Response(JSON.stringify({ 
    error: 'Method not allowed',
    message: 'CSP violation reports must be sent via POST'
  }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      'Allow': 'POST'
    }
  });
}