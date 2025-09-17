import type { MiddlewareHandler } from 'astro';

export const cacheMiddleware: MiddlewareHandler = async (context, next) => {
  const response = await next();
  const { pathname } = context.url;

  // Configure cache headers for static assets
  if (pathname.match(/\.(js|css|woff2?|ttf|eot|ico|svg|png|jpg|jpeg|webp|gif)$/)) {
    // Static assets - cache for 1 year
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('Expires', new Date(Date.now() + 31536000 * 1000).toUTCString());
    if (pathname.endsWith('.css')) {
      response.headers.set('Content-Type', 'text/css');
    }
  } else if (pathname.match(/\.(html|xml|json)$/)) {
    // HTML and data files - cache for 1 hour with revalidation
    response.headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
  } else if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
    // SEO files - cache for 1 day
    response.headers.set('Cache-Control', 'public, max-age=86400');
  }

  // Add performance headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Preload critical resources
  if (pathname === '/' || pathname === '/index.html') {
    response.headers.set('Link', [
      '/bubbles_enterprise_logo_large.svg; rel=preload; as=image'
    ].join(', '));
  }

  return response;
};