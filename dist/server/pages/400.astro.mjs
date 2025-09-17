import { c as createAstro, a as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/vendor_DQmjvFcz.mjs';
export { d as renderers } from '../chunks/vendor_DQmjvFcz.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BEKVeBBQ.mjs';

const $$Astro = createAstro("https://bubblesenterprise.com");
const $$400 = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$400;
  Astro2.response.headers.set("X-Content-Type-Options", "nosniff");
  Astro2.response.headers.set("X-Frame-Options", "DENY");
  Astro2.response.headers.set("X-XSS-Protection", "1; mode=block");
  Astro2.response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  Astro2.response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';");
  Astro2.response.status = 400;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "400 - Bad Request | Bubbles Enterprise", "description": "The request could not be understood by the server. Please check your request and try again." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen bg-gradient-to-br from-bubble-primary/5 via-white to-bubble-secondary/5 flex items-center justify-center px-4"> <div class="max-w-2xl mx-auto text-center"> <!-- Error Icon --> <div class="mb-8"> <div class="w-32 h-32 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse-glow"> <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path> </svg> </div> </div> <!-- Error Content --> <div class="glass-hover rounded-3xl p-8 mb-8"> <h1 class="text-6xl font-display font-bold text-red-600 mb-4">400</h1> <h2 class="text-3xl font-display font-semibold text-neutral-gray-800 mb-4">Bad Request</h2> <p class="text-lg text-neutral-gray-600 mb-6 leading-relaxed">
The server cannot process your request due to invalid syntax or malformed data. 
          Please check your input and try again.
</p> <!-- Security Notice --> <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6"> <div class="flex items-center space-x-2"> <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path> </svg> <p class="text-sm text-amber-800 font-medium">Security Notice</p> </div> <p class="text-sm text-amber-700 mt-2">
This request has been logged for security monitoring. Repeated invalid requests may result in temporary access restrictions.
</p> </div> <!-- Action Buttons --> <div class="flex flex-col sm:flex-row gap-4 justify-center"> <a href="/" class="btn-primary inline-flex items-center space-x-2"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path> </svg> <span>Return Home</span> </a> <a href="/quote" class="btn-secondary inline-flex items-center space-x-2"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path> </svg> <span>Contact Support</span> </a> </div> </div> <!-- Help Section --> <div class="text-center"> <h3 class="text-xl font-display font-semibold text-neutral-gray-800 mb-4">Common Causes</h3> <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left"> <div class="glass-hover rounded-2xl p-4"> <h4 class="font-semibold text-neutral-gray-800 mb-2">Invalid Form Data</h4> <p class="text-sm text-neutral-gray-600">Check that all required fields are filled correctly</p> </div> <div class="glass-hover rounded-2xl p-4"> <h4 class="font-semibold text-neutral-gray-800 mb-2">Malformed URL</h4> <p class="text-sm text-neutral-gray-600">Ensure the web address is typed correctly</p> </div> </div> </div> </div> </main> ` })} `;
}, "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/pages/400.astro", void 0);

const $$file = "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/pages/400.astro";
const $$url = "/400";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$400,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
