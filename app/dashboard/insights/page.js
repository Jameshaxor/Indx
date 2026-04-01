'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchAI, fetchMarket } from '@/lib/api';

export default function InsightsPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mktSummary, setMktSummary] = useState('');
  const [quickInsight, setQuickInsight] = useState(null);
  const [tab, setTab] = useState('chat');
  const chatRef = useRef(null);

  useEffect(() => {
    (async () => {
      const m = await fetchMarket();
      if (m) {
        const idx = m.indices || [];
        const summary = idx.map(i => `${i.displayName}: ${i.price?.toLocaleString()} (${i.change >= 0 ? '+' : ''}${i.change?.toFixed(2)}%)`).join(', ');
        setMktSummary(summary);
      }
    })();
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const quickPrompts = [
    { emoji: '📊', label: 'Market Summary', prompt: 'Give me a detailed summary of Indian stock market today. Include key indices, top movers, and sentiment.' },
    { emoji: '🏆', label: 'Top Picks', prompt: 'What are the top 5 stock picks for long-term investment in India right now? Include rationale for each.' },
    { emoji: '📈', label: 'Sector Analysis', prompt: 'Analyze the best performing sectors in India right now and which sectors to watch.' },
    { emoji: '🎯', label: 'Portfolio Tips', prompt: 'Give me portfolio allocation tips for a moderate risk Indian investor with 10 lakh to invest.' },
    { emoji: '📰', label: 'News Impact', prompt: 'What are the key market-moving events and news for Indian markets this week?' },
    { emoji: '💡', label: 'SIP Strategy', prompt: 'What is the best SIP strategy for 2024-25? Which mutual fund categories should I focus on?' },
    { emoji: '⚠️', label: 'Risk Assessment', prompt: 'What are the key risks for Indian stock market in the next 3-6 months?' },
    { emoji: '🌍', label: 'Global Impact', prompt: 'How are global markets affecting India? Analyze FII/DII flows and their impact.' },
  ];

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setTab('chat');

    const userMsg = { role: 'user', text: msg, time: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const contextPrompt = `You are Indx AI, an expert Indian financial advisor and market analyst. Current market data: ${mktSummary}. User: ${user?.name || 'Investor'}. Respond with detailed, actionable insights. Use Indian context (INR, NSE/BSE, Indian regulations). Format with clear sections and bullet points.

User question: ${msg}`;

      const res = await fetchAI(contextPrompt);
      const aiMsg = {
        role: 'ai',
        text: res?.response || res?.text || "I couldn't generate insights right now. Please try again.",
        time: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: '❌ Error: ' + e.message, time: new Date().toLocaleTimeString() }]);
    }
    setLoading(false);
  };

  const getQuickInsight = async (prompt) => {
    setQuickInsight({ loading: true, text: '' });
    try {
      const contextPrompt = `You are Indx AI. Current market: ${mktSummary}. Give a comprehensive, well-formatted analysis. Use bullet points, sections, and be specific to Indian markets. ${prompt}`;
      const res = await fetchAI(contextPrompt);
      setQuickInsight({ loading: false, text: res?.response || res?.text || 'Could not generate insight.' });
    } catch (e) {
      setQuickInsight({ loading: false, text: '❌ Error generating insight: ' + e.message });
    }
  };

  return (
    <div className="page-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}><span className="gradient-text">🤖 AI Insights</span></h2>
          <p className="caption" style={{ marginTop: 3 }}>Powered by Gemini AI · Indian market intelligence</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--bg1)', borderRadius: 10, padding: 4 }}>
        {['chat', 'quick'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: tab === t ? 'var(--accent)' : 'transparent',
            color: tab === t ? '#fff' : 'var(--t2)',
          }}>
            {t === 'chat' ? '💬 AI Chat' : '⚡ Quick Insights'}
          </button>
        ))}
      </div>

      {/* Chat Tab */}
      {tab === 'chat' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 260px)', minHeight: 400 }}>
          {/* Quick Prompts */}
          {messages.length === 0 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <div style={{ fontSize: 40 }}>🤖</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Ask Indx AI Anything</div>
              <div className="caption" style={{ textAlign: 'center', maxWidth: 400 }}>
                Get AI-powered market analysis, stock recommendations, portfolio advice, and more.
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', maxWidth: 500 }}>
                {quickPrompts.slice(0, 4).map((q, i) => (
                  <button key={i} className="btn btn-s btn-sm" onClick={() => sendMessage(q.prompt)}>
                    {q.emoji} {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '10px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    padding: '10px 14px', borderRadius: 12,
                    background: m.role === 'user' ? 'var(--accent)' : 'var(--bg0)',
                    color: m.role === 'user' ? '#fff' : 'var(--t1)',
                    fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                  }}>
                    {m.role === 'ai' && <span style={{ fontWeight: 700, fontSize: 11, color: 'var(--accent)', display: 'block', marginBottom: 4 }}>🤖 Indx AI</span>}
                    {m.text}
                  </div>
                  <span style={{ fontSize: 9, color: 'var(--t3)', marginTop: 3, fontFamily: 'var(--mono)' }}>{m.time}</span>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--bg0)', borderRadius: 12, alignSelf: 'flex-start' }}>
                  <div className="spinner" style={{ width: 16, height: 16 }} />
                  <span style={{ fontSize: 12, color: 'var(--t3)' }}>Analyzing...</span>
                </div>
              )}
            </div>
          )}

          {/* Input */}
          <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid var(--b0)' }}>
            <input
              className="input" placeholder="Ask about markets, stocks, investments..."
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              disabled={loading} style={{ flex: 1 }}
            />
            <button className="btn btn-p btn-sm" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
              {loading ? '⏳' : '🚀'} Send
            </button>
          </div>
        </div>
      )}

      {/* Quick Insights Tab */}
      {tab === 'quick' && (
        <div>
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10, marginBottom: 16 }}>
            {quickPrompts.map((q, i) => (
              <button key={i} className="card" onClick={() => getQuickInsight(q.prompt)}
                style={{ cursor: 'pointer', border: 'none', textAlign: 'left', transition: 'transform .2s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{q.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{q.label}</div>
                <div className="caption" style={{ marginTop: 4, fontSize: 10 }}>Click to generate</div>
              </button>
            ))}
          </div>

          {quickInsight && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div className="h-s">🤖 AI Analysis</div>
                <button onClick={() => setQuickInsight(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button>
              </div>
              {quickInsight.loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 10 }}>
                  <div className="spinner" /><span style={{ color: 'var(--t3)', fontSize: 13 }}>Generating insights...</span>
                </div>
              ) : (
                <div style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--t1)' }}>
                  {quickInsight.text}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
