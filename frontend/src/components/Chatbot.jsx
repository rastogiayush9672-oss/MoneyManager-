import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Bot, X, Send, Sparkles, Trash2, Copy, Check, ChevronDown, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Chatbot = () => {
  const { user, currencySymbol } = useContext(AuthContext);
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const quickPrompts = [
    'How much did I spend this month?',
    'What was my highest single expense?',
    'Show my salary history',
    'Compare this month with last month',
    'Which category is exceeding budget?',
    'Can I afford a purchase of ₹25,000?'
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
            content: `Hello ${user?.name || 'there'}! I am **Sikka AI**, your intelligent financial advisor. I analyze your live transactions, salary slips, budgets, and savings goals.\n\nAsk me anything about your money!`
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  useEffect(() => {
    if (user && isOpen && messages.length === 0) {
      fetchHistory();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
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
          toolsUsed: res.data.toolsUsed
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ I encountered an error retrieving verified financial data. Please make sure the backend is reachable.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await axios.delete('http://localhost:5000/api/ai/history', {
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      });
      setMessages([
        {
          role: 'assistant',
          content: 'Conversation history cleared. What would you like to examine next?'
        }
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Simple Markdown renderer for tables, lists, bold text
  const renderFormatted = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, idx) => {
      // Heading 3
      if (line.startsWith('### ')) {
        return <h6 key={idx} className="fw-bold mt-2 mb-1 text-primary">{line.replace('### ', '')}</h6>;
      }
      // Bullet list
      if (line.startsWith('- ')) {
        const content = line.replace('- ', '');
        return (
          <div key={idx} style={{ display: 'flex', gap: '0.4rem', margin: '0.2rem 0', fontSize: '0.84rem' }}>
            <span style={{ color: 'var(--color-primary)' }}>•</span>
            <span dangerouslySetInnerHTML={{ __html: parseBold(content) }} />
          </div>
        );
      }
      // Table row (simple display)
      if (line.startsWith('|') && line.endsWith('|')) {
        if (line.includes('---')) return null;
        const cells = line.split('|').filter(c => c.trim() !== '');
        return (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0', fontSize: '0.78rem', borderBottom: '1px solid var(--border-color)' }}>
            {cells.map((cell, cIdx) => (
              <span key={cIdx} style={{ flex: 1, fontWeight: idx === 0 || cIdx === 0 ? 600 : 400 }} dangerouslySetInnerHTML={{ __html: parseBold(cell.trim()) }} />
            ))}
          </div>
        );
      }
      // Regular line
      if (line.trim() === '') return <div key={idx} style={{ height: '0.4rem' }} />;
      return <div key={idx} style={{ fontSize: '0.84rem', margin: '0.15rem 0', lineHeight: 1.45 }} dangerouslySetInnerHTML={{ __html: parseBold(line) }} />;
    });
  };

  const parseBold = (str) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  };

  return (
    <>
      {/* FLOATING ACTION TRIGGER */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1080,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(59, 130, 246, 0.45)',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        title="Ask Sikka AI"
      >
        {isOpen ? <X size={24} /> : <Bot size={26} />}
      </button>

      {/* CHAT WINDOW */}
      {isOpen && (
        <div
          className="card shadow-lg"
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            width: '390px',
            maxWidth: 'calc(100vw - 32px)',
            height: '560px',
            maxHeight: 'calc(100vh - 120px)',
            zIndex: 1080,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-modal)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.85rem 1.15rem',
              backgroundColor: 'var(--bg-surface)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.2 }}>
                  Sikka AI
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
                  Database Grounded • Verified
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <button
                onClick={() => { setIsOpen(false); navigate('/ai-assistant'); }}
                className="btn btn-sm btn-outline-custom"
                style={{ padding: '4px', border: 'none' }}
                title="Open full page"
              >
                <Maximize2 size={15} />
              </button>
              <button
                onClick={clearChat}
                className="btn btn-sm btn-outline-custom"
                style={{ padding: '4px', border: 'none' }}
                title="Clear chat history"
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-sm btn-outline-custom"
                style={{ padding: '4px', border: 'none' }}
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          {/* Quick Prompts Carousel */}
          <div
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: 'var(--bg-card)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                style={{
                  fontSize: '0.72rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-app)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}
          >
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '88%',
                      padding: '0.75rem 1rem',
                      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      backgroundColor: isUser ? 'var(--color-primary)' : 'var(--bg-card)',
                      color: isUser ? '#fff' : 'var(--text-main)',
                      border: isUser ? 'none' : '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-sm)',
                      position: 'relative'
                    }}
                  >
                    {isUser ? (
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{m.content}</div>
                    ) : (
                      <>
                        {renderFormatted(m.content)}
                        {m.toolsUsed && m.toolsUsed.length > 0 && (
                          <div
                            style={{
                              marginTop: '0.5rem',
                              paddingTop: '0.4rem',
                              borderTop: '1px solid var(--border-color)',
                              fontSize: '0.68rem',
                              color: 'var(--text-dim)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            <Sparkles size={11} className="text-primary" />
                            Verified tools: {m.toolsUsed.join(', ')}
                          </div>
                        )}
                        <button
                          onClick={() => copyToClipboard(m.content, idx)}
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-dim)',
                            cursor: 'pointer',
                            padding: '2px'
                          }}
                          title="Copy response"
                        >
                          {copiedIdx === idx ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: '16px 16px 16px 4px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Bot size={16} className="text-primary pulse-indicator" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Evaluating verified financial records...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--bg-surface)',
              borderTop: '1px solid var(--border-color)'
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Ask about salary, food expenses, budget..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{ fontSize: '0.85rem', borderRadius: 'var(--radius-full)' }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn btn-primary"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  padding: 0,
                  flexShrink: 0
                }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
