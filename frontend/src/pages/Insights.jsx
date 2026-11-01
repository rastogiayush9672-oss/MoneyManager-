import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { AuthContext } from '../context/AuthContext';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Target,
  Repeat,
  ShieldCheck,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Insights = () => {
  const { user, currencySymbol } = useContext(AuthContext);
  const [insights, setInsights] = useState([]);
  const [healthScore, setHealthScore] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [insightsRes, healthRes] = await Promise.all([
        axios.get('http://localhost:5000/api/analytics/insights', { headers }),
        axios.get('http://localhost:5000/api/analytics/health-score', { headers })
      ]);

      setInsights(insightsRes.data || []);
      setHealthScore(healthRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return <div className="text-center py-5 text-muted">Evaluating statistical insights...</div>;
  }

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Financial Intelligence & Insights</h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Automated rule-based heuristics and predictive behavioral analysis of your finances.
          </p>
        </div>

        <Link to="/ai-assistant" className="btn btn-primary">
          <Sparkles size={16} /> Consult AI Assistant
        </Link>
      </div>

      {/* Health Score Overview Hero */}
      <div
        className="card p-4 mb-4 shadow-sm border-0 position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
          border: '1px solid var(--border-color)'
        }}
      >
        <div className="row align-items-center">
          <div className="col-md-3 text-center text-md-start mb-3 mb-md-0">
            <div
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                border: `5px solid ${healthScore?.badgeColor || '#3b82f6'}`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 800
              }}
            >
              {healthScore?.score || 80}
            </div>
          </div>

          <div className="col-md-9">
            <div className="d-flex align-items-center gap-2 mb-1">
              <h4 className="fw-bold mb-0">Financial Stability: {healthScore?.label}</h4>
              <span className="badge-fintech success">Verified Score</span>
            </div>
            <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
              Your composite score evaluates your monthly savings rate ({healthScore?.savingsRate}%), budget adherence, debt-to-asset leverage ({healthScore?.debtRatio}%), and available liquid cash.
            </p>
            <div className="d-flex flex-wrap gap-4 small">
              <span>Savings Rate: <strong className="text-success">{healthScore?.savingsRate}%</strong></span>
              <span>Budget Overruns: <strong>{healthScore?.budgetExceededCount || 0} categories</strong></span>
              <span>Liquid Cash: <strong>{currencySymbol}{healthScore?.liquidCash?.toLocaleString('en-IN')}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Insights Feed */}
      <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
        <Lightbulb size={20} className="text-warning" /> Live Financial Observations ({insights.length})
      </h5>

      <div className="row g-3">
        {insights.length === 0 ? (
          <div className="col-12 text-center py-5 text-muted card shadow-sm">
            <CheckCircle2 size={40} className="text-success mx-auto mb-2" />
            <h5>All Financial Metrics Balanced</h5>
            <p className="small mb-0">No unusual spending spikes or critical budget alarms detected.</p>
          </div>
        ) : (
          insights.map((item, idx) => {
            const isDanger = item.type === 'danger';
            const isWarning = item.type === 'warning';
            const isSuccess = item.type === 'success';

            const accentColor = isDanger
              ? 'var(--color-danger)'
              : isWarning
              ? 'var(--color-warning)'
              : isSuccess
              ? 'var(--color-success)'
              : 'var(--color-primary)';

            return (
              <div key={idx} className="col-md-6">
                <div
                  className="card p-4 h-100 shadow-sm"
                  style={{
                    borderLeft: `4px solid ${accentColor}`,
                    backgroundColor: 'var(--bg-card)'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="fw-bold mb-0" style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                      {item.title}
                    </h6>
                    <span
                      className={`badge-fintech ${isDanger ? 'danger' : isWarning ? 'warning' : isSuccess ? 'success' : 'info'}`}
                    >
                      {item.type.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-muted small mb-3" style={{ lineHeight: 1.6 }}>
                    {item.message}
                  </p>

                  <div className="mt-auto pt-2 border-top d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--border-color)' }}>
                    <small className="text-dim">Triggered by actual database records</small>
                    <Link to="/ai-assistant" className="small text-primary fw-bold text-decoration-none">
                      Consult AI →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Insights;
