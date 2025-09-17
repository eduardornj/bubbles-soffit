import 'es-module-lexer';
import { s as sequence } from './chunks/vendor_DQmjvFcz.mjs';
import '@astrojs/internal-helpers/path';
import 'cookie';

const cacheMiddleware = async (context, next) => {
  const response = await next();
  const { pathname } = context.url;
  if (pathname.match(/\.(js|css|woff2?|ttf|eot|ico|svg|png|jpg|jpeg|webp|gif)$/)) {
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
    response.headers.set("Expires", new Date(Date.now() + 31536e3 * 1e3).toUTCString());
    if (pathname.endsWith(".css")) {
      response.headers.set("Content-Type", "text/css");
    }
  } else if (pathname.match(/\.(html|xml|json)$/)) {
    response.headers.set("Cache-Control", "public, max-age=3600, must-revalidate");
  } else if (pathname === "/sitemap.xml" || pathname === "/robots.txt") {
    response.headers.set("Cache-Control", "public, max-age=86400");
  }
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  if (pathname === "/" || pathname === "/index.html") {
    response.headers.set("Link", [
      "</assets/main.css>; rel=preload; as=style",
      "/bubbles_enterprise_logo_large.svg; rel=preload; as=image"
    ].join(", "));
  }
  return response;
};

const securityMiddleware = async (context, next) => {
  const response = await next();
  const { pathname } = context.url;
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
  response.headers.set("Content-Security-Policy", cspDirectives.join("; "));
  const reportToHeader = JSON.stringify({
    group: "csp-endpoint",
    max_age: 86400,
    // 24 hours
    endpoints: [{
      url: "/api/csp-violation-report",
      priority: 1,
      weight: 1
    }]
  });
  response.headers.set("Report-To", reportToHeader);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  if (context.url.protocol === "https:") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  return response;
};

const onRequest$1 = sequence(
  securityMiddleware,
  cacheMiddleware
);

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
