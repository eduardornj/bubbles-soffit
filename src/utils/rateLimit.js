// Rate limiting utility to prevent spam and abuse

// In-memory store for rate limiting (in production, use Redis or similar)
const requestCounts = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.resetTime > data.windowMs) {
      requestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function rateLimit(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    max = 5, // 5 requests per window default
    message = 'Too many requests from this IP, please try again later.',
    keyGenerator = (request) => getClientIP(request)
  } = options;

  return async function(request) {
    try {
      const key = keyGenerator(request);
      const now = Date.now();
      
      // Get or create rate limit data for this key
      let rateLimitData = requestCounts.get(key);
      
      if (!rateLimitData || now - rateLimitData.resetTime > windowMs) {
        // Reset or create new rate limit data
        rateLimitData = {
          count: 0,
          resetTime: now,
          windowMs: windowMs
        };
      }
      
      // Increment request count
      rateLimitData.count++;
      requestCounts.set(key, rateLimitData);
      
      // Check if limit exceeded
      if (rateLimitData.count > max) {
        const timeUntilReset = Math.ceil((rateLimitData.resetTime + windowMs - now) / 1000);
        
        return {
          error: message,
          retryAfter: timeUntilReset,
          limit: max,
          remaining: 0,
          reset: new Date(rateLimitData.resetTime + windowMs)
        };
      }
      
      // Request allowed
      return {
        error: null,
        limit: max,
        remaining: max - rateLimitData.count,
        reset: new Date(rateLimitData.resetTime + windowMs)
      };
      
    } catch (error) {
      console.error('Rate limiting error:', error);
      // On error, allow the request to proceed
      return {
        error: null,
        limit: max,
        remaining: max - 1,
        reset: new Date(Date.now() + windowMs)
      };
    }
  };
}

// Extract client IP from request
function getClientIP(request) {
  // Check various headers for the real IP
  const headers = request.headers;
  
  // Common proxy headers
  const ipHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip', // Cloudflare
    'x-forwarded',
    'forwarded-for',
    'forwarded'
  ];
  
  for (const header of ipHeaders) {
    const value = headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      const ip = value.split(',')[0].trim();
      if (isValidIP(ip)) {
        return ip;
      }
    }
  }
  
  // Fallback to connection remote address
  return 'unknown';
}

// Basic IP validation
function isValidIP(ip) {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// Advanced rate limiting with different tiers
export function createTieredRateLimit() {
  return {
    // Strict limits for form submissions
    forms: rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 3,
      message: 'Too many form submissions. Please wait before submitting again.'
    }),
    
    // More lenient for API calls
    api: rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 20,
      message: 'API rate limit exceeded. Please slow down your requests.'
    }),
    
    // Very strict for sensitive operations
    sensitive: rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 1,
      message: 'This operation is limited to once per hour.'
    })
  };
}