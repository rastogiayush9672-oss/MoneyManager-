import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { AuthContext } from '../context/AuthContext';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  Copy,
  Check,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  Database,
  BarChart3,
  Lightbulb
} from 'lucide-react';

const AIAssistant = () => {
  const { user, currencySymbol } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    { title: 'Salary & Earnings', query: 'Show my salary history and breakdown' },
    { title: 'Monthly Expenses', query: 'How much did I spend this month?' },
    { title: 'Top Category', query: 'Where am I spending the most?' },
    { title: 'Food Spends', query: 'How much did I spend on food this month?' },
    { title: 'Budget Check', query: 'Which category is exceeding its budget?' },
    { title: 'Affordability Test', query: 'Can I afford a purchase of ₹25,000?' },
    { title: 'Savings Rate', query: 'What is my current savings rate and performance?' },
    { title: 'Period Comparison', query: 'Compare this month expenses with last month' }
  ];

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/ai/history', {
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      });
      if (res.data && res.data.length > 0) {
        setMessages(res.data);
      } else {
        setMessages([
          {
            role: 'assistant',
            content: `Hello **${user?.name || 'Friend'}**! Welcome to **Sikka AI Enterprise**. 

I am your personal AI Financial Advisor directly connected to your authenticated records. Every figure I provide is verified through backend calculations.

How can I help you optimize your finances today?`
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const text = queryText || input;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(
        'http://localhost:5000/api/ai/chat',
        { message: text },
        { headers: { Authorization: `Bearer ${Cookies.get('token')}` } }
      );

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: res.data.response,
          toolsUsed: res.data.toolsUsed,
          dataSnapshot: res.data.dataSnapshot
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Failed to query your verified financial database. Please check connection and try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (window.confirm('Clear all conversation history?')) {
      try {
        await axios.delete('http://localhost:5000/api/ai/history', {
          headers: { Authorization: `Bearer ${Cookies.get('token')}` }
        });
        setMessages([
          {
            role: 'assistant',
            content: 'Conversation history cleared. Ready for your next financial query!'
          }
        ]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const filteredMessages = messages.filter(m =>
    !searchTerm ? true : m.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderFormatted = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h5 key={idx} className="fw-bold mt-3 mb-2" style={{ color: 'var(--color-primary)' }}>{line.replace('### ', '')}</h5>;
      }
      if (line.startsWith('- ')) {
        const content = line.replace('- ', '');
        return (
          <div key={idx} style={{ display: 'flex', gap: '0.5rem', margin: '0.3rem 0', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>•</span>
            <span dangerouslySetInnerHTML={{ __html: parseBold(content) }} />
          </div>
        );
      }
      if (line.startsWith('|') && line.endsWith('|')) {
        if (line.includes('---')) return null;
        const cells = line.split('|').filter(c => c.trim() !== '');
        return (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)' }}>
            {cells.map((cell, cIdx) => (
              <span key={cIdx} style={{ flex: 1, fontWeight: idx === 0 || cIdx === 0 ? 600 : 400 }} dangerouslySetInnerHTML={{ __html: parseBold(cell.trim()) }} />
            ))}
          </div>
        );
      }
      if (line.trim() === '') return <div key={idx} style={{ height: '0.5rem' }} />;
      return <div key={idx} style={{ fontSize: '0.92rem', margin: '0.2rem 0', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: parseBold(line) }} />;
    });
  };

  const parseBold = (str) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  };

  return (
    <div style={{ paddingBottom: '30px' }}>
      {/* Top Header Card */}
      <div className="card p-4 mb-4 border-0 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)', border: '1px solid var(--border-color)' }}>
        <div className="row align-items-center">
          <div className="col-lg-8">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge-fintech success">
                <Database size={13} /> Live Database Connected
              </span>
              <span className="badge-fintech info">
                <ShieldCheck size={13} /> Zero Hallucination Engine
              </span>
            </div>
            <h2 className="fw-bold mb-1">AI Finance Assistant</h2>
            <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
              Conversational intelligence grounded in your personal transactions, salary statements, category budgets, and savings goals.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
            <button onClick={clearChat} className="btn btn-outline-custom">
              <Trash2 size={16} /> New Conversation
            </button>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left: Chat Container */}
        <div className="col-lg-8">
          <div
            className="card shadow-lg d-flex flex-column"
            style={{
              height: '700px',
              backgroundColor: 'var(--bg-card)',
              overflow: 'hidden',
              borderRadius: 'var(--radius-xl)'
            }}
          >
            {/* Chat Search Bar */}
            <div
              style={{
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: 'var(--bg-surface)'
              }}
            >
              <Search size={16} className="text-muted" />
              <input
                type="text"
                placeholder="Search within conversation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  flex: 1
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem' }}
                >
                  Clear search
                </button>
              )}
            </div>

            {/* Messages Scroll Area */}
            <div
              style={{
                flex: 1,
                padding: '1.25rem',
                overflowY: 'auto',
                backgroundColor: 'var(--bg-app)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
              }}
            >
              {filteredMessages.map((m, idx) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                      alignItems: 'flex-start'
                    }}
                  >
                    {!isUser && (
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          flexShrink: 0
                        }}
                      >
                        <Bot size={20} />
                      </div>
                    )}

                    <div
                      style={{
                        maxWidth: '82%',
                        padding: '1rem 1.25rem',
                        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        backgroundColor: isUser ? 'var(--color-primary)' : 'var(--bg-card)',
                        color: isUser ? '#fff' : 'var(--text-main)',
                        border: isUser ? 'none' : '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-sm)',
                        position: 'relative'
                      }}
                    >
                      {isUser ? (
                        <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{m.content}</div>
                      ) : (
                        <>
                          {renderFormatted(m.content)}
                          {m.toolsUsed && m.toolsUsed.length > 0 && (
                            <div
                              style={{
                                marginTop: '0.75rem',
                                paddingTop: '0.5rem',
                                borderTop: '1px solid var(--border-color)',
                                fontSize: '0.72rem',
                                color: 'var(--text-dim)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                              }}
                            >
                              <Database size={12} className="text-primary" />
                              Executed backend tools: {m.toolsUsed.join(', ')}
                            </div>
                          )}
                          <button
                            onClick={() => copyToClipboard(m.content, idx)}
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-dim)',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            title="Copy response"
                          >
                            {copiedIdx === idx ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff'
                    }}
                  >
                    <Bot size={20} className="pulse-indicator" />
                  </div>
                  <div
                    style={{
                      padding: '0.85rem 1.25rem',
                      borderRadius: '18px 18px 18px 4px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      Analyzing financial database and calculating exact figures...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-surface)',
                borderTop: '1px solid var(--border-color)'
              }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                style={{ display: 'flex', gap: '0.75rem' }}
              >
                <input
                  type="text"
                  className="form-control py-3 px-3"
                  placeholder="Ask a question about your salary, expenses, savings rate, or budget..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  style={{ borderRadius: 'var(--radius-lg)' }}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="btn btn-primary px-4"
                  style={{ borderRadius: 'var(--radius-lg)' }}
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right: Suggested Questions & Capabilities Guide */}
        <div className="col-lg-4">
          <div className="card p-4 mb-4 shadow-sm">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Sparkles size={17} className="text-primary" /> Suggested Questions
            </h6>
            <div className="d-flex flex-column gap-2">
              {suggestedQuestions.map((q, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSend(q.query)}
                  className="p-3 rounded-3"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                >
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                    {q.title}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                    {q.query}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4 shadow-sm">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Lightbulb size={17} className="text-warning" /> AI Architecture
            </h6>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <p className="mb-2">
                <strong>1. Intent Extraction:</strong> Parses user queries for dates, categories, and analytical goals.
              </p>
              <p className="mb-2">
                <strong>2. Deterministic Tool Execution:</strong> Runs secure Mongoose queries to calculate exact sums, averages, and ratios.
              </p>
              <p className="mb-0">
                <strong>3. Grounded Synthesis:</strong> Generates conversational explanations with zero mathematical hallucinations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
