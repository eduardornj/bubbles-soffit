import { c as createAstro, a as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/vendor_DQmjvFcz.mjs';
export { d as renderers } from '../chunks/vendor_DQmjvFcz.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BEKVeBBQ.mjs';

const $$Astro = createAstro("https://bubblesenterprise.com");
const $$503 = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$503;
  Astro2.response.headers.set("X-Content-Type-Options", "nosniff");
  Astro2.response.headers.set("X-Frame-Options", "DENY");
  Astro2.response.headers.set("X-XSS-Protection", "1; mode=block");
  Astro2.response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  Astro2.response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';");
  Astro2.response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  Astro2.response.headers.set("Retry-After", "300");
  Astro2.response.status = 503;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "503 - Service Unavailable | Bubbles Enterprise", "description": "Our service is temporarily unavailable due to maintenance or high traffic. Please try again shortly." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen bg-gradient-to-br from-orange-500/5 via-white to-yellow-500/5 flex items-center justify-center px-4"> <div class="max-w-2xl mx-auto text-center"> <!-- Error Icon --> <div class="mb-8"> <div class="w-32 h-32 mx-auto bg-gradient-to-br from-orange-500 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse-glow"> <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path> </svg> </div> </div> <!-- Error Content --> <div class="glass-hover rounded-3xl p-8 mb-8"> <h1 class="text-6xl font-display font-bold text-orange-600 mb-4">503</h1> <h2 class="text-3xl font-display font-semibold text-neutral-gray-800 mb-4">Service Unavailable</h2> <p class="text-lg text-neutral-gray-600 mb-6 leading-relaxed">
Our service is temporarily unavailable due to scheduled maintenance or high traffic. 
          We're working to restore normal service as quickly as possible.
</p> <!-- Security Notice --> <div class="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6"> <div class="flex items-center space-x-2"> <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> <p class="text-sm text-orange-800 font-medium">Service Status</p> </div> <p class="text-sm text-orange-700 mt-2">
This is a temporary service interruption. Your data remains secure and will be available once service is restored.
</p> </div> <!-- Countdown Timer --> <div class="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-2xl p-4 mb-6"> <p class="text-sm text-orange-800 font-medium mb-2">Estimated restoration time:</p> <div id="countdown" class="text-2xl font-display font-bold text-orange-600">5:00</div> <p class="text-xs text-orange-600 mt-1">Please try again after this time</p> </div> <!-- Action Buttons --> <div class="flex flex-col sm:flex-row gap-4 justify-center mb-6"> <button onclick="window.location.reload()" class="btn-primary inline-flex items-center space-x-2"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path> </svg> <span>Try Again</span> </button> <a href="/" class="btn-secondary inline-flex items-center space-x-2"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path> </svg> <span>Return Home</span> </a> </div> </div> <!-- Alternative Actions --> <div class="text-center"> <h3 class="text-xl font-display font-semibold text-neutral-gray-800 mb-4">While You Wait</h3> <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> <div class="glass-hover rounded-2xl p-4"> <svg class="w-8 h-8 text-bubble-primary mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> <h4 class="font-semibold text-neutral-gray-800 mb-2">Check Back Soon</h4> <p class="text-sm text-neutral-gray-600">Service should be restored within 5-10 minutes.</p> </div> <div class="glass-hover rounded-2xl p-4"> <svg class="w-8 h-8 text-bubble-primary mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path> </svg> <h4 class="font-semibold text-neutral-gray-800 mb-2">Call Us</h4> <p class="text-sm text-neutral-gray-600">Urgent? Contact us at (407) 715-1790</p> </div> <div class="glass-hover rounded-2xl p-4"> <svg class="w-8 h-8 text-bubble-primary mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path> </svg> <h4 class="font-semibold text-neutral-gray-800 mb-2">Learn More</h4> <p class="text-sm text-neutral-gray-600">Browse our services while you wait.</p> </div> </div> </div> </div> </main> ` })} `;
}, "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/pages/503.astro", void 0);

const $$file = "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/pages/503.astro";
const $$url = "/503";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$503,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
