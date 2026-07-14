import { useSelector, useDispatch } from 'react-redux';
import { setInputMode } from '../store/uiSlice';
import { MessageSquare, FileText, Activity } from 'lucide-react';

export default function Header() {
  const dispatch = useDispatch();
  const { inputMode } = useSelector((state) => state.ui);

  return (
    <header className="header">
      <div className="header-left">
        <Activity size={24} className="header-logo" />
        <span className="header-title">PharmaCRM</span>
        <span className="header-subtitle">HCP Module</span>
      </div>
      <div className="header-center">
        <div className="mode-toggle">
          <button
            className={`mode-btn ${inputMode === 'form' ? 'active' : ''}`}
            onClick={() => dispatch(setInputMode('form'))}
          >
            <FileText size={16} />
            Structured Form
          </button>
          <button
            className={`mode-btn ${inputMode === 'chat' ? 'active' : ''}`}
            onClick={() => dispatch(setInputMode('chat'))}
          >
            <MessageSquare size={16} />
            AI Chat
          </button>
        </div>
      </div>
      <div className="header-right">
        <div className="user-avatar">FR</div>
        <span className="user-name">Field Rep</span>
      </div>

      <style>{`
        .header {
          height: 64px;
          background: var(--bg-white);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .header-logo {
          color: var(--primary);
        }
        .header-title {
          font-weight: 700;
          font-size: 18px;
          color: var(--text);
        }
        .header-subtitle {
          font-size: 13px;
          color: var(--text-muted);
          padding-left: 8px;
          border-left: 1px solid var(--border);
          margin-left: 4px;
        }
        .header-center {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }
        .mode-toggle {
          display: flex;
          background: var(--border-light);
          border-radius: var(--radius);
          padding: 3px;
        }
        .mode-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: none;
          background: transparent;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all 0.2s;
        }
        .mode-btn.active {
          background: var(--bg-white);
          color: var(--primary);
          box-shadow: var(--shadow-sm);
        }
        .mode-btn:hover:not(.active) {
          color: var(--text);
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }
        .user-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
        }
      `}</style>
    </header>
  );
}
