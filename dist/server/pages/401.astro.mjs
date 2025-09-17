import { c as createAstro, a as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/vendor_DQmjvFcz.mjs';
export { d as renderers } from '../chunks/vendor_DQmjvFcz.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BEKVeBBQ.mjs';

const $$Astro = createAstro("https://bubblesenterprise.com");
const $$401 = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$401;
  Astro2.response.headers.set("X-Content-Type-Options", "nosniff");
  Astro2.response.headers.set("X-Frame-Options", "DENY");
  Astro2.response.headers.set("X-XSS-Protection", "1; mode=block");
  Astro2.response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  Astro2.response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';");
  Astro2.response.headers.set("WWW-Authenticate", 'Bearer realm="Bubbles Enterprise"');
  Astro2.response.status = 401;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "401 - Unauthorized | Bubbles Enterprise", "description": "Authentication is required to access this resource. Please provide valid credentials." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen bg-gradient-to-br from-amber-500/5 via-white to-orange-500/5 flex items-center justify-center px-4"> <div class="max-w-2xl mx-auto text-center"> <!-- Error Icon --> <div class="mb-8"> <div class="w-32 h-32 mx-auto bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse-glow"> <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path> </svg> </div> </div> <!-- Error Content --> <div class="glass-hover rounded-3xl p-8 mb-8"> <h1 class="text-6xl font-display font-bold text-amber-600 mb-4">401</h1> <h2 class="text-3xl font-display font-semibold text-neutral-gray-800 mb-4">Unauthorized</h2> <p class="text-lg text-neutral-gray-600 mb-6 leading-relaxed">
Authentication is required to access this resource. 
          Please provide valid credentials or contact our support team.
</p> <!-- Security Notice --> <div class="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6"> <div class="flex items-center space-x-2"> <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path> </svg> <p class="text-sm text-red-800 font-medium">Security Alert</p> </div> <p class="text-sm text-red-700 mt-2">
Unauthorized access attempts are monitored and logged. Multiple failed attempts may result in account lockout.
</p> </div> <!-- Action Buttons --> <div class="flex flex-col sm:flex-row gap-4 justify-center"> <a href="/" class="btn-primary inline-flex items-center space-x-2"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path> </svg> <span>Return Home</span> </a> <a href="/quote" class="btn-secondary inline-flex items-center space-x-2"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path> </svg> <span>Contact Support</span> </a> </div> </div> <!-- Help Section --> <div class="text-center"> <h3 class="text-xl font-display font-semibold text-neutral-gray-800 mb-4">Need Help?</h3> <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left"> <div class="glass-hover rounded-2xl p-4"> <h4 class="font-semibold text-neutral-gray-800 mb-2">Authentication Required</h4> <p class="text-sm text-neutral-gray-600">This resource requires valid authentication credentials</p> </div> <div class="glass-hover rounded-2xl p-4"> <h4 class="font-semibold text-neutral-gray-800 mb-2">Contact Support</h4> <p class="text-sm text-neutral-gray-600">Call (407) 715-1790 for assistance with access issues</p> </div> </div> </div> </div> </main> ` })} `;
}, "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/pages/401.astro", void 0);

const $$file = "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/pages/401.astro";
const $$url = "/401";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$401,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
