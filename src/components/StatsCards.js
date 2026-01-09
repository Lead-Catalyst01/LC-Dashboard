import React from 'react';
import { motion } from 'framer-motion';
import './StatsCards.css';

const StatsCards = ({ stats }) => {
  const cards = [
    {
      icon: '📧',
      label: 'TOTAL EMAILS SENT',
      value: (stats?.total_sent || 0).toLocaleString(),
      subtitle: 'Delivered to prospects',
      change: '+8.2%',
      positive: true
    },
    {
      icon: '💬',
      label: 'REPLY RATE',
      value: `${stats?.reply_rate || '0.00'}%`,
      subtitle: `${(stats?.total_replies || 0).toLocaleString()} total replies`,
      change: '+8.2%',
      positive: true
    },
    {
      icon: '⚠️',
      label: 'BOUNCE RATE',
      value: `${stats?.bounce_rate || '0.00'}%`,
      subtitle: `${(stats?.total_bounced || 0).toLocaleString()} bounced`,
      change: '-2.1%',
      positive: true
    },
    {
      icon: '🚀',
      label: 'ACTIVE CAMPAIGNS',
      value: stats?.total_campaigns || 0,
      subtitle: 'Currently running',
      change: '+14.3%',
      positive: true
    }
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }}
        >
          <div className="stat-card-header">
            <div className="stat-icon">{card.icon}</div>
            <div className={`stat-change ${card.positive ? 'positive' : 'negative'}`}>
              {card.change}
            </div>
          </div>
          <div className="stat-label">{card.label}</div>
          <div className="stat-value">{card.value}</div>
          <div className="stat-subtitle">{card.subtitle}</div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
