import React from 'react';
import './CampaignTable.css';

const CampaignTable = ({ campaigns }) => {
  const getBadgeClass = (rate) => {
    const numRate = parseFloat(rate);
    if (numRate >= 2.0) return 'badge-excellent';
    if (numRate >= 1.0) return 'badge-good';
    return 'badge-average';
  };

  return (
    <div className="table-section">
      <div className="table-header">
        <h3 className="table-title">Detailed Campaign Performance</h3>
        <p className="table-description">Complete breakdown of all campaigns</p>
      </div>
      
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>CAMPAIGN NAME</th>
              <th>EMAILS SENT</th>
              <th>REPLIES</th>
              <th>REPLY RATE</th>
            </tr>
          </thead>
          <tbody>
            {(campaigns || []).map((campaign, index) => (
              <tr key={index}>
                <td className="campaign-name">{campaign.name}</td>
                <td>{campaign.sent.toLocaleString()}</td>
                <td>{campaign.replies}</td>
                <td>
                  <span className={`badge ${getBadgeClass(campaign.reply_rate)}`}>
                    {campaign.reply_rate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignTable;
