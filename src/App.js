import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './App.css';

import StatsCards from './components/StatsCards';
import BarChart from "./components/BarChart";
import DonutChart from './components/DonutChart';
import CampaignTable from './components/CampaignTable';

import logo from './assets/lead-catalyst-full.png';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Export what is currently visible on the dashboard (no server needed)
  const exportVisibleCsv = () => {
    try {
      var b = (brand_name ? String(brand_name) : "Client");
      var safeBrand = b.replace(/[^a-z0-9_-]+/gi, "_");

      var days = (date_range && date_range.days) ? date_range.days : 0;
      var label = (date_range && date_range.label) ? String(date_range.label) : ("Last_" + days + "_days");
      var safeLabel = label.replace(/[^a-z0-9_-]+/gi, "_");

      var csvEscape = function(v){
        if (v === null || v === undefined) return "";
        var s = String(v);
        if (s.indexOf("\"") !== -1) s = s.replace(/\"/g, "\"\"");
        if (s.indexOf(",") !== -1 || s.indexOf("\n") !== -1 || s.indexOf("\"") !== -1) return "\"" + s + "\"";
        return s;
      };

      var get = function(obj, keys, fallback){
        for (var i=0;i<keys.length;i++){
          var k = keys[i];
          if (obj && obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
        }
        return fallback;
      };

      // ===== SUMMARY =====
      var totalEmailsSent = get(normalizedStats, ["total_sent","emails_sent","total_emails_sent","emails_sent_count"], 0);
      var totalReplies = get(normalizedStats, ["total_replies","reply_count","replies"], 0);
      var replyRate = get(normalizedStats, ["reply_rate","replyRate"], 0);
      var activeCampaigns = get(normalizedStats, ["active_campaigns","total_campaigns"], 0);

      var start = (date_range && date_range.start) ? date_range.start : "";
      var end = (date_range && date_range.end) ? date_range.end : "";

      var summaryRows = [
        ["Brand", b],
        ["View", label],
        ["Date Start", start],
        ["Date End", end],
        ["Days", days],
        ["Total Emails Sent", totalEmailsSent],
        ["Total Replies", totalReplies],
        ["Avg Reply Rate (%)", replyRate],
        ["Active Campaigns", activeCampaigns]
      ];

      // ===== CAMPAIGNS (match your table) =====
      var statusFromCode = function(code){
        if (code === 1) return "Active";
        if (code === 3) return "Completed";
        return "Paused";
      };

      var list = (campaigns || []).map(function(c){
        var name = get(c, ["name","campaign_name"], "");
        var emailsSent = Number(get(c, ["sent","emails_sent","emails_sent_count"], 0)) || 0;
        var replies = Number(get(c, ["replies","reply_count","reply_count_unique"], 0)) || 0;
        var rr = get(c, ["reply_rate","avg_reply_rate"], "");

        var code = (c.campaign_status !== undefined && c.campaign_status !== null)
          ? c.campaign_status
          : ((c.status !== undefined && c.status !== null) ? c.status : 0);

        var st = get(c, ["status_label"], "");
        if (!st) st = statusFromCode(code);

        if (rr !== "" && rr !== null && rr !== undefined){
          var s = String(rr);
          if (s.indexOf("%") === -1) s = s + "%";
          rr = s;
        }

        return { campaign_name: name, status: st, emails_sent: emailsSent, replies: replies, avg_reply_rate: rr };
      });

      var lines = [];
      lines.push("SUMMARY");
      lines.push("Metric,Value");
      for (var j=0;j<summaryRows.length;j++){
        lines.push(csvEscape(summaryRows[j][0]) + "," + csvEscape(summaryRows[j][1]));
      }

      lines.push("");
      lines.push("CAMPAIGNS");
      lines.push("Campaign Name,Status,Emails Sent,Replies,Avg Reply Rate");
      for (var k2=0;k2<list.length;k2++){
        var r = list[k2];
        lines.push([
          csvEscape(r.campaign_name),
          csvEscape(r.status),
          csvEscape(r.emails_sent),
          csvEscape(r.replies),
          csvEscape(r.avg_reply_rate)
        ].join(","));
      }

      var csv = lines.join("\n");
      var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      var url = URL.createObjectURL(blob);

      var a = document.createElement("a");
      a.href = url;
      a.download = safeBrand + "_" + safeLabel + "_dashboard.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

    } catch (e) {
      console.error("Export CSV failed:", e);
      alert("Export failed — check console for details");
    }
  };

  // Export what is currently visible on the dashboard as a formatted Excel file (.xlsx)
  const exportVisibleXlsx = async () => {
    try {
      const XLSX = await import("xlsx");
      const { saveAs } = await import("file-saver");

      const b = brand_name ? String(brand_name) : "Client";
      const safeBrand = b.replace(/[^a-z0-9_-]+/gi, "_");

      const days = (date_range && date_range.days) ? date_range.days : 0;
      const label = (date_range && date_range.label) ? String(date_range.label) : ("Last_" + days + "_days");
      const safeLabel = label.replace(/[^a-z0-9_-]+/gi, "_");

      const get = (obj, keys, fallback = 0) => {
        for (const k of keys) {
          if (obj && obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
        }
        return fallback;
      };

      // ===== Summary Sheet (nice + readable) =====
      const totalEmailsSent = get(normalizedStats, ["total_sent","emails_sent","total_emails_sent","emails_sent_count"], 0);
      const totalReplies = get(normalizedStats, ["total_replies","reply_count","replies"], 0);
      const replyRate = get(normalizedStats, ["reply_rate","replyRate"], 0);
      const activeCampaigns = get(normalizedStats, ["active_campaigns","total_campaigns"], 0);

      const start = (date_range && date_range.start) ? date_range.start : "";
      const end = (date_range && date_range.end) ? date_range.end : "";

      const summaryAoA = [
        ["DASHBOARD SUMMARY", ""],
        ["Brand", b],
        ["View", label],
        ["Date Start", start],
        ["Date End", end],
        ["Days", days],
        ["", ""],
        ["Total Emails Sent", Number(totalEmailsSent)],
        ["Total Replies", Number(totalReplies)],
        ["Avg Reply Rate (%)", Number(replyRate)],
        ["Active Campaigns", Number(activeCampaigns)],
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryAoA);
      wsSummary["!cols"] = [{ wch: 22 }, { wch: 36 }];

      // ===== Campaigns Sheet =====
      const statusFromCode = (code) => {
        if (code === 1) return "Active";
        if (code === 3) return "Completed";
        return "Paused";
      };

      const campaignRows = (campaigns || []).map((c) => {
        const code =
          (c.campaign_status !== undefined && c.campaign_status !== null)
            ? c.campaign_status
            : ((c.status !== undefined && c.status !== null) ? c.status : 0);

        const name = get(c, ["name","campaign_name"], "");
        const status = get(c, ["status_label"], "") || statusFromCode(code);

        const emailsSent = Number(get(c, ["sent","emails_sent","emails_sent_count"], 0)) || 0;
        const replies = Number(get(c, ["replies","reply_count","reply_count_unique"], 0)) || 0;

        const rrRaw = get(c, ["reply_rate","avg_reply_rate"], "");
        const rr = (rrRaw === "" || rrRaw === null || rrRaw === undefined) ? "" : Number(rrRaw);

        return {
          "Campaign Name": name,
          "Status": status,
          "Emails Sent": emailsSent,
          "Replies": replies,
          "Avg Reply Rate (%)": rr,
        };
      }).sort((a, b) => (b["Emails Sent"] || 0) - (a["Emails Sent"] || 0));

      const wsCampaigns = XLSX.utils.json_to_sheet(campaignRows);
      wsCampaigns["!freeze"] = { xSplit: 0, ySplit: 1 };
      wsCampaigns["!cols"] = [
        { wch: 44 },
        { wch: 12 },
        { wch: 14 },
        { wch: 10 },
        { wch: 18 },
      ];

      // Number formats
      const range = XLSX.utils.decode_range(wsCampaigns["!ref"] || "A1:A1");
      for (let R = 1; R <= range.e.r; R++) {
        const cCell = XLSX.utils.encode_cell({ r: R, c: 2 }); // Emails Sent
        if (wsCampaigns[cCell]) wsCampaigns[cCell].z = "#,##0";

        const dCell = XLSX.utils.encode_cell({ r: R, c: 3 }); // Replies
        if (wsCampaigns[dCell]) wsCampaigns[dCell].z = "#,##0";

        const eCell = XLSX.utils.encode_cell({ r: R, c: 4 }); // Reply Rate
        if (wsCampaigns[eCell]) wsCampaigns[eCell].z = "0.00";
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
      XLSX.utils.book_append_sheet(wb, wsCampaigns, "Campaigns");

      const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([out], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, safeBrand + "_" + safeLabel + "_dashboard.xlsx");
    } catch (e) {
      console.error("Export XLSX failed:", e);
      alert("Export failed - check console for details");
    }
  };
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gistId = urlParams.get('gist');

    if (!gistId) {
      setError('No Gist ID provided in URL. Please add ?gist=YOUR_GIST_ID');
      setLoading(false);
      return;
    }

    fetch(`https://api.github.com/gists/${gistId}`)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to fetch Gist: ${response.status}`);
        return response.json();
      })
      .then((gist) => {
        const files = gist.files;
        const fileName = Object.keys(files).find((name) => name.endsWith('.json'));
        if (!fileName) throw new Error('No JSON file found in Gist');

        const parsedData = JSON.parse(files[fileName].content);
        console.log('Dashboard data loaded:', parsedData);
        setData(parsedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // keep hooks-only-above: compute safely without hooks
  const brand_name = data?.brand_name;
  const date_range = data?.date_range;
  const stats = data?.stats;
  const charts = data?.charts;
  const campaigns = data?.campaigns;

  // ✅ active campaigns fix (robust)
  const derivedActive =
    stats?.active_campaigns ??
    stats?.total_campaigns ??
    (campaigns || []).filter((c) => (c.status ?? c.campaign_status) === 1).length ??
    0;

  const normalizedStats = {
    ...(stats || {}),
    active_campaigns: derivedActive,
    total_sent:
      stats?.total_sent ??
      stats?.emails_sent ??
      stats?.total_emails_sent ??
      stats?.emails_sent_count ??
      0,
    reply_rate: stats?.reply_rate ?? stats?.replyRate ?? 0,
  };

  const subtitle = `${date_range?.start || 'N/A'} to ${date_range?.end || 'N/A'} (${date_range?.days || 0} days) • ${derivedActive} active campaigns`;

  const headerVariants = {
    hidden: { opacity: 0, y: -18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, staggerChildren: 0.08 } }
  };

  const itemLeft = { hidden: { opacity: 0, x: -18 }, show: { opacity: 1, x: 0, transition: { duration: 0.55 } } };
  const itemRight = { hidden: { opacity: 0, x: 18 }, show: { opacity: 1, x: 0, transition: { duration: 0.55 } } };

  if (loading) {
    return (
      <div className="app">
        <div className="container">
          <div className="loading glass-card glass-card--pad">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading dashboard data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="container">
          <div className="error glass-card glass-card--pad">
            <div className="error-title">Error Loading Dashboard</div>
            <div className="error-message">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        {/* Topbar (outside header card) */}
        <div className="topbar">
          <img className="brand-logo-main" src={logo} alt="Lead Catalyst" />
        

          <div className="topbar-actions">
            <button className="btn-export" onClick={exportVisibleXlsx}>
              ⬇️ Export
            </button>
          </div>
</div>

        {/* Header */}
        <motion.div className="header glass-card glass-card--pad" variants={headerVariants} initial="hidden" animate="show">
          <div className="header-top">
            <motion.div className="daterange" variants={itemRight}>
              Date range: <span>{date_range?.label || `Last ${date_range?.days || 0} days`}</span>
            </motion.div>
          </div>

          <motion.h1 className="title" variants={itemLeft}>{(brand_name || "Client")} Campaign Analytics</motion.h1>
          <motion.p className="subtitle" variants={itemLeft}>{subtitle}</motion.p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.12 }}>
          <StatsCards stats={normalizedStats} />
        </motion.div>

        {/* Charts */}
        <div className="charts-grid">
          <motion.div className="chart-wrap glass-card glass-card--pad"
            initial={{ opacity: 0, x: -22 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
          >
            <BarChart data={charts?.campaign_performance} />
          </motion.div>

          <motion.div className="chart-wrap glass-card glass-card--pad"
            initial={{ opacity: 0, x: 22 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.30 }}
          >
            <DonutChart campaigns={campaigns} />
          </motion.div>
        </div>

        {/* Campaign Table */}
        <motion.div
          className="glass-card glass-card--pad"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.36 }}
        >
          <CampaignTable campaigns={campaigns} />
        </motion.div>

      </div>
    </div>
  );
}

export default App;
