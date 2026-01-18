import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { motion } from 'framer-motion';
import './ChartCard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const DonutChart = ({ campaigns }) => {
  const top4 = (campaigns || []).slice(0, 4);

  const chartData = {
    labels: top4.map(c => c.name),
    datasets: [
      {
        data: top4.map(c => parseFloat(c.reply_rate)),
        backgroundColor: [
          'rgba(168, 85, 247, 0.75)',
          'rgba(34, 211, 238, 0.55)',
          'rgba(236, 72, 153, 0.55)',
          'rgba(251, 191, 36, 0.65)'
        ],
        borderColor: 'rgba(255,255,255,0.18)',
        borderWidth: 1,
        hoverOffset: 8,
        cutout: '65%'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1200, easing: 'easeOutQuart' },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgba(255,255,255,0.80)',
          font: { size: 11, weight: '600' },
          padding: 14,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(10,10,18,0.92)',
        padding: 12,
        titleColor: 'rgba(255,255,255,0.95)',
        bodyColor: 'rgba(255,255,255,0.85)',
        borderColor: 'rgba(255,255,255,0.18)',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.parsed}%`
        }
      }
    }
  };

  return (
    <motion.div
      className="glass-card chart-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
    >
      <div className="chart-header">
        <h3 className="chart-title">Reply Rate Performance</h3>
        <p className="chart-description">Performance by campaign</p>
      </div>

      <div className="chart-wrapper">
        <Doughnut data={chartData} options={options} />
      </div>
    </motion.div>
  );
};

export default DonutChart;
