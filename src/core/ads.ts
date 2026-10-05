const round = (n: number, d = 2) => Number.isFinite(n) ? Number(n.toFixed(d)) : null;

export function cpc(i: { cost?: number; clicks?: number; cpc?: number; conversionRatePct?: number; avgOrderValue?: number }) {
  let { cost, clicks, cpc: c } = i;
  if (c === undefined) {
    if (cost === undefined || !clicks) throw new Error("Provide cost and clicks (>0), or cpc plus one of cost/clicks.");
    c = cost / clicks;
  } else if (cost === undefined && clicks !== undefined) cost = c * clicks;
  else if (clicks === undefined && cost !== undefined) clicks = c > 0 ? cost / c : undefined;
  const out: Record<string, number | null | undefined> = { cpc: round(c), cost: cost === undefined ? undefined : round(cost), clicks: clicks === undefined ? undefined : round(clicks, 0) };
  if (i.conversionRatePct && clicks !== undefined && cost !== undefined) {
    const conv = clicks * (i.conversionRatePct / 100);
    out.conversions = round(conv);
    out.cpa = conv > 0 ? round(cost / conv) : null;
    if (i.avgOrderValue !== undefined) {
      const revenue = conv * i.avgOrderValue;
      out.revenue = round(revenue); out.profit = round(revenue - cost); out.roas = cost > 0 ? round(revenue / cost) : null;
    }
  }
  return out;
}

export function cpm(i: { cost?: number; impressions?: number; cpm?: number }) {
  let { cost, impressions, cpm: m } = i;
  if (m === undefined) {
    if (cost === undefined || !impressions) throw new Error("Provide cost and impressions (>0), or cpm plus one of cost/impressions.");
    m = (cost / impressions) * 1000;
  } else if (cost === undefined && impressions !== undefined) cost = (m * impressions) / 1000;
  else if (impressions === undefined && cost !== undefined) impressions = m > 0 ? (cost / m) * 1000 : undefined;
  return { cpm: round(m), cost: cost === undefined ? undefined : round(cost), impressions: impressions === undefined ? undefined : round(impressions, 0) };
}

export function ctr(i: { clicks?: number; impressions?: number; ctrPct?: number }) {
  let { clicks, impressions, ctrPct } = i;
  if (ctrPct === undefined) {
    if (clicks === undefined || !impressions) throw new Error("Provide clicks and impressions (>0), or ctrPct plus one of them.");
    ctrPct = (clicks / impressions) * 100;
  } else if (clicks === undefined && impressions !== undefined) clicks = (ctrPct / 100) * impressions;
  else if (impressions === undefined && clicks !== undefined) impressions = ctrPct > 0 ? clicks / (ctrPct / 100) : undefined;
  return { ctrPct: round(ctrPct), clicks: clicks === undefined ? undefined : round(clicks, 0), impressions: impressions === undefined ? undefined : round(impressions, 0) };
}

export function seoRoi(i: { monthlyInvestment: number; monthlyVisitors: number; conversionRatePct: number; valuePerConversion: number; months?: number }) {
  const months = i.months ?? 12;
  const conversions = i.monthlyVisitors * (i.conversionRatePct / 100);
  const revenue = conversions * i.valuePerConversion;
  const cost = i.monthlyInvestment;
  const net = revenue - cost;
  return {
    monthlyConversions: round(conversions), monthlyRevenue: round(revenue), monthlyNet: round(net),
    roiPct: cost > 0 ? round((net / cost) * 100) : null,
    costPerConversion: conversions > 0 ? round(cost / conversions) : null,
    periodMonths: months, periodRevenue: round(revenue * months), periodNet: round(net * months),
    breakEvenConversionsPerMonth: i.valuePerConversion > 0 ? round(cost / i.valuePerConversion) : null,
  };
}
