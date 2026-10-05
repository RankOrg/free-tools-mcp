import { z } from "zod";
import * as ads from "../core/ads.js";
import * as text from "../core/text.js";
import * as gen from "../core/generators.js";

/** One entry per tool: pure handler + schema. Add a tool here and it is served over stdio. */
export interface ToolDef<S extends z.ZodRawShape = z.ZodRawShape> {
  name: string; title: string; description: string; schema: S;
  handler: (args: z.infer<z.ZodObject<S>>) => unknown;
}
const tool = <S extends z.ZodRawShape>(t: ToolDef<S>) => t;
const n = z.number().optional();

export const tools = [
  tool({ name: "cpc_calculator", title: "CPC Calculator", description: "Cost per click from spend and clicks, or solve for spend/clicks from a CPC. Optional conversion rate and order value add CPA, revenue, profit and ROAS.",
    schema: { cost: n, clicks: n, cpc: n, conversionRatePct: n, avgOrderValue: n }, handler: ads.cpc }),
  tool({ name: "cpm_calculator", title: "CPM Calculator", description: "Cost per 1,000 impressions from spend and impressions, or solve for spend/impressions from a CPM.",
    schema: { cost: n, impressions: n, cpm: n }, handler: ads.cpm }),
  tool({ name: "ctr_calculator", title: "CTR Calculator", description: "Click-through rate (%) from clicks and impressions, or solve for clicks/impressions from a CTR.",
    schema: { clicks: n, impressions: n, ctrPct: n }, handler: ads.ctr }),
  tool({ name: "seo_roi_calculator", title: "SEO ROI Calculator", description: "Estimate SEO return: monthly conversions, revenue, ROI %, cost per conversion and break-even over a period.",
    schema: { monthlyInvestment: z.number().min(0), monthlyVisitors: z.number().min(0), conversionRatePct: z.number().min(0).max(100), valuePerConversion: z.number().min(0), months: z.number().int().min(1).optional() }, handler: ads.seoRoi }),
  tool({ name: "word_counter", title: "Word Counter", description: "Count words, characters, sentences, paragraphs and estimate reading/speaking time. Accepts text or HTML.",
    schema: { text: z.string() }, handler: (a) => text.wordCount(a.text) }),
  tool({ name: "keyword_density", title: "Keyword Density Analyzer", description: "Find the most repeated words or 2-3 word phrases in text/HTML with counts and density %. Stop words are ignored.",
    schema: { text: z.string(), phraseLength: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(1), limit: z.number().int().min(1).max(50).default(15) }, handler: (a) => text.keywordDensity(a.text, a.phraseLength, a.limit) }),
  tool({ name: "heading_structure_analyzer", title: "Heading Structure Analyzer", description: "Extract the H1-H6 outline from HTML and flag missing/multiple H1s and skipped levels.",
    schema: { html: z.string() }, handler: (a) => text.headingStructure(a.html) }),
  tool({ name: "meta_tag_generator", title: "Meta Tag Generator", description: "Generate title, description, robots, canonical and viewport tags, with length warnings.",
    schema: { title: z.string(), description: z.string(), url: z.string().url().optional(), robots: z.string().optional(), author: z.string().optional(), keywords: z.array(z.string()).optional() }, handler: gen.metaTags }),
  tool({ name: "open_graph_generator", title: "Open Graph Generator", description: "Generate Open Graph and Twitter Card meta tags for social sharing.",
    schema: { title: z.string(), description: z.string(), url: z.string().url(), image: z.string().url().optional(), siteName: z.string().optional(), type: z.string().optional(), twitterHandle: z.string().optional() }, handler: gen.openGraph }),
  tool({ name: "hreflang_generator", title: "Hreflang Generator", description: "Generate hreflang alternate link tags for multilingual/regional pages, with language code validation.",
    schema: { entries: z.array(z.object({ lang: z.string(), url: z.string().url() })).min(1), xDefault: z.string().url().optional() }, handler: gen.hreflang }),
  tool({ name: "schema_markup_generator", title: "Schema Markup Generator", description: "Generate JSON-LD structured data for Article, FAQPage, Organization, LocalBusiness or Product.",
    schema: { markup: z.discriminatedUnion("type", [
      z.object({ type: z.literal("Article"), headline: z.string(), author: z.string(), datePublished: z.string(), image: z.string().optional(), url: z.string().optional() }),
      z.object({ type: z.literal("FAQPage"), questions: z.array(z.object({ q: z.string(), a: z.string() })).min(1) }),
      z.object({ type: z.literal("Organization"), name: z.string(), url: z.string(), logo: z.string().optional(), sameAs: z.array(z.string()).optional() }),
      z.object({ type: z.literal("LocalBusiness"), name: z.string(), url: z.string().optional(), telephone: z.string().optional(), address: z.string().optional(), priceRange: z.string().optional() }),
      z.object({ type: z.literal("Product"), name: z.string(), description: z.string().optional(), image: z.string().optional(), price: z.number(), currency: z.string().length(3), availability: z.enum(["InStock", "OutOfStock"]).optional() }),
    ]) }, handler: (a) => gen.schemaMarkup(a.markup) }),
  tool({ name: "xml_sitemap_generator", title: "XML Sitemap Generator", description: "Build a valid sitemap.xml from a list of URLs with optional lastmod, changefreq and priority.",
    schema: { urls: z.array(z.object({ loc: z.string().url(), lastmod: z.string().optional(), changefreq: z.enum(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"]).optional(), priority: z.number().min(0).max(1).optional() })).min(1) }, handler: gen.xmlSitemap }),
  tool({ name: "robots_txt_generator", title: "Robots.txt Generator", description: "Generate a robots.txt from per-user-agent allow/disallow rules and sitemap URLs.",
    schema: { rules: z.array(z.object({ userAgent: z.string(), allow: z.array(z.string()).optional(), disallow: z.array(z.string()).optional(), crawlDelay: z.number().optional() })).min(1), sitemaps: z.array(z.string().url()).optional() }, handler: gen.robotsTxt }),
];
