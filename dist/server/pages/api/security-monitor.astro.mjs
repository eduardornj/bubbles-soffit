import { r as rateLimit, g as getSecurityStats, d as generateSecurityReport } from '../../chunks/utils_XnkmivEU.mjs';
export { d as renderers } from '../../chunks/vendor_DQmjvFcz.mjs';

// Security Monitoring API Endpoint
// Provides security statistics and threat analysis for administrators


// Simple authentication check (in production, use proper auth)
function isAuthorized(request) {
  const authHeader = request.headers.get('authorization');
  const adminKey = process.env.ADMIN_SECURITY_KEY || 'admin-key-2025';
  
  return authHeader === `Bearer ${adminKey}`;
}

async function GET({ request, url }) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request, { maxRequests: 10, windowMs: 60000 });
    if (!rateLimitResult.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Too many requests. Please try again later.' 
        }),
        { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check authorization
    if (!isAuthorized(request)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unauthorized access' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const searchParams = new URL(url).searchParams;
    const action = searchParams.get('action') || 'stats';
    const timeRange = parseInt(searchParams.get('timeRange')) || 3600000; // Default 1 hour

    let responseData;

    switch (action) {
      case 'stats':
        responseData = {
          success: true,
          data: getSecurityStats(timeRange),
          timeRange: timeRange,
          timestamp: new Date().toISOString()
        };
        break;

      case 'report':
        responseData = {
          success: true,
          data: generateSecurityReport(timeRange),
          timestamp: new Date().toISOString()
        };
        break;

      case 'dashboard':
        // Combined dashboard data
        const stats = getSecurityStats(timeRange);
        const report = generateSecurityReport(86400000); // 24 hours for report
        
        responseData = {
          success: true,
          data: {
            currentStats: stats,
            dailyReport: report,
            alerts: generateAlerts(stats, report),
            systemHealth: getSystemHealth(stats)
          },
          timestamp: new Date().toISOString()
        };
        break;

      default:
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid action. Use: stats, report, or dashboard' 
          }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
    }

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );

  } catch (error) {
    console.error('Security Monitor API Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Generate real-time alerts based on current stats
function generateAlerts(stats, report) {
  const alerts = [];

  // High severity events alert
  if (stats.eventsBySeverity?.HIGH > 5) {
    alerts.push({
      type: 'HIGH_SEVERITY_EVENTS',
      level: 'WARNING',
      message: `${stats.eventsBySeverity.HIGH} high severity security events in the last hour`,
      action: 'Review security logs immediately',
      timestamp: new Date().toISOString()
    });
  }

  // Critical events alert
  if (stats.eventsBySeverity?.CRITICAL > 0) {
    alerts.push({
      type: 'CRITICAL_SECURITY_EVENTS',
      level: 'CRITICAL',
      message: `${stats.eventsBySeverity.CRITICAL} critical security events detected`,
      action: 'Immediate investigation required',
      timestamp: new Date().toISOString()
    });
  }

  // High bot activity alert
  if (stats.eventsByType?.BOT_DETECTED > 10) {
    alerts.push({
      type: 'HIGH_BOT_ACTIVITY',
      level: 'WARNING',
      message: `Unusual bot activity detected: ${stats.eventsByType.BOT_DETECTED} bot attempts`,
      action: 'Consider implementing additional bot protection',
      timestamp: new Date().toISOString()
    });
  }

  // AI threat detection alert
  if (stats.eventsByType?.AI_THREAT_DETECTED > 3) {
    alerts.push({
      type: 'AI_THREATS_DETECTED',
      level: 'INFO',
      message: `AI-generated content threats detected: ${stats.eventsByType.AI_THREAT_DETECTED} instances`,
      action: 'Monitor for sophisticated spam campaigns',
      timestamp: new Date().toISOString()
    });
  }

  // High block rate alert
  const totalRequests = stats.blockedRequests + stats.challengedRequests + (stats.totalEvents - stats.blockedRequests - stats.challengedRequests);
  const blockRate = totalRequests > 0 ? (stats.blockedRequests / totalRequests) * 100 : 0;
  
  if (blockRate > 20) {
    alerts.push({
      type: 'HIGH_BLOCK_RATE',
      level: 'WARNING',
      message: `High request block rate: ${blockRate.toFixed(1)}%`,
      action: 'Review security rules for false positives',
      timestamp: new Date().toISOString()
    });
  }

  return alerts;
}

// Get system health indicators
function getSystemHealth(stats) {
  const health = {
    status: 'HEALTHY',
    indicators: {},
    score: 100
  };

  // Security event volume indicator
  const eventVolume = stats.totalEvents;
  if (eventVolume > 100) {
    health.indicators.eventVolume = 'HIGH';
    health.score -= 20;
  } else if (eventVolume > 50) {
    health.indicators.eventVolume = 'MEDIUM';
    health.score -= 10;
  } else {
    health.indicators.eventVolume = 'LOW';
  }

  // Critical events indicator
  const criticalEvents = stats.eventsBySeverity?.CRITICAL || 0;
  if (criticalEvents > 0) {
    health.indicators.criticalEvents = 'CRITICAL';
    health.score -= 30;
    health.status = 'CRITICAL';
  } else {
    health.indicators.criticalEvents = 'NONE';
  }

  // Block rate indicator
  const totalRequests = stats.blockedRequests + stats.challengedRequests + (stats.totalEvents - stats.blockedRequests - stats.challengedRequests);
  const blockRate = totalRequests > 0 ? (stats.blockedRequests / totalRequests) * 100 : 0;
  
  if (blockRate > 30) {
    health.indicators.blockRate = 'HIGH';
    health.score -= 15;
  } else if (blockRate > 10) {
    health.indicators.blockRate = 'MEDIUM';
    health.score -= 5;
  } else {
    health.indicators.blockRate = 'LOW';
  }

  // AI threat indicator
  const aiThreats = stats.eventsByType?.AI_THREAT_DETECTED || 0;
  if (aiThreats > 10) {
    health.indicators.aiThreats = 'HIGH';
    health.score -= 10;
  } else if (aiThreats > 3) {
    health.indicators.aiThreats = 'MEDIUM';
    health.score -= 5;
  } else {
    health.indicators.aiThreats = 'LOW';
  }

  // Determine overall status
  if (health.score >= 80 && health.status !== 'CRITICAL') {
    health.status = 'HEALTHY';
  } else if (health.score >= 60) {
    health.status = 'WARNING';
  } else if (health.status !== 'CRITICAL') {
    health.status = 'UNHEALTHY';
  }

  return health;
}

// POST endpoint for security actions (future use)
async function POST({ request }) {
  try {
    // Check authorization
    if (!isAuthorized(request)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unauthorized access' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await request.json();
    const { action, params } = data;

    // Future actions could include:
    // - Block IP addresses
    // - Update security rules
    // - Clear threat patterns
    // - Export security logs

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Security actions not yet implemented' 
      }),
      { 
        status: 501,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Security Monitor POST Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
