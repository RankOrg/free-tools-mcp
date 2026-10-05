const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function metaTags(i: { title: string; description: string; url?: string; robots?: string; author?: string; keywords?: string[] }) {
  const warnings: string[] = [];
  if (i.title.length > 60) warnings.push(`Title is ${i.title.length} chars; aim for <= 60.`);
  if (i.description.length > 160) warnings.push(`Description is ${i.description.length} chars; aim for <= 160.`);
  if (i.description.length < 70) warnings.push("Description is short; 120-160 chars usually performs best.");
  const lines = [
    `<title>${esc(i.title)}</title>`,
    `<meta name="description" content="${esc(i.description)}">`,
    i.keywords?.length ? `<meta name="keywords" content="${esc(i.keywords.join(", "))}">` : "",
    i.author ? `<meta name="author" content="${esc(i.author)}">` : "",
    `<meta name="robots" content="${esc(i.robots ?? "index, follow")}">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1">`,
    i.url ? `<link rel="canonical" href="${esc(i.url)}">` : "",
  ].filter(Boolean);
  return { html: lines.join("\n"), warnings };
}

export function openGraph(i: { title: string; description: string; url: string; image?: string; siteName?: string; type?: string; twitterHandle?: string }) {
  const l = [
    ["og:title", i.title], ["og:description", i.description], ["og:url", i.url], ["og:type", i.type ?? "website"],
    ["og:site_name", i.siteName], ["og:image", i.image],
  ].filter(([, v]) => v).map(([p, v]) => `<meta property="${p}" content="${esc(v!)}">`);
  l.push(`<meta name="twitter:card" content="${i.image ? "summary_large_image" : "summary"}">`);
  l.push(`<meta name="twitter:title" content="${esc(i.title)}">`, `<meta name="twitter:description" content="${esc(i.description)}">`);
  if (i.image) l.push(`<meta name="twitter:image" content="${esc(i.image)}">`);
  if (i.twitterHandle) l.push(`<meta name="twitter:site" content="@${esc(i.twitterHandle.replace(/^@/, ""))}">`);
  return { html: l.join("\n") };
}

export function hreflang(i: { entries: { lang: string; url: string }[]; xDefault?: string }) {
  const bad = i.entries.filter((e) => !/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(e.lang));
  if (bad.length) throw new Error(`Invalid language codes: ${bad.map((b) => b.lang).join(", ")} (use e.g. en, en-US, fr-CA).`);
  const l = i.entries.map((e) => `<link rel="alternate" hreflang="${e.lang}" href="${esc(e.url)}">`);
  if (i.xDefault) l.push(`<link rel="alternate" hreflang="x-default" href="${esc(i.xDefault)}">`);
  return { html: l.join("\n"), note: "Every page in the set must include the full list, including a self-reference." };
}

export type SchemaInput =
  | { type: "Article"; headline: string; author: string; datePublished: string; image?: string; url?: string }
  | { type: "FAQPage"; questions: { q: string; a: string }[] }
  | { type: "Organization"; name: string; url: string; logo?: string; sameAs?: string[] }
  | { type: "LocalBusiness"; name: string; url?: string; telephone?: string; address?: string; priceRange?: string }
  | { type: "Product"; name: string; description?: string; image?: string; price: number; currency: string; availability?: "InStock" | "OutOfStock" };

export function schemaMarkup(i: SchemaInput) {
  let data: Record<string, unknown>;
  switch (i.type) {
    case "Article": data = { "@type": "Article", headline: i.headline, author: { "@type": "Person", name: i.author }, datePublished: i.datePublished, image: i.image, mainEntityOfPage: i.url }; break;
    case "FAQPage": data = { "@type": "FAQPage", mainEntity: i.questions.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) }; break;
    case "Organization": data = { "@type": "Organization", name: i.name, url: i.url, logo: i.logo, sameAs: i.sameAs }; break;
    case "LocalBusiness": data = { "@type": "LocalBusiness", name: i.name, url: i.url, telephone: i.telephone, address: i.address, priceRange: i.priceRange }; break;
    case "Product": data = { "@type": "Product", name: i.name, description: i.description, image: i.image, offers: { "@type": "Offer", price: i.price, priceCurrency: i.currency, availability: `https://schema.org/${i.availability ?? "InStock"}` } }; break;
  }
  const json = JSON.stringify({ "@context": "https://schema.org", ...data }, null, 2);
  return { jsonLd: json, html: `<script type="application/ld+json">\n${json}\n</script>` };
}

export function xmlSitemap(i: { urls: { loc: string; lastmod?: string; changefreq?: string; priority?: number }[] }) {
  if (i.urls.length > 50000) throw new Error("Sitemaps are limited to 50,000 URLs; split into several files.");
  const body = i.urls.map((u) => ["  <url>", `    <loc>${esc(u.loc)}</loc>`, u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>` : "", u.changefreq ? `    <changefreq>${u.changefreq}</changefreq>` : "", u.priority !== undefined ? `    <priority>${u.priority.toFixed(1)}</priority>` : "", "  </url>"].filter(Boolean).join("\n")).join("\n");
  return { xml: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`, count: i.urls.length };
}

export function robotsTxt(i: { rules: { userAgent: string; allow?: string[]; disallow?: string[]; crawlDelay?: number }[]; sitemaps?: string[] }) {
  const blocks = i.rules.map((r) => [`User-agent: ${r.userAgent}`, ...(r.allow ?? []).map((p) => `Allow: ${p}`), ...(r.disallow ?? []).map((p) => `Disallow: ${p}`), ...(r.crawlDelay ? [`Crawl-delay: ${r.crawlDelay}`] : [])].join("\n"));
  const sm = (i.sitemaps ?? []).map((s) => `Sitemap: ${s}`).join("\n");
  return { robotsTxt: [blocks.join("\n\n"), sm].filter(Boolean).join("\n\n") + "\n" };
}
