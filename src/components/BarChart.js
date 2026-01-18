import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import './ChartCard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const BarChart = ({ data }) => {
  const labels = (data && data.labels) ? data.labels : [];
  const sent = (data && data.sent) ? data.sent : [];
  const replies = (data && data.replies) ? data.replies : [];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Emails Sent',
        data: sent,
        borderColor: 'rgba(168, 85, 247, 0.95)',
        backgroundColor: 'rgba(168, 85, 247, 0.18)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 3
      },
      {
        label: 'Replies',
        data: replies,
        borderColor: 'rgba(34, 211, 238, 0.95)',
        backgroundColor: 'rgba(34, 211, 238, 0.12)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 3
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1200, easing: 'easeOutQuart' },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(255,255,255,0.85)',
          font: { size: 12, weight: '600' },
          padding: 18,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          title: (items) => items?.[0]?.label || '',
          label: (ctx) => {
            const v = ctx.parsed?.y ?? ctx.raw ?? 0;
            const label = ctx.dataset?.label || '';
            return `${label}: ${Number(v).toLocaleString()}`;
          }
        },
        backgroundColor: 'rgba(10,10,14,0.92)',
        padding: 12,
        titleColor: 'rgba(255,255,255,0.95)',
        bodyColor: 'rgba(255,255,255,0.85)',
        borderColor: 'rgba(255,255,255,0.14)',
        borderWidth: 1
      }
    },
    interaction: { mode: 'index', intersect: false },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: 'rgba(255,255,255,0.65)', font: { size: 11 } },
        grid: { color: 'rgba(255,255,255,0.08)' }
      },
      x: {
        ticks: { display: false },
        grid: { display: false }
      }
    }
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Top 10 Campaigns by Volume</h3>
        <p className="chart-description">Emails sent and replies received</p>
      </div>
      <div className="chart-wrapper">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default BarChart;
