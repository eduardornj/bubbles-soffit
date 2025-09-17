import { a as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/vendor_DQmjvFcz.mjs';
export { d as renderers } from '../chunks/vendor_DQmjvFcz.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BEKVeBBQ.mjs';
import { $ as $$Breadcrumbs } from '../chunks/Breadcrumbs_eBFx-ZwG.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Services = createComponent(($$result, $$props, $$slots) => {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Services" }
  ];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Services - Bubbles Enterprise | Aluminum & Vinyl Soffit Specialists Orlando", "description": "Professional aluminum and vinyl soffit services in Orlando. Repairs, replacements, and new construction installations by certified specialists.", "keywords": "soffit services orlando, aluminum soffit installation, vinyl soffit repair, soffit replacement orlando, new construction soffit" }, { "default": ($$result2) => renderTemplate`  ${renderComponent($$result2, "Breadcrumbs", $$Breadcrumbs, { "items": breadcrumbItems })}   ${maybeRenderHead()}<section class="relative py-20 bg-gradient-to-br from-blue-50 to-white"> <div class="container mx-auto px-4"> <div class="max-w-4xl mx-auto text-center"> <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
Our <span class="text-blue-600">Soffit Services</span> </h1> <p class="text-xl text-gray-600 leading-relaxed">
Professional aluminum and vinyl soffit solutions for Orlando homes. 
          From repairs to complete installations, we've got you covered.
</p> </div> </div> </section>  <section class="py-16 bg-white"> <div class="container mx-auto px-4"> <div class="max-w-6xl mx-auto"> <div class="text-center mb-12"> <h2 class="text-3xl font-bold text-gray-900 mb-4">Complete Soffit Solutions</h2> <p class="text-xl text-gray-600">Specializing exclusively in aluminum and vinyl soffit systems</p> </div> <div class="grid md:grid-cols-3 gap-8"> <!-- Repairs --> <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 hover:shadow-lg transition-shadow"> <div class="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6"> <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path> </svg> </div> <h3 class="text-2xl font-bold text-gray-900 mb-4">Soffit Repairs</h3> <p class="text-gray-600 mb-6 leading-relaxed">
Quick and efficient repairs for damaged aluminum and vinyl soffit. 
              We fix storm damage, wear and tear, and ventilation issues.
</p> <ul class="space-y-2 text-gray-600 mb-6"> <li class="flex items-center"> <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Storm damage repair
</li> <li class="flex items-center"> <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Ventilation restoration
</li> <li class="flex items-center"> <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Panel replacement
</li> <li class="flex items-center"> <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Emergency services
</li> </ul> <a href="/services/repairs" class="block w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center">
Learn More
</a> </div> <!-- Remove & Replace --> <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 hover:shadow-lg transition-shadow"> <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6"> <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path> </svg> </div> <h3 class="text-2xl font-bold text-gray-900 mb-4">Remove & Replace</h3> <p class="text-gray-600 mb-6 leading-relaxed">
Complete soffit system replacement with premium aluminum or vinyl materials. 
              Perfect for upgrading old or extensively damaged soffit.
</p> <ul class="space-y-2 text-gray-600 mb-6"> <li class="flex items-center"> <svg class="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Complete system removal
</li> <li class="flex items-center"> <svg class="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Premium material installation
</li> <li class="flex items-center"> <svg class="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Improved ventilation design
</li> <li class="flex items-center"> <svg class="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Warranty included
</li> </ul> <a href="/services/remove-replace" class="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center">
Learn More
</a> </div> <!-- New Construction --> <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 hover:shadow-lg transition-shadow"> <div class="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-6"> <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path> </svg> </div> <h3 class="text-2xl font-bold text-gray-900 mb-4">New Construction</h3> <p class="text-gray-600 mb-6 leading-relaxed">
Professional soffit installation for new homes and additions. 
              We work with builders and homeowners to ensure perfect results.
</p> <ul class="space-y-2 text-gray-600 mb-6"> <li class="flex items-center"> <svg class="w-4 h-4 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
New home installations
</li> <li class="flex items-center"> <svg class="w-4 h-4 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Home additions
</li> <li class="flex items-center"> <svg class="w-4 h-4 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Builder partnerships
</li> <li class="flex items-center"> <svg class="w-4 h-4 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Code compliance
</li> </ul> <a href="/services/new-construction" class="block w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center">
Learn More
</a> </div> </div> </div> </div> </section>  <section class="py-16 bg-gray-50"> <div class="container mx-auto px-4"> <div class="max-w-6xl mx-auto"> <div class="text-center mb-12"> <h2 class="text-3xl font-bold text-gray-900 mb-4">Our Materials</h2> <p class="text-xl text-gray-600">We specialize in two premium soffit materials</p> </div> <div class="grid md:grid-cols-2 gap-12"> <!-- Aluminum --> <div class="bg-white rounded-2xl p-8 shadow-lg"> <div class="flex items-center mb-6"> <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4"> <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z"></path> </svg> </div> <h3 class="text-2xl font-bold text-gray-900">Aluminum Soffit</h3> </div> <p class="text-gray-600 mb-6 leading-relaxed">
Premium aluminum soffit systems designed to withstand Orlando's challenging climate. 
              Excellent for hurricane-prone areas with superior durability.
</p> <div class="grid grid-cols-2 gap-4 mb-6"> <div class="text-center p-4 bg-blue-50 rounded-lg"> <div class="text-2xl font-bold text-blue-600 mb-1">25+</div> <div class="text-sm text-gray-600">Year Lifespan</div> </div> <div class="text-center p-4 bg-blue-50 rounded-lg"> <div class="text-2xl font-bold text-blue-600 mb-1">100%</div> <div class="text-sm text-gray-600">Recyclable</div> </div> </div> <ul class="space-y-2 text-gray-600"> <li class="flex items-center"> <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Hurricane and wind resistant
</li> <li class="flex items-center"> <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Fire resistant properties
</li> <li class="flex items-center"> <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Superior ventilation system
</li> <li class="flex items-center"> <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Low maintenance requirements
</li> </ul> </div> <!-- Vinyl --> <div class="bg-white rounded-2xl p-8 shadow-lg"> <div class="flex items-center mb-6"> <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4"> <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path> </svg> </div> <h3 class="text-2xl font-bold text-gray-900">Vinyl Soffit</h3> </div> <p class="text-gray-600 mb-6 leading-relaxed">
High-quality vinyl soffit offering excellent value and performance. 
              Perfect for homeowners seeking durability at an affordable price point.
</p> <div class="grid grid-cols-2 gap-4 mb-6"> <div class="text-center p-4 bg-green-50 rounded-lg"> <div class="text-2xl font-bold text-green-600 mb-1">15+</div> <div class="text-sm text-gray-600">Year Lifespan</div> </div> <div class="text-center p-4 bg-green-50 rounded-lg"> <div class="text-2xl font-bold text-green-600 mb-1">20+</div> <div class="text-sm text-gray-600">Color Options</div> </div> </div> <ul class="space-y-2 text-gray-600"> <li class="flex items-center"> <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Cost-effective solution
</li> <li class="flex items-center"> <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Moisture and pest resistant
</li> <li class="flex items-center"> <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Wide variety of colors
</li> <li class="flex items-center"> <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Easy installation process
</li> </ul> </div> </div> </div> </div> </section>  <section class="py-16 bg-white"> <div class="container mx-auto px-4"> <div class="max-w-6xl mx-auto"> <div class="text-center mb-12"> <h2 class="text-3xl font-bold text-gray-900 mb-4">Our Process</h2> <p class="text-xl text-gray-600">Simple, transparent, and professional from start to finish</p> </div> <div class="grid md:grid-cols-4 gap-8"> <div class="text-center"> <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"> <span class="text-2xl font-bold text-blue-600">1</span> </div> <h3 class="text-lg font-bold text-gray-900 mb-2">Free Inspection</h3> <p class="text-gray-600 text-sm">Comprehensive assessment of your current soffit system</p> </div> <div class="text-center"> <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"> <span class="text-2xl font-bold text-blue-600">2</span> </div> <h3 class="text-lg font-bold text-gray-900 mb-2">Detailed Quote</h3> <p class="text-gray-600 text-sm">Transparent pricing with no hidden fees or surprises</p> </div> <div class="text-center"> <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"> <span class="text-2xl font-bold text-blue-600">3</span> </div> <h3 class="text-lg font-bold text-gray-900 mb-2">Professional Installation</h3> <p class="text-gray-600 text-sm">Expert installation by certified technicians</p> </div> <div class="text-center"> <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"> <span class="text-2xl font-bold text-blue-600">4</span> </div> <h3 class="text-lg font-bold text-gray-900 mb-2">Quality Guarantee</h3> <p class="text-gray-600 text-sm">Warranty protection and ongoing support</p> </div> </div> </div> </div> </section>  <section class="py-16 bg-gray-50"> <div class="container mx-auto px-4"> <div class="max-w-4xl mx-auto"> <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2> <div class="space-y-6"> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> <h3 class="text-xl font-semibold text-gray-900 mb-3">How long does soffit installation take?</h3> <p class="text-gray-600">Most residential soffit installations in Orlando take 1-3 days depending on the size of your home and complexity of the project. We work efficiently while maintaining our high quality standards.</p> </div> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> <h3 class="text-xl font-semibold text-gray-900 mb-3">What's the difference between aluminum and vinyl soffit?</h3> <p class="text-gray-600">Aluminum soffit offers superior durability and fire resistance, lasting 30+ years in Orlando's climate. Vinyl soffit is more cost-effective upfront but may need replacement sooner due to UV exposure and heat.</p> </div> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> <h3 class="text-xl font-semibold text-gray-900 mb-3">Do you provide warranties on soffit installation?</h3> <p class="text-gray-600">Yes! We offer comprehensive warranties on both materials and workmanship. Aluminum soffit comes with manufacturer warranties up to 30 years, plus our installation guarantee.</p> </div> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> <h3 class="text-xl font-semibold text-gray-900 mb-3">How much does soffit replacement cost in Orlando?</h3> <p class="text-gray-600">Soffit replacement costs vary based on material choice, home size, and project complexity. Use our free calculator for instant estimates, or contact us for a detailed quote tailored to your specific needs.</p> </div> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> <h3 class="text-xl font-semibold text-gray-900 mb-3">Why is proper soffit ventilation important in Florida?</h3> <p class="text-gray-600">Florida's humid climate requires excellent attic ventilation to prevent moisture buildup, mold growth, and energy inefficiency. Properly vented soffit systems help maintain optimal airflow and protect your home's structure.</p> </div> </div> </div> </div> </section>  <section class="py-16 bg-gradient-to-r from-blue-600 to-blue-800"> <div class="container mx-auto px-4"> <div class="max-w-4xl mx-auto text-center"> <h2 class="text-3xl font-bold text-white mb-6">
Ready to Get Started?
</h2> <p class="text-xl text-blue-100 mb-8">
Contact us today for your free estimate and discover why Orlando homeowners 
          choose Bubbles Enterprise for their soffit needs.
</p> <div class="flex flex-col sm:flex-row gap-4 justify-center"> <a href="/quote" class="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center">
Get Free Estimate
<svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path> </svg> </a> <a href="tel:+1234567890" class="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center">
Call Now
<svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path> </svg> </a> </div> </div> </div> </section> `, "head": ($$result2) => renderTemplate(_a || (_a = __template([`<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How long does soffit installation take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Most residential soffit installations in Orlando take 1-3 days depending on the size of your home and complexity of the project. We work efficiently while maintaining our high quality standards."
        }
      },
      {
        "@type": "Question",
        "name": "What's the difference between aluminum and vinyl soffit?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Aluminum soffit offers superior durability and fire resistance, lasting 30+ years in Orlando's climate. Vinyl soffit is more cost-effective upfront but may need replacement sooner due to UV exposure and heat."
        }
      },
      {
        "@type": "Question",
        "name": "Do you provide warranties on soffit installation?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! We offer comprehensive warranties on both materials and workmanship. Aluminum soffit comes with manufacturer warranties up to 30 years, plus our installation guarantee."
        }
      },
      {
        "@type": "Question",
        "name": "How much does soffit replacement cost in Orlando?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Soffit replacement costs vary based on material choice, home size, and project complexity. Use our free calculator for instant estimates, or contact us for a detailed quote tailored to your specific needs."
        }
      },
      {
        "@type": "Question",
        "name": "Why is proper soffit ventilation important in Florida?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Florida's humid climate requires excellent attic ventilation to prevent moisture buildup, mold growth, and energy inefficiency. Properly vented soffit systems help maintain optimal airflow and protect your home's structure."
        }
      }
    ]
  }
  <\/script>`]))) })}`;
}, "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/pages/services.astro", void 0);

const $$file = "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/pages/services.astro";
const $$url = "/services";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Services,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
