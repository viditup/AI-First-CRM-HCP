import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchHcps, setSelectedHcp } from '../store/hcpSlice';
import { fetchInteractions } from '../store/interactionSlice';
import { Users, Search, Star } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const dispatch = useDispatch();
  const { list: hcps, selected, loading } = useSelector((state) => state.hcp);
  const [search, setSearch] = useState('');

  const filtered = hcps.filter((h) =>
    `${h.first_name} ${h.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    (h.specialty && h.specialty.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (hcp) => {
    dispatch(setSelectedHcp(hcp));
    dispatch(fetchInteractions({ hcp_id: hcp.id }));
  };

  const tierColor = (tier) => {
    switch (tier) {
      case 'A': return '#16a34a';
      case 'B': return '#f59e0b';
      case 'C': return '#6b7280';
      default: return '#9ca3af';
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Users size={16} />
        <span>HCP Directory</span>
      </div>
      <div className="sidebar-search">
        <Search size={14} className="search-icon" />
        <input
          type="text"
          placeholder="Search HCPs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="hcp-list">
        {filtered.map((hcp) => (
          <div
            key={hcp.id}
            className={`hcp-item ${selected?.id === hcp.id ? 'active' : ''}`}
            onClick={() => handleSelect(hcp)}
          >
            <div className="hcp-avatar">{hcp.first_name[0]}{hcp.last_name[0]}</div>
            <div className="hcp-info">
              <div className="hcp-name">Dr. {hcp.first_name} {hcp.last_name}</div>
              <div className="hcp-specialty">{hcp.specialty}</div>
            </div>
            <span className="hcp-tier" style={{ color: tierColor(hcp.tier) }}>{hcp.tier}</span>
          </div>
        ))}
        {filtered.length === 0 && !loading && (
          <div className="empty-state">No HCPs found</div>
        )}
      </div>

      <style>{`
        .sidebar {
          width: 260px;
          background: var(--bg-white);
          border-right: 1px solid var(--border);
          height: calc(100vh - 64px);
          overflow-y: auto;
          flex-shrink: 0;
        }
        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 16px 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .sidebar-search {
          padding: 8px 12px;
          position: relative;
        }
        .sidebar-search input {
          width: 100%;
          padding: 8px 8px 8px 32px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
          outline: none;
          background: var(--bg);
          transition: border-color 0.2s;
        }
        .sidebar-search input:focus {
          border-color: var(--primary-light);
        }
        .search-icon {
          position: absolute;
          left: 22px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .hcp-list {
          padding: 4px 8px;
        }
        .hcp-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .hcp-item:hover {
          background: var(--border-light);
        }
        .hcp-item.active {
          background: var(--primary-bg);
        }
        .hcp-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary-light), var(--accent));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .hcp-info {
          flex: 1;
          min-width: 0;
        }
        .hcp-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .hcp-specialty {
          font-size: 11px;
          color: var(--text-muted);
        }
        .hcp-tier {
          font-size: 12px;
          font-weight: 700;
        }
        .empty-state {
          padding: 24px;
          text-align: center;
          font-size: 13px;
          color: var(--text-muted);
        }
      `}</style>
    </aside>
  );
}
