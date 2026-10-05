const STOP = new Set("a an and the of to in for on with is are was were be been being at by from as it its this that these those or but if then so we you your our their his her they them he she i my me will can just about into over after before than not no do does did has have had".split(" "));

export const stripHtml = (s: string) => s.replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ");

function tokenize(text: string) {
  return stripHtml(text).toLowerCase().replace(/[^\p{L}\p{N}\s'-]/gu, " ").split(/\s+/).filter(Boolean);
}

export function wordCount(text: string, wpm = 230) {
  const plain = stripHtml(text).trim();
  const words = plain ? plain.split(/\s+/).length : 0;
  const sentences = (plain.match(/[^.!?]+[.!?]+/g) ?? (plain ? [plain] : [])).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length;
  return {
    words, characters: plain.length, charactersNoSpaces: plain.replace(/\s/g, "").length,
    sentences, paragraphs, readingTimeMinutes: Number((words / wpm).toFixed(1)),
    speakingTimeMinutes: Number((words / 130).toFixed(1)),
  };
}

export function keywordDensity(text: string, n: 1 | 2 | 3 = 1, limit = 15) {
  const words = tokenize(text);
  const map = new Map<string, number>();
  for (let i = 0; i + n <= words.length; i++) {
    const s = words.slice(i, i + n);
    if (n === 1 ? STOP.has(s[0]) : STOP.has(s[0]) || STOP.has(s[n - 1])) continue;
    const g = s.join(" ");
    map.set(g, (map.get(g) ?? 0) + 1);
  }
  return {
    totalWords: words.length,
    results: [...map].filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1]).slice(0, limit)
      .map(([phrase, count]) => ({ phrase, count, densityPct: Number(((count / words.length) * 100).toFixed(2)) })),
  };
}

export function headingStructure(html: string) {
  const headings = [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map((m) => ({ level: Number(m[1]), text: stripHtml(m[2]).replace(/\s+/g, " ").trim() }));
  const issues: string[] = [];
  const h1 = headings.filter((h) => h.level === 1).length;
  if (h1 === 0) issues.push("Missing H1.");
  if (h1 > 1) issues.push(`Multiple H1s (${h1}).`);
  headings.forEach((h, i) => {
    const prev = headings[i - 1]?.level ?? 0;
    if (h.level > prev + 1 && i > 0) issues.push(`Skipped level: H${prev} -> H${h.level} ("${h.text.slice(0, 40)}").`);
    if (!h.text) issues.push(`Empty H${h.level}.`);
  });
  return { headings, h1Count: h1, issues, ok: issues.length === 0 };
}
