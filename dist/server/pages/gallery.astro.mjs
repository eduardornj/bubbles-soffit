import { a as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead, e as addAttribute } from '../chunks/vendor_DQmjvFcz.mjs';
export { d as renderers } from '../chunks/vendor_DQmjvFcz.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BEKVeBBQ.mjs';

const $$Gallery = createComponent(($$result, $$props, $$slots) => {
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
    { src: "/images/works/work12.jpeg", alt: "Comprehensive soffit and fascia renovation project Orlando FL - Remove and Replace Soffit" }
  ];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Project Gallery - Soffit and Fascia Work in Orlando FL | Bubbles Enterprise", "description": "Browse our complete gallery of soffit and fascia projects in Orlando, Winter Park, and surrounding areas. See quality craftsmanship and professional installations by licensed experts.", "keywords": "soffit gallery Orlando, fascia projects Florida, residential soffit installation, commercial fascia repair, Orlando home improvement" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main> <!-- Hero Section --> <section class="py-16 lg:py-24 bg-gradient-to-br from-bubble-blue to-bubble-purple text-white"> <div class="container-custom text-center"> <h1 class="text-4xl md:text-6xl font-bold mb-6">
Project <span class="text-gradient-white">Gallery</span> </h1> <p class="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
Explore our portfolio of professional soffit and fascia installations across Orlando and Central Florida
</p> </div> </section> <!-- Gallery Grid --> <section class="py-16 lg:py-24 bg-white"> <div class="container-custom"> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"> ${projects.map((project, index) => renderTemplate`<article${addAttribute(index, "key")} class="group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" itemscope itemtype="https://schema.org/ImageObject"> <div class="relative aspect-[4/3] overflow-hidden"> <img${addAttribute(project.src, "src")}${addAttribute(project.alt, "alt")} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"${addAttribute(index < 8 ? "eager" : "lazy", "loading")} width="400" height="300" itemprop="contentUrl"> <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center"> <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300"> <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path> </svg> </div> </div> </div> <div class="p-4 bg-white"> <h3 class="font-semibold text-neutral-gray-900 mb-2" itemprop="caption"> ${project.alt.split(" - ")[1] || `Project ${index + 1}`} </h3> <p class="text-sm text-neutral-gray-600"> ${project.alt.split(" - ")[0]} </p> </div> </article>`)} </div> <!-- Call to Action --> <div class="text-center mt-16"> <h2 class="text-3xl font-bold text-neutral-gray-900 mb-6">
Ready to Start Your Project?
</h2> <p class="text-xl text-neutral-gray-600 mb-8 max-w-2xl mx-auto">
Get a free estimate for your soffit and fascia project. Licensed professionals with over 10 years of experience in Orlando.
</p> <a href="/quote" class="btn-modern btn-primary inline-flex items-center gap-2">
Get Free Quote
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path> </svg> </a> </div> </div> </section> </main>  <div id="lightboxModal" class="fixed inset-0 bg-black/90 hidden z-50 flex items-center justify-center p-4"> <div class="relative w-full h-full max-w-6xl max-h-[90vh]"> <!-- Close Button --> <button id="closeLightbox" class="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 transition-colors bg-bubble-blue/80 hover:bg-bubble-blue px-4 py-2 rounded z-10" aria-label="Close lightbox gallery">
✕
</button> <!-- Navigation --> <button id="prevLightbox" class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300 z-10" aria-label="Previous image">
‹
</button> <button id="nextLightbox" class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300 z-10" aria-label="Next image">
›
</button> <!-- Image Container --> <div class="lightbox-container w-full h-full flex items-center justify-center"> <img id="lightboxImage" src="" alt="" class="max-w-full max-h-full object-contain"> </div> <!-- Caption --> <div id="lightboxCaption" class="absolute bottom-4 left-4 right-4 text-white text-center bg-black/50 p-4 rounded"> <p class="text-lg font-semibold"></p> </div> </div> </div>  ` })}`;
}, "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/pages/gallery.astro", void 0);

const $$file = "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/pages/gallery.astro";
const $$url = "/gallery";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Gallery,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
