import { describe, expect, it } from "vitest";
import { cpc, cpm, ctr, seoRoi } from "./ads.js";
import { wordCount, keywordDensity, headingStructure } from "./text.js";
import { hreflang, robotsTxt, xmlSitemap } from "./generators.js";

describe("ads", () => {
  it("cpc with cpa/roas", () => {
    const r = cpc({ cost: 500, clicks: 250, conversionRatePct: 2.5, avgOrderValue: 80 });
    expect(r.cpc).toBe(2); expect(r.cpa).toBe(80); expect(r.roas).toBe(1);
  });
  it("cpc solves clicks", () => expect(cpc({ cpc: 2, cost: 500 }).clicks).toBe(250));
  it("cpm", () => expect(cpm({ cost: 50, impressions: 10000 }).cpm).toBe(5));
  it("ctr", () => expect(ctr({ clicks: 25, impressions: 1000 }).ctrPct).toBe(2.5));
  it("roi", () => expect(seoRoi({ monthlyInvestment: 1000, monthlyVisitors: 5000, conversionRatePct: 2, valuePerConversion: 50 }).roiPct).toBe(400));
  it("errors without inputs", () => expect(() => cpc({})).toThrow());
});
describe("text", () => {
  it("word count", () => expect(wordCount("Hello world. Two sentences!").words).toBe(4));
  it("density", () => expect(keywordDensity("seo tools seo tips seo").results[0]).toMatchObject({ phrase: "seo", count: 3 }));
  it("headings", () => expect(headingStructure("<h1>A</h1><h3>B</h3>").issues[0]).toMatch(/Skipped/));
});
describe("generators", () => {
  it("hreflang rejects bad code", () => expect(() => hreflang({ entries: [{ lang: "english", url: "https://a.com" }] })).toThrow());
  it("sitemap", () => expect(xmlSitemap({ urls: [{ loc: "https://a.com/?a=1&b=2" }] }).xml).toContain("&amp;"));
  it("robots", () => expect(robotsTxt({ rules: [{ userAgent: "*", disallow: ["/x"] }], sitemaps: ["https://a.com/s.xml"] }).robotsTxt).toBe("User-agent: *\nDisallow: /x\n\nSitemap: https://a.com/s.xml\n"));
});
