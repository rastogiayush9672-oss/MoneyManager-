import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Brain,
  Bot,
  ArrowRight,
  PieChart,
  CheckCircle2,
  Lock,
  Zap,
  Globe,
  Briefcase
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }}>
      {/* Top Navbar */}
      <nav
        style={{
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-sidebar)',
          padding: '1rem 0'
        }}
      >
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
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
                fontWeight: 800,
                fontSize: '1.1rem'
              }}
            >
              ₹
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
              MoneyManager <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)' }}>AI ENTERPRISE</span>
            </span>
          </div>

          <div className="d-flex align-items-center gap-3">
            <Link to="/login" className="btn btn-outline-custom btn-sm">
              Log In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container py-5 text-center" style={{ maxWidth: '960px', marginTop: '3rem' }}>
        <div className="d-inline-flex align-items-center gap-2 badge-fintech success mb-3 px-3 py-2">
          <Sparkles size={14} /> AI-Powered Personal Finance & Salary Management
        </div>

        <h1 className="display-4 fw-bold mb-3" style={{ letterSpacing: '-0.03em', lineHeight: 1.15 }}>
          Intelligent Wealth, Salary & <br className="d-none d-md-inline" />
          <span style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Predictive Cash Flow Analytics
          </span>
        </h1>

        <p className="text-muted fs-5 mb-4 mx-auto" style={{ maxWidth: '680px', lineHeight: 1.6 }}>
          A full-stack, enterprise-grade fintech platform engineered for MCA final major academic demonstration. Seamlessly managing salaries, monthly budgets, savings goals, recurring bills, and grounded AI assistance.
        </p>

        <div className="d-flex justify-content-center gap-3 mb-5">
          <Link to="/dashboard" className="btn btn-primary px-4 py-3 fs-6">
            Enter Live Platform <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-outline-custom px-4 py-3 fs-6">
            Explore Demo Account
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="row g-4 text-start mt-4">
          <div className="col-md-4">
            <div className="card p-4 h-100 shadow-sm">
              <div className="p-2 rounded-3 mb-3 d-inline-block" style={{ backgroundColor: 'var(--color-primary-glow)', color: 'var(--color-primary)' }}>
                <Bot size={24} />
              </div>
              <h5 className="fw-bold mb-2">Sikka AI Assistant</h5>
              <p className="text-muted small mb-0">
                Deterministic tool-calling engine directly grounded in your MongoDB transactions. Zero hallucinations, 100% verified math.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card p-4 h-100 shadow-sm">
              <div className="p-2 rounded-3 mb-3 d-inline-block" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                <Briefcase size={24} />
              </div>
              <h5 className="fw-bold mb-2">Salary & Payslips</h5>
              <p className="text-muted small mb-0">
                End-to-end payroll management with basic salary, HRA, DA, EPF deductions, TDS tracking, and printable salary statements.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card p-4 h-100 shadow-sm">
              <div className="p-2 rounded-3 mb-3 d-inline-block" style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
                <TrendingUp size={24} />
              </div>
              <h5 className="fw-bold mb-2">Smart Heuristics</h5>
              <p className="text-muted small mb-0">
                Financial health score (0-100), automated overspending alarms, 50/30/20 budget tracking, and period-over-period comparisons.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-top py-4 mt-5 text-center text-muted small" style={{ borderColor: 'var(--border-color)' }}>
        <div className="container">
          <p className="mb-0">
            © 2026 MoneyManager AI Enterprise • Built with React, Express, and MongoDB.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
