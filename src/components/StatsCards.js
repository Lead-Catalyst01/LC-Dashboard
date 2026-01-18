import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import './StatsCards.css';

const StatsCards = ({ stats }) => {
  const cards = [
  {
    label: "Total Emails Sent",
    value: stats?.total_sent || 0
  },
  {
    label: "Avg Reply Rate",
    value: stats?.reply_rate || 0,
    suffix: "%"
  },
  {
    label: "Total Replies",
    value: stats?.total_replies ?? ((stats?.replies_interested || 0) + (stats?.replies_not_interested || 0))
  },
  {
    label: "Active Campaigns",
    value: stats?.active_campaigns || 0
  }
];

  return (
    <div className="stats-grid">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          className="stat-card glass-card"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.12 + i * 0.08 }}
        >
          <div className="stat-label">{c.label}</div>
          <div className="stat-value">
            <CountUp end={Number(c.value) || 0} duration={1.6} separator="," decimals={c.suffix === '%' ? 2 : 0} />
            {c.suffix}
          </div>
          <div className="stat-subtext">Updated just now</div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
