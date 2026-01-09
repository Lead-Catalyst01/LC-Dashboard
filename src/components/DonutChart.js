import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import './ChartCard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const DonutChart = ({ campaigns }) => {
  const top4 = (campaigns || []).slice(0, 4);
  
  const chartData = {
    labels: top4.map(c => c.name),
    datasets: [{
      data: top4.map(c => parseFloat(c.reply_rate)),
      backgroundColor: [
        'rgba(251, 191, 36, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(244, 114, 182, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ],
      borderColor: [
        'rgba(251, 191, 36, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(244, 114, 182, 1)',
        'rgba(139, 92, 246, 1)'
      ],
      borderWidth: 2
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'white',
          font: {
            size: 11,
            weight: '600'
          },
          padding: 16,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(139, 92, 246, 0.5)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      }
    }
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Reply Rate Performance</h3>
        <p className="chart-description">Performance by campaign</p>
      </div>
      <div className="chart-wrapper">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default DonutChart;
