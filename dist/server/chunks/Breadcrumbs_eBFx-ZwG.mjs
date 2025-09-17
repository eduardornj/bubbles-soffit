import { c as createAstro, a as createComponent, b as renderTemplate, e as addAttribute, m as maybeRenderHead, u as unescapeHTML } from './vendor_DQmjvFcz.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                         */

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://bubblesenterprise.com");
const $$Breadcrumbs = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Breadcrumbs;
  const { items } = Astro2.props;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      ...item.url && { "item": `https://bubblesenterprise.com${item.url}` }
    }))
  };
  return renderTemplate(_a || (_a = __template(['<!-- Schema Markup para Breadcrumbs --><script type="application/ld+json">', "<\/script> <!-- Breadcrumbs visuais -->", '<nav aria-label="Breadcrumb" class="bg-gray-50 border-b border-gray-200" data-astro-cid-ilhxcym7> <div class="container mx-auto px-4 py-3" data-astro-cid-ilhxcym7> <ol class="flex items-center space-x-2 text-sm" data-astro-cid-ilhxcym7> ', " </ol> </div> </nav> "])), unescapeHTML(JSON.stringify(breadcrumbSchema)), maybeRenderHead(), items.map((item, index) => renderTemplate`<li class="flex items-center" data-astro-cid-ilhxcym7> ${index > 0 && renderTemplate`<svg class="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20" data-astro-cid-ilhxcym7> <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" data-astro-cid-ilhxcym7></path> </svg>`} ${item.url ? renderTemplate`<a${addAttribute(item.url, "href")} class="text-blue-600 hover:text-blue-800 hover:underline transition-colors" itemprop="item" data-astro-cid-ilhxcym7> <span itemprop="name" data-astro-cid-ilhxcym7>${item.name}</span> </a>` : renderTemplate`<span class="text-gray-700 font-medium" itemprop="name" data-astro-cid-ilhxcym7> ${item.name} </span>`} </li>`));
}, "C:/Users/eDuArDoXP/Downloads/Soffit2025Bubble/src/components/Breadcrumbs.astro", void 0);

export { $$Breadcrumbs as $ };
