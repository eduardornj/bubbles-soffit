import { a as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/vendor_DQmjvFcz.mjs';
export { d as renderers } from '../chunks/vendor_DQmjvFcz.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BEKVeBBQ.mjs';
import { $ as $$Breadcrumbs } from '../chunks/Breadcrumbs_eBFx-ZwG.mjs';

const $$Quote = createComponent(($$result, $$props, $$slots) => {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Get Quote" }
  ];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Free Soffit & Fascia Quote Orlando FL | Bubbles Enterprise | 24hr Response", "description": "Get your FREE soffit & fascia estimate in Orlando, FL! Licensed contractors provide detailed quotes within 24 hours. No obligation. Professional installation & repair services. Call (407) 715-1790!", "keywords": "free soffit quote Orlando, fascia estimate Florida, Orlando soffit installation quote, free home improvement estimate, soffit repair quote Orlando FL, licensed contractor estimate, aluminum soffit quote" }, { "default": ($$result2) => renderTemplate`  ${renderComponent($$result2, "Breadcrumbs", $$Breadcrumbs, { "items": breadcrumbItems })}  ${maybeRenderHead()}<section class="relative py-24 lg:py-32 gradient-blue"> <div class="container-custom"> <div class="text-center text-white mb-12"> <h1 class="font-display font-bold text-4xl md:text-5xl lg:text-6xl mb-6">
Get Your Free Quote
</h1> <p class="text-xl md:text-2xl text-bubble-light max-w-3xl mx-auto">
Professional soffit and fascia services in Orlando. Fill out the form below and we'll provide you with a detailed estimate within 24 hours.
</p> </div> </div> </section>  <section class="py-16 lg:py-24 bg-neutral-gray-50"> <div class="container-custom"> <div class="max-w-4xl mx-auto"> <div class="bg-white rounded-2xl shadow-xl p-8 lg:p-12"> <div class="text-center mb-8"> <h2 class="font-display font-bold text-3xl lg:text-4xl text-bubble-primary mb-4">
Request Your Free Estimate
</h2> <p class="text-lg text-neutral-gray-600">
Tell us about your project and we'll provide a detailed quote
</p> </div> <form id="quoteForm" class="space-y-6" action="/api/quote" method="POST" enctype="multipart/form-data"> <!-- Honeypot field (hidden from users) --> <input type="text" name="website" style="display: none;" tabindex="-1" autocomplete="off"> <!-- CSRF Token (added for enhanced security) --> <input type="hidden" name="_csrf" id="csrfToken" value=""> <!-- Contact Information --> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> <div> <label for="firstName" class="block text-sm font-medium text-neutral-gray-700 mb-2">
First Name *
</label> <input type="text" id="firstName" name="firstName" required minlength="2" maxlength="50" pattern="[A-Za-z\s]+" class="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:ring-2 focus:ring-bubble-blue focus:border-transparent transition-colors" placeholder="Your first name"> </div> <div> <label for="lastName" class="block text-sm font-medium text-neutral-gray-700 mb-2">
Last Name *
</label> <input type="text" id="lastName" name="lastName" required minlength="2" maxlength="50" pattern="[A-Za-z\s]+" class="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:ring-2 focus:ring-bubble-blue focus:border-transparent transition-colors" placeholder="Your last name"> </div> </div> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> <div> <label for="email" class="block text-sm font-medium text-neutral-gray-700 mb-2">
Email Address *
</label> <input type="email" id="email" name="email" required maxlength="100" class="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:ring-2 focus:ring-bubble-blue focus:border-transparent transition-colors" placeholder="your.email@example.com"> </div> <div> <label for="phone" class="block text-sm font-medium text-neutral-gray-700 mb-2">
Phone Number *
</label> <input type="tel" id="phone" name="phone" required pattern="[\d\s\(\)\-\+\.]+" maxlength="20" class="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:ring-2 focus:ring-bubble-blue focus:border-transparent transition-colors" placeholder="(407) 715-1790"> </div> </div> <!-- Property Information --> <div> <label for="address" class="block text-sm font-medium text-neutral-gray-700 mb-2">
Property Address *
</label> <input type="text" id="address" name="address" required class="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:ring-2 focus:ring-bubble-blue focus:border-transparent transition-colors" placeholder="123 Main St, Orlando, FL 32801"> </div> <!-- Service Type --> <div> <label for="serviceType" class="block text-sm font-medium text-neutral-gray-700 mb-2">
Service Type *
</label> <select id="serviceType" name="serviceType" required class="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:ring-2 focus:ring-bubble-blue focus:border-transparent transition-colors"> <option value="">Select a service</option> <option value="repairs">Repairs</option> <option value="remove-replace">Remove & Replace</option> <option value="new-construction">New Construction</option> </select> </div> <!-- Project Details --> <div> <label for="projectDetails" class="block text-sm font-medium text-neutral-gray-700 mb-2">
Project Details
</label> <textarea id="projectDetails" name="projectDetails" rows="4" minlength="20" maxlength="2000" class="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:ring-2 focus:ring-bubble-blue focus:border-transparent transition-colors" placeholder="Please describe your project, including any specific requirements, timeline, or questions you may have... (minimum 20 characters)"></textarea> </div> <!-- Photo Upload --> <div> <label for="photos" class="block text-sm font-medium text-neutral-gray-700 mb-2">
📸 Upload Photos (Especialmente para reparos)
</label> <div class="border-2 border-dashed border-neutral-gray-300 rounded-lg p-6 text-center hover:border-bubble-blue transition-colors"> <input type="file" id="photos" name="photos" multiple accept="image/jpeg,image/jpg,image/png,image/webp" class="hidden"> <label for="photos" class="cursor-pointer"> <div class="flex flex-col items-center"> <svg class="w-12 h-12 text-neutral-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path> </svg> <p class="text-lg font-medium text-neutral-gray-700 mb-2">Clique para enviar fotos</p> <p class="text-sm text-neutral-gray-500">PNG, JPG até 10MB cada (máximo 5 fotos)</p> </div> </label> <div id="photo-preview" class="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 hidden"></div> </div> <p class="text-xs text-neutral-gray-500 mt-2">
💡 Para reparos, as fotos nos ajudam a entender melhor o problema e fornecer um orçamento mais preciso.
</p> </div> <!-- Preferred Contact Method --> <div> <label class="block text-sm font-medium text-neutral-gray-700 mb-3">
Preferred Contact Method
</label> <div class="flex flex-wrap gap-4"> <label class="flex items-center"> <input type="radio" name="contactMethod" value="phone" class="mr-2 text-bubble-blue focus:ring-bubble-blue"> <span class="text-neutral-gray-700">Phone Call</span> </label> <label class="flex items-center"> <input type="radio" name="contactMethod" value="email" class="mr-2 text-bubble-blue focus:ring-bubble-blue" checked> <span class="text-neutral-gray-700">Email</span> </label> <label class="flex items-center"> <input type="radio" name="contactMethod" value="text" class="mr-2 text-bubble-blue focus:ring-bubble-blue"> <span class="text-neutral-gray-700">Text Message</span> </label> </div> </div> <!-- Submit Button --> <div class="pt-6"> <button type="submit" id="submitBtn" class="w-full btn-primary text-lg py-4 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"> <span id="submitText">Get My Free Quote</span> <span id="submitLoader" class="hidden">Sending...</span> </button> <!-- Success/Error Messages --> <div id="formMessage" class="hidden p-4 rounded-lg"></div> </div> <!-- Privacy Notice --> <div class="text-center text-sm text-neutral-gray-500"> <p>
By submitting this form, you agree to our
<a href="/privacy" class="text-bubble-blue hover:underline">Privacy Policy</a>
and consent to be contacted about your project.
</p> </div> </form> </div> </div> </div> </section>  <section class="py-16 lg:py-24"> <div class="container-custom"> <div class="text-center mb-12"> <h2 class="font-display font-bold text-3xl lg:text-4xl text-bubble-primary mb-4">
Why Choose Bubbles Enterprise?
</h2> <p class="text-lg text-neutral-gray-600 max-w-2xl mx-auto">
We're committed to providing exceptional service and quality workmanship
</p> </div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"> <div class="text-center"> <div class="w-16 h-16 bg-bubble-blue rounded-full flex items-center justify-center mx-auto mb-4"> <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path> </svg> </div> <h3 class="font-semibold text-lg text-bubble-primary mb-2">Licensed & Insured</h3> <p class="text-neutral-gray-600">Fully licensed and insured for your peace of mind</p> </div> <div class="text-center"> <div class="w-16 h-16 bg-bubble-blue rounded-full flex items-center justify-center mx-auto mb-4"> <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"> <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> </div> <h3 class="font-semibold text-lg text-bubble-primary mb-2">Quality Guarantee</h3> <p class="text-neutral-gray-600">100% satisfaction guarantee on all our work</p> </div> <div class="text-center"> <div class="w-16 h-16 bg-bubble-blue rounded-full flex items-center justify-center mx-auto mb-4"> <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path> </svg> </div> <h3 class="font-semibold text-lg text-bubble-primary mb-2">Fast Response</h3> <p class="text-neutral-gray-600">Quick quotes within 24 hours</p> </div> <div class="text-center"> <div class="w-16 h-16 bg-bubble-blue rounded-full flex items-center justify-center mx-auto mb-4"> <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"> <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"></path> </svg> </div> <h3 class="font-semibold text-lg text-bubble-primary mb-2">Competitive Pricing</h3> <p class="text-neutral-gray-600">Fair and transparent pricing</p> </div> </div> </div> </section> ` })} `;
}, "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/pages/quote.astro", void 0);

const $$file = "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/pages/quote.astro";
const $$url = "/quote";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Quote,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
