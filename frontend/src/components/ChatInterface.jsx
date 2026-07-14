import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { sendChatMessage, addUserMessage, clearChat } from '../store/chatSlice';
import { Send, Bot, User, Wrench, RotateCcw, Sparkles } from 'lucide-react';

export default function ChatInterface() {
  const dispatch = useDispatch();
  const { messages, conversationId, loading } = useSelector((state) => state.chat);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    dispatch(addUserMessage(msg));
    dispatch(sendChatMessage({ message: msg, conversationId }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "Log a meeting with Dr. Sharma about CardioShield today",
    "Show me interaction history for Dr. Patel",
    "Search for cardiologists in Mumbai",
    "Schedule a follow-up with Dr. Menon next week",
    "Edit interaction #1 to change sentiment to positive",
  ];

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-left">
          <Sparkles size={16} className="ai-icon" />
          <span>AI Assistant</span>
        </div>
        <button className="clear-btn" onClick={() => dispatch(clearChat())} title="New conversation">
          <RotateCcw size={14} /> New
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <Bot size={40} className="welcome-icon" />
            <h3>How can I help you today?</h3>
            <p>Describe your interaction naturally and I'll log it for you, or ask me to search HCPs, view history, and more.</p>
            <div className="suggestions">
              {suggestions.map((s, i) => (
                <button key={i} className="suggestion-btn" onClick={() => { setInput(s); }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            <div className="msg-avatar">
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className="msg-content">
              <div className="msg-text">{msg.content}</div>
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="tool-calls">
                  {msg.toolCalls.map((tc, j) => (
                    <div key={j} className="tool-call-badge">
                      <Wrench size={12} /> {tc.tool}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-msg assistant">
            <div className="msg-avatar"><Bot size={16} /></div>
            <div className="msg-content">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your interaction or ask a question..."
          rows={2}
          disabled={loading}
        />
        <button className="send-btn" onClick={handleSend} disabled={!input.trim() || loading}>
          <Send size={18} />
        </button>
      </div>

      <style>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 220px);
          min-height: 500px;
        }
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
        }
        .chat-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }
        .ai-icon { color: var(--accent); }
        .clear-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg-white);
          font-size: 12px;
          color: var(--text-secondary);
          transition: all 0.2s;
        }
        .clear-btn:hover {
          background: var(--border-light);
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }
        .chat-welcome {
          text-align: center;
          padding: 40px 20px;
        }
        .welcome-icon {
          color: var(--primary-light);
          margin-bottom: 12px;
        }
        .chat-welcome h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .chat-welcome p {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 20px;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }
        .suggestions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
        }
        .suggestion-btn {
          padding: 8px 16px;
          border: 1px solid var(--border);
          border-radius: 20px;
          background: var(--bg-white);
          font-size: 12px;
          color: var(--text-secondary);
          transition: all 0.2s;
          max-width: 380px;
          text-align: left;
        }
        .suggestion-btn:hover {
          border-color: var(--primary-light);
          color: var(--primary);
          background: var(--primary-bg);
        }
        .chat-msg {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }
        .msg-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .chat-msg.user .msg-avatar {
          background: var(--primary-bg);
          color: var(--primary);
        }
        .chat-msg.assistant .msg-avatar {
          background: #f3e8ff;
          color: var(--accent);
        }
        .msg-content {
          flex: 1;
          min-width: 0;
        }
        .msg-text {
          font-size: 14px;
          line-height: 1.6;
          color: var(--text);
          white-space: pre-wrap;
        }
        .tool-calls {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }
        .tool-call-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 12px;
          background: #f0fdf4;
          color: #16a34a;
          font-size: 11px;
          font-weight: 500;
        }
        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 8px 0;
        }
        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--text-muted);
          animation: bounce 1.4s infinite ease-in-out;
        }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .chat-input-area {
          display: flex;
          gap: 8px;
          padding: 16px 20px;
          border-top: 1px solid var(--border);
          background: var(--bg);
        }
        .chat-input-area textarea {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
          resize: none;
          outline: none;
          background: var(--bg-white);
          line-height: 1.5;
        }
        .chat-input-area textarea:focus {
          border-color: var(--primary-light);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .send-btn {
          width: 44px;
          height: 44px;
          border: none;
          border-radius: 8px;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          align-self: flex-end;
        }
        .send-btn:hover:not(:disabled) {
          background: var(--primary-dark);
        }
        .send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
