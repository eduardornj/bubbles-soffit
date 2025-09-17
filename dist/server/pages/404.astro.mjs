import { c as createAstro, a as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead, e as addAttribute } from '../chunks/vendor_DQmjvFcz.mjs';
export { d as renderers } from '../chunks/vendor_DQmjvFcz.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BEKVeBBQ.mjs';
import { m as mysqlSecurityLogger } from '../chunks/utils_XnkmivEU.mjs';

const $$Astro = createAstro("https://bubblesenterprise.com");
const $$404 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$404;
  Astro2.response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self';");
  Astro2.response.headers.set("X-Frame-Options", "DENY");
  Astro2.response.headers.set("X-Content-Type-Options", "nosniff");
  Astro2.response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  Astro2.response.status = 404;
  const requestInfo = {
    url: Astro2.url.pathname + Astro2.url.search,
    userAgent: Astro2.request.headers.get("user-agent") || "Unknown",
    referer: Astro2.request.headers.get("referer") || "Direct",
    clientIP: "Unknown",
    // Astro.clientAddress not available in prerendered pages
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    method: Astro2.request.method
  };
  const suspiciousPatterns = [
    /\.\.\//,
    // Directory traversal
    /\/wp-admin/i,
    // WordPress admin
    /\/admin/i,
    // Admin panels
    /\.(php|asp|jsp)$/i,
    // Server scripts
    /\/api\//i,
    // API endpoints
    /\.(env|config|backup)$/i,
    // Config files
    /\/(login|signin)$/i,
    // Login pages
    /\.(sql|db)$/i
    // Database files
  ];
  const isSuspicious = suspiciousPatterns.some((pattern) => pattern.test(requestInfo.url));
  const suspiciousType = isSuspicious ? requestInfo.url.includes("..") ? "Directory Traversal" : requestInfo.url.includes("wp-admin") ? "WordPress Scan" : requestInfo.url.includes("admin") ? "Admin Panel Scan" : requestInfo.url.includes(".php") ? "PHP File Scan" : requestInfo.url.includes("api") ? "API Enumeration" : requestInfo.url.includes(".env") ? "Config File Access" : requestInfo.url.includes("login") ? "Login Page Scan" : "Suspicious Activity" : null;
  try {
    if (isSuspicious) {
      await mysqlSecurityLogger.logSecurityEvent(
        "suspicious_404",
        "medium",
        requestInfo.clientIP,
        requestInfo.userAgent,
        `Suspicious 404 attempt: ${suspiciousType}`,
        {
          url: requestInfo.url,
          referer: requestInfo.referer,
          method: requestInfo.method,
          suspiciousType,
          patterns: suspiciousPatterns.filter((p) => p.test(requestInfo.url)).map((p) => p.toString())
        }
      );
      await mysqlSecurityLogger.logErrorEvent({
        errorCode: 404,
        requestedPath: requestInfo.url,
        clientIP: requestInfo.clientIP,
        userAgent: requestInfo.userAgent,
        referer: requestInfo.referer,
        method: requestInfo.method,
        isSuspicious: true,
        suspiciousPatterns: [suspiciousType],
        headers: Object.fromEntries(Astro2.request.headers.entries()),
        queryParams: Object.fromEntries(Astro2.url.searchParams.entries())
      });
    } else {
      await mysqlSecurityLogger.logErrorEvent({
        errorCode: 404,
        requestedPath: requestInfo.url,
        clientIP: requestInfo.clientIP,
        userAgent: requestInfo.userAgent,
        referer: requestInfo.referer,
        method: requestInfo.method,
        isSuspicious: false,
        headers: Object.fromEntries(Astro2.request.headers.entries()),
        queryParams: Object.fromEntries(Astro2.url.searchParams.entries())
      });
    }
  } catch (error) {
    console.error("Error logging 404 event:", error);
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "404 - Page Not Found | Bubbles Enterprise", "description": "The page you're looking for doesn't exist. Explore our services or contact us for assistance." }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen bg-gradient-to-br from-blue-500/5 via-white to-purple-500/5 flex items-center justify-center px-4"> <div class="max-w-2xl mx-auto text-center"> <!-- Error Icon --> <div class="mb-8"> <div class="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse-glow"> <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path> </svg> </div> </div> <!-- Error Content --> <div class="glass-hover rounded-3xl p-8 mb-8"> <h1 class="text-6xl font-display font-bold text-blue-600 mb-4">404</h1> <h2 class="text-3xl font-display font-semibold text-neutral-gray-800 mb-4">Page Not Found</h2> <p class="text-lg text-neutral-gray-600 mb-6 leading-relaxed">
The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track with our services.
</p> <!-- Security Notice --> <div${addAttribute(`border rounded-2xl p-4 mb-6 ${isSuspicious ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"}`, "class")}> <div class="flex items-center space-x-2"> <svg${addAttribute(`w-5 h-5 ${isSuspicious ? "text-red-600" : "text-blue-600"}`, "class")} fill="none" stroke="currentColor" viewBox="0 0 24 24"> ${isSuspicious ? renderTemplate`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>` : renderTemplate`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>`} </svg> <p${addAttribute(`text-sm font-medium ${isSuspicious ? "text-red-800" : "text-blue-800"}`, "class")}> ${isSuspicious ? "Security Alert" : "Navigation Notice"} </p> </div> <p${addAttribute(`text-sm mt-2 ${isSuspicious ? "text-red-700" : "text-blue-700"}`, "class")}> ${isSuspicious ? "This access attempt has been flagged and logged for security analysis. Unauthorized access attempts are monitored." : "This request has been logged for site improvement. We monitor 404 errors to enhance user experience."} </p> <div class="mt-2 text-xs opacity-75"> <p><strong>Path:</strong> ${requestInfo.url}</p> <p><strong>Time:</strong> ${(/* @__PURE__ */ new Date()).toLocaleString("pt-BR")}</p> <p><strong>ID:</strong> ${requestInfo.timestamp.slice(-8)}</p> </div> </div> <!-- Action Buttons --> <div class="flex flex-col sm:flex-row gap-4 justify-center mb-6"> <a href="/" class="btn-primary inline-flex items-center space-x-2"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path> </svg> <span>Return Home</span> </a> <a href="/services" class="btn-secondary inline-flex items-center space-x-2"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path> </svg> <span>View Services</span> </a> </div> </div> <!-- Popular Pages --> <div class="text-center"> <h3 class="text-xl font-display font-semibold text-neutral-gray-800 mb-4">Popular Pages</h3> <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> <a href="/services" class="glass-hover rounded-2xl p-4 block hover:scale-105 transition-transform duration-200"> <svg class="w-8 h-8 text-bubble-primary mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path> </svg> <h4 class="font-semibold text-neutral-gray-800 mb-1">Our Services</h4> <p class="text-sm text-neutral-gray-600">Soffit & Fascia Solutions</p> </a> <a href="/calculator" class="glass-hover rounded-2xl p-4 block hover:scale-105 transition-transform duration-200"> <svg class="w-8 h-8 text-bubble-primary mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path> </svg> <h4 class="font-semibold text-neutral-gray-800 mb-1">Cost Calculator</h4> <p class="text-sm text-neutral-gray-600">Estimate Your Project</p> </a> <a href="/quote" class="glass-hover rounded-2xl p-4 block hover:scale-105 transition-transform duration-200"> <svg class="w-8 h-8 text-bubble-primary mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path> </svg> <h4 class="font-semibold text-neutral-gray-800 mb-1">Get Quote</h4> <p class="text-sm text-neutral-gray-600">Free Consultation</p> </a> </div> </div> </div> </main> ` })} `;
}, "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/pages/404.astro", void 0);

const $$file = "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/pages/404.astro";
const $$url = "/404";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
