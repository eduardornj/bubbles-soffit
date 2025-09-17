import { c as createAstro, a as createComponent, m as maybeRenderHead, e as addAttribute, b as renderTemplate, r as renderComponent, g as renderSlot, h as renderHead, u as unescapeHTML } from './vendor_DQmjvFcz.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                       */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const $$Astro$1 = createAstro("https://bubblesenterprise.com");
const $$Header = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Header;
  const { transparent = false } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<header${addAttribute(`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${transparent ? "bg-transparent" : "bg-white/95 backdrop-blur-md shadow-soft"}`, "class")}> <div class="container-custom"> <div class="flex items-center justify-between py-4"> <!-- Logo --> <div class="flex items-center space-x-2"> <a href="/" class="flex items-center space-x-2 group"> <!-- Logo Icon --> <div class="w-10 h-10 bg-gradient-to-br from-bubble-primary to-bubble-secondary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200"> <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"> <circle cx="12" cy="8" r="3" opacity="0.8"></circle> <circle cx="8" cy="14" r="2.5" opacity="0.6"></circle> <circle cx="16" cy="14" r="2.5" opacity="0.6"></circle> <circle cx="12" cy="18" r="1.5" opacity="0.4"></circle> </svg> </div> <!-- Logo Text --> <div class="hidden sm:block"> <div${addAttribute(`logo-text font-display font-bold text-xl leading-none ${transparent ? "text-white" : "text-bubble-primary"}`, "class")}>
Bubbles
</div> <div${addAttribute(`logo-text font-display font-medium text-sm leading-none ${transparent ? "text-bubble-light" : "text-bubble-secondary"}`, "class")}>
Enterprise
</div> </div> </a> </div> <!-- Desktop Navigation --> <nav class="hidden lg:flex items-center space-x-8"> <a href="/"${addAttribute(`nav-link font-medium transition-colors duration-200 hover:text-bubble-primary ${transparent ? "text-white hover:text-bubble-light" : "text-neutral-gray-700"}`, "class")}>
Home
</a> <a href="/services"${addAttribute(`nav-link font-medium transition-colors duration-200 hover:text-bubble-primary ${transparent ? "text-white hover:text-bubble-light" : "text-neutral-gray-700"}`, "class")}>
Services
</a> <a href="/about"${addAttribute(`nav-link font-medium transition-colors duration-200 hover:text-bubble-primary ${transparent ? "text-white hover:text-bubble-light" : "text-neutral-gray-700"}`, "class")}>
About
</a> <a href="/calculator"${addAttribute(`nav-link font-medium transition-colors duration-200 hover:text-bubble-primary ${transparent ? "text-white hover:text-bubble-light" : "text-neutral-gray-700"}`, "class")}>
Calculator
</a> <a href="/certifications"${addAttribute(`nav-link font-medium transition-colors duration-200 hover:text-bubble-primary ${transparent ? "text-white hover:text-bubble-light" : "text-neutral-gray-700"}`, "class")}>
Certifications
</a> <a href="/quote"${addAttribute(`nav-link font-medium transition-colors duration-200 hover:text-bubble-primary ${transparent ? "text-white hover:text-bubble-light" : "text-neutral-gray-700"}`, "class")}>
Contact
</a> </nav> <!-- CTA Button --> <div class="hidden md:flex items-center space-x-4"> <a href="tel:+1-407-715-1790"${addAttribute(`phone-link font-medium transition-colors duration-200 ${transparent ? "text-white hover:text-bubble-light" : "text-neutral-gray-700 hover:text-bubble-primary"}`, "class")}>
(407) 715-1790
</a> <a href="/quote" class="btn-primary">
Free Quote
</a> </div> <!-- Mobile Menu Button --> <button id="mobile-menu-button"${addAttribute(`lg:hidden p-2 rounded-lg transition-colors duration-200 ${transparent ? "text-white hover:bg-white/10" : "text-neutral-gray-700 hover:bg-neutral-gray-100"}`, "class")} aria-label="Toggle mobile menu"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path> </svg> </button> </div> <!-- Mobile Menu --> <div id="mobile-menu" class="lg:hidden hidden absolute top-full left-0 right-0 bg-white shadow-xl border-t border-neutral-gray-200 z-50"> <div class="py-6 px-4"> <nav class="flex flex-col space-y-1"> <a href="/" class="mobile-nav-link block px-4 py-3 text-neutral-gray-700 hover:text-bubble-primary hover:bg-bubble-light/10 rounded-lg font-medium transition-all duration-200">
🏠 Home
</a> <a href="/services" class="mobile-nav-link block px-4 py-3 text-neutral-gray-700 hover:text-bubble-primary hover:bg-bubble-light/10 rounded-lg font-medium transition-all duration-200">
🔧 Services
</a> <a href="/about" class="mobile-nav-link block px-4 py-3 text-neutral-gray-700 hover:text-bubble-primary hover:bg-bubble-light/10 rounded-lg font-medium transition-all duration-200">
ℹ️ About
</a> <a href="/calculator" class="mobile-nav-link block px-4 py-3 text-neutral-gray-700 hover:text-bubble-primary hover:bg-bubble-light/10 rounded-lg font-medium transition-all duration-200">
🧮 Calculator
</a> <a href="/certifications" class="mobile-nav-link block px-4 py-3 text-neutral-gray-700 hover:text-bubble-primary hover:bg-bubble-light/10 rounded-lg font-medium transition-all duration-200">
🏆 Certifications
</a> <a href="/quote" class="mobile-nav-link block px-4 py-3 text-neutral-gray-700 hover:text-bubble-primary hover:bg-bubble-light/10 rounded-lg font-medium transition-all duration-200">
📞 Contact
</a> <div class="pt-4 mt-4 border-t border-neutral-gray-200"> <a href="tel:+1-407-715-1790" class="mobile-phone-link block px-4 py-3 text-bubble-primary hover:text-bubble-dark font-semibold text-lg transition-colors duration-200">
📱 (407) 715-1790
</a> <div class="px-4 pt-3"> <a href="/quote" class="btn-primary w-full text-center py-3 px-6 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg">
✨ Get Free Quote
</a> </div> </div> </nav> </div> </div> </div> </header> `;
}, "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/components/Header.astro", void 0);

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<footer class="bg-neutral-gray-900 text-white"> <!-- Main Footer Content --> <div class="container-custom py-16"> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"> <!-- Company Info --> <div class="lg:col-span-2"> <!-- Logo --> <div class="flex items-center space-x-2 mb-6"> <div class="w-10 h-10 bg-gradient-to-br from-bubble-primary to-bubble-secondary rounded-lg flex items-center justify-center"> <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"> <circle cx="12" cy="8" r="3" opacity="0.8"></circle> <circle cx="8" cy="14" r="2.5" opacity="0.6"></circle> <circle cx="16" cy="14" r="2.5" opacity="0.6"></circle> <circle cx="12" cy="18" r="1.5" opacity="0.4"></circle> </svg> </div> <div> <div class="font-display font-bold text-xl leading-none text-white">
Bubbles
</div> <div class="font-display font-medium text-sm leading-none text-bubble-light">
Enterprise
</div> </div> </div> <p class="text-neutral-gray-300 mb-6 max-w-md">
Professional soffit and fascia specialists serving Orlando, FL and surrounding areas. 
          Quality workmanship with guaranteed results for over 15 years.
</p> <!-- Contact Info --> <div class="space-y-3"> <div class="flex items-center space-x-3"> <svg class="w-5 h-5 text-bubble-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path> </svg> <a href="tel:+1-407-715-1790" class="text-white hover:text-bubble-light transition-colors duration-200">
(407) 715-1790
</a> </div> <div class="flex items-center space-x-3"> <svg class="w-5 h-5 text-bubble-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path> </svg> <a href="mailto:contact@bubblesenterprise.com" class="text-white hover:text-bubble-light transition-colors duration-200">
contact@bubblesenterprise.com
</a> </div> <div class="flex items-start space-x-3"> <svg class="w-5 h-5 text-bubble-light mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path> </svg> <div class="text-neutral-gray-300">
Orlando, FL<br>
Serving Central Florida
</div> </div> </div> </div> <!-- Services --> <div> <h3 class="font-display font-semibold text-lg mb-6 text-white">Services</h3> <ul class="space-y-3"> <li> <a href="/services/new-construction" class="text-neutral-gray-300 hover:text-bubble-light transition-colors duration-200">
New Construction
</a> </li> <li> <a href="/services/remove-replace" class="text-neutral-gray-300 hover:text-bubble-light transition-colors duration-200">
Remove & Replace
</a> </li> <li> <a href="/services/repairs" class="text-neutral-gray-300 hover:text-bubble-light transition-colors duration-200">
Repairs
</a> </li> <li> <a href="/calculator" class="text-neutral-gray-300 hover:text-bubble-light transition-colors duration-200">
Cost Calculator
</a> </li> </ul> </div> <!-- Company --> <div> <h3 class="font-display font-semibold text-lg mb-6 text-white">Company</h3> <ul class="space-y-3"> <li> <a href="/about" class="text-neutral-gray-300 hover:text-bubble-light transition-colors duration-200">
About Us
</a> </li> <li> <a href="/quote" class="text-neutral-gray-300 hover:text-bubble-light transition-colors duration-200">
Orçamento
</a> </li> <li> <a href="/testimonials" class="text-neutral-gray-300 hover:text-bubble-light transition-colors duration-200">
Testimonials
</a> </li> <li> <a href="/quote" class="text-neutral-gray-300 hover:text-bubble-light transition-colors duration-200">
Contact
</a> </li> <li> <a href="/quote" class="text-neutral-gray-300 hover:text-bubble-light transition-colors duration-200">
Free Quote
</a> </li> </ul> </div> </div> </div> <!-- Bottom Bar --> <div class="border-t border-neutral-gray-800"> <div class="container-custom py-6"> <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"> <!-- Copyright --> <div class="text-neutral-gray-400 text-sm">
© ${(/* @__PURE__ */ new Date()).getFullYear()} Bubbles Enterprise. All rights reserved.
</div> <!-- Social Links --> <div class="flex items-center space-x-4"> <a href="#" class="text-neutral-gray-400 hover:text-bubble-light transition-colors duration-200" aria-label="Facebook"> <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"> <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path> </svg> </a> <a href="#" class="text-neutral-gray-400 hover:text-bubble-light transition-colors duration-200" aria-label="Instagram"> <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"> <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447c0-1.297.49-2.448 1.297-3.323.875-.807 2.026-1.297 3.323-1.297 1.297 0 2.448.49 3.323 1.297.807.875 1.297 2.026 1.297 3.323 0 1.297-.49 2.448-1.297 3.323-.875.807-2.026 1.297-3.323 1.297zm7.83-9.781c-.49 0-.875-.385-.875-.875s.385-.875.875-.875.875.385.875.875-.385.875-.875.875zm-3.832 9.781c-2.26 0-4.094-1.834-4.094-4.094s1.834-4.094 4.094-4.094 4.094 1.834 4.094 4.094-1.834 4.094-4.094 4.094z"></path> </svg> </a> <a href="#" class="text-neutral-gray-400 hover:text-bubble-light transition-colors duration-200" aria-label="LinkedIn"> <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"> <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path> </svg> </a> </div> <!-- Legal Links --> <div class="flex items-center space-x-6 text-sm"> <a href="/privacy" class="text-neutral-gray-400 hover:text-bubble-light transition-colors duration-200">
Privacy Policy
</a> <a href="/terms" class="text-neutral-gray-400 hover:text-bubble-light transition-colors duration-200">
Terms of Service
</a> </div> </div> </div> </div> </footer>`;
}, "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/components/Footer.astro", void 0);

const $$ChatBotWrapper = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="chatbot-container" data-astro-cid-aa5bzj2l></div>  `;
}, "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/components/ChatBotWrapper.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://bubblesenterprise.com");
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  let criticalCSS = "";
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const criticalPath = path.join(__dirname, "../styles/critical.css");
    criticalCSS = readFileSync(criticalPath, "utf-8");
  } catch (error) {
    console.warn("Critical CSS file not found, using fallback styles");
    criticalCSS = "/* Fallback critical styles */ * { box-sizing: border-box; } body { margin: 0; font-family: system-ui, sans-serif; }";
  }
  const {
    title,
    description = "Bubbles Enterprise - Especialistas em Soffit e Fascia em Orlando. Constru\xE7\xE3o nova, remo\xE7\xE3o e substitui\xE7\xE3o, reparos. Or\xE7amentos gratuitos e servi\xE7o de qualidade premium.",
    keywords = "soffit installation orlando, fascia repair florida, aluminum soffit orlando, vinyl soffit installation, soffit fascia contractor orlando, home exterior orlando, construction services florida, bubbles enterprise",
    ogImage = "/images/og-image.svg",
    transparentHeader = false
  } = Astro2.props;
  const canonicalURL = new URL(Astro2.url.pathname, Astro2.site);
  return renderTemplate(_a || (_a = __template(['<html lang="en" class="scroll-smooth" data-astro-cid-37fxchfa> <head><meta charset="UTF-8"><meta name="description"', '><meta name="keywords"', '><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><meta name="author" content="Bubbles Enterprise"><meta name="theme-color" content="#2563eb"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="format-detection" content="telephone=no"><meta name="mobile-web-app-capable" content="yes"><meta name="application-name" content="Bubbles Enterprise"><meta name="msapplication-TileColor" content="#2563eb"><meta name="msapplication-config" content="/browserconfig.xml"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="manifest" href="/manifest.webmanifest"><meta name="generator"', '><!-- Canonical URL --><link rel="canonical"', '><!-- Enhanced Open Graph / Facebook for 2025 --><meta property="og:type" content="website"><meta property="og:url"', '><meta property="og:title"', '><meta property="og:description"', '><meta property="og:image"', '><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:type" content="image/svg+xml"><meta property="og:image:alt" content="Bubbles Enterprise - Professional Soffit & Fascia Services in Orlando"><meta property="og:site_name" content="Bubbles Enterprise"><meta property="og:locale" content="en_US"><meta property="og:locale:alternate" content="es_US"><meta property="business:contact_data:street_address" content="Orlando Metro Area"><meta property="business:contact_data:locality" content="Orlando"><meta property="business:contact_data:region" content="Florida"><meta property="business:contact_data:postal_code" content="32801"><meta property="business:contact_data:country_name" content="United States"><meta property="business:contact_data:phone_number" content="+1-407-715-1790"><!-- Enhanced Twitter Cards for 2025 --><meta name="twitter:card" content="summary_large_image"><meta name="twitter:site" content="@bubblesenterprise"><meta name="twitter:creator" content="@bubblesenterprise"><meta name="twitter:url"', '><meta name="twitter:title"', '><meta name="twitter:description"', '><meta name="twitter:image"', `><meta name="twitter:image:alt" content="Bubbles Enterprise - Professional Soffit & Fascia Services in Orlando"><meta name="twitter:label1" content="Service Area"><meta name="twitter:data1" content="Orlando, FL Metro Area"><meta name="twitter:label2" content="Phone"><meta name="twitter:data2" content="(407) 715-1790"><!-- Preload critical resources for better performance --><link rel="preload" href="/assets/fonts/inter-400.ttf" as="font" type="font/ttf" crossorigin><link rel="preload" href="/assets/fonts/inter-600.ttf" as="font" type="font/ttf" crossorigin><link rel="preload" href="/assets/fonts/poppins-600.ttf" as="font" type="font/ttf" crossorigin><link rel="preload" href="/assets/fonts/poppins-700.ttf" as="font" type="font/ttf" crossorigin><link rel="preload" href="/js/calculator.js" as="script"><link rel="preload" href="/images/hero-bg.svg" as="image"><!-- Load local font CSS with optimized loading --><link rel="stylesheet" href="/assets/fonts/fonts.css" media="print" onload="this.media='all'">`, `<noscript><link rel="stylesheet" href="/assets/fonts/fonts.css"></noscript><!-- Optimize font loading with font-display swap --><!-- Fallback for no-JS --><noscript><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"></noscript><!-- Enhanced Schema.org markup for 2025 --><script type="application/ld+json">
      [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": "https://bubblesenterprise.com/#website",
          "url": "https://bubblesenterprise.com",
          "name": "Bubbles Enterprise - Soffit & Fascia Specialists",
          "description": "Professional soffit and fascia installation, repair, and replacement services in Orlando, Florida",
          "publisher": {
            "@id": "https://bubblesenterprise.com/#organization"
          },
          "potentialAction": [
            {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://bubblesenterprise.com/search?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          ],
          "inLanguage": "en-US"
        },
        {
          "@context": "https://schema.org",
          "@type": ["LocalBusiness", "HomeAndConstructionBusiness", "Contractor"],
          "@id": "https://bubblesenterprise.com/#organization",
        "name": "Bubbles Enterprise",
        "alternateName": "Bubbles Enterprise LLC",
        "description": "Professional soffit and fascia installation, repair, and replacement services in Orlando, Florida. Licensed and insured contractors with over 10 years of experience.",
        "url": "https://bubblesenterprise.com",
        "telephone": "+1-407-715-1790",
        "email": "contact@bubblesenterprise.com",
        "foundingDate": "2014",
        "slogan": "Quality Soffit & Fascia Solutions for Your Home",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Orlando Metro Area",
          "addressLocality": "Orlando",
          "addressRegion": "FL",
          "addressCountry": "US",
          "postalCode": "32801"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "28.5383",
          "longitude": "-81.3792"
        },
        "openingHours": [
          "Mo-Fr 08:00-18:00",
          "Sa 09:00-16:00"
        ],
        "priceRange": "$$-$$$",
        "paymentAccepted": ["Cash", "Check", "Credit Card", "Financing Available"],
        "currenciesAccepted": "USD",
        "areaServed": [
          {
            "@type": "City",
            "name": "Orlando",
            "sameAs": "https://en.wikipedia.org/wiki/Orlando,_Florida"
          },
          {
            "@type": "City",
            "name": "Winter Park",
            "sameAs": "https://en.wikipedia.org/wiki/Winter_Park,_Florida"
          },
          {
            "@type": "City",
            "name": "Kissimmee",
            "sameAs": "https://en.wikipedia.org/wiki/Kissimmee,_Florida"
          },
          {
            "@type": "City",
            "name": "Altamonte Springs"
          },
          {
            "@type": "City",
            "name": "Apopka"
          }
        ],
        "serviceType": [
          "Soffit Installation",
          "Fascia Repair",
          "Aluminum Soffit",
          "Vinyl Soffit",
          "Home Exterior Services",
          "Construction Services"
        ],
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Soffit and Fascia Services",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "New Soffit Installation",
                "description": "Professional installation of aluminum and vinyl soffit systems for new construction and home improvements",
                "category": "Home Improvement"
              },
              "availability": "https://schema.org/InStock",
              "areaServed": "Orlando, FL Metro Area"
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Fascia Repair & Replacement",
                "description": "Expert repair and replacement of damaged fascia boards and trim",
                "category": "Home Repair"
              },
              "availability": "https://schema.org/InStock",
              "areaServed": "Orlando, FL Metro Area"
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Free Estimates",
                "description": "Complimentary on-site project estimates and consultations",
                "category": "Consultation"
              },
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            }
          ]
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "bestRating": "5",
          "worstRating": "1",
          "reviewCount": "127",
          "ratingCount": "127"
        },
        "review": [
          {
            "@type": "Review",
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "5",
              "bestRating": "5"
            },
            "author": {
              "@type": "Person",
              "name": "Sarah Johnson"
            },
            "reviewBody": "Excellent work on our soffit installation. Professional, timely, and great quality."
          }
        ],
        "logo": {
          "@type": "ImageObject",
          "url": "https://bubblesenterprise.com/bubbles_enterprise_logo_large.svg",
          "width": "300",
          "height": "100"
        },
        "image": [
          "https://bubblesenterprise.com/images/og-image.svg"
        ],
        "sameAs": [
          "https://www.facebook.com/bubblesenterprise",
          "https://www.instagram.com/bubblesenterprise",
          "https://www.linkedin.com/company/bubblesenterprise"
        ],
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": "+1-407-715-1790",
            "contactType": "customer service",
            "availableLanguage": ["English", "Spanish"],
            "areaServed": "US-FL"
          },
          {
            "@type": "ContactPoint",
            "email": "contact@bubblesenterprise.com",
            "contactType": "sales",
            "availableLanguage": ["English", "Spanish"]
          }
        ],
        "makesOffer": {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Soffit and Fascia Services"
          },
          "areaServed": "Orlando, FL Metro Area",
          "availability": "https://schema.org/InStock"
        },
        "knowsAbout": [
          "Soffit Installation",
          "Fascia Repair",
          "Aluminum Siding",
          "Vinyl Soffits",
          "Home Exterior Renovation",
          "Construction Services",
          "Roofline Protection",
          "Ventilation Systems"
        ],
        "hasCredential": {
          "@type": "EducationalOccupationalCredential",
          "name": "Licensed General Contractor",
          "credentialCategory": "Professional License"
        },
        "memberOf": {
          "@type": "Organization",
          "name": "Better Business Bureau",
          "url": "https://www.bbb.org"
        }
        },
         {
           "@context": "https://schema.org",
           "@type": "FAQPage",
           "mainEntity": [
             {
               "@type": "Question",
               "name": "What is soffit and fascia?",
               "acceptedAnswer": {
                 "@type": "Answer",
                 "text": "Soffit is the exposed surface beneath the overhanging section of a roof eave. Fascia is the vertical finishing edge connected to the ends of the rafters, trusses, or the area where the gutter is attached to the roof."
               }
             },
             {
               "@type": "Question",
               "name": "How much does soffit and fascia installation cost in Orlando?",
               "acceptedAnswer": {
                 "@type": "Answer",
                 "text": "Soffit and fascia installation costs in Orlando typically range from $6 to $20 per linear foot, depending on materials (aluminum, vinyl, or wood) and complexity of the project. We provide free estimates for accurate pricing."
               }
             },
             {
               "@type": "Question",
               "name": "Do you provide free estimates for soffit and fascia work?",
               "acceptedAnswer": {
                 "@type": "Answer",
                 "text": "Yes, Bubbles Enterprise provides completely free, no-obligation estimates for all soffit and fascia projects in Orlando and Central Florida. Contact us at (407) 715-1790 to schedule your free consultation."
               }
             },
             {
               "@type": "Question",
               "name": "What areas do you serve in Florida?",
               "acceptedAnswer": {
                 "@type": "Answer",
                 "text": "We serve Orlando, Winter Park, Kissimmee, Altamonte Springs, Apopka, and the entire Central Florida metro area for professional soffit and fascia installation, repair, and replacement services."
               }
             },
             {
               "@type": "Question",
               "name": "How long does soffit and fascia installation take?",
               "acceptedAnswer": {
                 "@type": "Answer",
                 "text": "Most residential soffit and fascia installations are completed within 1-3 days, depending on the size of your home and complexity of the project. We work efficiently while maintaining high quality standards."
               }
             },
             {
               "@type": "Question",
               "name": "What materials do you use for soffit and fascia?",
               "acceptedAnswer": {
                 "@type": "Answer",
                 "text": "We specialize in high-quality aluminum and vinyl soffit and fascia materials that are durable, weather-resistant, and low-maintenance. These materials are ideal for Florida's climate and provide long-lasting protection."
               }
             }
           ]
         }
       ]
    <\/script><title>`, "</title><!-- Critical CSS Inline for LCP optimization --><style>", `</style><!-- Load non-critical CSS asynchronously with fetchpriority --><link rel="preload" href="/src/styles/global.css" as="style" onload="this.onload=null;this.rel='stylesheet'" fetchpriority="low"><noscript><link rel="stylesheet" href="/src/styles/global.css"></noscript><!-- Preload critical images for LCP with fetchpriority --><link rel="preload" href="/images/bubbles_enterprise_logo_large.svg" as="image" type="image/svg+xml" fetchpriority="high"><!-- Preload critical scripts for better INP --><link rel="preload" href="/js/lazy-loader.js" as="script" fetchpriority="high"><!-- Load lazy loader immediately for INP optimization --><script src="/js/lazy-loader.js" async><\/script><!-- Custom Scripts --><!-- <script src="/js/main.js" is:inline><\/script> --><script src="/js/calculator.js"><\/script><script src="/js/form-security.js"><\/script><!-- Performance optimization hints --><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><meta http-equiv="X-UA-Compatible" content="IE=edge"><!-- Reduce layout shift with aspect ratio hints -->`, '</head> <body class="min-h-screen bg-neutral-white ios-fix" data-astro-cid-37fxchfa> <!-- Skip to main content for accessibility --> <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-bubble-blue text-white px-4 py-2 rounded-md z-50" data-astro-cid-37fxchfa>\nSkip to main content\n</a> ', ' <!-- Main Content --> <main id="main-content" class="flex-1" data-astro-cid-37fxchfa> ', " </main> ", " <!-- ChatBot Grok AI --> ", " </body></html>"])), addAttribute(description, "content"), addAttribute(keywords, "content"), addAttribute(Astro2.generator, "content"), addAttribute(canonicalURL, "href"), addAttribute(canonicalURL, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(ogImage, "content"), addAttribute(canonicalURL, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(ogImage, "content"), maybeRenderHead(), title, unescapeHTML(criticalCSS), renderHead(), renderComponent($$result, "Header", $$Header, { "transparent": transparentHeader, "data-astro-cid-37fxchfa": true }), renderSlot($$result, $$slots["default"]), renderComponent($$result, "Footer", $$Footer, { "data-astro-cid-37fxchfa": true }), renderComponent($$result, "ChatBotWrapper", $$ChatBotWrapper, { "data-astro-cid-37fxchfa": true }));
}, "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
