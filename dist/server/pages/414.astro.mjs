import { c as createAstro, a as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/vendor_DQmjvFcz.mjs';
export { d as renderers } from '../chunks/vendor_DQmjvFcz.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BEKVeBBQ.mjs';

const $$Astro = createAstro("https://bubblesenterprise.com");
const $$414 = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$414;
  Astro2.response.headers.set("X-Content-Type-Options", "nosniff");
  Astro2.response.headers.set("X-Frame-Options", "DENY");
  Astro2.response.headers.set("X-XSS-Protection", "1; mode=block");
  Astro2.response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  Astro2.response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';");
  Astro2.response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  Astro2.response.status = 414;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "414 - URI Too Long | Bubbles Enterprise", "description": "The requested URI is too long for the server to process. Please shorten your request URL." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen bg-gradient-to-br from-yellow-500/5 via-white to-orange-500/5 flex items-center justify-center px-4"> <div class="max-w-2xl mx-auto text-center"> <!-- Error Icon --> <div class="mb-8"> <div class="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse-glow"> <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path> </svg> </div> </div> <!-- Error Content --> <div class="glass-hover rounded-3xl p-8 mb-8"> <h1 class="text-6xl font-display font-bold text-yellow-600 mb-4">414</h1> <h2 class="text-3xl font-display font-semibold text-neutral-gray-800 mb-4">URI Too Long</h2> <p class="text-lg text-neutral-gray-600 mb-6 leading-relaxed">
The requested URI (Uniform Resource Identifier) is longer than the server 
          is willing to interpret. Please shorten your request URL.
</p> <!-- Security Notice --> <div class="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6"> <div class="flex items-center space-x-2"> <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path> </svg> <p class="text-sm text-yellow-800 font-medium">URL Length Protection</p> </div> <p class="text-sm text-yellow-700 mt-2">
Long URLs can be used in security attacks. This limit protects against buffer overflow and injection attempts.
</p> </div> <!-- URI Limits Info --> <div class="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6"> <h3 class="text-sm font-semibold text-blue-800 mb-3">URL Length Limits:</h3> <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm"> <div class="flex justify-between items-center"> <span class="text-blue-700">Maximum URL:</span> <span class="font-medium text-blue-800">2,048 chars</span> </div> <div class="flex justify-between items-center"> <span class="text-blue-700">Query String:</span> <span class="font-medium text-blue-800">1,024 chars</span> </div> <div class="flex justify-between items-center"> <span class="text-blue-700">Path Length:</span> <span class="font-medium text-blue-800">512 chars</span> </div> <div class="flex justify-between items-center"> <span class="text-blue-700">Fragment:</span> <span class="font-medium text-blue-800">256 chars</span> </div> </div> </div> <!-- Action Buttons --> <div class="flex flex-col sm:flex-row gap-4 justify-center mb-6"> <a href="/" class="btn-primary inline-flex items-center space-x-2"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path> </svg> <span>Return Home</span> </a> <a href="/search" class="btn-secondary inline-flex items-center space-x-2"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path> </svg> <span>Use Search</span> </a> </div> </div> <!-- Solutions --> <div class="text-center"> <h3 class="text-xl font-display font-semibold text-neutral-gray-800 mb-4">How to Fix This</h3> <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> <div class="glass-hover rounded-2xl p-4"> <svg class="w-8 h-8 text-bubble-primary mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path> </svg> <h4 class="font-semibold text-neutral-gray-800 mb-2">Shorten URL</h4> <p class="text-sm text-neutral-gray-600">Remove unnecessary parameters or use shorter parameter names.</p> </div> <div class="glass-hover rounded-2xl p-4"> <svg class="w-8 h-8 text-bubble-primary mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path> </svg> <h4 class="font-semibold text-neutral-gray-800 mb-2">Use POST Method</h4> <p class="text-sm text-neutral-gray-600">Send large data in the request body instead of URL parameters.</p> </div> <div class="glass-hover rounded-2xl p-4"> <svg class="w-8 h-8 text-bubble-primary mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path> </svg> <h4 class="font-semibold text-neutral-gray-800 mb-2">URL Shortener</h4> <p class="text-sm text-neutral-gray-600">Use a URL shortening service for very long links.</p> </div> </div> </div> </div> </main> ` })} `;
}, "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/pages/414.astro", void 0);

const $$file = "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/pages/414.astro";
const $$url = "/414";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$414,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
