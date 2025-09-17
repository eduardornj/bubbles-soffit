import type { MiddlewareHandler } from 'astro';

export const securityMiddleware: MiddlewareHandler = async (context, next) => {
  const response = await next();
  const { pathname } = context.url;

  // Content Security Policy with violation reporting
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.openai.com https://api.anthropic.com ws://localhost:8080 https://cdn.jsdelivr.net",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    "block-all-mixed-content",
    // CSP violation reporting endpoint
    "report-uri /api/csp-violation-report",
    "report-to csp-endpoint"
  ];

  // Set CSP header
  response.headers.set('Content-Security-Policy', cspDirectives.join('; '));

  // Report-To header for CSP violation reporting
  const reportToHeader = JSON.stringify({
    group: 'csp-endpoint',
    max_age: 86400, // 24 hours
    endpoints: [{
      url: '/api/csp-violation-report',
      priority: 1,
      weight: 1
    }]
  });
  response.headers.set('Report-To', reportToHeader);

  // Additional security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // HSTS (HTTP Strict Transport Security) for HTTPS
  if (context.url.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Cross-Origin policies
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

  return response;
};