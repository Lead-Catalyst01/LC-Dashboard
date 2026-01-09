import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './App.css';
import StatsCards from './components/StatsCards';
import BarChart from './components/BarChart';
import DonutChart from './components/DonutChart';
import CampaignTable from './components/CampaignTable';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get Gist ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const gistId = urlParams.get('gist');

    if (!gistId) {
      setError('No Gist ID provided in URL. Please add ?gist=YOUR_GIST_ID');
      setLoading(false);
      return;
    }

    // Fetch data from GitHub Gist
    fetch(`https://api.github.com/gists/${gistId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch Gist: ${response.status}`);
        }
        return response.json();
      })
      .then(gist => {
        // Find the JSON file in the Gist
        const files = gist.files;
        const fileName = Object.keys(files).find(name => name.endsWith('.json'));
        
        if (!fileName) {
          throw new Error('No JSON file found in Gist');
        }
        
        // Parse the JSON content
        const jsonContent = files[fileName].content;
        const parsedData = JSON.parse(jsonContent);
        
        console.log('Dashboard data loaded:', parsedData);
        setData(parsedData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">
          <div className="error-icon">❌</div>
          <div className="error-title">Error Loading Dashboard</div>
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  const { brand_name, date_range, stats, charts, campaigns } = data;

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <motion.div 
          className="header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="brand">
            <div className="brand-logo">📊</div>
            <div className="brand-text">LEAD CATALYST</div>
          </div>
          <h1 className="title">Campaign Analytics</h1>
          <p className="subtitle">
            {date_range?.start || 'N/A'} to {date_range?.end || 'N/A'} ({date_range?.days || 0} days) • {stats?.total_campaigns || 0} active campaigns
          </p>
        </motion.div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Charts */}
        <div className="charts-grid">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <BarChart data={charts?.campaign_performance} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <DonutChart campaigns={campaigns} />
          </motion.div>
        </div>

        {/* Campaign Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <CampaignTable campaigns={campaigns} />
        </motion.div>
      </div>
    </div>
  );
}

export default App;
