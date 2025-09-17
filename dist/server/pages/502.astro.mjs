import { c as createAstro, a as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/vendor_DQmjvFcz.mjs';
export { d as renderers } from '../chunks/vendor_DQmjvFcz.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BEKVeBBQ.mjs';

const $$Astro = createAstro("https://bubblesenterprise.com");
const $$502 = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$502;
  Astro2.response.headers.set("X-Content-Type-Options", "nosniff");
  Astro2.response.headers.set("X-Frame-Options", "DENY");
  Astro2.response.headers.set("X-XSS-Protection", "1; mode=block");
  Astro2.response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  Astro2.response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';");
  Astro2.response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  Astro2.response.status = 502;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "502 - Bad Gateway | Bubbles Enterprise", "description": "We're experiencing connectivity issues with our servers. Our technical team is working to resolve this issue." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen bg-gradient-to-br from-red-500/5 via-white to-pink-500/5 flex items-center justify-center px-4"> <div class="max-w-2xl mx-auto text-center"> <!-- Error Icon --> <div class="mb-8"> <div class="w-32 h-32 mx-auto bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse-glow"> <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path> </svg> </div> </div> <!-- Error Content --> <div class="glass-hover rounded-3xl p-8 mb-8"> <h1 class="text-6xl font-display font-bold text-red-600 mb-4">502</h1> <h2 class="text-3xl font-display font-semibold text-neutral-gray-800 mb-4">Bad Gateway</h2> <p class="text-lg text-neutral-gray-600 mb-6 leading-relaxed">
We're experiencing connectivity issues between our servers. 
          Our technical team has been notified and is working to restore normal service.
</p> <!-- Security Notice --> <div class="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6"> <div class="flex items-center space-x-2"> <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path> </svg> <p class="text-sm text-red-800 font-medium">Gateway Notice</p> </div> <p class="text-sm text-red-700 mt-2">
This is a temporary connectivity issue. Your data and privacy remain secure during this service interruption.
</p> </div> <!-- Action Buttons --> <div class="flex flex-col sm:flex-row gap-4 justify-center mb-6"> <button onclick="window.location.reload()" class="btn-primary inline-flex items-center space-x-2"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path> </svg> <span>Try Again</span> </button> <a href="/" class="btn-secondary inline-flex items-center space-x-2"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path> </svg> <span>Return Home</span> </a> </div> </div> <!-- Status Information --> <div class="text-center"> <h3 class="text-xl font-display font-semibold text-neutral-gray-800 mb-4">What's Happening?</h3> <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> <div class="glass-hover rounded-2xl p-4"> <svg class="w-8 h-8 text-bubble-primary mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path> </svg> <h4 class="font-semibold text-neutral-gray-800 mb-2">Server Issue</h4> <p class="text-sm text-neutral-gray-600">Our servers are experiencing connectivity problems.</p> </div> <div class="glass-hover rounded-2xl p-4"> <svg class="w-8 h-8 text-bubble-primary mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path> </svg> <h4 class="font-semibold text-neutral-gray-800 mb-2">Being Fixed</h4> <p class="text-sm text-neutral-gray-600">Our technical team is actively working on a solution.</p> </div> <div class="glass-hover rounded-2xl p-4"> <svg class="w-8 h-8 text-bubble-primary mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path> </svg> <h4 class="font-semibold text-neutral-gray-800 mb-2">Need Help?</h4> <p class="text-sm text-neutral-gray-600">Call us at (407) 715-1790 for urgent assistance.</p> </div> </div> </div> </div> </main> ` })} `;
}, "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/pages/502.astro", void 0);

const $$file = "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/pages/502.astro";
const $$url = "/502";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$502,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
