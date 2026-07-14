import { useSelector } from 'react-redux';
import { Clock, Phone, Mail, Users, Monitor, Coffee, Briefcase, FileText, Calendar } from 'lucide-react';

const typeIcons = {
  meeting: Briefcase,
  phone_call: Phone,
  email: Mail,
  conference: Users,
  virtual_meeting: Monitor,
  lunch_and_learn: Coffee,
  detail_aid: FileText,
  sample_drop: FileText,
};

const typeLabels = {
  detail_aid: 'Detail Aid',
  sample_drop: 'Sample Drop',
  meeting: 'Meeting',
  phone_call: 'Phone Call',
  email: 'Email',
  conference: 'Conference',
  lunch_and_learn: 'Lunch & Learn',
  virtual_meeting: 'Virtual Meeting',
};

const sentimentColors = {
  positive: { bg: '#f0fdf4', color: '#16a34a', label: 'Positive' },
  neutral: { bg: '#fffbeb', color: '#d97706', label: 'Neutral' },
  negative: { bg: '#fef2f2', color: '#dc2626', label: 'Negative' },
};

export default function InteractionHistory() {
  const { list, loading } = useSelector((state) => state.interaction);
  const { selected: selectedHcp } = useSelector((state) => state.hcp);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="history">
      <div className="history-header">
        <Calendar size={16} />
        <span>Recent Interactions</span>
        <span className="history-count">{list.length}</span>
      </div>

      {list.length === 0 && (
        <div className="history-empty">
          <Clock size={32} className="empty-icon" />
          <p>{selectedHcp ? 'No interactions logged yet' : 'Select an HCP to view history'}</p>
        </div>
      )}

      <div className="history-list">
        {list.map((interaction) => {
          const Icon = typeIcons[interaction.interaction_type] || FileText;
          const sentiment = sentimentColors[interaction.sentiment] || sentimentColors.neutral;
          return (
            <div key={interaction.id} className="history-item">
              <div className="history-icon-wrap">
                <Icon size={16} />
              </div>
              <div className="history-item-content">
                <div className="history-item-top">
                  <span className="history-type">{typeLabels[interaction.interaction_type] || interaction.interaction_type}</span>
                  <span
                    className="sentiment-badge"
                    style={{ background: sentiment.bg, color: sentiment.color }}
                  >
                    {sentiment.label}
                  </span>
                </div>
                <div className="history-date">
                  {formatDate(interaction.interaction_date)} at {formatTime(interaction.interaction_date)}
                  {interaction.duration_minutes && ` · ${interaction.duration_minutes}min`}
                </div>
                {interaction.products_discussed && (
                  <div className="history-products">{interaction.products_discussed}</div>
                )}
                {interaction.notes && (
                  <div className="history-notes">{interaction.notes}</div>
                )}
                {interaction.ai_summary && (
                  <div className="history-ai-summary">
                    <strong>AI Summary:</strong> {interaction.ai_summary}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .history {
          display: flex;
          flex-direction: column;
        }
        .history-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }
        .history-count {
          margin-left: auto;
          background: var(--border-light);
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .history-empty {
          text-align: center;
          padding: 48px 20px;
          color: var(--text-muted);
        }
        .empty-icon {
          color: var(--border);
          margin-bottom: 8px;
        }
        .history-empty p {
          font-size: 13px;
        }
        .history-list {
          padding: 8px;
        }
        .history-item {
          display: flex;
          gap: 12px;
          padding: 14px 12px;
          border-radius: 8px;
          transition: background 0.15s;
        }
        .history-item:hover {
          background: var(--border-light);
        }
        .history-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--primary-bg);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .history-item-content {
          flex: 1;
          min-width: 0;
        }
        .history-item-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2px;
        }
        .history-type {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }
        .sentiment-badge {
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 500;
        }
        .history-date {
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 6px;
        }
        .history-products {
          font-size: 12px;
          color: var(--primary);
          margin-bottom: 4px;
        }
        .history-notes {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .history-ai-summary {
          margin-top: 6px;
          padding: 8px;
          background: #f5f3ff;
          border-radius: 6px;
          font-size: 12px;
          color: var(--accent);
          line-height: 1.5;
        }
        .history-ai-summary strong {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
