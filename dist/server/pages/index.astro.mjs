import { c as createAstro, a as createComponent, m as maybeRenderHead, e as addAttribute, r as renderComponent, F as Fragment, b as renderTemplate, u as unescapeHTML } from '../chunks/vendor_DQmjvFcz.mjs';
export { d as renderers } from '../chunks/vendor_DQmjvFcz.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BEKVeBBQ.mjs';
/* empty css                                 */
import 'clsx';

const $$Astro = createAstro("https://bubblesenterprise.com");
const $$ServiceCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$ServiceCard;
  const {
    title,
    description,
    features,
    image,
    href = "#",
    variant = "default",
    icon
  } = Astro2.props;
  const cardClasses = variant === "featured" ? "bg-gradient-to-br from-bubble-blue to-bubble-dark text-white transform scale-105 shadow-2xl" : "bg-white hover:shadow-xl";
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(`rounded-xl p-6 lg:p-8 transition-all duration-300 hover:-translate-y-2 ${cardClasses}`, "class")} data-astro-cid-uhzbvkqe> <!-- Icon or Image --> ${icon ? renderTemplate`<div class="mb-6" data-astro-cid-uhzbvkqe> <div${addAttribute(`w-16 h-16 rounded-lg flex items-center justify-center ${variant === "featured" ? "bg-white/20" : "bg-bubble-light/10"}`, "class")} data-astro-cid-uhzbvkqe> ${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${unescapeHTML(icon)}` })} </div> </div>` : image && renderTemplate`<div class="mb-6 overflow-hidden rounded-lg" data-astro-cid-uhzbvkqe> <img${addAttribute(image, "src")}${addAttribute(title, "alt")} class="w-full h-48 object-cover transition-transform duration-300 hover:scale-110" loading="lazy" data-astro-cid-uhzbvkqe> </div>`} <!-- Content --> <div class="space-y-4" data-astro-cid-uhzbvkqe> <h3${addAttribute(`text-xl lg:text-2xl font-bold ${variant === "featured" ? "text-white" : "text-neutral-gray-900"}`, "class")} data-astro-cid-uhzbvkqe> ${title} </h3> <p${addAttribute(`text-base lg:text-lg leading-relaxed ${variant === "featured" ? "text-white/90" : "text-neutral-gray-600"}`, "class")} data-astro-cid-uhzbvkqe> ${description} </p> <!-- Features List --> ${features.length > 0 && renderTemplate`<ul class="space-y-2" data-astro-cid-uhzbvkqe> ${features.map((feature) => renderTemplate`<li${addAttribute(`flex items-start space-x-3 ${variant === "featured" ? "text-white/90" : "text-neutral-gray-600"}`, "class")} data-astro-cid-uhzbvkqe> <svg${addAttribute(`w-5 h-5 mt-0.5 flex-shrink-0 ${variant === "featured" ? "text-bubble-light" : "text-bubble-primary"}`, "class")} fill="currentColor" viewBox="0 0 20 20" data-astro-cid-uhzbvkqe> <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" data-astro-cid-uhzbvkqe></path> </svg> <span data-astro-cid-uhzbvkqe>${feature}</span> </li>`)} </ul>`} <!-- CTA Button --> <div class="pt-4" data-astro-cid-uhzbvkqe> ${title === "Repairs & Maintenance" ? renderTemplate`<button onclick="openServiceModal('repair')"${addAttribute(`inline-flex items-center justify-center w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${variant === "featured" ? "bg-white text-bubble-primary hover:bg-bubble-light hover:text-white shadow-lg" : "bg-bubble-primary text-white hover:bg-bubble-secondary shadow-lg hover:shadow-xl"}`, "class")} data-astro-cid-uhzbvkqe> <span data-astro-cid-uhzbvkqe>🔧 Get Your Repair Now</span> </button>` : title === "Remove & Replace" ? renderTemplate`<button onclick="openServiceModal('remove-replace')"${addAttribute(`inline-flex items-center justify-center w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${variant === "featured" ? "bg-white text-bubble-primary hover:bg-bubble-light hover:text-white shadow-lg" : "bg-bubble-primary text-white hover:bg-bubble-secondary shadow-lg hover:shadow-xl"}`, "class")} data-astro-cid-uhzbvkqe> <span data-astro-cid-uhzbvkqe>🏠 Request Quote</span> </button>` : title === "New Construction" ? renderTemplate`<button onclick="openServiceModal('new-construction')"${addAttribute(`inline-flex items-center justify-center w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${variant === "featured" ? "bg-white text-bubble-primary hover:bg-bubble-light hover:text-white shadow-lg" : "bg-bubble-primary text-white hover:bg-bubble-secondary shadow-lg hover:shadow-xl"}`, "class")} data-astro-cid-uhzbvkqe> <span data-astro-cid-uhzbvkqe>🏗️ Construction Quote</span> </button>` : renderTemplate`<a${addAttribute(href, "href")}${addAttribute(`inline-flex items-center space-x-2 font-semibold transition-all duration-200 ${variant === "featured" ? "text-white hover:text-bubble-light border-b-2 border-white/30 hover:border-bubble-light pb-1" : "text-bubble-primary hover:text-bubble-secondary border-b-2 border-bubble-primary/30 hover:border-bubble-secondary pb-1"}`, "class")} data-astro-cid-uhzbvkqe> <span data-astro-cid-uhzbvkqe>Learn More</span> <svg class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-uhzbvkqe> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" data-astro-cid-uhzbvkqe></path> </svg> </a>`} </div> </div> </div> `;
}, "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/components/ServiceCard.astro", void 0);

const $$ServicesSection = createComponent(($$result, $$props, $$slots) => {
  const services = [
    {
      title: "Repairs & Maintenance",
      description: "Quick and reliable repair services for damaged soffit and fascia, including storm damage restoration and preventive maintenance.",
      features: [
        "Emergency repair services",
        "Storm damage restoration",
        "Preventive maintenance plans",
        "Color matching existing materials",
        "Same-day service available"
      ],
      href: "/services/repairs",
      variant: "featured",
      icon: `<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
    </svg>`
    },
    {
      title: "Remove & Replace",
      description: "Expert removal of old, damaged soffit and fascia with complete replacement using modern, durable materials that enhance your property value.",
      features: [
        "Safe removal of old materials",
        "Damage assessment and repair",
        "Upgraded ventilation systems",
        "Seamless integration",
        "Cleanup and disposal included"
      ],
      href: "/services/remove-replace",
      variant: "default",
      icon: `<svg class="w-8 h-8 text-bubble-primary" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd"/>
      <path fill-rule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 2a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
    </svg>`
    },
    {
      title: "New Construction",
      description: "Complete soffit and fascia installation for new residential and commercial buildings with premium materials and expert craftsmanship.",
      features: [
        "Premium aluminum and vinyl materials",
        "Custom color matching",
        "Professional installation team",
        "Code compliance guarantee",
        "10-year warranty"
      ],
      href: "/services/new-construction",
      variant: "default",
      icon: `<svg class="w-8 h-8 text-bubble-primary" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
    </svg>`
    }
  ];
  return renderTemplate`${maybeRenderHead()}<section class="py-16 lg:py-24 bg-neutral-gray-50" data-astro-cid-satlbe6z> <div class="container-custom" data-astro-cid-satlbe6z> <!-- Section Header --> <div class="text-center mb-12 lg:mb-16" data-astro-cid-satlbe6z> <h2 class="text-3xl lg:text-4xl xl:text-5xl font-bold text-neutral-gray-900 mb-4" data-astro-cid-satlbe6z>
Our <span class="text-bubble-primary" data-astro-cid-satlbe6z>Services</span> </h2> <p class="text-lg lg:text-xl text-neutral-gray-600 max-w-3xl mx-auto leading-relaxed" data-astro-cid-satlbe6z>
Professional soffit and fascia solutions for residential and commercial properties in Orlando. 
        Quality workmanship with materials that last.
</p> </div> <!-- Services Grid --> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10" data-astro-cid-satlbe6z> ${services.map((service) => renderTemplate`${renderComponent($$result, "ServiceCard", $$ServiceCard, { "title": service.title, "description": service.description, "features": service.features, "href": service.href, "variant": service.variant, "icon": service.icon, "data-astro-cid-satlbe6z": true })}`)} </div> <!-- Bottom CTA --> <div class="text-center mt-12 lg:mt-16" data-astro-cid-satlbe6z> <div class="bg-white rounded-2xl p-8 lg:p-12 shadow-lg max-w-4xl mx-auto" data-astro-cid-satlbe6z> <h3 class="text-2xl lg:text-3xl font-bold text-neutral-gray-900 mb-4" data-astro-cid-satlbe6z>
Need a Custom Solution?
</h3> <p class="text-lg text-neutral-gray-600 mb-6 max-w-2xl mx-auto" data-astro-cid-satlbe6z>
Every project is unique. Contact us for a personalized consultation and free estimate 
          tailored to your specific needs.
</p> <div class="flex flex-col sm:flex-row gap-4 justify-center items-center" data-astro-cid-satlbe6z> <a href="/quote" class="btn-primary" data-astro-cid-satlbe6z>
Get Free Quote
</a> <a href="tel:+1-407-715-1790" class="btn-secondary" data-astro-cid-satlbe6z>
Call (407) 715-1790
</a> </div> </div> </div> </div> </section> `;
}, "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/components/ServicesSection.astro", void 0);

const $$ModernCarousel = createComponent(($$result, $$props, $$slots) => {
  const projects = [
    { src: "/images/works/work1.jpeg", alt: "Professional soffit and fascia project in residential Orlando FL - Bubbles Enterprise" },
    { src: "/images/works/work2.jpeg", alt: "Commercial soffit installation services in Orlando FL - Expert contractors" },
    { src: "/images/works/work3.jpeg", alt: "Fascia repair project in Winter Park FL - Quality soffit and fascia solutions" },
    { src: "/images/works/work4.jpeg", alt: "New construction soffit and fascia installation Orlando FL - Licensed experts" },
    { src: "/images/works/work5.jpeg", alt: "Residential soffit replacement in Orlando area - Durable materials guaranteed" },
    { src: "/images/works/work6.jpeg", alt: "Soffit design project for homes in Orlando FL - 10+ years experience" },
    { src: "/images/works/work7.jpeg", alt: "Residential fascia installation Orlando FL - Professional craftsmanship" },
    { src: "/images/works/work8.jpeg", alt: "Commercial soffit services in Winter Park FL - Trusted local contractors" },
    { src: "/images/works/work9.jpeg", alt: "Fascia maintenance and repair in Orlando FL - White Aluminum Soffit" },
    { src: "/images/works/work10.jpeg", alt: "Complete soffit and fascia project in Orlando FL - Black Soffit Gable" },
    { src: "/images/works/work11.jpeg", alt: "Advanced soffit and fascia installation for luxury homes Orlando FL - Ceiling" },
    { src: "/images/works/work12.jpeg", alt: "Comprehensive soffit and fascia renovation project Orlando FL  - Remove and Replace Soffit" }
  ];
  return renderTemplate`${maybeRenderHead()}<section class="py-16 lg:py-24 bg-white" data-astro-cid-n7eman4h> <div class="container-custom" data-astro-cid-n7eman4h> <div class="text-center mb-16" data-astro-cid-n7eman4h> <h2 class="text-4xl md:text-5xl font-bold text-neutral-gray-900 mb-6" data-astro-cid-n7eman4h>
Our <span class="text-gradient" data-astro-cid-n7eman4h>Project</span> Gallery
</h2> <p class="text-xl text-neutral-gray-600 max-w-3xl mx-auto" data-astro-cid-n7eman4h>
Explore our latest soffit and fascia projects in Orlando and surrounding areas. Each installation demonstrates Bubbles Enterprise's commitment to quality craftsmanship, durable materials, and customer satisfaction with over 10 years of licensed expertise in Florida.
</p> </div> <!-- Optimized Project Grid for SEO and Performance --> <div class="project-grid" role="region" aria-label="Soffit and Fascia Project Gallery Orlando FL" data-astro-cid-n7eman4h> ${projects.map((project, index) => renderTemplate`<article${addAttribute(index, "key")} class="project-item" itemscope itemtype="https://schema.org/ImageObject" data-astro-cid-n7eman4h> <img${addAttribute(project.src, "src")}${addAttribute(project.alt, "alt")} class="project-image"${addAttribute(index < 4 ? "eager" : "lazy", "loading")} width="400" height="300" itemprop="contentUrl" data-astro-cid-n7eman4h> <div class="project-overlay" data-astro-cid-n7eman4h> <figcaption class="project-caption" itemprop="caption" data-astro-cid-n7eman4h>${project.alt.split(" - ")[1] || `Project ${index + 1}`}</figcaption> </div> </article>`)} </div> <div class="text-center mt-8" data-astro-cid-n7eman4h> <a href="/gallery" class="btn-modern btn-primary inline-flex items-center gap-2" rel="nofollow" data-astro-cid-n7eman4h>
View Full Gallery
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-n7eman4h> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" data-astro-cid-n7eman4h></path> </svg> </a> </div> </div> </section> <!-- SEO-Optimized Lightbox Modal --> <div id="lightboxModal" class="fixed inset-0 bg-black/90 hidden z-50 flex items-center justify-center p-4" data-astro-cid-n7eman4h> <div class="relative w-full h-full max-w-4xl max-h-[90vh]" data-astro-cid-n7eman4h> <!-- Close Button --> <button id="closeLightbox" class="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 transition-colors bg-bubble-blue/80 hover:bg-bubble-blue px-4 py-2 rounded" aria-label="Close lightbox gallery" data-astro-cid-n7eman4h>
Close
</button> <!-- Navigation --> <button id="prevLightbox" class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300" aria-label="Previous image" data-astro-cid-n7eman4h>
‹
</button> <button id="nextLightbox" class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300" aria-label="Next image" data-astro-cid-n7eman4h>
›
</button> <!-- Image Container --> <div class="lightbox-container" data-astro-cid-n7eman4h> <img id="lightboxImage" src="" alt="" class="w-full h-full object-contain" data-astro-cid-n7eman4h> </div> <!-- Caption --> <div id="lightboxCaption" class="absolute bottom-4 left-4 right-4 text-white text-center bg-black/50 p-2 rounded" data-astro-cid-n7eman4h> <p class="text-sm" data-astro-cid-n7eman4h></p> </div> </div> </div>  `;
}, "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/components/ModernCarousel.astro", void 0);

const $$FeaturedChatBotWrapper = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="featured-chatbot-container" class="w-full max-w-2xl mx-auto"> <div id="featured-chatbot-mount"></div> </div> `;
}, "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/components/FeaturedChatBotWrapper.astro", void 0);

const $$ServiceModalWrapper = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="service-modal-root"></div> `;
}, "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/components/ServiceModalWrapper.astro", void 0);

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Bubbles Enterprise - #1 Soffit & Fascia Contractors Orlando FL | Free Estimates", "description": "Top-rated soffit & fascia installation, repair & replacement in Orlando, FL. Licensed contractors with 10+ years experience. Free estimates, 100% satisfaction guarantee. Call (407) 715-1790!", "keywords": "soffit installation Orlando, fascia repair Orlando FL, aluminum soffit contractors, vinyl soffit installation, Orlando home improvement, fascia replacement Florida, licensed soffit contractors, Orlando construction services", "transparentHeader": true, "data-astro-cid-j7pv25f6": true }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<section id="home" class="relative min-h-screen flex items-center justify-center overflow-hidden" data-astro-cid-j7pv25f6> <!-- Background Gradient --> <div class="absolute inset-0 gradient-blue" data-astro-cid-j7pv25f6></div> <!-- Background Pattern --> <div class="absolute inset-0 opacity-10" data-astro-cid-j7pv25f6> <svg class="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" data-astro-cid-j7pv25f6> <defs data-astro-cid-j7pv25f6> <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse" data-astro-cid-j7pv25f6> <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5" data-astro-cid-j7pv25f6></path> </pattern> </defs> <rect width="100" height="100" fill="url(#grid)" data-astro-cid-j7pv25f6></rect> </svg> </div> <!-- Floating Elements --> <div class="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float" data-astro-cid-j7pv25f6></div> <div class="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-float" style="animation-delay: 1s;" data-astro-cid-j7pv25f6></div> <div class="absolute bottom-40 left-20 w-12 h-12 bg-white/10 rounded-full animate-float" style="animation-delay: 2s;" data-astro-cid-j7pv25f6></div> <!-- Hero Content --> <div class="relative z-10 container-custom text-center text-white" data-astro-cid-j7pv25f6> <!-- Main Logo Typography --> <div class="mb-8 animate-fade-in" data-astro-cid-j7pv25f6> <h1 class="font-display font-bold text-6xl md:text-8xl lg:text-9xl mb-4" data-astro-cid-j7pv25f6> <span class="block text-white" data-astro-cid-j7pv25f6>Bubbles</span> <span class="block text-bubble-light text-5xl md:text-7xl lg:text-8xl -mt-4" data-astro-cid-j7pv25f6>Enterprise</span> </h1> <div class="w-32 h-1 bg-bubble-light mx-auto rounded-full" data-astro-cid-j7pv25f6></div> </div> <!-- Tagline --> <div class="mb-12 animate-slide-up" style="animation-delay: 0.3s;" data-astro-cid-j7pv25f6> <p class="text-xl md:text-2xl lg:text-3xl font-light text-bubble-light mb-4" data-astro-cid-j7pv25f6>
Soffit & Fascia Specialists
</p> <p class="text-lg md:text-xl text-white/90 max-w-2xl mx-auto" data-astro-cid-j7pv25f6>
Professional construction services in Orlando, FL and surrounding areas throughout Central Florida. Quality workmanship with guaranteed results.
</p> </div> <!-- CTA Buttons --> <div class="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style="animation-delay: 0.6s;" data-astro-cid-j7pv25f6> <a href="/quote" class="btn bg-white text-bubble-blue hover:bg-bubble-light hover:text-bubble-dark px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300" data-astro-cid-j7pv25f6>
Get Free Quote
</a> <a href="/calculator" class="btn bg-transparent text-white border-2 border-white hover:bg-white hover:text-bubble-blue px-8 py-4 text-lg font-semibold transition-all duration-300" data-astro-cid-j7pv25f6>
Cost Calculator
</a> </div> <!-- Trust Indicators --> <div class="mt-16 animate-fade-in" style="animation-delay: 0.9s;" data-astro-cid-j7pv25f6> <div class="flex flex-col sm:flex-row items-center justify-center gap-8 text-bubble-light" data-astro-cid-j7pv25f6> <div class="flex items-center gap-2" data-astro-cid-j7pv25f6> <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" data-astro-cid-j7pv25f6> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" data-astro-cid-j7pv25f6></path> </svg> <span class="font-medium" data-astro-cid-j7pv25f6>Licensed & Insured</span> </div> <div class="flex items-center gap-2" data-astro-cid-j7pv25f6> <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" data-astro-cid-j7pv25f6> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" data-astro-cid-j7pv25f6></path> </svg> <span class="font-medium" data-astro-cid-j7pv25f6>10+ Years Experience</span> </div> <div class="flex items-center gap-2" data-astro-cid-j7pv25f6> <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" data-astro-cid-j7pv25f6> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" data-astro-cid-j7pv25f6></path> </svg> <span class="font-medium" data-astro-cid-j7pv25f6>100% Satisfaction Guarantee</span> </div> </div> </div> </div> <!-- Scroll Indicator --> <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-gentle" data-astro-cid-j7pv25f6> <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" data-astro-cid-j7pv25f6></path> </svg> </div> </section>  <section id="chat" class="py-16 bg-gradient-to-br from-bubble-light/5 to-bubble-blue/5" data-astro-cid-j7pv25f6> <div class="container-custom" data-astro-cid-j7pv25f6> <div class="text-center mb-12" data-astro-cid-j7pv25f6> <h2 class="text-4xl md:text-5xl font-bold text-neutral-gray-900 mb-4" data-astro-cid-j7pv25f6>
🚀 <span class="text-gradient" data-astro-cid-j7pv25f6>Revolutionary!</span> AI Chat Assistant
</h2> <p class="text-xl text-neutral-gray-600 max-w-3xl mx-auto" data-astro-cid-j7pv25f6>
Chat now with our specialized soffit and fascia assistant. 
          Get instant quotes, ask questions and schedule your free inspection!
</p> </div> <div class="flex justify-center" data-astro-cid-j7pv25f6> ${renderComponent($$result2, "FeaturedChatBotWrapper", $$FeaturedChatBotWrapper, { "data-astro-cid-j7pv25f6": true })} </div> <div class="text-center mt-8" data-astro-cid-j7pv25f6> <div class="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-lg border border-bubble-blue/20" data-astro-cid-j7pv25f6> <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse" data-astro-cid-j7pv25f6></div> <span class="text-sm font-medium text-neutral-gray-700" data-astro-cid-j7pv25f6>Assistant online now</span> </div> </div> </div> </section>  <div id="services" data-astro-cid-j7pv25f6> ${renderComponent($$result2, "ServicesSection", $$ServicesSection, { "data-astro-cid-j7pv25f6": true })} </div>  ${renderComponent($$result2, "ModernCarousel", $$ModernCarousel, { "data-astro-cid-j7pv25f6": true })}  <section id="about" class="section" data-astro-cid-j7pv25f6> <div class="container-custom" data-astro-cid-j7pv25f6> <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center" data-astro-cid-j7pv25f6> <div data-astro-cid-j7pv25f6> <h2 class="text-4xl md:text-5xl font-bold text-neutral-gray-900 mb-6" data-astro-cid-j7pv25f6>
Why Choose <span class="text-gradient" data-astro-cid-j7pv25f6>Bubbles Enterprise</span>?
</h2> <p class="text-xl text-neutral-gray-600 mb-8" data-astro-cid-j7pv25f6>
With over 10 years of experience in Orlando, we deliver exceptional quality and customer service.
</p> <div class="space-y-6" data-astro-cid-j7pv25f6> <div class="flex items-start gap-4" data-astro-cid-j7pv25f6> <div class="w-8 h-8 bg-bubble-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" data-astro-cid-j7pv25f6> <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" data-astro-cid-j7pv25f6></path> </svg> </div> <div data-astro-cid-j7pv25f6> <h3 class="text-lg font-semibold text-neutral-gray-900 mb-2" data-astro-cid-j7pv25f6>Licensed & Insured</h3> <p class="text-neutral-gray-600" data-astro-cid-j7pv25f6>Fully licensed and insured for your peace of mind and protection. <a href="/about" class="text-blue-600 hover:text-blue-800 underline" data-astro-cid-j7pv25f6>Learn about our certifications</a>.</p> </div> </div> <div class="flex items-start gap-4" data-astro-cid-j7pv25f6> <div class="w-8 h-8 bg-bubble-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" data-astro-cid-j7pv25f6> <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" data-astro-cid-j7pv25f6></path> </svg> </div> <div data-astro-cid-j7pv25f6> <h3 class="text-lg font-semibold text-neutral-gray-900 mb-2" data-astro-cid-j7pv25f6>Quality Materials</h3> <p class="text-neutral-gray-600" data-astro-cid-j7pv25f6>We use only premium materials that withstand Florida's climate. <a href="/services" class="text-blue-600 hover:text-blue-800 underline" data-astro-cid-j7pv25f6>Explore our material options</a>.</p> </div> </div> <div class="flex items-start gap-4" data-astro-cid-j7pv25f6> <div class="w-8 h-8 bg-bubble-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" data-astro-cid-j7pv25f6> <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" data-astro-cid-j7pv25f6></path> </svg> </div> <div data-astro-cid-j7pv25f6> <h3 class="text-lg font-semibold text-neutral-gray-900 mb-2" data-astro-cid-j7pv25f6>Satisfaction Guarantee</h3> <p class="text-neutral-gray-600" data-astro-cid-j7pv25f6>100% satisfaction guarantee on all our work and services.</p> </div> </div> <div class="flex items-start gap-4" data-astro-cid-j7pv25f6> <div class="w-8 h-8 bg-bubble-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" data-astro-cid-j7pv25f6> <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" data-astro-cid-j7pv25f6></path> </svg> </div> <div data-astro-cid-j7pv25f6> <h3 class="text-lg font-semibold text-neutral-gray-900 mb-2" data-astro-cid-j7pv25f6>Free Estimates</h3> <p class="text-neutral-gray-600" data-astro-cid-j7pv25f6>Get detailed, no-obligation estimates for your project. <a href="/quote" class="text-blue-600 hover:text-blue-800 underline" data-astro-cid-j7pv25f6>Request your free quote</a> or use our <a href="/calculator" class="text-blue-600 hover:text-blue-800 underline" data-astro-cid-j7pv25f6>online calculator</a>.</p> </div> </div> </div> </div> <div class="relative" data-astro-cid-j7pv25f6> <div class="aspect-square bg-gradient-light rounded-2xl p-8 flex items-center justify-center" data-astro-cid-j7pv25f6> <div class="text-center" data-astro-cid-j7pv25f6> <div class="logo-text text-6xl mb-4" data-astro-cid-j7pv25f6>
Bubbles<span class="logo-accent" data-astro-cid-j7pv25f6>Enterprise</span> </div> <p class="text-bubble-dark font-medium text-lg" data-astro-cid-j7pv25f6>
Your Trusted Partner in Orlando
</p> </div> </div> <!-- Decorative elements --> <div class="absolute -top-4 -right-4 w-24 h-24 bg-bubble-blue/10 rounded-full" data-astro-cid-j7pv25f6></div> <div class="absolute -bottom-4 -left-4 w-32 h-32 bg-bubble-accent/10 rounded-full" data-astro-cid-j7pv25f6></div> </div> </div> </div> </section>  <section class="py-16 bg-white" data-astro-cid-j7pv25f6> <div class="container mx-auto px-4" data-astro-cid-j7pv25f6> <div class="max-w-6xl mx-auto" data-astro-cid-j7pv25f6> <div class="text-center mb-12" data-astro-cid-j7pv25f6> <h2 class="text-3xl font-bold text-gray-900 mb-4" data-astro-cid-j7pv25f6>Serving Orlando and Surrounding Areas</h2> <p class="text-xl text-gray-600" data-astro-cid-j7pv25f6>Professional soffit and fascia services</p> </div> <div class="grid md:grid-cols-2 gap-12 items-center" data-astro-cid-j7pv25f6> <div data-astro-cid-j7pv25f6> <h3 class="text-2xl font-semibold text-gray-900 mb-6" data-astro-cid-j7pv25f6>Where Do We Provide Soffit Services?</h3> <p class="text-gray-600 mb-6 leading-relaxed" data-astro-cid-j7pv25f6>
Bubbles Enterprise proudly serves Orlando, FL and all surrounding communities throughout Central Florida. 
              Our experienced team brings professional <a href="/services" class="text-blue-600 hover:text-blue-800 underline" data-astro-cid-j7pv25f6>soffit installation, repair, and replacement services</a> directly to your neighborhood. 
              Learn more <a href="/about" class="text-blue-600 hover:text-blue-800 underline" data-astro-cid-j7pv25f6>about our company</a> and get a <a href="/calculator" class="text-blue-600 hover:text-blue-800 underline" data-astro-cid-j7pv25f6>free cost estimate</a> today.
</p> <div class="grid grid-cols-2 gap-4 text-sm" data-astro-cid-j7pv25f6> <div class="space-y-2" data-astro-cid-j7pv25f6> <div class="flex items-center text-gray-700" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-astro-cid-j7pv25f6></path> </svg>
Orlando
</div> <div class="flex items-center text-gray-700" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-astro-cid-j7pv25f6></path> </svg>
Winter Park
</div> <div class="flex items-center text-gray-700" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-astro-cid-j7pv25f6></path> </svg>
Kissimmee
</div> <div class="flex items-center text-gray-700" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-astro-cid-j7pv25f6></path> </svg>
Sanford
</div> </div> <div class="space-y-2" data-astro-cid-j7pv25f6> <div class="flex items-center text-gray-700" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-astro-cid-j7pv25f6></path> </svg>
Apopka
</div> <div class="flex items-center text-gray-700" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-astro-cid-j7pv25f6></path> </svg>
Altamonte Springs
</div> <div class="flex items-center text-gray-700" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-astro-cid-j7pv25f6></path> </svg>
Oviedo
</div> <div class="flex items-center text-gray-700" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-astro-cid-j7pv25f6></path> </svg>
Lake Mary
</div> </div> </div> </div> <div class="bg-blue-50 p-8 rounded-2xl" data-astro-cid-j7pv25f6> <h4 class="text-xl font-semibold text-gray-900 mb-4" data-astro-cid-j7pv25f6>Why Choose Local Orlando Soffit Experts?</h4> <ul class="space-y-3 text-gray-600" data-astro-cid-j7pv25f6> <li class="flex items-start" data-astro-cid-j7pv25f6> <svg class="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-astro-cid-j7pv25f6></path> </svg> <span data-astro-cid-j7pv25f6>Understanding of Florida's unique climate challenges</span> </li> <li class="flex items-start" data-astro-cid-j7pv25f6> <svg class="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-astro-cid-j7pv25f6></path> </svg> <span data-astro-cid-j7pv25f6>Quick response times within Central Florida</span> </li> <li class="flex items-start" data-astro-cid-j7pv25f6> <svg class="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-astro-cid-j7pv25f6></path> </svg> <span data-astro-cid-j7pv25f6>Licensed and insured in Florida</span> </li> <li class="flex items-start" data-astro-cid-j7pv25f6> <svg class="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-astro-cid-j7pv25f6></path> </svg> <span data-astro-cid-j7pv25f6>Established relationships with local suppliers</span> </li> </ul> </div> </div> </div> </div> </section>  <section id="contact" class="section gradient-blue" data-astro-cid-j7pv25f6> <div class="container-custom text-center text-white" data-astro-cid-j7pv25f6> <h2 class="text-4xl md:text-5xl font-bold mb-6" data-astro-cid-j7pv25f6>
Ready to Get Started?
</h2> <p class="text-xl mb-8 max-w-2xl mx-auto" data-astro-cid-j7pv25f6>
Contact us today for a free estimate on your soffit and fascia project. We're here to help!
</p> <div class="flex flex-col sm:flex-row gap-4 justify-center" data-astro-cid-j7pv25f6> <a href="/quote" class="btn bg-white text-bubble-blue hover:bg-bubble-light px-8 py-4 text-lg font-semibold" data-astro-cid-j7pv25f6>
Get Free Quote
</a> <a href="tel:+1-407-715-1790" class="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-bubble-blue px-8 py-4 text-lg font-semibold" data-astro-cid-j7pv25f6>
Call Now: (407) 715-1790
</a> </div> </div> </section>  ${renderComponent($$result2, "ServiceModalWrapper", $$ServiceModalWrapper, { "data-astro-cid-j7pv25f6": true })} ` })} `;
}, "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/pages/index.astro", void 0);

const $$file = "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
