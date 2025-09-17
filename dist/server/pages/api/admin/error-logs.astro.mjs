import fs from 'fs';
import path from 'path';
import { s as securityLogger } from '../../../chunks/utils_XnkmivEU.mjs';
export { d as renderers } from '../../../chunks/vendor_DQmjvFcz.mjs';

const prerender = false;

async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days')) || 7;
    const errorType = url.searchParams.get('type') || 'all';
    
    const logPath = path.join(process.cwd(), 'logs', 'error-pages.log');
    
    if (!fs.existsSync(logPath)) {
      return new Response(JSON.stringify({ 
        success: true, 
        data: [], 
        message: 'Log file not found' 
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
    const errorCounts = {};
    const dailyCounts = {};
    const ipCounts = {};
    
    for (const line of lines) {
      try {
        const logEntry = JSON.parse(line);
        const logDate = new Date(logEntry.timestamp);
        
        if (logDate >= cutoffDate) {
          // Filter by error type if specified
          if (errorType !== 'all' && logEntry.errorCode !== errorType) {
            continue;
          }
          
          processedLogs.push(logEntry);
          
          // Count by error code
          errorCounts[logEntry.errorCode] = (errorCounts[logEntry.errorCode] || 0) + 1;
          
          // Count by day
          const dayKey = logDate.toISOString().split('T')[0];
          dailyCounts[dayKey] = (dailyCounts[dayKey] || 0) + 1;
          
          // Count by IP
          if (logEntry.clientIP) {
            ipCounts[logEntry.clientIP] = (ipCounts[logEntry.clientIP] || 0) + 1;
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
      totalErrors: processedLogs.length,
      errorTypes: Object.entries(errorCounts)
        .sort(([,a], [,b]) => b - a)
        .map(([code, count]) => ({ code, count })),
      dailyTrend: Object.entries(dailyCounts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count })),
      topIPs: Object.entries(ipCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([ip, count]) => ({ ip, count }))
    };
    
    return new Response(JSON.stringify({
      success: true,
      data: processedLogs.slice(0, 100), // Limit to 100 most recent
      stats,
      filters: {
        days,
        errorType,
        totalFound: processedLogs.length
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    securityLogger.logError('Error reading error logs', {
      error: error.message,
      stack: error.stack
    });
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to read error logs'
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
