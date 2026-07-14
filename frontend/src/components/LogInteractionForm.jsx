import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createInteraction, resetFormStatus } from '../store/interactionSlice';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';

const INTERACTION_TYPES = [
  { value: 'detail_aid', label: 'Detail Aid' },
  { value: 'sample_drop', label: 'Sample Drop' },
  { value: 'meeting', label: 'In-Person Meeting' },
  { value: 'phone_call', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
  { value: 'conference', label: 'Conference' },
  { value: 'lunch_and_learn', label: 'Lunch & Learn' },
  { value: 'virtual_meeting', label: 'Virtual Meeting' },
];

const PRODUCTS = [
  'CardioShield 50mg', 'CardioShield 100mg', 'VasoPro 100mg',
  'GlucoBalance XR', 'OncoDefend', 'ImmunoBoost',
  'NeuroCare Plus', 'DermaSoothe Cream',
];

const initialForm = {
  hcp_id: '',
  interaction_type: 'meeting',
  interaction_date: new Date().toISOString().slice(0, 16),
  duration_minutes: 30,
  products_discussed: [],
  key_topics: '',
  notes: '',
  sentiment: 'neutral',
  follow_up_required: 'no',
};

export default function LogInteractionForm() {
  const dispatch = useDispatch();
  const { selected: selectedHcp } = useSelector((state) => state.hcp);
  const { formStatus } = useSelector((state) => state.interaction);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (selectedHcp) {
      setForm((f) => ({ ...f, hcp_id: selectedHcp.id }));
    }
  }, [selectedHcp]);

  useEffect(() => {
    if (formStatus === 'success') {
      const timer = setTimeout(() => {
        dispatch(resetFormStatus());
        setForm({ ...initialForm, hcp_id: selectedHcp?.id || '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formStatus, dispatch, selectedHcp]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const toggleProduct = (product) => {
    setForm((f) => ({
      ...f,
      products_discussed: f.products_discussed.includes(product)
        ? f.products_discussed.filter((p) => p !== product)
        : [...f.products_discussed, product],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.hcp_id) return;
    dispatch(createInteraction({
      ...form,
      products_discussed: form.products_discussed.join(', '),
      interaction_date: new Date(form.interaction_date).toISOString(),
    }));
  };

  return (
    <form className="log-form" onSubmit={handleSubmit}>
      <div className="form-section-header">
        <h3>Interaction Details</h3>
        {!selectedHcp && <span className="hint">← Select an HCP from the sidebar</span>}
      </div>

      {selectedHcp && (
        <div className="selected-hcp-banner">
          <div className="hcp-banner-avatar">{selectedHcp.first_name[0]}{selectedHcp.last_name[0]}</div>
          <div>
            <strong>Dr. {selectedHcp.first_name} {selectedHcp.last_name}</strong>
            <span>{selectedHcp.specialty} · {selectedHcp.institution}</span>
          </div>
        </div>
      )}

      <div className="form-grid">
        <div className="form-group">
          <label>Interaction Type</label>
          <select name="interaction_type" value={form.interaction_type} onChange={handleChange}>
            {INTERACTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Date & Time</label>
          <input type="datetime-local" name="interaction_date" value={form.interaction_date} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Duration (minutes)</label>
          <input type="number" name="duration_minutes" value={form.duration_minutes} onChange={handleChange} min="1" max="480" />
        </div>

        <div className="form-group">
          <label>Sentiment</label>
          <div className="sentiment-buttons">
            {['positive', 'neutral', 'negative'].map((s) => (
              <button
                key={s}
                type="button"
                className={`sentiment-btn ${s} ${form.sentiment === s ? 'active' : ''}`}
                onClick={() => setForm((f) => ({ ...f, sentiment: s }))}
              >
                {s === 'positive' ? '😊' : s === 'neutral' ? '😐' : '😞'} {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="form-group full-width">
        <label>Products Discussed</label>
        <div className="product-chips">
          {PRODUCTS.map((p) => (
            <button
              key={p}
              type="button"
              className={`chip ${form.products_discussed.includes(p) ? 'active' : ''}`}
              onClick={() => toggleProduct(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group full-width">
        <label>Key Topics</label>
        <input
          type="text"
          name="key_topics"
          value={form.key_topics}
          onChange={handleChange}
          placeholder="e.g., Clinical trial data, dosing guidelines, competitive analysis"
        />
      </div>

      <div className="form-group full-width">
        <label>Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={4}
          placeholder="Describe the interaction in detail..."
        />
      </div>

      <div className="form-group">
        <label>Follow-up Required?</label>
        <div className="radio-group">
          <label className="radio-label">
            <input type="radio" name="follow_up_required" value="yes" checked={form.follow_up_required === 'yes'} onChange={handleChange} />
            Yes
          </label>
          <label className="radio-label">
            <input type="radio" name="follow_up_required" value="no" checked={form.follow_up_required === 'no'} onChange={handleChange} />
            No
          </label>
        </div>
      </div>

      <div className="form-actions">
        {formStatus === 'success' && (
          <div className="status-msg success"><CheckCircle size={16} /> Interaction logged successfully!</div>
        )}
        {formStatus === 'error' && (
          <div className="status-msg error"><AlertCircle size={16} /> Failed to log interaction.</div>
        )}
        <button type="submit" className="submit-btn" disabled={!form.hcp_id || formStatus === 'submitting'}>
          <Save size={16} />
          {formStatus === 'submitting' ? 'Saving...' : 'Log Interaction'}
        </button>
      </div>

      <style>{`
        .log-form {
          padding: 24px;
        }
        .form-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .form-section-header h3 {
          font-size: 16px;
          font-weight: 600;
        }
        .hint {
          font-size: 13px;
          color: var(--warning);
        }
        .selected-hcp-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--primary-bg);
          border: 1px solid #bfdbfe;
          border-radius: var(--radius);
          margin-bottom: 20px;
        }
        .selected-hcp-banner strong {
          display: block;
          font-size: 14px;
          color: var(--text);
        }
        .selected-hcp-banner span {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .hcp-banner-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary-light), var(--accent));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          flex-shrink: 0;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-group.full-width {
          grid-column: 1 / -1;
        }
        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }
        .form-group input[type="text"],
        .form-group input[type="number"],
        .form-group input[type="datetime-local"],
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          background: var(--bg-white);
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: var(--primary-light);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .form-group textarea {
          resize: vertical;
        }
        .sentiment-buttons {
          display: flex;
          gap: 8px;
        }
        .sentiment-btn {
          flex: 1;
          padding: 8px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg-white);
          font-size: 13px;
          text-transform: capitalize;
          transition: all 0.2s;
        }
        .sentiment-btn.active.positive {
          border-color: #16a34a;
          background: #f0fdf4;
          color: #16a34a;
        }
        .sentiment-btn.active.neutral {
          border-color: #f59e0b;
          background: #fffbeb;
          color: #d97706;
        }
        .sentiment-btn.active.negative {
          border-color: #dc2626;
          background: #fef2f2;
          color: #dc2626;
        }
        .product-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .chip {
          padding: 6px 12px;
          border: 1px solid var(--border);
          border-radius: 20px;
          background: var(--bg-white);
          font-size: 12px;
          color: var(--text-secondary);
          transition: all 0.2s;
        }
        .chip.active {
          border-color: var(--primary);
          background: var(--primary-bg);
          color: var(--primary);
          font-weight: 500;
        }
        .radio-group {
          display: flex;
          gap: 16px;
        }
        .radio-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          cursor: pointer;
        }
        .form-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 8px;
          border-top: 1px solid var(--border-light);
        }
        .submit-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          border: none;
          border-radius: 6px;
          background: var(--primary);
          color: white;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.2s;
        }
        .submit-btn:hover:not(:disabled) {
          background: var(--primary-dark);
        }
        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .status-msg {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
        }
        .status-msg.success { color: var(--success); }
        .status-msg.error { color: var(--danger); }
      `}</style>
    </form>
  );
}
