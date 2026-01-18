import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './App.css';
import './styles/theme.css';
import './components/ChartCard.css';
import './components/StatsCards.css';
import './components/CampaignTable.css';

import StatsCards from './components/StatsCards';
import BarChart from "./components/BarChart";
import DonutChart from './components/DonutChart';
import CampaignTable from './components/CampaignTable';

import logo from './assets/lead-catalyst-full.png';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
