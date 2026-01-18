import * as XLSX from "xlsx";

function toNumber(v) {
  if (v === null || v === undefined) return 0;
  const n = typeof v === "string" ? Number(v.replace(/,/g, "").trim()) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function toPercentFraction(v) {
  if (v === null || v === undefined) return 0;

  if (typeof v === "number") {
    if (!Number.isFinite(v)) return 0;
    return v > 1 ? v / 100 : v;
  }

  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return 0;
    const hasPct = s.includes("%");
    const num = parseFloat(s.replace("%", "").trim());
    if (!Number.isFinite(num)) return 0;
    if (hasPct) return num / 100;
    return num > 1 ? num / 100 : num;
  }

  return 0;
}

function pick(obj, keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null) return v;
  }
  return undefined;
}

export function exportDashboardExcel(payload) {
  const data = payload?.data || payload || {};
  const stats = data?.stats || payload?.stats || {};

  const campaigns = data?.campaigns || payload?.campaigns || [];

  const totalSent = toNumber(
    pick(stats, ["total_emails_sent", "totalSent", "total_sent", "emails_sent", "emailsSent"])
  );

  const totalReplies = toNumber(
    pick(stats, ["total_replies", "totalReplies", "replies", "total_replied"])
  );

  let avgReplyRate = toPercentFraction(
    pick(stats, ["avg_reply_rate", "avgReplyRate", "average_reply_rate", "reply_rate"])
  );

  if (!avgReplyRate) {
    const ts = totalSent;
    const tr = totalReplies;
    avgReplyRate = ts > 0 ? (tr / ts) : 0;
  }

  const activeCampaigns =
    toNumber(pick(stats, ["active_campaigns", "activeCampaigns"])) ||
    (Array.isArray(campaigns)
      ? campaigns.filter((c) => (c.status ?? c.campaign_status) === 1).length
      : 0);

  const wsSummary = XLSX.utils.aoa_to_sheet([
    ["Lead Catalyst Dashboard Export"],
    ["Generated At", new Date().toISOString()],
    [],
    ["Total Emails Sent", totalSent],
    ["Total Replies", totalReplies],
    ["Avg Reply Rate", avgReplyRate],
    ["Active Campaigns", activeCampaigns],
  ]);

  wsSummary["!cols"] = [{ wch: 28 }, { wch: 26 }];
  if (wsSummary["B6"]) wsSummary["B6"].z = "0.00%";

  const header = ["Campaign Name", "Emails Sent", "Replies", "Avg Reply Rate", "Opportunities"];

  const rows = (Array.isArray(campaigns) ? campaigns : []).map((c) => {
    const name = pick(c, ["name", "campaignName", "campaign_name"]) || "";

    const emailsSent = toNumber(pick(c, ["emailsSent", "emails_sent", "sent", "total_emails"]));
    const replies = toNumber(pick(c, ["replies", "replied", "totalReplies", "total_replies"]));

    const rateRaw = pick(c, [
      "reply_rate",
      "replyRate",
      "avg_reply_rate",
      "avgReplyRate",
      "avg_reply_rate_percent",
      "reply_rate_percent",
      "replyRatePercent"
    ]);

    let avgRate = 0;

    if (rateRaw !== undefined && rateRaw !== null && rateRaw !== "") {
      // CampaignTable uses campaign.reply_rate as a NUMBER like 2.1 (meaning 2.1%)
      // So we must convert percent -> fraction for Excel
      const n = typeof rateRaw === "string" ? Number(rateRaw.replace("%","").trim()) : Number(rateRaw);
      if (Number.isFinite(n)) avgRate = n / 100;
    }

    const opportunities = toNumber(
      pick(c, ["opportunities", "opps", "opportunity_count", "opportunities_count", "opportunityCount"])
    );

    return [name, emailsSent, replies, avgRate, opportunities];
  });

  const wsBreakdown = XLSX.utils.aoa_to_sheet([
    ["Campaign Breakdown"],
    ["Generated At", new Date().toISOString()],
    [],
    header,
    ...rows,
  ]);

  wsBreakdown["!cols"] = [{ wch: 44 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 16 }];

  const firstDataRow = 5;
  const lastDataRow = 4 + rows.length;
  for (let r = firstDataRow; r <= lastDataRow; r++) {
    const addr = XLSX.utils.encode_cell({ r: r - 1, c: 3 });
    if (wsBreakdown[addr]) wsBreakdown[addr].z = "0.00%";
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
  XLSX.utils.book_append_sheet(wb, wsBreakdown, "Campaign Breakdown");

  const fname = `LC-Dashboard-Export-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fname);
}
