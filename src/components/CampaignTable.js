import React, { useMemo } from 'react';
import './CampaignTable.css';

const statusMeta = (code) => {
  // Based on your data:
  // 1 = Active
  // 3 = Completed
  // -1 (and anything else) = Paused / Inactive
  if (code === 1) return { label: 'Active', cls: 'status-active' };
  if (code === 3) return { label: 'Completed', cls: 'status-completed' };
  return { label: 'Paused', cls: 'status-paused' };
};

const CampaignTable = ({ campaigns }) => {
  const summary = useMemo(() => {
    const list = campaigns || [];
    let active = 0, completed = 0, paused = 0;

    for (const c of list) {
      const code = c.campaign_status ?? c.status ?? 0;
      if (code === 1) active++;
      else if (code === 3) completed++;
      else paused++;
    }

    return { total: list.length, active, completed, paused };
  }, [campaigns]);

  const getRateBadgeClass = (rate) => {
    const numRate = parseFloat(rate);
    if (numRate >= 2.0) return 'badge-excellent';
    if (numRate >= 1.0) return 'badge-good';
    return 'badge-average';
  };

  return (
    <div className="table-section glass-card glass-card--pad">
      <div className="table-header">
        <div>
          <h3 className="table-title">Campaign Performance</h3>
          <p className="table-description">Complete breakdown of all campaigns</p>
        </div>

        <div className="table-summary">
          <span className="pill pill-active">Active {summary.active}</span>
          <span className="pill pill-completed">Completed {summary.completed}</span>
          <span className="pill pill-paused">Paused {summary.paused}</span>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>CAMPAIGN NAME</th>
              <th>STATUS</th>
              <th>EMAILS SENT</th>
              <th>REPLIES</th>
              <th>AVG REPLY RATE</th>
            </tr>
          </thead>
          <tbody>
            {(campaigns || []).map((campaign, index) => {
              const code = campaign.campaign_status ?? campaign.status ?? 0;
              const st = statusMeta(code);

              return (
                <tr key={index}>
                  <td className="campaign-name">{campaign.name}</td>

                  <td>
                    <span className={`status-badge ${st.cls}`}>
                      {st.label}
                    </span>
                  </td>

                  <td>{Number(campaign.sent || 0).toLocaleString()}</td>
                  <td>{Number(campaign.replies || 0).toLocaleString()}</td>

                  <td>
                    <span className={`badge ${getRateBadgeClass(campaign.reply_rate)}`}>
                      {campaign.reply_rate}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignTable;
