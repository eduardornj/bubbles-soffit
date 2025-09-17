import fs from 'fs';
import path from 'path';
import { s as securityLogger } from '../../../chunks/utils_XnkmivEU.mjs';
export { d as renderers } from '../../../chunks/vendor_DQmjvFcz.mjs';

const prerender = false;

async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days')) || 7;
    const severity = url.searchParams.get('severity') || 'all';
    
    const logPath = path.join(process.cwd(), 'logs', 'server.log');
    
    if (!fs.existsSync(logPath)) {
      return new Response(JSON.stringify({ 
        success: true, 
        data: [], 
        message: 'Server log file not found' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const logContent = fs.readFileSync(logPath, 'utf-8');
    const lines = logContent.split('\n').filter(line => line.trim());
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const processedLogs = [];
    const violationCounts = {};
    const dailyCounts = {};
    const ipCounts = {};
    const directiveCounts = {};
    const blockedUriCounts = {};
    
    for (const line of lines) {
      try {
        // Look for CSP violation logs
        if (line.includes('CSP_VIOLATION') || line.includes('csp-report')) {
          const logEntry = JSON.parse(line);
          const logDate = new Date(logEntry.timestamp);
          
          if (logDate >= cutoffDate) {
            // Filter by severity if specified
            if (severity !== 'all' && logEntry.severity !== severity.toUpperCase()) {
              continue;
            }
            
            processedLogs.push(logEntry);
            
            // Count by violation type
            const violationType = logEntry.details?.violatedDirective || 'unknown';
            violationCounts[violationType] = (violationCounts[violationType] || 0) + 1;
            
            // Count by day
            const dayKey = logDate.toISOString().split('T')[0];
            dailyCounts[dayKey] = (dailyCounts[dayKey] || 0) + 1;
            
            // Count by IP
            if (logEntry.clientIP) {
              ipCounts[logEntry.clientIP] = (ipCounts[logEntry.clientIP] || 0) + 1;
            }
            
            // Count by directive
            if (logEntry.details?.violatedDirective) {
              directiveCounts[logEntry.details.violatedDirective] = 
                (directiveCounts[logEntry.details.violatedDirective] || 0) + 1;
            }
            
            // Count by blocked URI
            if (logEntry.details?.blockedUri) {
              const uri = logEntry.details.blockedUri;
              blockedUriCounts[uri] = (blockedUriCounts[uri] || 0) + 1;
            }
          }
        }
      } catch (parseError) {
        // Skip invalid JSON lines
        continue;
      }
    }
    
    // Sort logs by timestamp (newest first)
    processedLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Prepare statistics
    const stats = {
      totalViolations: processedLogs.length,
      violationTypes: Object.entries(violationCounts)
        .sort(([,a], [,b]) => b - a)
        .map(([type, count]) => ({ type, count })),
      dailyTrend: Object.entries(dailyCounts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count })),
      topIPs: Object.entries(ipCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([ip, count]) => ({ ip, count })),
      topDirectives: Object.entries(directiveCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([directive, count]) => ({ directive, count })),
      topBlockedUris: Object.entries(blockedUriCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([uri, count]) => ({ uri, count }))
    };
    
    return new Response(JSON.stringify({
      success: true,
      data: processedLogs.slice(0, 100), // Limit to 100 most recent
      stats,
      filters: {
        days,
        severity,
        totalFound: processedLogs.length
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    securityLogger.logError('Error reading CSP logs', {
      error: error.message,
      stack: error.stack
    });
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to read CSP logs'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
